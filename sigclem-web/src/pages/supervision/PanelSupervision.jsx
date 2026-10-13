import { useEffect, useState } from 'react';
import { Eye, Users, UserSquare, CalendarDays } from 'lucide-react';
import { buscarAlumnos } from '../../api/alumnos';
import { listarFacilitadores } from '../../api/facilitadores';
import { listarGrupos } from '../../api/grupos';
import { mensajeError } from '../../api/cliente';
import { Alerta, Cargando, Tarjeta } from '../../components/ui';

/** Panel de consulta de la jefa del DGTV (Figura 45). No contiene acciones de registro ni de autorización. */
export default function PanelSupervision() {
  const [resumen, setResumen] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([
      buscarAlumnos({ tamano: 1 }),
      listarFacilitadores(),
      listarGrupos(),
    ]).then(([alumnos, facilitadores, grupos]) => {
      setResumen({
        alumnos: alumnos.totalElements,
        facilitadores: facilitadores.length,
        grupos: grupos.length,
      });
    }).catch((e) => setError(mensajeError(e)));
  }, []);

  return (
    <>
      <Alerta tipo="info">
        <b>Modo de solo consulta.</b> Puedes revisar toda la información del sistema y los mensajes del coordinador;
        las operaciones las realiza la coordinación.
      </Alerta>
      {error && <Alerta tipo="error">{error}</Alerta>}
      {error ? null : !resumen ? <Cargando texto="Cargando panorama general…" /> : (
        <div className="grid gap-[18px] sm:grid-cols-3">
          <Tarjeta titulo="Panorama general" icono={Eye}>
            <p className="text-sm text-tenue">Datos académicos disponibles para consulta.</p>
          </Tarjeta>
          <Tarjeta titulo="Alumnos" icono={Users}>
            <p className="text-2xl font-semibold">{resumen.alumnos}</p>
          </Tarjeta>
          <Tarjeta titulo="Facilitadores" icono={UserSquare}>
            <p className="text-2xl font-semibold">{resumen.facilitadores}</p>
          </Tarjeta>
          <Tarjeta titulo="Grupos" icono={CalendarDays}>
            <p className="text-2xl font-semibold">{resumen.grupos}</p>
          </Tarjeta>
        </div>
      )}
    </>
  );
}
