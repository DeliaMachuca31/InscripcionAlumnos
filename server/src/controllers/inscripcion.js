import { prisma } from "../db.js";
import { registrarAlumno } from "../services/inscripcion.js";

export async function crearInscripcion(req, res) {
  const alumno = await registrarAlumno(req.validado);
  res.status(201).json({
    mensaje: "Inscripción registrada. Tu cuenta queda pendiente de aprobación por la facultad.",
    alumno,
  });
}

export async function listarCarreras(_req, res) {
  const carreras = await prisma.carrera.findMany({
    where: { activa: true },
    orderBy: { nombre: "asc" },
    select: { id: true, nombre: true, descripcion: true },
  });
  res.json({ carreras });
}

export async function listarTurnos(_req, res) {
  res.json({ turnos: ["MANANA", "TARDE", "NOCHE"] });
}