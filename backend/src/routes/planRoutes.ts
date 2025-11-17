import express from "express";
import isAuth from "../middleware/isAuth";
import isAdminOrSuper from "../middleware/isAdminOrSuper";

import * as PlanController from "../controllers/PlanController";

const planRoutes = express.Router();

// Rotas protegidas - Apenas admin e super podem acessar
planRoutes.get("/plans", isAuth, isAdminOrSuper, PlanController.index);
planRoutes.get("/plans/list", PlanController.list);
planRoutes.get("/plans/all", isAuth, isAdminOrSuper, PlanController.list);
planRoutes.get("/plans/:id", isAuth, isAdminOrSuper, PlanController.show);
planRoutes.post("/plans", isAuth, isAdminOrSuper, PlanController.store);
planRoutes.put("/plans/:id", isAuth, isAdminOrSuper, PlanController.update);
planRoutes.delete("/plans/:id", isAuth, isAdminOrSuper, PlanController.remove);

export default planRoutes;
