import { Eye } from 'lucide-react';
import { Alerta, Tarjeta } from '../../components/ui';

/** Panel de consulta de la jefa del DGTV (Figura 45). No contiene acciones de registro ni de autorización. */
export default function PanelSupervision() {
  return (
    <>
      <Alerta tipo="info">
        <b>Modo de solo consulta.</b> Puedes revisar toda la información del sistema y los mensajes del coordinador;
        las operaciones las realiza la coordinación.
      </Alerta>
      <Tarjeta titulo="Panorama general" icono={Eye}>
        <p className="text-tenue">Los indicadores de alumnos, grupos, constancias y aprobación se mostrarán al implementar el módulo de reportes (CU-17, CU-21).</p>
      </Tarjeta>
    </>
  );
}
