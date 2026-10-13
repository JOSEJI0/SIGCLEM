import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { ROLES } from './roles';

export default function RutaProtegida({ roles = [] }) {
  const { perfil } = useAuth();
  const { pathname } = useLocation();

  if (!perfil) {
    return <Navigate to="/login" replace state={{ desde: pathname }} />;
  }

  if (roles.length > 0 && !roles.includes(perfil.rol)) {
    return <Navigate to="/no-autorizado" replace />;
  }

  return <Outlet />;
}
