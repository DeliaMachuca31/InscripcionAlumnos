import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle2, ClipboardList, Clock, ShieldCheck } from "lucide-react";
import { useAuth } from "../auth/auth-context.js";

const PASOS = [
  {
    icono: ClipboardList,
    titulo: "Completá el formulario",
    texto: "Datos personales, carrera y turno, en un proceso guiado paso a paso.",
  },
  {
    icono: Clock,
    titulo: "Queda pendiente",
    texto: "La facultad revisa tu inscripción y tu cuenta se crea automáticamente.",
  },
  {
    icono: CheckCircle2,
    titulo: "Recibís la aprobación",
    texto: "Te avisamos por correo y podés ver tu estado desde tu cuenta.",
  },
];

export function Home() {
  const { token } = useAuth();

  return (
    <div className="space-y-12">
      <section className="rounded-2xl bg-gradient-to-br from-marca-700 to-marca-500 px-6 py-14 text-white">
        <div className="max-w-2xl">
          <h1 className="text-3xl font-bold sm:text-4xl">
            Inscripción en línea de alumnos
          </h1>
          <p className="mt-3 text-marca-100">
            Completá tu postulación en pocos minutos, sin papeleo. Tu cuenta queda pendiente
            hasta que la facultad apruebe tu inscripción.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to={token ? "/mi-inscripcion" : "/inscripcion"}
              className="btn bg-white text-marca-700 hover:bg-marca-50"
            >
              {token ? "Ver mi inscripción" : "Comenzar inscripción"}
              <ArrowRight className="size-4" />
            </Link>
            {!token && (
              <Link to="/login" className="btn border border-white/40 text-white hover:bg-white/10">
                Ya tengo cuenta
              </Link>
            )}
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-center text-2xl font-semibold">¿Cómo funciona?</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {PASOS.map(({ icono: Icono, titulo, texto }, i) => (
            <div key={titulo} className="tarjeta">
              <div className="flex items-center gap-3">
                <span className="flex size-10 items-center justify-center rounded-lg bg-marca-50 text-marca-700">
                  <Icono className="size-5" />
                </span>
                <span className="text-xs font-semibold text-slate-400">PASO {i + 1}</span>
              </div>
              <h3 className="mt-3 font-semibold">{titulo}</h3>
              <p className="mt-1 text-sm text-slate-600">{texto}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="tarjeta flex flex-wrap items-center gap-4">
        <ShieldCheck className="size-8 shrink-0 text-emerald-600" />
        <div className="flex-1">
          <h3 className="font-semibold">Tus datos están protegidos</h3>
          <p className="text-sm text-slate-600">
            La cédula es tu identificador único y tu contraseña se almacena cifrada.
          </p>
        </div>
        <Link to="/inscripcion" className="btn-primario">
          Inscribirme ahora
        </Link>
      </section>
    </div>
  );
}