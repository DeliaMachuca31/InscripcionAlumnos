import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, CheckCircle2, Loader2, Send } from "lucide-react";
import { api } from "../lib/api.js";
import { validarCampo, validarFormulario } from "../lib/validacion.js";
import { Campo, Input, Select } from "../components/Campo.jsx";
import { Stepper } from "../components/Stepper.jsx";
import { Aviso, AvisoErrores } from "../components/Aviso.jsx";
import { useAuth } from "../auth/auth-context.js";
import { ETIQUETA_TURNO } from "../lib/etiquetas.js";

const PASOS = [
  { id: "personales", titulo: "Datos personales", campos: ["nombres", "apellidos", "cedula", "fechaNacimiento", "genero", "telefono"] },
  { id: "academicos", titulo: "Datos académicos", campos: ["carreraId", "turno", "anioIngreso"] },
  { id: "cuenta", titulo: "Tu cuenta", campos: ["email", "password"] },
];

const INICIAL = {
  nombres: "",
  apellidos: "",
  cedula: "",
  fechaNacimiento: "",
  genero: "",
  telefono: "",
  carreraId: "",
  turno: "",
  anioIngreso: String(new Date().getFullYear()),
  email: "",
  password: "",
};

export function InscriptionForm() {
  const navegar = useNavigate();
  const { iniciarSesion } = useAuth();

  const [datos, setDatos] = useState(INICIAL);
  const [errores, setErrores] = useState({});
  const [tocados, setTocados] = useState({});
  const [paso, setPaso] = useState(0);
  const [carreras, setCarreras] = useState([]);
  const [turnos, setTurnos] = useState([]);
  const [cargandoCatalogos, setCargandoCatalogos] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [errorApi, setErrorApi] = useState(null);
  const [detallesApi, setDetallesApi] = useState(null);
  const [exito, setExito] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    Promise.all([api.carreras(controller.signal), api.turnos(controller.signal)])
      .then(([c, t]) => {
        setCarreras(c.carreras);
        setTurnos(t.turnos);
      })
      .catch((err) => {
        if (err.name !== "AbortError") setErrorApi(err.message);
      })
      .finally(() => setCargandoCatalogos(false));
    return () => controller.abort();
  }, []);

  const cambiar = (campo) => (e) => {
    const valor = e.target.value;
    setDatos((prev) => ({ ...prev, [campo]: valor }));
    if (tocados[campo]) {
      setErrores((prev) => ({ ...prev, [campo]: validarCampo(campo, valor) }));
    }
  };

  const blur = (campo) => () => {
    setTocados((prev) => ({ ...prev, [campo]: true }));
    setErrores((prev) => ({ ...prev, [campo]: validarCampo(campo, datos[campo]) }));
  };

  const validarPaso = (indice) => {
    const campos = PASOS[indice].campos;
    const nuevos = validarFormulario(datos, campos);
    setErrores((prev) => ({ ...prev, ...nuevos }));
    setTocados((prev) => {
      const t = { ...prev };
      for (const c of campos) t[c] = true;
      return t;
    });
    return Object.keys(nuevos).length === 0;
  };

  const avanzar = () => {
    if (!validarPaso(paso)) return;
    if (paso < PASOS.length - 1) setPaso(paso + 1);
  };

  const retroceder = () => setPaso((p) => Math.max(0, p - 1));

  const enviar = async (e) => {
    e.preventDefault();
    if (!validarPaso(0) || !validarPaso(1) || !validarPaso(2)) {
      const primerError = PASOS.findIndex((p) =>
        p.campos.some((c) => validarCampo(c, datos[c])),
      );
      setPaso(Math.max(0, primerError));
      return;
    }

    setEnviando(true);
    setErrorApi(null);
    setDetallesApi(null);
    try {
      const resultado = await api.inscribir(datos);
      setExito(resultado.mensaje);
      try {
        await iniciarSesion({ email: datos.email, password: datos.password });
        navegar("/mi-inscripcion", { replace: true });
      } catch {
        navegar("/login", { replace: true });
      }
    } catch (err) {
      setErrorApi(err.message);
      setDetallesApi(err.details ?? null);
    } finally {
      setEnviando(false);
    }
  };

  const error = (campo) => (tocados[campo] ? errores[campo] : "");

  if (exito) {
    return (
      <div className="tarjeta mx-auto max-w-md text-center">
        <CheckCircle2 className="mx-auto size-12 text-emerald-600" />
        <h2 className="mt-3 text-lg font-semibold">¡Inscripción registrada!</h2>
        <p className="mt-1 text-sm text-slate-600">{exito}</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="tarjeta mb-6">
        <Stepper pasos={PASOS} actual={paso} />
      </div>

      <form onSubmit={enviar} noValidate className="tarjeta space-y-5">
        {errorApi && (
          <Aviso tipo="error" onCerrar={() => setErrorApi(null)}>
            {errorApi}
            <AvisoErrores details={detallesApi} />
          </Aviso>
        )}

        {paso === 0 && (
          <section className="grid gap-4 sm:grid-cols-2">
            <Campo etiqueta="Nombres" error={error("nombres")} obligatorio>
              <Input error={error("nombres")} value={datos.nombres} onChange={cambiar("nombres")} onBlur={blur("nombres")} placeholder="Juan Carlos" />
            </Campo>
            <Campo etiqueta="Apellidos" error={error("apellidos")} obligatorio>
              <Input error={error("apellidos")} value={datos.apellidos} onChange={cambiar("apellidos")} onBlur={blur("apellidos")} placeholder="Pérez" />
            </Campo>
            <Campo etiqueta="Cédula" error={error("cedula")} ayuda="Será tu identificador único" obligatorio>
              <Input error={error("cedula")} value={datos.cedula} onChange={cambiar("cedula")} onBlur={blur("cedula")} inputMode="numeric" placeholder="12345678" />
            </Campo>
            <Campo etiqueta="Fecha de nacimiento" error={error("fechaNacimiento")} obligatorio>
              <Input error={error("fechaNacimiento")} type="date" value={datos.fechaNacimiento} onChange={cambiar("fechaNacimiento")} onBlur={blur("fechaNacimiento")} />
            </Campo>
            <Campo etiqueta="Género" error={error("genero")} obligatorio>
              <Select error={error("genero")} value={datos.genero} onChange={cambiar("genero")} onBlur={blur("genero")}>
                <option value="">Seleccionar</option>
                <option value="MASCULINO">Masculino</option>
                <option value="FEMENINO">Femenino</option>
                <option value="OTRO">Otro</option>
              </Select>
            </Campo>
            <Campo etiqueta="Teléfono" error={error("telefono")} obligatorio>
              <Input error={error("telefono")} value={datos.telefono} onChange={cambiar("telefono")} onBlur={blur("telefono")} placeholder="0991 234 567" />
            </Campo>
          </section>
        )}

        {paso === 1 && (
          <section className="space-y-4">
            <Campo etiqueta="Carrera" error={error("carreraId")} obligatorio>
              <Select error={error("carreraId")} value={datos.carreraId} onChange={cambiar("carreraId")} onBlur={blur("carreraId")} disabled={cargandoCatalogos}>
                <option value="">{cargandoCatalogos ? "Cargando..." : "Seleccionar carrera"}</option>
                {carreras.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre}
                  </option>
                ))}
              </Select>
            </Campo>
            <div className="grid gap-4 sm:grid-cols-2">
              <Campo etiqueta="Turno preferido" error={error("turno")} obligatorio>
                <Select error={error("turno")} value={datos.turno} onChange={cambiar("turno")} onBlur={blur("turno")}>
<option value="">Seleccionar</option>
                  {turnos.map((t) => (
                    <option key={t} value={t}>
                      {ETIQUETA_TURNO[t]}
                    </option>
                  ))}
                </Select>
              </Campo>
              <Campo etiqueta="Año de ingreso" error={error("anioIngreso")} obligatorio>
                <Input error={error("anioIngreso")} type="number" value={datos.anioIngreso} onChange={cambiar("anioIngreso")} onBlur={blur("anioIngreso")} />
              </Campo>
            </div>
          </section>
        )}

        {paso === 2 && (
          <section className="space-y-4">
            <Aviso tipo="info">
              Tu cuenta se crea automáticamente y queda <strong>pendiente</strong> hasta que la
              facultad apruebe tu inscripción.
            </Aviso>
            <Campo etiqueta="Correo electrónico" error={error("email")} obligatorio>
              <Input error={error("email")} type="email" value={datos.email} onChange={cambiar("email")} onBlur={blur("email")} placeholder="tu@correo.com" autoComplete="email" />
            </Campo>
            <Campo etiqueta="Contraseña" error={error("password")} ayuda="Mínimo 8 caracteres" obligatorio>
              <Input error={error("password")} type="password" value={datos.password} onChange={cambiar("password")} onBlur={blur("password")} autoComplete="new-password" />
            </Campo>
          </section>
        )}

        <div className="flex items-center justify-between gap-3 border-t border-slate-200 pt-4">
          <button type="button" onClick={retroceder} disabled={paso === 0 || enviando} className="btn-secundario">
            <ArrowLeft className="size-4" />
            Atrás
          </button>
          {paso < PASOS.length - 1 ? (
            <button type="button" onClick={avanzar} className="btn-primario">
              Continuar
              <ArrowRight className="size-4" />
            </button>
          ) : (
            <button type="submit" disabled={enviando} className="btn-primario">
              {enviando ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
              {enviando ? "Enviando..." : "Finalizar inscripción"}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}