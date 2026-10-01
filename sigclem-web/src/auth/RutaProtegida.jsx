import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';

/** Permite el acceso solo a usuarios autenticados con alguno de los roles indicados (Tabla 59). */
export default function RutaProtegida({ roles }) {
  const { perfil } = useAuth();
  const ubicacion = useLocation();
  if (!perfil) return <Navigate to="/login" replace state={{ desde: ubicacion.pathname }} />;
  if (roles && !roles.includes(perfil.rol)) return <Navigate to="/no-autorizado" replace />;
  return <Outlet />;
}
