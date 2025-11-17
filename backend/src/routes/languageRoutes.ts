import { Router } from "express";
import isAuth from "../middleware/isAuth";
import isSuper from "../middleware/isSuper";
import LanguageController from "../controllers/LanguageController";

const router = Router();

// Rotas públicas (sem autenticação necessária)
router.get("/api/languages/public/available", LanguageController.getAvailableLanguages);
router.get("/api/languages/public/feature-check", LanguageController.checkFeatureEnabled);

// Rotas de leitura (qualquer usuário autenticado)
router.get("/api/languages/available", isAuth, LanguageController.getAvailableLanguages);
router.get("/api/languages/settings", isAuth, LanguageController.getLanguageSettings);

// Rota para salvar preferência de idioma (qualquer usuário autenticado)
router.post("/api/languages/preferences", isAuth, LanguageController.saveLanguagePreference);

// Rotas de admin (apenas admins podem atualizar línguas para subordinados)
router.put("/api/admin/languages", isAuth, LanguageController.updateAdminLanguages);

// Rotas de super admin (apenas super admins)
router.put("/api/super-admin/languages", isSuper, LanguageController.updateSuperAdminLanguages);
router.put("/api/languages/toggle-feature", isSuper, LanguageController.toggleFeature);

export default router;