import { Request, Response, NextFunction } from "express";
import User from "../models/User";
import LanguageSettings from "../models/LanguageSettings";

const languageMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Obter idioma do header se disponível
    const headerLanguage = req.headers["x-user-language"] || 
                          req.headers["accept-language"];

    // Se houver usuário autenticado, buscar preferência
    const reqUser = (req as any).user;
    if (reqUser?.id) {
      const user = await User.findByPk(reqUser.id);
      
      if (user) {
        // Verificar se o novo sistema está habilitado
        const settings = await LanguageSettings.findOne({
          where: { companyId: user.companyId }
        });

        if (settings?.featureEnabled) {
          // Usar preferência do banco de dados
          (req as any).language = user.preferredLanguage || "pt";
        } else {
          // Sistema legado - usar header ou padrão
          (req as any).language = (headerLanguage as string)?.substring(0, 2) || "pt";
        }

        // Adicionar idioma ao response header para o frontend
        res.setHeader("X-User-Language", (req as any).language || "pt");
      }
    } else {
      // Usuário não autenticado - usar header ou padrão
      (req as any).language = (headerLanguage as string)?.substring(0, 2) || "pt";
    }

    // Definir idiomas aceitos (para futuras expansões)
    (req as any).acceptLanguages = ["pt", "en", "es", "ar", "tr"];

    next();
  } catch (error) {
    console.error("Error in language middleware:", error);
    // Em caso de erro, continuar com idioma padrão
    (req as any).language = "pt";
    next();
  }
};

export default languageMiddleware;