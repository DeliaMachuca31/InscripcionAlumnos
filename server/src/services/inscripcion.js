import { prisma } from "../db.js";
import { hashPassword } from "../middleware/auth.js";
import { badRequest, conflict } from "../lib/errors.js";

export async function registrarAlumno(datos) {
  const { email, cedula, password, ...perfil } = datos;

  const [existentePorEmail, existentePorCedula, carrera] = await Promise.all([
    prisma.user.findUnique({ where: { email }, select: { id: true } }),
    prisma.alumno.findUnique({ where: { cedula }, select: { id: true } }),
    prisma.carrera.findUnique({ where: { id: perfil.carreraId }, select: { id: true, activa: true } }),
  ]);

  if (existentePorEmail) throw conflict("Ya existe una cuenta con ese correo electrónico");
  if (existentePorCedula) throw conflict("Ya existe una inscripción con esa cédula");
  if (!carrera) throw badRequest("La carrera seleccionada no existe");
  if (!carrera.activa) throw badRequest("La carrera seleccionada no está disponible");

  const passwordHash = await hashPassword(password);

  return prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: { email, passwordHash, rol: "ALUMNO" },
    });

    return tx.alumno.create({
      data: { ...perfil, cedula, userId: user.id },
      include: { carrera: { select: { id: true, nombre: true } } },
    });
  });
}