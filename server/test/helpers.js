import { execFileSync } from "node:child_process";
import bcrypt from "bcryptjs";

const BD_TEST = "inscripciones_test";

const admin = new (await import("@prisma/client")).PrismaClient();

const existe = await admin.$queryRawUnsafe(
  "SELECT 1 FROM pg_database WHERE datname = $1",
  BD_TEST,
);
if (!existe.length) await admin.$queryRawUnsafe(`CREATE DATABASE ${BD_TEST}`);
await admin.$disconnect();

process.env.DATABASE_URL = process.env.DATABASE_URL.replace(
  /\/[^/?]+(\?|$)/,
  `/${BD_TEST}$1`,
);
process.env.NODE_ENV = "test";
process.env.JWT_SECRET = "secreto-de-pruebas";

execFileSync("npx.cmd", ["prisma", "db", "push", "--force-reset", "--skip-generate"], {
  stdio: "inherit",
  shell: true,
});

const { prisma } = await import("../src/db.js");
const { default: request } = await import("supertest");
const { default: app } = await import("../src/index.js");

export const usuarioAdmin = await prisma.user.upsert({
  where: { email: "admin@test.local" },
  update: {},
  create: {
    email: "admin@test.local",
    passwordHash: await bcrypt.hash("Admin123!", 10),
    rol: "ADMIN",
  },
});

export const carrera = await prisma.carrera.upsert({
  where: { nombre: "Carrera de Prueba" },
  update: {},
  create: { nombre: "Carrera de Prueba" },
});

export { app, prisma, request };