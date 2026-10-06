import { Router } from "express";
import { validate } from "../lib/validate.js";
import { asyncHandler } from "../lib/asyncHandler.js";
import { loginSchema } from "../validations/alumno.js";
import { authenticate, loadUser } from "../middleware/auth.js";
import { login, perfil } from "../controllers/auth.js";

export const router = Router();

router.post("/login", validate(loginSchema), asyncHandler(login));
router.get("/perfil", authenticate, asyncHandler(loadUser), perfil);