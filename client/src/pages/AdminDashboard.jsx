import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Loader2, Search, Users, X } from "lucide-react";
import { api } from "../lib/api.js";
import { useAuth } from "../auth/auth-context.js";
import { Badge } from "../components/Badge.jsx";
import { ETIQUETA_GENERO, ETIQUETA_TURNO } from "../lib/etiquetas.js";
import { Aviso } from "../components/Aviso.jsx";
import { Select } from "../components/Campo.jsx";

const ESTADOS = ["", "PENDIENTE", "APROBADO", "RECHAZADO"];

export function AdminDashboard() {
  const { token } = useAuth();
  const [filtros, setFiltros] = useState({ estado: "", carreraId: "", cedula: "" });
  const [busca, setBusca] = useState("");
  const [pagina, setPagina] = useState(1);
  const [datos, setDatos] = useState({ alumnos: [], paginacion: { total: 0, paginas: 1 } });
  const [carreras, setCarreras] = useState([]);
  const [estadisticas, setEstadisticas] = useState(null);
  const [seleccionado, setSeleccionado] = useState(null);
  const [claveCargada, setClaveCargada] = useState(null);
  const [error, setError] = useState(null);

  const clave = JSON.stringify([filtros, busca, pagina]);
  const cargando = clave !== claveCargada;

  const cargar = useCallback(async () => {
    const consulta = JSON.stringify([filtros, busca, pagina]);
    try {
      const [lista, stats] = await Promise.all([
        api.admin.alumnos(token, { ...filtros, q: busca, page: pagina, limit: 10 }),
        api.admin.estadisticas(token),
      ]);
      setDatos(lista);
      setEstadisticas(stats);
      setClaveCargada(consulta);
    } catch (err) {
      setError(err.message);
      setClaveCargada(consulta);
    }
  }, [token, filtros, busca, pagina]);

  useEffect(() => {
    const t = setTimeout(() => cargar(), 250);
    return () => clearTimeout(t);
  }, [cargar]);

  useEffect(() => {
    const controller = new AbortController();
    api
      .carreras(controller.signal)
      .then((c) => setCarreras(c.carreras))
      .catch((err) => err.name !== "AbortError" && setError(err.message));
    return () => controller.abort();
  }, []);

  const cambiarEstado = async (alumno, estado) => {
    try {
      const r = await api.admin.cambiarEstado(token, alumno.id, { estado });
      setDatos((prev) => ({
        ...prev,
        alumnos: prev.alumnos.map((a) => (a.id === alumno.id ? r.alumno : a)),
      }));
      setSeleccionado((prev) => (prev?.id === alumno.id ? r.alumno : prev));
      const stats = await api.admin.estadisticas(token);
      setEstadisticas(stats);
    } catch (err) {
      setError(err.message);
    }
  };

  const filtroActivo = filtros.estado || filtros.carreraId || filtros.cedula || busca;
  const { paginacion } = datos;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">Panel de inscripciones</h1>
        {estadisticas && (
          <div className="flex flex-wrap gap-2 text-sm">
            <Pildra texto="Total" valor={estadisticas.total} />
            <Pildra texto="Pendientes" valor={estadisticas.porEstado.PENDIENTE ?? 0} tono="amber" />
            <Pildra texto="Aprobados" valor={estadisticas.porEstado.APROBADO ?? 0} tono="emerald" />
            <Pildra texto="Rechazados" valor={estadisticas.porEstado.RECHAZADO ?? 0} tono="red" />
          </div>
        )}
      </div>

      {error && <Aviso tipo="error" onCerrar={() => setError(null)}>{error}</Aviso>}

      <div className="tarjeta grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="relative sm:col-span-2">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400" />
          <input
            className="campo pl-9"
            placeholder="Buscar por nombre o apellido"
            value={busca}
            onChange={(e) => {
              setBusca(e.target.value);
              setPagina(1);
            }}
          />
        </div>
        <Select
          value={filtros.estado}
          onChange={(e) => {
            setFiltros((f) => ({ ...f, estado: e.target.value }));
            setPagina(1);
          }}
        >
          {ESTADOS.map((e) => (
            <option key={e || "todos"} value={e}>
              {e === "" ? "Todos los estados" : e[0] + e.slice(1).toLowerCase()}
            </option>
          ))}
        </Select>
        <Select
          value={filtros.carreraId}
          onChange={(e) => {
            setFiltros((f) => ({ ...f, carreraId: e.target.value }));
            setPagina(1);
          }}
        >
          <option value="">Todas las carreras</option>
          {carreras.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nombre}
            </option>
          ))}
        </Select>
        <input
          className="campo"
          placeholder="Cédula"
          inputMode="numeric"
          value={filtros.cedula}
          onChange={(e) => {
            setFiltros((f) => ({ ...f, cedula: e.target.value }));
            setPagina(1);
          }}
        />
        {filtroActivo && (
          <button
            className="btn-secundario"
            onClick={() => {
              setFiltros({ estado: "", carreraId: "", cedula: "" });
              setBusca("");
            }}
          >
            <X className="size-4" />
            Limpiar
          </button>
        )}
      </div>

      <div className="tarjeta overflow-x-auto p-0">
        <table className="w-full text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">Alumno</th>
              <th className="px-4 py-3">Cédula</th>
              <th className="px-4 py-3">Carrera</th>
              <th className="px-4 py-3">Turno</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {datos.alumnos.map((a) => (
              <tr key={a.id} className="hover:bg-slate-50">
                <td className="px-4 py-3">
                  <p className="font-medium">
                    {a.nombres} {a.apellidos}
                  </p>
                  <p className="text-xs text-slate-500">{a.user?.email}</p>
                </td>
                <td className="px-4 py-3">{a.cedula}</td>
                <td className="px-4 py-3">{a.carrera?.nombre}</td>
                <td className="px-4 py-3">{ETIQUETA_TURNO[a.turno]}</td>
                <td className="px-4 py-3">
                  <Badge estado={a.estado} />
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-1">
                    <BotonAccion onClick={() => cambiarEstado(a, "APROBADO")} disabled={a.estado === "APROBADO"} tono="emerald">
                      Aprobar
                    </BotonAccion>
                    <BotonAccion onClick={() => cambiarEstado(a, "RECHAZADO")} disabled={a.estado === "RECHAZADO"} tono="red">
                      Rechazar
                    </BotonAccion>
                    <BotonAccion onClick={() => setSeleccionado(a)} tono="slate">
                      Ver
                    </BotonAccion>
                  </div>
                </td>
              </tr>
            ))}
            {!cargando && datos.alumnos.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-slate-500">
                  <Users className="mx-auto mb-2 size-8 text-slate-300" />
                  No hay inscripciones que coincidan con los filtros.
                </td>
              </tr>
            )}
            {cargando && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-slate-500">
                  <Loader2 className="mx-auto size-6 animate-spin" />
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {paginacion.paginas > 1 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-500">
            Página {paginacion.pagina} de {paginacion.paginas} · {paginacion.total} resultados
          </span>
          <div className="flex gap-2">
            <button
              className="btn-secundario"
              disabled={pagina <= 1}
              onClick={() => setPagina((p) => p - 1)}
            >
              <ChevronLeft className="size-4" />
              Anterior
            </button>
            <button
              className="btn-secundario"
              disabled={pagina >= paginacion.paginas}
              onClick={() => setPagina((p) => p + 1)}
            >
              Siguiente
              <ChevronRight className="size-4" />
            </button>
          </div>
        </div>
      )}

      {seleccionado && (
        <DetalleAlumno alumno={seleccionado} onCerrar={() => setSeleccionado(null)} />
      )}
    </div>
  );
}

