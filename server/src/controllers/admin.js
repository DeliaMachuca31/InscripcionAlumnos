import { prisma } from "../db.js";

const selectAlumno = {
  id: true,
  cedula: true,
  nombres: true,
  apellidos: true,
  fechaNacimiento: true,
  genero: true,
  telefono: true,
  anioIngreso: true,
  turno: true,
  estado: true,
  observaciones: true,
  createdAt: true,
  carrera: { select: { id: true, nombre: true } },
  user: { select: { id: true, email: true } },
};

export async function listarAlumnos(req, res) {
  const { estado, carreraId, cedula, q, page = "1", limit = "20" } = req.query;

  const porPagina = Math.min(Math.max(Number(limit) || 20, 1), 100);
  const pagina = Math.max(Number(page) || 1, 1);

  const where = {
    ...(estado ? { estado } : {}),
    ...(carreraId ? { carreraId } : {}),
    ...(cedula ? { cedula: { contains: cedula, mode: "insensitive" } } : {}),
    ...(q
      ? {
          OR: [
            { nombres: { contains: q, mode: "insensitive" } },
            { apellidos: { contains: q, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const [total, alumnos] = await Promise.all([
    prisma.alumno.count({ where }),
    prisma.alumno.findMany({
      where,
      select: selectAlumno,
      orderBy: { createdAt: "desc" },
      skip: (pagina - 1) * porPagina,
      take: porPagina,
    }),
  ]);

  res.json({
    alumnos,
    paginacion: { total, pagina, porPagina, paginas: Math.ceil(total / porPagina) || 1 },
  });
}

export async function obtenerAlumno(req, res) {
  const alumno = await prisma.alumno.findUnique({
    where: { id: req.params.id },
    select: selectAlumno,
  });
  if (!alumno) return res.status(404).json({ error: "Alumno no encontrado" });
  res.json({ alumno });
}

export async function actualizarEstado(req, res) {
  const { estado, observaciones } = req.validado;
  const alumno = await prisma.alumno.findUnique({
    where: { id: req.params.id },
    select: { id: true },
  });
  if (!alumno) return res.status(404).json({ error: "Alumno no encontrado" });

  const actualizado = await prisma.alumno.update({
    where: { id: req.params.id },
    data: { estado, ...(observaciones !== undefined ? { observaciones } : {}) },
    select: selectAlumno,
  });

  res.json({ mensaje: `Estado actualizado a ${estado}`, alumno: actualizado });
}

export async function actualizarAlumno(req, res) {
  const existente = await prisma.alumno.findUnique({
    where: { id: req.params.id },
    select: { id: true },
  });
  if (!existente) return res.status(404).json({ error: "Alumno no encontrado" });

  const datos = { ...req.validado };
  if (datos.carreraId) {
    const carrera = await prisma.carrera.findUnique({
      where: { id: datos.carreraId },
      select: { activa: true },
    });
    if (!carrera?.activa) return res.status(400).json({ error: "Carrera no disponible" });
  }

  const actualizado = await prisma.alumno.update({
    where: { id: req.params.id },
    data: datos,
    select: selectAlumno,
  });

  res.json({ mensaje: "Alumno actualizado", alumno: actualizado });
}

export async function estadisticas(_req, res) {
  const [porEstado, total] = await Promise.all([
    prisma.alumno.groupBy({ by: ["estado"], _count: { _all: true } }),
    prisma.alumno.count(),
  ]);

  res.json({
    total,
    porEstado: Object.fromEntries(porEstado.map((e) => [e.estado, e._count._all])),
  });
}