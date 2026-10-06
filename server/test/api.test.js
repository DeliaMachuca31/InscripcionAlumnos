import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import { app, carrera, prisma, request } from "./helpers.js";

before(async () => {
  await prisma.user.deleteMany({ where: { rol: "ALUMNO" } });
});

after(async () => {
  await prisma.$disconnect();
});

const ALUMNO = {
  nombres: "Ana",
  apellidos: "Ruiz",
  cedula: "11223344",
  fechaNacimiento: "2005-05-15",
  genero: "FEMENINO",
  telefono: "0991112233",
  email: "ana@test.local",
  password: "Test1234",
  turno: "MANANA",
  anioIngreso: 2026,
};

const inscripcion = (over = {}) => ({ ...ALUMNO, carreraId: carrera.id, ...over });

describe("POST /api/inscripcion", () => {
  it("crea la cuenta y deja la inscripcion en PENDIENTE", async () => {
    const res = await request(app).post("/api/inscripcion").send(inscripcion());

    assert.equal(res.status, 201);
    assert.equal(res.body.alumno.estado, "PENDIENTE");
    assert.equal(res.body.alumno.cedula, "11223344");

    const user = await prisma.user.findUnique({
      where: { email: ALUMNO.email },
      include: { alumno: true },
    });
    assert.equal(user.rol, "ALUMNO");
    assert.equal(user.alumno.estado, "PENDIENTE");
  });

  it("rechaza cedula duplicada", async () => {
    const res = await request(app)
      .post("/api/inscripcion")
      .send(inscripcion({ email: "otro@test.local" }));

    assert.equal(res.status, 409);
    assert.ok(res.body.error);
  });

  it("rechaza email duplicado", async () => {
    const res = await request(app)
      .post("/api/inscripcion")
      .send(inscripcion({ cedula: "55667788" }));

    assert.equal(res.status, 409);
  });

  it("rechaza campos incompletos con detalle por campo", async () => {
    const res = await request(app).post("/api/inscripcion").send({ nombres: "A" });

    assert.equal(res.status, 400);
    assert.ok(res.body.details.cedula);
    assert.ok(res.body.details.email);
  });

  it("rechaza contrasena corta", async () => {
    const res = await request(app)
      .post("/api/inscripcion")
      .send(inscripcion({ password: "123", email: "corta@test.local", cedula: "99001122" }));

    assert.equal(res.status, 400);
    assert.ok(res.body.details.password);
  });

  it("rechaza una carrera inexistente", async () => {
    const res = await request(app)
      .post("/api/inscripcion")
      .send(
        inscripcion({
          email: "sincarrera@test.local",
          cedula: "33445566",
          carreraId: "00000000-0000-0000-0000-000000000000",
        }),
      );

    assert.equal(res.status, 400);
  });
});

describe("POST /api/auth/login", () => {
  it("devuelve token y el alumno con su estado", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: ALUMNO.email, password: ALUMNO.password });

    assert.equal(res.status, 200);
    assert.ok(res.body.token);
    assert.equal(res.body.usuario.rol, "ALUMNO");
    assert.equal(res.body.alumno.estado, "PENDIENTE");
  });

  it("rechaza contrasena incorrecta sin revelar el motivo", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: ALUMNO.email, password: "incorrecta" });

    assert.equal(res.status, 401);
    assert.equal(res.body.error, "Credenciales inválidas");
  });

  it("rechaza email inexistente", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "nadie@test.local", password: "Test1234" });

    assert.equal(res.status, 401);
  });
});

