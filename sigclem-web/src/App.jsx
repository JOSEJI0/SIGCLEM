import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './auth/AuthContext';
import { ROLES, rutaInicio } from './auth/roles';
import RutaProtegida from './auth/RutaProtegida';
import LayoutPrincipal from './layout/LayoutPrincipal';
import EnConstruccion from './components/EnConstruccion';
import Login from './pages/Login';
import RegistroAlumno from './pages/RegistroAlumno';
import { NoAutorizado, NoEncontrado } from './pages/Errores';
import Expediente from './pages/alumno/Expediente';
import PanelCoordinador from './pages/coordinacion/PanelCoordinador';
import PanelSupervision from './pages/supervision/PanelSupervision';
import PanelFacilitador from './pages/facilitador/PanelFacilitador';

const pendiente = (titulo, casosUso) => <EnConstruccion titulo={titulo} casosUso={casosUso} />;

function Inicio() {
  const { perfil } = useAuth();
  return <Navigate to={perfil ? rutaInicio(perfil.rol) : '/login'} replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Inicio />} />
      <Route path="/login" element={<Login />} />
      <Route path="/registro" element={<RegistroAlumno />} />
      <Route path="/no-autorizado" element={<NoAutorizado />} />

      <Route element={<RutaProtegida roles={[ROLES.ALUMNO]} />}>
        <Route path="/alumno" element={<LayoutPrincipal />}>
          <Route index element={<Expediente />} />
          <Route path="diagnostico" element={pendiente('Evaluación de diagnóstico', 'CU-22')} />
          <Route path="pagos" element={pendiente('Pagos', 'CU-11 y CU-12')} />
          <Route path="boletas" element={pendiente('Boletas', 'CU-20')} />
          <Route path="constancias" element={pendiente('Constancias', 'CU-14')} />
          <Route path="lengua-materna" element={pendiente('Lengua materna', 'CU-18')} />
        </Route>
      </Route>

      <Route element={<RutaProtegida roles={[ROLES.FACILITADOR]} />}>
        <Route path="/facilitador" element={<LayoutPrincipal />}>
          <Route index element={<PanelFacilitador />} />
          <Route path="grupos" element={pendiente('Mis grupos', 'CU-09')} />
          <Route path="actas" element={pendiente('Actas de calificaciones', 'CU-10')} />
        </Route>
      </Route>

      <Route element={<RutaProtegida roles={[ROLES.COORDINADOR]} />}>
        <Route path="/coordinacion" element={<LayoutPrincipal />}>
          <Route index element={<PanelCoordinador />} />
          <Route path="alumnos" element={pendiente('Alumnos', 'CU-16')} />
          <Route path="diagnosticos" element={pendiente('Diagnósticos y exámenes', 'CU-05, CU-06, CU-23 y CU-24')} />
          <Route path="facilitadores" element={pendiente('Facilitadores', 'CU-07')} />
          <Route path="grupos" element={pendiente('Grupos y horarios', 'CU-08')} />
          <Route path="comprobantes" element={pendiente('Comprobantes', 'CU-13')} />
          <Route path="constancias" element={pendiente('Constancias', 'CU-15')} />
          <Route path="lenguas-maternas" element={pendiente('Lenguas maternas', 'CU-19')} />
          <Route path="reportes" element={pendiente('Reportes', 'CU-17')} />
          <Route path="mensajes" element={pendiente('Mensajes a la jefa del DGTV', 'CU-25')} />
        </Route>
      </Route>

      <Route element={<RutaProtegida roles={[ROLES.JEFA_DGTV]} />}>
        <Route path="/supervision" element={<LayoutPrincipal />}>
          <Route index element={<PanelSupervision />} />
          <Route path="alumnos" element={pendiente('Alumnos', 'CU-21')} />
          <Route path="facilitadores" element={pendiente('Facilitadores', 'CU-21')} />
          <Route path="grupos" element={pendiente('Grupos', 'CU-21')} />
          <Route path="reportes" element={pendiente('Reportes', 'CU-17 y CU-21')} />
          <Route path="mensajes" element={pendiente('Mensajes del coordinador', 'CU-25')} />
        </Route>
      </Route>

      <Route path="*" element={<NoEncontrado />} />
    </Routes>
  );
}
