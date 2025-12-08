import { Router } from "express";
import * as WhitelabelController from "../controllers/WhitelabelController";
import isAuth from "../middleware/isAuth";

const whitelabelRoutes = Router();

// Rota pública - buscar logo para página de login (sem autenticação)
whitelabelRoutes.get(
  "/public-logo",
  WhitelabelController.getPublicLogo
);

// Upload de logos (apenas admin e super admin)
whitelabelRoutes.post(
  "/logo",
  isAuth,
  WhitelabelController.upload.fields([
    { name: "logoLight", maxCount: 1 },
    { name: "logoDark", maxCount: 1 }
  ]),
  WhitelabelController.uploadLogos
);

// Buscar logo atual do usuário (todos os usuários autenticados)
whitelabelRoutes.get(
  "/current-logo",
  isAuth,
  WhitelabelController.getCurrentLogo
);

// Listar todas as configurações (apenas super admin)
whitelabelRoutes.get(
  "/settings",
  isAuth,
  WhitelabelController.listWhitelabelSettings
);

// Deletar configuração (admin e super admin)
whitelabelRoutes.delete(
  "/settings/:id",
  isAuth,
  WhitelabelController.deleteWhitelabelSetting
);

export default whitelabelRoutes;