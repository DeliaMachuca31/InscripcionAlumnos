const REGEX = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  cedula: /^[0-9]{5,20}$/,
  telefono: /^[0-9+\-\s()]{7,20}$/,
  soloTexto: /^[\p{L}\s'.-]{2,80}$/u,
};

const requerido = (mensaje) => (v) => (v?.trim() ? "" : mensaje);

export const reglas = {
  nombres: [requerido("Ingresá tus nombres"), (v) => (REGEX.soloTexto.test(v.trim()) ? "" : "Solo letras")],
  apellidos: [requerido("Ingresá tus apellidos"), (v) => (REGEX.soloTexto.test(v.trim()) ? "" : "Solo letras")],
  cedula: [
    requerido("Ingresá tu cédula"),
    (v) => (REGEX.cedula.test(v.trim()) ? "" : "Debe tener entre 5 y 20 dígitos"),
  ],
  fechaNacimiento: [
    requerido("Seleccioná tu fecha de nacimiento"),
    (v) => {
      const fecha = new Date(v);
      if (Number.isNaN(fecha.getTime())) return "Fecha inválida";
      if (fecha >= new Date()) return "No puede ser futura";
      const edad = (Date.now() - fecha) / 31557600000;
      if (edad < 15) return "Debés tener al menos 15 años";
      if (edad > 100) return "Fecha inválida";
      return "";
    },
  ],
  genero: [requerido("Seleccioná un género")],
  telefono: [
    requerido("Ingresá tu teléfono"),
    (v) => (REGEX.telefono.test(v.trim()) ? "" : "Teléfono inválido"),
  ],
  email: [
    requerido("Ingresá tu correo"),
    (v) => (REGEX.email.test(v.trim()) ? "" : "Correo inválido"),
  ],
  password: [
    requerido("Creá una contraseña"),
    (v) => (v.length >= 8 ? "" : "Mínimo 8 caracteres"),
  ],
  carreraId: [requerido("Seleccioná una carrera")],
  turno: [requerido("Seleccioná un turno")],
  anioIngreso: [
    requerido("Ingresá el año de ingreso"),
    (v) => {
      const n = Number(v);
      if (!Number.isInteger(n)) return "Debe ser un número entero";
      if (n < 2000) return "Año inválido";
      if (n > new Date().getFullYear() + 1) return "No puede ser futuro";
      return "";
    },
  ],
};

export function validarCampo(campo, valor) {
  const lista = reglas[campo];
  if (!lista) return "";
  for (const fn of lista) {
    const error = fn(String(valor ?? ""));
    if (error) return error;
  }
  return "";
}

export function validarFormulario(datos, campos) {
  const errores = {};
  for (const campo of campos) {
    const error = validarCampo(campo, datos[campo]);
    if (error) errores[campo] = error;
  }
  return errores;
}