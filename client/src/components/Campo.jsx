export function Campo({ etiqueta, error, ayuda, children, obligatorio }) {
  return (
    <div>
      <label className="etiqueta">
        {etiqueta}
        {obligatorio && <span className="ml-0.5 text-red-500">*</span>}
      </label>
      {children}
      {ayuda && !error && <p className="mt-1 text-xs text-slate-500">{ayuda}</p>}
      {error && (
        <p className="mt-1 text-xs font-medium text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

export function Input({ error, ...props }) {
  return <input {...props} className={`campo ${error ? "campo-error" : ""}`} />;
}

export function Select({ error, children, ...props }) {
  return (
    <select {...props} className={`campo ${error ? "campo-error" : ""}`}>
      {children}
    </select>
  );
}