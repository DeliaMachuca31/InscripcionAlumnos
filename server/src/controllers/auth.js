import { prisma } from "../db.js";
import { comparePassword, signToken } from "../middleware/auth.js";
import { unauthorized } from "../lib/errors.js";

export async function login(req, res) {
  const { email, password } = req.validado;

  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      rol: true,
      activo: true,
      passwordHash: true,
      alumno: { select: { id: true, cedula: true, nombres: true, apellidos: true, estado: true } },
    },
  });

  const ok = user && user.activo && (await comparePassword(password, user.passwordHash));
  if (!ok) return res.status(401).json({ error: "Credenciales inválidas" });

  res.json({
    token: signToken(user),
    usuario: { id: user.id, email: user.email, rol: user.rol },
    alumno: user.alumno,
  });
}

export function perfil(req, res) {
  const { alumno, ...usuario } = req.user;
  res.json({ usuario, alumno });
}