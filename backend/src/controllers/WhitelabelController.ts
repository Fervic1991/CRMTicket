import { Request, Response } from "express";
import * as Yup from "yup";
import path from "path";
import fs from "fs";
import { Op } from "sequelize";
import multer from "multer";

import WhitelabelSettings from "../models/WhitelabelSettings";
import User from "../models/User";
import Company from "../models/Company";
import AppError from "../errors/AppError";

// Configuração do multer para upload de imagens
const uploadPath = path.join(__dirname, "..", "..", "public", "logos");

// Criar diretório se não existir
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

export const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|svg|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error("Apenas imagens são permitidas (jpeg, jpg, png, gif, svg, webp)"));
    }
  }
});

interface AuthenticatedRequest {
  user?: {
    id: string;
    profile: string;
    companyId: number;
  };
  body?: any;
  params?: any;
  query?: any;
  file?: Express.Multer.File;
  files?: {
    [fieldname: string]: Express.Multer.File[];
  } | Express.Multer.File[];
}

// Upload de logos
export const uploadLogos = async (req: any, res: Response): Promise<Response> => {
  try {
    const { user } = req;
    const { companyId } = req.body;

    if (!user) {
      throw new AppError("Usuário não autenticado", 401);
    }

    // Validar permissões
    if (user.profile === "user") {
      throw new AppError("Sem permissão para configurar whitelabel", 403);
    }

    const isGlobal = user.profile === "super" && !companyId;
    let targetCompanyId = isGlobal ? null : (companyId || user.companyId);

    // Se é admin, validar se é admin da empresa
    if (user.profile === "admin" && targetCompanyId && targetCompanyId !== user.companyId) {
      throw new AppError("Sem permissão para configurar whitelabel de outra empresa", 403);
    }

    // Processar uploads
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    const logoLightFile = files?.logoLight?.[0];
    const logoDarkFile = files?.logoDark?.[0];

    if (!logoLightFile && !logoDarkFile) {
      throw new AppError("Pelo menos uma logo deve ser enviada", 400);
    }

    const logoLightUrl = logoLightFile ? `/logos/${logoLightFile.filename}` : undefined;
    const logoDarkUrl = logoDarkFile ? `/logos/${logoDarkFile.filename}` : undefined;

    // Buscar configuração existente
    let settings = await WhitelabelSettings.findOne({
      where: isGlobal ? { isGlobal: true } : { companyId: targetCompanyId }
    });

    if (settings) {
      // Deletar logos antigas do sistema de arquivos
      if (settings.logoLightUrl && logoLightUrl) {
        const oldPath = path.join(uploadPath, path.basename(settings.logoLightUrl));
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }
      if (settings.logoDarkUrl && logoDarkUrl) {
        const oldPath = path.join(uploadPath, path.basename(settings.logoDarkUrl));
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }

      // Atualizar com novas logos
      await settings.update({
        logoLightUrl: logoLightUrl || settings.logoLightUrl,
        logoDarkUrl: logoDarkUrl || settings.logoDarkUrl,
        userId: user.id
      });
    } else {
      // Criar nova configuração
      settings = await WhitelabelSettings.create({
        userId: user.id,
        companyId: targetCompanyId,
        logoLightUrl,
        logoDarkUrl,
        isGlobal
      });
    }

    return res.json({
      success: true,
      settings: {
        id: settings.id,
        logoLightUrl: settings.logoLightUrl,
        logoDarkUrl: settings.logoDarkUrl,
        isGlobal: settings.isGlobal,
        companyId: settings.companyId
      }
    });
  } catch (error) {
    console.error("Erro ao fazer upload de logos:", error);
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    return res.status(500).json({ error: "Erro ao fazer upload de logos" });
  }
};

