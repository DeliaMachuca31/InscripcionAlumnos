const CLAVE = "inscripcion:token";

let disponible = null;

function probar() {
  if (disponible !== null) return disponible;
  try {
    const prueba = "__prueba__";
    localStorage.setItem(prueba, "1");
    localStorage.removeItem(prueba);
    disponible = true;
  } catch {
    disponible = false;
  }
  return disponible;
}

export function leerToken() {
  if (!probar()) return null;
  try {
    return localStorage.getItem(CLAVE);
  } catch {
    return null;
  }
}

export function guardarToken(token) {
  if (!probar()) return;
  try {
    localStorage.setItem(CLAVE, token);
  } catch {
    /* modo privado o sin almacenamiento: la sesion vive solo en memoria */
  }
}

export function borrarToken() {
  if (!probar()) return;
  try {
    localStorage.removeItem(CLAVE);
  } catch {
    /* sin almacenamiento, no hay nada que borrar */
  }
}