function Pildra({ texto, valor, tono = "slate" }) {
  const clases = {
    slate: "bg-slate-100 text-slate-700",
    amber: "bg-amber-100 text-amber-800",
    emerald: "bg-emerald-100 text-emerald-800",
    red: "bg-red-100 text-red-800",
  };
  return (
    <span className={`rounded-lg px-3 py-1.5 font-medium ${clases[tono]}`}>
      {texto}: <span className="font-semibold">{valor}</span>
    </span>
  );
}

function BotonAccion({ children, tono, ...props }) {
  const clases = {
    emerald: "text-emerald-700 hover:bg-emerald-50",
    red: "text-red-700 hover:bg-red-50",
    slate: "text-slate-600 hover:bg-slate-100",
  };
  return (
    <button
      {...props}
      className={`rounded-md px-2.5 py-1.5 text-xs font-semibold disabled:opacity-40 ${clases[tono]}`}
    >
      {children}
    </button>
  );
}

function DetalleAlumno({ alumno, onCerrar }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/40 p-0 sm:items-center sm:p-4"
      onClick={onCerrar}
    >
      <div
        className="max-h-full w-full max-w-lg overflow-y-auto rounded-t-xl bg-white p-5 sm:rounded-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h2 className="text-lg font-semibold">
              {alumno.nombres} {alumno.apellidos}
            </h2>
            <p className="text-sm text-slate-500">{alumno.carrera?.nombre}</p>
          </div>
          <button onClick={onCerrar} className="rounded p-1 hover:bg-slate-100" aria-label="Cerrar">
            <X className="size-5" />
          </button>
        </div>

        <dl className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
          {[
            ["Cédula", alumno.cedula],
            ["Correo", alumno.user?.email ?? "—"],
            ["Teléfono", alumno.telefono],
            ["Género", ETIQUETA_GENERO[alumno.genero] ?? alumno.genero],
            ["Turno", ETIQUETA_TURNO[alumno.turno]],
            ["Año de ingreso", alumno.anioIngreso],
            ["Fecha de nacimiento", new Date(alumno.fechaNacimiento).toLocaleDateString("es")],
            ["Registrado", new Date(alumno.createdAt).toLocaleDateString("es")],
          ].map(([etiqueta, valor]) => (
            <div key={etiqueta}>
              <dt className="text-xs text-slate-500">{etiqueta}</dt>
              <dd className="text-sm font-medium">{valor}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-4 flex items-center justify-between border-t border-slate-200 pt-4">
          <span className="text-sm text-slate-500">Estado actual</span>
          <Badge estado={alumno.estado} />
        </div>
      </div>
    </div>
  );
}