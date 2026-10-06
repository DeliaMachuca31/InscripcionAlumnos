import { Link } from "react-router-dom";
import { ETIQUETA_GENERO, ETIQUETA_TURNO } from "../lib/etiquetas.js";
import { Badge } from "../components/Badge.jsx";
import { useAuth } from "../auth/auth-context.js";

const FILAS = [
  ["Cédula", (a) => a.cedula],
  ["Correo", (a) => a.user?.email ?? "—"],
  ["Teléfono", (a) => a.telefono],
  ["Fecha de nacimiento", (a) => new Date(a.fechaNacimiento).toLocaleDateString("es")],
  ["Género", (a) => ETIQUETA_GENERO[a.genero] ?? a.genero],
  ["Carrera", (a) => a.carrera?.nombre ?? "—"],
  ["Turno", (a) => ETIQUETA_TURNO[a.turno] ?? a.turno],
  ["Año de ingreso", (a) => a.anioIngreso],
];

export function MiInscripcion() {
  const { alumno, esAdmin } = useAuth();

  if (!alumno) {
    return (
      <div className="tarjeta mx-auto max-w-md text-center">
        <h1 className="text-lg font-semibold">
          {esAdmin ? "No tenés una inscripción" : "Todavía no tenés una inscripción"}
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          {esAdmin
            ? "Ingresá como alumno para ver el estado de tu postulación."
            : "Completá el formulario de inscripción para crear tu cuenta y seguir tu postulación."}
        </p>
        <Link to={esAdmin ? "/admin" : "/inscripcion"} className="btn-primario mt-4">
          {esAdmin ? "Ir al panel" : "Inscribirme"}
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <div className="tarjeta">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold">
              {alumno.nombres} {alumno.apellidos}
            </h1>
            <p className="text-sm text-slate-500">{alumno.carrera?.nombre}</p>
          </div>
          <Badge estado={alumno.estado} />
        </div>

        <AvisoEstado estado={alumno.estado} />
      </div>

      <div className="tarjeta">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
          Datos registrados
        </h2>
        <dl className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
          {FILAS.map(([etiqueta, obtener]) => (
            <div key={etiqueta}>
              <dt className="text-xs text-slate-500">{etiqueta}</dt>
              <dd className="text-sm font-medium">{obtener(alumno)}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}

function AvisoEstado({ estado }) {
  if (estado === "APROBADO") {
    return (
      <p className="mt-4 rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
        Tu inscripción fue aprobada. Bienvenido/a a la facultad.
      </p>
    );
  }
  if (estado === "RECHAZADO") {
    return (
      <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-800">
        Tu inscripción fue rechazada. Contactá a la secretaría para más información.
      </p>
    );
  }
  return (
    <p className="mt-4 rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-800">
      Tu inscripción está en revisión. Te avisaremos cuando la facultad la apruebe.
    </p>
  );
}