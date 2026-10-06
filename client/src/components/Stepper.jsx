import { Check } from "lucide-react";

export function Stepper({ pasos, actual }) {
  return (
    <ol className="flex items-center gap-2 sm:gap-4">
      {pasos.map((paso, i) => {
        const completado = i < actual;
        const activo = i === actual;
        return (
          <li key={paso.id} className="flex flex-1 items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-2">
              <span
                className={`flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold transition-colors ${
                  completado
                    ? "bg-emerald-600 text-white"
                    : activo
                      ? "bg-marca-600 text-white"
                      : "bg-slate-200 text-slate-500"
                }`}
              >
                {completado ? <Check className="size-4" /> : i + 1}
              </span>
              <span
                className={`hidden text-sm font-medium sm:block ${
                  activo ? "text-slate-900" : "text-slate-500"
                }`}
              >
                {paso.titulo}
              </span>
            </div>
            {i < pasos.length - 1 && (
              <span
                className={`h-0.5 flex-1 rounded ${completado ? "bg-emerald-500" : "bg-slate-200"}`}
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}