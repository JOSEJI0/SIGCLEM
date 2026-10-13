import { useEffect, useState } from 'react';
import { UserSquare } from 'lucide-react';
import { listarFacilitadores } from '../../api/facilitadores';
import { mensajeError } from '../../api/cliente';
import { Alerta, Cargando, Insignia, Tarjeta } from '../../components/ui';

export default function FacilitadoresSupervision() {
  const [facilitadores, setFacilitadores] = useState([]);
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    listarFacilitadores()
      .then(setFacilitadores)
      .catch((e) => setError(mensajeError(e)))
      .finally(() => setCargando(false));
  }, []);

  return (
    <Tarjeta titulo="Facilitadores" icono={UserSquare} extra={`${facilitadores.length} en total`}>
      {error && <Alerta tipo="error">{error}</Alerta>}
      {cargando ? <Cargando /> : facilitadores.length === 0 ? (
        <p className="text-sm text-tenue">No hay facilitadores registrados.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead className="border-b border-linea text-xs text-tenue">
              <tr>
                <th className="px-2 py-2">Nombre</th>
                <th className="px-2 py-2">Correo</th>
                <th className="px-2 py-2">Teléfono</th>
                <th className="px-2 py-2">Cuenta</th>
              </tr>
            </thead>
            <tbody>
              {facilitadores.map((facilitador) => (
                <tr className="border-b border-linea last:border-0" key={facilitador.id}>
                  <td className="px-2 py-3 font-medium">{facilitador.nombreCompleto}</td>
                  <td className="px-2 py-3">{facilitador.correo}</td>
                  <td className="px-2 py-3">{facilitador.telefono || '—'}</td>
                  <td className="px-2 py-3"><Insignia estatus={facilitador.activo ? 'Activa' : 'Inactiva'} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Tarjeta>
  );
}
