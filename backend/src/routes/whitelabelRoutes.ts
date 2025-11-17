import { Router } from "express";
import * as WhitelabelController from "../controllers/WhitelabelController";
import isAuth from "../middleware/isAuth";

const whitelabelRoutes = Router();

// Rota pública - buscar logo para página de login (sem autenticação)
whitelabelRoutes.get(
  "/whitelabel/public-logo",
  WhitelabelController.getPublicLogo
);

// Upload de logos (apenas admin e super admin)
whitelabelRoutes.post(
  "/whitelabel/logo",
  isAuth,
  WhitelabelController.upload.fields([
    { name: "logoLight", maxCount: 1 },
    { name: "logoDark", maxCount: 1 }
  ]),
  WhitelabelController.uploadLogos
);

// Buscar logo atual do usuário (todos os usuários autenticados)
whitelabelRoutes.get(
  "/whitelabel/current-logo",
  isAuth,
  WhitelabelController.getCurrentLogo
);

// Listar todas as configurações (apenas super admin)
whitelabelRoutes.get(
  "/whitelabel/settings",
  isAuth,
  WhitelabelController.listWhitelabelSettings
);

// Deletar configuração (admin e super admin)
whitelabelRoutes.delete(
  "/whitelabel/settings/:id",
  isAuth,
  WhitelabelController.deleteWhitelabelSetting
);

export default whitelabelRoutes;