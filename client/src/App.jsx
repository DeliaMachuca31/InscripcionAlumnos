import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { Loader2, LogOut } from "lucide-react";
import { useAuth } from "./auth/auth-context.js";
import { Home } from "./pages/Home.jsx";
import { InscriptionForm } from "./pages/InscriptionForm.jsx";
import { Login } from "./pages/Login.jsx";
import { MiInscripcion } from "./pages/MiInscripcion.jsx";
import { AdminDashboard } from "./pages/AdminDashboard.jsx";

function Protegida({ children, soloAdmin }) {
  const { token, cargando, esAdmin } = useAuth();
  const ubicacion = useLocation();

  if (cargando) return <PantallaCarga />;
  if (!token) return <Navigate to="/login" state={{ from: ubicacion.pathname }} replace />;
  if (soloAdmin && !esAdmin) return <Navigate to="/mi-inscripcion" replace />;
  return children;
}

function PantallaCarga() {
  return (
    <div className="flex min-h-64 items-center justify-center">
      <Loader2 className="size-8 animate-spin text-marca-600" />
    </div>
  );
}

export default function App() {
  const { token, usuario, esAdmin, cerrarSesion } = useAuth();

  return (
    <div className="flex min-h-full flex-col">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <a href="/" className="flex items-center gap-2 font-semibold text-marca-700">
            <span className="flex size-9 items-center justify-center rounded-lg bg-marca-600 text-white">
              <GraduationCapIcon />
            </span>
            <span className="hidden sm:block">Facultad · Inscripción</span>
          </a>

          <nav className="flex items-center gap-2 text-sm">
            {token ? (
              <>
                <span className="hidden text-slate-500 md:block">{usuario?.email}</span>
                <button onClick={cerrarSesion} className="btn-secundario">
                  <LogOut className="size-4" />
                  <span className="hidden sm:inline">Salir</span>
                </button>
              </>
            ) : (
              <>
                <a href="/login" className="btn-secundario">
                  Ingresar
                </a>
                <a href="/inscripcion" className="btn-primario">
                  Inscribirme
                </a>
              </>
            )}
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/inscripcion" element={<InscriptionForm />} />
          <Route path="/login" element={<Login />} />
          <Route
            path="/mi-inscripcion"
            element={
              <Protegida>
                <MiInscripcion />
              </Protegida>
            }
          />
          <Route
            path="/admin"
            element={
              <Protegida soloAdmin>
                <AdminDashboard />
              </Protegida>
            }
          />
          <Route
            path="*"
            element={
              <div className="py-20 text-center text-slate-500">
                <p className="text-lg font-medium">Página no encontrada</p>
                <a href="/" className="text-marca-600 hover:underline">
                  Volver al inicio
                </a>
              </div>
            }
          />
        </Routes>
      </main>

      <footer className="border-t border-slate-200 py-6 text-center text-xs text-slate-500">
        Sistema de Inscripción de Alumnos {esAdmin && "· Panel administrativo"}
      </footer>
    </div>
  );
}

function GraduationCapIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-5">
      <path d="M22 10 12 5 2 10l10 5 10-5Z" />
      <path d="M6 12v5c0 1.7 2.7 3 6 3s6-1.3 6-3v-5" />
    </svg>
  );
}