import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const CARRERAS = [
  { nombre: "Ingeniería en Sistemas", descripcion: "Grado en Ingeniería de Sistemas" },
  { nombre: "Ingeniería Civil", descripcion: "Grado en Ingeniería Civil" },
  { nombre: "Ingeniería Electrónica", descripcion: "Grado en Ingeniería Electrónica" },
  { nombre: "Contaduría General", descripcion: "Grado en Contaduría General" },
  { nombre: "Administración de Empresas", descripcion: "Grado en Administración de Empresas" },
  { nombre: "Psicología", descripcion: "Grado en Psicología" },
  { nombre: "Derecho", descripcion: "Grado en Derecho" },
];

async function main() {
  const passwordHash = await bcrypt.hash(process.env.ADMIN_PASSWORD ?? "Admin123!", 10);

  await prisma.user.upsert({
    where: { email: process.env.ADMIN_EMAIL ?? "admin@facultad.edu" },
    update: { rol: "ADMIN", passwordHash, activo: true },
    create: {
      email: process.env.ADMIN_EMAIL ?? "admin@facultad.edu",
      passwordHash,
      rol: "ADMIN",
    },
  });

  for (const carrera of CARRERAS) {
    await prisma.carrera.upsert({
      where: { nombre: carrera.nombre },
      update: { descripcion: carrera.descripcion, activa: true },
      create: carrera,
    });
  }

  console.log("Seed completo:", CARRERAS.length, "carreras y 1 administrador.");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());