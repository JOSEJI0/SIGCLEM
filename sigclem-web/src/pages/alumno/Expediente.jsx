import { Fragment, useEffect, useState } from 'react';
import { IdCard, Network } from 'lucide-react';
import { useAuth } from '../../auth/AuthContext';
import { obtenerExpediente } from '../../api/alumnos';
import { mensajeError } from '../../api/cliente';
import { Alerta, Cargando, Insignia, Tarjeta } from '../../components/ui';

function fecha(iso) {
  return iso ? new Date(`${iso}T00:00:00`).toLocaleDateString('es-MX') : '—';
}

/** CU-03 Consultar expediente y avance reticular (Figura 38). */
export default function Expediente() {
  const { perfil } = useAuth();
  const [exp, setExp] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    obtenerExpediente(perfil.usuario).then(setExp).catch((e) => setError(mensajeError(e)));
  }, [perfil.usuario]);

  if (error) return <Alerta tipo="error">{error}</Alerta>;
  if (!exp) return <Cargando />;

  const porcentaje = Math.round((exp.nivelesCubiertos / exp.avance.length) * 100);
  const datos = [
    ['Número de control', <b key="nc">{exp.numeroControl}</b>],
    ['Nombre', exp.nombreCompleto],
    ['Carrera', exp.carrera],
    ['Semestre', `${exp.semestre}.º`],
    ['Nivel actual', <b key="na">{exp.nivelActual}</b>],
    ['Fecha de alta', fecha(exp.fechaInscripcion)],
  ];

  return (
    <div className="grid gap-[18px] xl:grid-cols-[1fr_2fr]">
      <Tarjeta titulo="Datos generales" icono={IdCard}>
        <dl className="grid grid-cols-[140px_1fr] gap-x-3 gap-y-2">
          {datos.map(([k, v]) => (
            <Fragment key={k}><dt className="text-tenue">{k}</dt><dd>{v}</dd></Fragment>
          ))}
        </dl>
      </Tarjeta>
      <Tarjeta titulo="Avance reticular de inglés" icono={Network}
        extra={`${exp.nivelesCubiertos} de ${exp.avance.length} niveles acreditados o exentos`}>
        <div className="mb-3.5 h-2 rounded-md bg-neutro-fondo" role="progressbar" aria-valuenow={porcentaje} aria-valuemin={0} aria-valuemax={100}>
          <div className="h-2 rounded-md bg-ok" style={{ width: `${porcentaje}%` }} />
        </div>
        <ol className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-5">
          {exp.avance.map((n) => (
            <li key={n.numero} className={`rounded-[9px] border border-linea p-3 ${n.estatus === 'No permitido' ? 'bg-[#FAFBFC]' : 'bg-white'}`}>
              <div className="text-[11px] text-tenue">Nivel {n.numero} · {n.nivelMcer}</div>
              <div className="mb-2 mt-0.5 font-semibold">{n.nombre}</div>
              <Insignia estatus={n.estatus} />
            </li>
          ))}
        </ol>
        <p className="mt-3 text-xs text-tenue">Solo puedes cursar el nivel siguiente al último acreditado o exento (validación secuencial, RF-04).</p>
      </Tarjeta>
    </div>
  );
}