describe("rutas protegidas", () => {
  it("GET /api/admin/alumnos exige token", async () => {
    const res = await request(app).get("/api/admin/alumnos");
    assert.equal(res.status, 401);
  });

  it("GET /api/admin/alumnos rechaza token invalido", async () => {
    const res = await request(app)
      .get("/api/admin/alumnos")
      .set("Authorization", "Bearer no.es.valido");

    assert.equal(res.status, 401);
  });

  it("un alumno no puede entrar al panel admin", async () => {
    const login = await request(app)
      .post("/api/auth/login")
      .send({ email: ALUMNO.email, password: ALUMNO.password });

    const res = await request(app)
      .get("/api/admin/alumnos")
      .set("Authorization", `Bearer ${login.body.token}`);

    assert.equal(res.status, 403);
  });

  it("GET /api/auth/perfil devuelve el alumno asociado", async () => {
    const login = await request(app)
      .post("/api/auth/login")
      .send({ email: ALUMNO.email, password: ALUMNO.password });

    const res = await request(app)
      .get("/api/auth/perfil")
      .set("Authorization", `Bearer ${login.body.token}`);

    assert.equal(res.status, 200);
    assert.equal(res.body.alumno.cedula, ALUMNO.cedula);
    assert.equal(res.body.usuario.rol, "ALUMNO");
  });
});

describe("panel de administracion", () => {
  let token;
  let alumnoId;

  before(async () => {
    token = (
      await request(app)
        .post("/api/auth/login")
        .send({ email: "admin@test.local", password: "Admin123!" })
    ).body.token;

    alumnoId = (await prisma.alumno.findUnique({ where: { cedula: ALUMNO.cedula } })).id;
  });

  it("lista los alumnos con paginacion", async () => {
    const res = await request(app)
      .get("/api/admin/alumnos")
      .set("Authorization", `Bearer ${token}`);

    assert.equal(res.status, 200);
    assert.ok(res.body.paginacion.total >= 1);
    assert.ok(res.body.alumnos.length >= 1);
  });

  it("filtra por estado", async () => {
    const res = await request(app)
      .get("/api/admin/alumnos?estado=PENDIENTE")
      .set("Authorization", `Bearer ${token}`);

    assert.equal(res.status, 200);
    assert.ok(res.body.alumnos.every((a) => a.estado === "PENDIENTE"));
  });

  it("filtra por busqueda de nombre", async () => {
    const res = await request(app)
      .get("/api/admin/alumnos?q=Ruiz")
      .set("Authorization", `Bearer ${token}`);

    assert.equal(res.status, 200);
    assert.ok(res.body.alumnos.some((a) => a.apellidos === "Ruiz"));
  });

  it("cambia el estado a APROBADO con observacion", async () => {
    const res = await request(app)
      .patch(`/api/admin/alumnos/${alumnoId}/estado`)
      .set("Authorization", `Bearer ${token}`)
      .send({ estado: "APROBADO", observaciones: "Documentacion ok" });

    assert.equal(res.status, 200);
    assert.equal(res.body.alumno.estado, "APROBADO");
    assert.equal(res.body.alumno.observaciones, "Documentacion ok");
  });

  it("rechaza un estado fuera del enum", async () => {
    const res = await request(app)
      .patch(`/api/admin/alumnos/${alumnoId}/estado`)
      .set("Authorization", `Bearer ${token}`)
      .send({ estado: "BANANA" });

    assert.equal(res.status, 400);
  });

  it("devuelve 404 al cambiar el estado de un alumno inexistente", async () => {
    const res = await request(app)
      .patch("/api/admin/alumnos/00000000-0000-0000-0000-000000000000/estado")
      .set("Authorization", `Bearer ${token}`)
      .send({ estado: "APROBADO" });

    assert.equal(res.status, 404);
  });

  it("el alumno ve el estado actualizado al iniciar sesion", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: ALUMNO.email, password: ALUMNO.password });

    assert.equal(res.body.alumno.estado, "APROBADO");
  });

  it("devuelve estadisticas agrupadas por estado", async () => {
    const res = await request(app)
      .get("/api/admin/estadisticas")
      .set("Authorization", `Bearer ${token}`);

    assert.equal(res.status, 200);
    assert.equal(res.body.porEstado.APROBADO, 1);
  });
});