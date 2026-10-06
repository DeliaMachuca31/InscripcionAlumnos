import { Router } from "express";
import { authenticate, requireRole } from "../middleware/auth.js";
import { validate } from "../lib/validate.js";
import { asyncHandler } from "../lib/asyncHandler.js";
import {
  actualizarAlumnoSchema,
  actualizarEstadoSchema,
} from "../validations/alumno.js";
import {
  actualizarAlumno,
  actualizarEstado,
  estadisticas,
  listarAlumnos,
  obtenerAlumno,
} from "../controllers/admin.js";

export const router = Router();

router.use(authenticate, requireRole("ADMIN"));

router.get("/alumnos", asyncHandler(listarAlumnos));
router.get("/alumnos/:id", asyncHandler(obtenerAlumno));
router.patch(
  "/alumnos/:id/estado",
  validate(actualizarEstadoSchema),
  asyncHandler(actualizarEstado),
);
router.patch("/alumnos/:id", validate(actualizarAlumnoSchema), asyncHandler(actualizarAlumno));
router.get("/estadisticas", asyncHandler(estadisticas));