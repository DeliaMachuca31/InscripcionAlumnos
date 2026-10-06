import { Router } from "express";
import { validate } from "../lib/validate.js";
import { asyncHandler } from "../lib/asyncHandler.js";
import { registroSchema } from "../validations/alumno.js";
import {
  crearInscripcion,
  listarCarreras,
  listarTurnos,
} from "../controllers/inscripcion.js";

export const router = Router();

router.get("/carreras", asyncHandler(listarCarreras));
router.get("/turnos", asyncHandler(listarTurnos));
router.post("/", validate(registroSchema), asyncHandler(crearInscripcion));