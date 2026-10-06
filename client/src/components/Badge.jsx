import { ETIQUETA_ESTADO } from "../lib/etiquetas.js";

export function Badge({ estado }) {
  const info = ETIQUETA_ESTADO[estado];
  if (!info) return null;
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${info.clase}`}
    >
      {info.texto}
    </span>
  );
}