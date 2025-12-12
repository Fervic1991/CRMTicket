import { Request, Response } from "express";
import * as Yup from "yup";
import { Op } from "sequelize";
import AppError from "../errors/AppError";
import User from "../models/User";
import Company from "../models/Company";
import LanguageSettings from "../models/LanguageSettings";

class LanguageController {
  /**
   * GET /api/languages/available  (autenticada)
   * GET /api/languages/public/available (pública)
   * Retorna línguas disponíveis baseado no role e hierarquia do usuário
   */
  public async getAvailableLanguages(req: Request, res: Response): Promise<Response> {
    try {
      const user = (req as any).user;
      
      // Se não há usuário (rota pública), retornar línguas padrão
      if (!user) {
        const settings = await LanguageSettings.findOne({
          where: { companyId: 1 } // Empresa padrão
        });
        
        if (!settings?.featureEnabled) {
          // Sistema legado - todas as línguas disponíveis
          return res.json({
            languages: ["pt", "en", "es", "ar", "tr","it"],
            currentLanguage: "pt",
            source: "public_legacy"
          });
        }
        
        // Sistema novo - retornar línguas do sistema
        return res.json({
          languages: settings.systemLanguages || ["pt", "en", "es", "ar", "tr","it"],
          currentLanguage: "pt",
          source: "public_backend"
        });
      }

      const { id: userId, profile, companyId } = user;

      // Buscar configurações da empresa
      const company = await Company.findByPk(companyId);
      if (!company) {
        throw new AppError("Company not found", 404);
      }

      // Verificar se o novo sistema está habilitado
      const languageSettings = await LanguageSettings.findOne({
        where: { companyId }
      });

      if (!languageSettings?.featureEnabled) {
        // Sistema antigo - retornar todas as línguas
        return res.json({
          languages: ["pt", "en", "es", "ar", "tr","it"],
          source: "legacy"
        });
      }

      let availableLanguages: string[] = [];

      // Lógica hierárquica de permissões
      if (profile === "super") {
        // Super admin tem acesso a todas as línguas do sistema
        availableLanguages = languageSettings.systemLanguages;
      } else if (profile === "admin") {
        // Admin tem acesso apenas às línguas habilitadas pelo super admin
        availableLanguages = company.enabledLanguages || languageSettings.systemLanguages;
      } else {
        // Usuário comum - verificar configurações do admin
        const userRecord = await User.findByPk(userId, {
          include: [{ model: Company, as: "company" }]
        });

        if (!userRecord) {
          throw new AppError("User not found", 404);
        }

        // Buscar admin da empresa
        const admin = await User.findOne({
          where: {
            companyId,
            profile: "admin"
          },
          order: [["createdAt", "ASC"]] // Pegar o admin mais antigo
        });

        if (admin?.adminSelectedLanguages && admin.adminSelectedLanguages.length > 0) {
          // Admin definiu línguas específicas
          availableLanguages = admin.adminSelectedLanguages;
        } else {
          // Herdar do super admin (línguas habilitadas da empresa)
          availableLanguages = company.enabledLanguages || languageSettings.systemLanguages;
        }
      }

      // Buscar preferência atual do usuário
      const currentUser = await User.findByPk(userId);
      const currentLanguage = currentUser?.preferredLanguage || "pt";

      return res.json({
        languages: availableLanguages,
        currentLanguage,
        source: "backend",
        profile,
        featureEnabled: true
      });
    } catch (error) {
      console.error("Error getting available languages:", error);
      throw new AppError("Error getting available languages", 500);
    }
  }

  /**
   * POST /api/languages/preferences
   * Salva preferência de idioma do usuário
   */
  public async saveLanguagePreference(req: Request, res: Response): Promise<Response> {
    try {
      const user = (req as any).user;
      if (!user) {
        throw new AppError("User not found", 401);
      }

      const { language } = req.body;

      // Validação
      const schema = Yup.object().shape({
        language: Yup.string()
          .oneOf(["pt", "en", "es", "ar", "tr","it"])
          .required()
      });

      try {
        await schema.validate({ language });
      } catch (err) {
        throw new AppError("Invalid language", 400);
      }

      // Verificar se o usuário tem permissão para usar esta língua
      // Recriar lógica aqui ao invés de chamar o método
      const company = await Company.findByPk(user.companyId);
      const languageSettings = await LanguageSettings.findOne({
        where: { companyId: user.companyId }
      });
      
      const availableLanguages = company?.enabledLanguages || ["pt", "en", "es", "ar", "tr","it"];

      if (!availableLanguages.includes(language)) {
        throw new AppError("Language not available for this user", 403);
      }

      // Atualizar preferência do usuário
      await User.update(
        { preferredLanguage: language },
        { where: { id: user.id } }
      );

      return res.json({
        success: true,
        language,
        message: "Language preference updated successfully"
      });
    } catch (error) {
      console.error("Error saving language preference:", error);
      throw new AppError("Error saving language preference", 500);
    }
  }

