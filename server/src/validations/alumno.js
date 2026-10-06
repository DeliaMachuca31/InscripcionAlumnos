import { z } from "zod";

const cedula = z
  .string()
  .trim()
  .min(5, "La cédula es muy corta")
  .max(20, "La cédula es muy larga")
  .regex(/^[0-9]+$/, "La cédula solo puede contener números");

const password = z
  .string()
  .min(8, "La contraseña debe tener al menos 8 caracteres")
  .max(72, "La contraseña es demasiado larga");

export const registroSchema = z
  .object({
    nombres: z.string().trim().min(2, "Ingresá tus nombres").max(80),
    apellidos: z.string().trim().min(2, "Ingresá tus apellidos").max(80),
    cedula,
    fechaNacimiento: z.coerce
      .date()
      .refine((d) => d < new Date(), "La fecha de nacimiento no puede ser futura")
      .refine(
        (d) => new Date().getFullYear() - d.getFullYear() >= 15,
        "Debés tener al menos 15 años",
      ),
    genero: z.enum(["MASCULINO", "FEMENINO", "OTRO"], {
      errorMap: () => ({ message: "Seleccioná un género" }),
    }),
    telefono: z
      .string()
      .trim()
      .min(7, "Ingresá un teléfono válido")
      .max(20)
      .regex(/^[0-9+\-\s()]+$/, "El teléfono solo puede contener números y símbolos"),
    email: z.string().trim().toLowerCase().email("Correo electrónico inválido"),
    password,
    carreraId: z.string().uuid("Seleccioná una carrera válida"),
    turno: z.enum(["MANANA", "TARDE", "NOCHE"], {
      errorMap: () => ({ message: "Seleccioná un turno" }),
    }),
    anioIngreso: z.coerce
      .number()
      .int("El año de ingreso debe ser un número entero")
      .min(2000, "El año de ingreso es inválido")
      .max(new Date().getFullYear() + 1, "El año de ingreso no puede ser futuro"),
  })
  .refine(
    (data) => {
      const edad = new Date().getFullYear() - data.fechaNacimiento.getFullYear();
      return edad < 100;
    },
    { message: "La fecha de nacimiento es inválida", path: ["fechaNacimiento"] },
  );

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Correo electrónico inválido"),
  password: z.string().min(1, "Ingresá tu contraseña"),
});

export const actualizarEstadoSchema = z.object({
  estado: z.enum(["PENDIENTE", "APROBADO", "RECHAZADO"], {
    errorMap: () => ({ message: "Estado inválido" }),
  }),
  observaciones: z.string().trim().max(500).optional(),
});

export const actualizarAlumnoSchema = z
  .object({
    nombres: z.string().trim().min(2).max(80).optional(),
    apellidos: z.string().trim().min(2).max(80).optional(),
    telefono: z.string().trim().min(7).max(20).optional(),
    carreraId: z.string().uuid().optional(),
    turno: z.enum(["MANANA", "TARDE", "NOCHE"]).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, { message: "No enviaste campos a actualizar" });