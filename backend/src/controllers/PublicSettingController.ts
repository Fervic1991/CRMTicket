import { Request, Response } from "express";
import Setting from "../models/Setting";

// Buscar logos públicas para página de login
export const getPublicLogos = async (req: Request, res: Response): Promise<Response> => {
  try {
    // Buscar configurações de logo (appLogoLight e appLogoDark)
    // Busca primeiro as configurações globais (companyId = 1 ou null)
    const logoLight = await Setting.findOne({
      where: { 
        key: "appLogoLight"
      },
      order: [["companyId", "ASC"]] // Prioriza companyId = 1 (super admin)
    });

    const logoDark = await Setting.findOne({
      where: { 
        key: "appLogoDark"
      },
      order: [["companyId", "ASC"]]
    });

    // Retornar as logos encontradas ou valores padrão
    return res.json({
      logos: {
        logoLightUrl: logoLight?.value || null,
        logoDarkUrl: logoDark?.value || null,
        source: (logoLight || logoDark) ? "settings" : "default"
      }
    });
  } catch (error) {
    console.error("Erro ao buscar logos públicas:", error);
    // Em caso de erro, retornar valores padrão
    return res.json({
      logos: {
        logoLightUrl: null,
        logoDarkUrl: null,
        source: "default"
      }
    });
  }
};