  /**
   * PUT /api/admin/languages
   * Admin atualiza línguas disponíveis para usuários subordinados
   */
  public async updateAdminLanguages(req: Request, res: Response): Promise<Response> {
    try {
      const user = (req as any).user;
      if (!user) {
        throw new AppError("User not found", 401);
      }

      if (user.profile !== "admin" && user.profile !== "super") {
        throw new AppError("Insufficient permissions", 403);
      }

      const { languages } = req.body;

      // Validação
      const schema = Yup.object().shape({
        languages: Yup.array()
          .of(Yup.string().oneOf(["pt", "en", "es", "ar", "tr","it"]))
          .min(1, "At least one language must be selected")
          .required()
      });

      try {
        await schema.validate({ languages });
      } catch (err) {
        throw new AppError("Invalid languages", 400);
      }

      // Buscar empresa e suas configurações
      const company = await Company.findByPk(user.companyId);
      if (!company) {
        throw new AppError("Company not found", 404);
      }

      // Verificar se as línguas estão dentro do conjunto permitido pelo super admin
      const enabledLanguages = company.enabledLanguages || ["pt", "en", "es", "ar", "tr","it"];
      const invalidLanguages = languages.filter(lang => !enabledLanguages.includes(lang));

      if (invalidLanguages.length > 0) {
        throw new AppError(
          `Languages not enabled by super admin: ${invalidLanguages.join(", ")}`,
          403
        );
      }

      // Atualizar línguas selecionadas pelo admin
      await User.update(
        { adminSelectedLanguages: languages },
        { where: { id: user.id } }
      );

      return res.json({
        success: true,
        languages,
        message: "Admin languages updated successfully"
      });
    } catch (error) {
      console.error("Error updating admin languages:", error);
      throw new AppError("Error updating admin languages", 500);
    }
  }

  /**
   * PUT /api/super-admin/languages
   * Super admin define línguas globais disponíveis
   */
  public async updateSuperAdminLanguages(req: Request, res: Response): Promise<Response> {
    try {
      const user = (req as any).user;
      if (!user) {
        throw new AppError("User not found", 401);
      }

      if (user.profile !== "super") {
        throw new AppError("Only super admin can update global languages", 403);
      }

      const { languages } = req.body;

      // Validação
      const schema = Yup.object().shape({
        languages: Yup.array()
          .of(Yup.string().oneOf(["pt", "en", "es", "ar", "tr","it"]))
          .min(1, "At least one language must be selected")
          .required()
      });

      try {
        await schema.validate({ languages });
      } catch (err) {
        throw new AppError("Invalid languages", 400);
      }

      // Atualizar línguas habilitadas da empresa
      await Company.update(
        { enabledLanguages: languages },
        { where: { id: user.companyId } }
      );

      // Verificar se usuários estão usando línguas que serão desabilitadas
      const users = await User.findAll({
        where: {
          companyId: user.companyId,
          preferredLanguage: {
            [Op.notIn]: languages
          }
        }
      });

      // Se houver usuários afetados, mudar para a primeira língua disponível
      if (users.length > 0) {
        await User.update(
          { preferredLanguage: languages[0] },
          {
            where: {
              companyId: user.companyId,
              preferredLanguage: {
                [Op.notIn]: languages
              }
            }
          }
        );
      }

      return res.json({
        success: true,
        languages,
        affectedUsers: users.length,
        message: "Global languages updated successfully"
      });
    } catch (error) {
      console.error("Error updating super admin languages:", error);
      throw new AppError("Error updating super admin languages", 500);
    }
  }

  /**
   * GET /api/languages/settings
   * Retorna configurações de idiomas da empresa
   */
  public async getLanguageSettings(req: Request, res: Response): Promise<Response> {
    try {
      const user = (req as any).user;
      if (!user) {
        throw new AppError("User not found", 401);
      }

      const { companyId } = user;

      const [settings, created] = await LanguageSettings.findOrCreate({
        where: { companyId },
        defaults: {
          companyId,
          systemLanguages: ["pt", "en", "es", "ar", "tr","it"],
          featureEnabled: false
        }
      });

      const company = await Company.findByPk(companyId);

      return res.json({
        systemLanguages: settings.systemLanguages,
        enabledLanguages: company?.enabledLanguages || settings.systemLanguages,
        featureEnabled: settings.featureEnabled
      });
    } catch (error) {
      console.error("Error getting language settings:", error);
      throw new AppError("Error getting language settings", 500);
    }
  }

  /**
   * PUT /api/languages/toggle-feature
   * Ativa/desativa o novo sistema de idiomas
   */
  public async toggleFeature(req: Request, res: Response): Promise<Response> {
    try {
      const user = (req as any).user;
      if (!user) {
        throw new AppError("User not found", 401);
      }

      if (user.profile !== "super") {
        throw new AppError("Only super admin can toggle this feature", 403);
      }

      const { enabled } = req.body;
      const { companyId } = user;

      const [settings] = await LanguageSettings.findOrCreate({
        where: { companyId },
        defaults: {
          companyId,
          systemLanguages: ["pt", "en", "es", "ar", "tr","it"],
          featureEnabled: false
        }
      });

      settings.featureEnabled = enabled;
      await settings.save();

      return res.json({
        success: true,
        featureEnabled: enabled,
        message: `Language feature ${enabled ? "enabled" : "disabled"} successfully`
      });
    } catch (error) {
      console.error("Error toggling language feature:", error);
      throw new AppError("Error toggling language feature", 500);
    }
  }

  /**
   * GET /api/languages/public/feature-check
   * Verifica se o novo sistema de idiomas está habilitado (rota pública)
   */
  public async checkFeatureEnabled(req: Request, res: Response): Promise<Response> {
    try {
      // Para rota pública, vamos verificar globalmente para a primeira empresa
      // ou usar um padrão. Idealmente, isso seria baseado no domínio ou outro identificador
      const settings = await LanguageSettings.findOne({
        where: { companyId: 1 } // Assumindo empresa padrão ID 1
      });

      return res.json({
        featureEnabled: settings?.featureEnabled || false
      });
    } catch (error) {
      console.error("Error checking feature status:", error);
      // Em caso de erro, retornar false para usar o sistema legado
      return res.json({
        featureEnabled: false
      });
    }
  }
}

export default new LanguageController();