// Buscar logo apropriada para o usuário atual
export const getCurrentLogo = async (req: any, res: Response): Promise<Response> => {
  try {
    const { user } = req;

    if (!user) {
      throw new AppError("Usuário não autenticado", 401);
    }

    let logoSettings = null;
    let source = "default";

    // Lógica de cascata baseada no perfil do usuário
    if (user.profile === "super") {
      // Super admin sempre vê a logo global
      logoSettings = await WhitelabelSettings.findOne({
        where: { isGlobal: true }
      });
      if (logoSettings) source = "global";
    } else if (user.profile === "admin") {
      // Admin vê logo da sua empresa ou global
      logoSettings = await WhitelabelSettings.findOne({
        where: { companyId: user.companyId }
      });
      
      if (logoSettings) {
        source = "company";
      } else {
        // Fallback para logo global
        logoSettings = await WhitelabelSettings.findOne({
          where: { isGlobal: true }
        });
        if (logoSettings) source = "global";
      }
    } else {
      // Usuário comum - buscar logo da empresa
      const userWithCompany = await User.findByPk(user.id, {
        include: [Company]
      });

      if (userWithCompany?.companyId) {
        logoSettings = await WhitelabelSettings.findOne({
          where: { companyId: userWithCompany.companyId }
        });
        if (logoSettings) source = "company";
      }

      // Fallback para logo global
      if (!logoSettings) {
        logoSettings = await WhitelabelSettings.findOne({
          where: { isGlobal: true }
        });
        if (logoSettings) source = "global";
      }
    }

    // Se não houver configuração, usar logos padrão
    const logos = {
      logoLightUrl: logoSettings?.logoLightUrl || "/logo.png",
      logoDarkUrl: logoSettings?.logoDarkUrl || "/logo-black.png",
      source
    };

    return res.json({ logos });
  } catch (error) {
    console.error("Erro ao buscar logo:", error);
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    return res.status(500).json({ error: "Erro ao buscar logo" });
  }
};

// Listar configurações de whitelabel (para super admin)
export const listWhitelabelSettings = async (req: any, res: Response): Promise<Response> => {
  try {
    const { user } = req;

    if (!user) {
      throw new AppError("Usuário não autenticado", 401);
    }

    if (user.profile !== "super") {
      throw new AppError("Sem permissão para listar configurações", 403);
    }

    const settings = await WhitelabelSettings.findAll({
      include: [
        {
          model: Company,
          attributes: ["id", "name"]
        },
        {
          model: User,
          attributes: ["id", "name", "email"]
        }
      ],
      order: [["isGlobal", "DESC"], ["createdAt", "DESC"]]
    });

    return res.json(settings);
  } catch (error) {
    console.error("Erro ao listar configurações:", error);
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    return res.status(500).json({ error: "Erro ao listar configurações" });
  }
};

// Buscar logo pública (sem autenticação - para página de login)
export const getPublicLogo = async (req: Request, res: Response): Promise<Response> => {
  try {
    // Buscar logo global (configurada pelo super admin)
    const globalSettings = await WhitelabelSettings.findOne({
      where: { isGlobal: true }
    });

    // Se houver configuração global, usar ela
    if (globalSettings) {
      return res.json({
        logos: {
          logoLightUrl: globalSettings.logoLightUrl || "/logo.png",
          logoDarkUrl: globalSettings.logoDarkUrl || "/logo-black.png",
          source: "global"
        }
      });
    }

    // Caso contrário, usar logos padrão
    return res.json({
      logos: {
        logoLightUrl: "/logo.png",
        logoDarkUrl: "/logo-black.png",
        source: "default"
      }
    });
  } catch (error) {
    console.error("Erro ao buscar logo pública:", error);
    // Em caso de erro, retornar logos padrão
    return res.json({
      logos: {
        logoLightUrl: "/logo.png",
        logoDarkUrl: "/logo-black.png",
        source: "default"
      }
    });
  }
};

// Deletar configuração de whitelabel
export const deleteWhitelabelSetting = async (req: any, res: Response): Promise<Response> => {
  try {
    const { user } = req;
    const { id } = req.params;

    if (!user) {
      throw new AppError("Usuário não autenticado", 401);
    }

    const setting = await WhitelabelSettings.findByPk(id);

    if (!setting) {
      throw new AppError("Configuração não encontrada", 404);
    }

    // Validar permissões
    if (user.profile === "super") {
      // Super admin pode deletar qualquer configuração
    } else if (user.profile === "admin") {
      // Admin só pode deletar configuração da própria empresa
      if (setting.companyId !== user.companyId) {
        throw new AppError("Sem permissão para deletar esta configuração", 403);
      }
    } else {
      throw new AppError("Sem permissão para deletar configurações", 403);
    }

    // Deletar arquivos de logo
    if (setting.logoLightUrl) {
      const filePath = path.join(uploadPath, path.basename(setting.logoLightUrl));
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
    if (setting.logoDarkUrl) {
      const filePath = path.join(uploadPath, path.basename(setting.logoDarkUrl));
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await setting.destroy();

    return res.json({ success: true, message: "Configuração deletada com sucesso" });
  } catch (error) {
    console.error("Erro ao deletar configuração:", error);
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    return res.status(500).json({ error: "Erro ao deletar configuração" });
  }
};