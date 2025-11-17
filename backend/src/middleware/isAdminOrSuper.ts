import { Request, Response, NextFunction } from "express";
import AppError from "../errors/AppError";
import User from "../models/User";

/**
 * Middleware para garantir que apenas admins e super admins acessem recursos específicos
 * Bloqueia completamente usuários com profile === "user"
 */
const isAdminOrSuper = async (
  req: Request, 
  res: Response, 
  next: NextFunction
): Promise<void> => {
  const { id, profile } = req.user;

  // Verificação crítica: Bloquear usuários comuns
  if (profile === "user") {
    throw new AppError("ERR_NO_PERMISSION", 403);
  }

  try {
    // Buscar usuário completo para verificar flag super
    const user = await User.findByPk(id);
    
    if (!user) {
      throw new AppError("ERR_USER_NOT_FOUND", 404);
    }

    // Permitir apenas admin ou super
    if (profile === "admin" || user.super === true) {
      return next();
    }

    throw new AppError("ERR_NO_PERMISSION", 403);
  } catch (err) {
    if (err instanceof AppError) {
      throw err;
    }
    throw new AppError("ERR_AUTHORIZATION_CHECK_FAILED", 500);
  }
};

export default isAdminOrSuper;