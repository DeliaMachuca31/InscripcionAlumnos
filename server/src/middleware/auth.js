import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { prisma } from "../db.js";
import { unauthorized, forbidden } from "../lib/errors.js";

const { JWT_SECRET, JWT_EXPIRES_IN = "2h" } = process.env;

export const hashPassword = (plain) => bcrypt.hash(plain, 10);
export const comparePassword = (plain, hash) => bcrypt.compare(plain, hash);

export function signToken(user) {
  return jwt.sign({ sub: user.id, rol: user.rol }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
}

export function authenticate(req, _res, next) {
  const header = req.headers.authorization ?? "";
  const [scheme, token] = header.split(" ");
  if (scheme !== "Bearer" || !token) return next(unauthorized());

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.userId = payload.sub;
    req.userRol = payload.rol;
    next();
  } catch {
    next(unauthorized("Token inválido o expirado"));
  }
}

export function requireRole(...roles) {
  return (req, _res, next) => {
    if (!req.userId) return next(unauthorized());
    if (!roles.includes(req.userRol)) return next(forbidden());
    next();
  };
}

export function loadUser(req, _res, next) {
  prisma.user
    .findUnique({
      where: { id: req.userId },
      select: { id: true, email: true, rol: true, activo: true, alumno: true },
    })
    .then((user) => {
      if (!user || !user.activo) return next(unauthorized("Usuario inactivo o inexistente"));
      req.user = user;
      next();
    })
    .catch(next);
}