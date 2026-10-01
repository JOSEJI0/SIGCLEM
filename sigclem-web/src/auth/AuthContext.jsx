import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { CLAVE_SESION, EVENTO_SESION_EXPIRADA, leerSesion } from '../api/cliente';
import { iniciarSesion } from '../api/auth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [sesion, setSesion] = useState(() => leerSesion());
  const [expirada, setExpirada] = useState(false);

  const cerrarSesion = useCallback(() => {
    localStorage.removeItem(CLAVE_SESION);
    setSesion(null);
  }, []);

  const login = useCallback(async (usuario, contrasena) => {
    const datos = await iniciarSesion(usuario, contrasena);
    const nueva = {
      token: datos.token,
      perfil: datos.perfil,
      expiraEn: Date.now() + datos.expiraEnSegundos * 1000,
    };
    localStorage.setItem(CLAVE_SESION, JSON.stringify(nueva));
    setExpirada(false);
    setSesion(nueva);
    return nueva.perfil;
  }, []);

  // Cierra la sesión cuando la API responde 401 o cuando vence el token.
  useEffect(() => {
    const alExpirar = () => {
      cerrarSesion();
      setExpirada(true);
    };
    window.addEventListener(EVENTO_SESION_EXPIRADA, alExpirar);
    let temporizador;
    if (sesion) temporizador = setTimeout(alExpirar, Math.max(sesion.expiraEn - Date.now(), 0));
    return () => {
      window.removeEventListener(EVENTO_SESION_EXPIRADA, alExpirar);
      clearTimeout(temporizador);
    };
  }, [sesion, cerrarSesion]);

  const valor = useMemo(
    () => ({ sesion, perfil: sesion?.perfil ?? null, login, cerrarSesion, expirada }),
    [sesion, login, cerrarSesion, expirada],
  );
  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return ctx;
}
