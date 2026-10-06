const BASE = "/api";

async function request(path, { method = "GET", body, token, signal } = {}) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    signal,
    headers: {
      ...(body ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });

  const texto = await res.text();
  const datos = texto ? JSON.parse(texto) : null;

  if (!res.ok) {
    const error = new Error(datos?.error ?? `Error ${res.status}`);
    error.status = res.status;
    error.details = datos?.details;
    throw error;
  }
  return datos;
}

export const api = {
  health: () => request("/health"),
  carreras: (signal) => request("/inscripcion/carreras", { signal }),
  turnos: (signal) => request("/inscripcion/turnos", { signal }),
  inscribir: (body) => request("/inscripcion", { method: "POST", body }),
  login: (body) => request("/auth/login", { method: "POST", body }),
  perfil: (token) => request("/auth/perfil", { token }),
  admin: {
    alumnos: (token, params = {}) => {
      const qs = new URLSearchParams(
        Object.entries(params).filter(([, v]) => v !== "" && v != null),
      ).toString();
      return request(`/admin/alumnos${qs ? `?${qs}` : ""}`, { token });
    },
    estadisticas: (token) => request("/admin/estadisticas", { token }),
    cambiarEstado: (token, id, body) =>
      request(`/admin/alumnos/${id}/estado`, { method: "PATCH", body, token }),
  },
};