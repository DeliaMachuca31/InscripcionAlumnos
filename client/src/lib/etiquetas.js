export const ETIQUETA_ESTADO = {
  PENDIENTE: { texto: "Pendiente", clase: "bg-amber-100 text-amber-800 ring-amber-200" },
  APROBADO: { texto: "Aprobado", clase: "bg-emerald-100 text-emerald-800 ring-emerald-200" },
  RECHAZADO: { texto: "Rechazado", clase: "bg-red-100 text-red-800 ring-red-200" },
};

export const ETIQUETA_GENERO = {
  MASCULINO: "Masculino",
  FEMENINO: "Femenino",
  OTRO: "Otro",
};

export const ETIQUETA_TURNO = {
  MANANA: "Mañana",
  TARDE: "Tarde",
  NOCHE: "Noche",
};

export const claseEstado = (estado) => ETIQUETA_ESTADO[estado]?.clase ?? "";