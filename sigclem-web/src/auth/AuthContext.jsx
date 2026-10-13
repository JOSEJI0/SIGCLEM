import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { CLAVE_SESION, EVENTO_SESION_EXPIRADA, leerSesion } from '../api/cliente';
import { iniciarSesion } from '../api/auth';
import { ROLES } from './roles';

const AuthContext = createContext(null);

export const PERFILES_DEV = {
  [ROLES.COORDINADOR]: { id: 1, usuario: 'coordinador', nombre: 'Coordinador de Lenguas', rol: ROLES.COORDINADOR },
  [ROLES.ALUMNO]: { id: 2, usuario: '22520187', nombre: 'José de Jesús Tepetitlán', rol: ROLES.ALUMNO },
  [ROLES.FACILITADOR]: { id: 3, usuario: 'facilitador', nombre: 'Facilitador Docente', rol: ROLES.FACILITADOR },
  [ROLES.JEFA_DGTV]: { id: 4, usuario: 'jefa.dgtv', nombre: 'Jefa del DGTV', rol: ROLES.JEFA_DGTV },
};

export const SESION_DEV_POR_DEFECTO = {
  token: 'dev-token',
  perfil: PERFILES_DEV[ROLES.COORDINADOR],
  expiraEn: Date.now() + 1000 * 60 * 60 * 24 * 365,
};

export function AuthProvider({ children }) {
  const [sesion, setSesion] = useState(() => leerSesion());
  const [expirada, setExpirada] = useState(false);

  useEffect(() => {
    const manejarSesionExpirada = () => {
      setExpirada(true);
      setSesion(null);
      localStorage.removeItem(CLAVE_SESION);
    };

    window.addEventListener(EVENTO_SESION_EXPIRADA, manejarSesionExpirada);
    return () => window.removeEventListener(EVENTO_SESION_EXPIRADA, manejarSesionExpirada);
  }, []);

  const cambiarRolDev = useCallback((nuevoRol) => {
    const nuevoPerfil = PERFILES_DEV[nuevoRol] || PERFILES_DEV[ROLES.COORDINADOR];
    const nuevaSesion = {
      token: 'dev-token',
      perfil: nuevoPerfil,
      expiraEn: Date.now() + 1000 * 60 * 60 * 24 * 365,
    };
    setExpirada(false);
    setSesion(nuevaSesion);
    localStorage.setItem(CLAVE_SESION, JSON.stringify(nuevaSesion));
  }, []);

  const cerrarSesion = useCallback(() => {
    setExpirada(false);
    setSesion(null);
    localStorage.removeItem(CLAVE_SESION);
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

  const valor = useMemo(
    () => ({
      sesion,
      perfil: sesion?.perfil ?? null,
      login,
      cerrarSesion,
      cambiarRolDev,
      expirada,
    }),
    [sesion, login, cerrarSesion, cambiarRolDev, expirada],
  );
  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return ctx;
}
