import { useCallback, useEffect, useMemo, useState } from "react";
import { api } from "../lib/api.js";
import { borrarToken, guardarToken, leerToken } from "../lib/storage.js";
import { AuthContext } from "./auth-context.js";

export function AuthProvider({ children }) {
  const [token, setToken] = useState(leerToken);
  const [usuario, setUsuario] = useState(null);
  const [alumno, setAlumno] = useState(null);
  const [cargando, setCargando] = useState(Boolean(token));

  const cerrarSesion = useCallback(() => {
    borrarToken();
    setToken(null);
    setUsuario(null);
    setAlumno(null);
    setCargando(false);
  }, []);

  useEffect(() => {
    if (!token) return;
    let vigente = true;
    api
      .perfil(token)
      .then(({ usuario: u, alumno: a }) => {
        if (!vigente) return;
        setUsuario(u);
        setAlumno(a);
        setCargando(false);
      })
      .catch(() => vigente && cerrarSesion());
    return () => {
      vigente = false;
    };
  }, [token, cerrarSesion]);

  const iniciarSesion = useCallback(async (credenciales) => {
    const datos = await api.login(credenciales);
    guardarToken(datos.token);
    setUsuario(datos.usuario);
    setAlumno(datos.alumno);
    setToken(datos.token);
    return datos;
  }, []);

  const valor = useMemo(
    () => ({
      token,
      usuario,
      alumno,
      cargando,
      esAdmin: usuario?.rol === "ADMIN",
      iniciarSesion,
      cerrarSesion,
    }),
    [token, usuario, alumno, cargando, iniciarSesion, cerrarSesion],
  );

  return <AuthContext value={valor}>{children}</AuthContext>;
}