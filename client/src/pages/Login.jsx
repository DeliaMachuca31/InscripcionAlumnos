import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, LogIn } from "lucide-react";
import { useAuth } from "../auth/auth-context.js";
import { Aviso } from "../components/Aviso.jsx";
import { Campo, Input } from "../components/Campo.jsx";

export function Login() {
  const navegar = useNavigate();
  const { iniciarSesion } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState(null);
  const [enviando, setEnviando] = useState(false);

  const enviar = async (e) => {
    e.preventDefault();
    setEnviando(true);
    setError(null);
    try {
      const datos = await iniciarSesion(form);
      navegar(datos.usuario.rol === "ADMIN" ? "/admin" : "/mi-inscripcion", {
        replace: true,
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="mx-auto max-w-md">
      <form onSubmit={enviar} className="tarjeta space-y-4">
        <div className="text-center">
          <h1 className="text-xl font-semibold">Iniciar sesión</h1>
          <p className="mt-1 text-sm text-slate-500">Ingresá con tu cuenta de alumno</p>
        </div>

        {error && <Aviso tipo="error">{error}</Aviso>}

        <Campo etiqueta="Correo electrónico">
          <Input
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="tu@correo.com"
            autoComplete="email"
            required
          />
        </Campo>
        <Campo etiqueta="Contraseña">
          <Input
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            autoComplete="current-password"
            required
          />
        </Campo>

        <button type="submit" disabled={enviando} className="btn-primario w-full">
          {enviando ? <Loader2 className="size-4 animate-spin" /> : <LogIn className="size-4" />}
          {enviando ? "Ingresando..." : "Ingresar"}
        </button>
      </form>
    </div>
  );
}