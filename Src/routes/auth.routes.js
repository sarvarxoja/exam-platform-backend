import { Router } from "express";
import { limiter } from "../secure/limiter.js";
import { checkAdminToken } from "../token/token.js";
import authController from "../controller/auth/auth.controller.js";

export const auth_routes = Router();

// limiter

auth_routes
  .post("/login", limiter, authController.login)
  .post("/refresh/token", authController.refreshToken)
  .post("/logout", checkAdminToken, authController.logout)
  .get("/check/exists", checkAdminToken, authController.checkAuth)
  // .post("/register", authController.authRegister);
