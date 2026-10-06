import { AlertCircle, CheckCircle2, Info, X } from "lucide-react";

const ESTILOS = {
  error: { icono: AlertCircle, clase: "bg-red-50 text-red-800 border-red-200" },
  exito: { icono: CheckCircle2, clase: "bg-emerald-50 text-emerald-800 border-emerald-200" },
  info: { icono: Info, clase: "bg-sky-50 text-sky-800 border-sky-200" },
};

export function Aviso({ tipo = "info", children, onCerrar }) {
  if (!children) return null;
  const { icono: Icono, clase } = ESTILOS[tipo] ?? ESTILOS.info;

  return (
    <div
      role="alert"
      className={`flex items-start gap-3 rounded-lg border px-4 py-3 text-sm ${clase}`}
    >
      <Icono className="mt-0.5 size-4 shrink-0" />
      <div className="flex-1">{children}</div>
      {onCerrar && (
        <button onClick={onCerrar} className="shrink-0 opacity-60 hover:opacity-100" aria-label="Cerrar">
          <X className="size-4" />
        </button>
      )}
    </div>
  );
}

export function AvisoErrores({ details }) {
  if (!details || Object.keys(details).length === 0) return null;
  return (
    <ul className="mt-2 list-disc space-y-0.5 pl-5 text-xs">
      {Object.entries(details).map(([campo, mensaje]) => (
        <li key={campo}>{mensaje}</li>
      ))}
    </ul>
  );
}