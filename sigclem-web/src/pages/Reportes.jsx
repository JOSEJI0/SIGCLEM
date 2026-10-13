import { useEffect, useState } from 'react';
import { BarChart3, Printer } from 'lucide-react';
import { obtenerPeriodos } from '../api/catalogos';
import { obtenerReporteAcademico } from '../api/reportes';
import { mensajeError } from '../api/cliente';
import { Alerta, Boton, Campo, Cargando, Tarjeta, claseEntrada } from '../components/ui';

const numero = (valor) => new Intl.NumberFormat('es-MX', { maximumFractionDigits: 1 }).format(valor);

function hoyLocal() {
  const hoy = new Date();
  return `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}-${String(hoy.getDate()).padStart(2, '0')}`;
}

export default function Reportes() {
  const [periodos, setPeriodos] = useState([]);
  const [periodoId, setPeriodoId] = useState('');
  const [reporte, setReporte] = useState(null);
  const [cargandoPeriodos, setCargandoPeriodos] = useState(true);
  const [cargandoReporte, setCargandoReporte] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    obtenerPeriodos()
      .then((data) => {
        setPeriodos(data);
        const hoy = hoyLocal();
        const periodoActual = data.find((periodo) => periodo.fechaInicio <= hoy && periodo.fechaFin >= hoy);
        if (data.length) setPeriodoId(String((periodoActual || data[0]).id));
      })
      .catch((e) => setError(mensajeError(e)))
      .finally(() => setCargandoPeriodos(false));
  }, []);

  useEffect(() => {
    if (!periodoId) {
      setReporte(null);
      return;
    }
    setCargandoReporte(true);
    obtenerReporteAcademico(periodoId)
      .then((data) => {
        setReporte(data);
        setError('');
      })
      .catch((e) => setError(mensajeError(e)))
      .finally(() => setCargandoReporte(false));
  }, [periodoId]);

  if (cargandoPeriodos) return <Cargando texto="Cargando periodos…" />;

  return (
    <div className="grid gap-[18px]">
      <div className="flex flex-wrap items-end justify-between gap-3 print:hidden">
        <div>
          <h1 className="flex items-center gap-2 text-xl font-bold"><BarChart3 className="h-5 w-5" /> Reporte académico</h1>
          <p className="mt-1 text-sm text-tenue">Inscripciones y resultados de cursos por periodo académico.</p>
        </div>
        {periodos.length > 0 && (
          <div className="flex items-end gap-2">
            <Campo etiqueta="Periodo" id="periodoReporte">
              <select id="periodoReporte" className={claseEntrada} value={periodoId}
                onChange={(evento) => setPeriodoId(evento.target.value)}>
                {periodos.map((periodo) => (
                  <option key={periodo.id} value={periodo.id}>{periodo.nombre}</option>
                ))}
              </select>
            </Campo>
            <Boton variante="secundario" type="button" onClick={() => window.print()}>
              <Printer className="h-4 w-4" /> Imprimir
            </Boton>
          </div>
        )}
      </div>

      {error && <Alerta tipo="error">{error}</Alerta>}
      {!error && periodos.length === 0 && (
        <Alerta tipo="info">No hay periodos académicos registrados para consultar.</Alerta>
      )}
      {cargandoReporte && <Cargando texto="Generando reporte…" />}
      {reporte && !cargandoReporte && (
        <>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <Tarjeta titulo="Grupos">
              <p className="text-2xl font-semibold">{reporte.grupos}</p>
              <p className="mt-1 text-xs text-tenue">{reporte.actasCerradas} actas cerradas</p>
            </Tarjeta>
            <Tarjeta titulo="Alumnado inscrito">
              <p className="text-2xl font-semibold">{reporte.alumnosInscritos}</p>
              <p className="mt-1 text-xs text-tenue">{reporte.alumnosUnicos} alumnos distintos</p>
            </Tarjeta>
            <Tarjeta titulo="Promedio publicado">
              <p className="text-2xl font-semibold">
                {reporte.promedioPublicado == null ? '—' : numero(reporte.promedioPublicado)}
              </p>
              <p className="mt-1 text-xs text-tenue">Solo considera actas cerradas</p>
            </Tarjeta>
            <Tarjeta titulo="Resultados publicados">
              <p className="text-2xl font-semibold">{reporte.acreditados + reporte.noAcreditados}</p>
              <p className="mt-1 text-xs text-tenue">
                {reporte.acreditados} acreditados · {reporte.noAcreditados} no acreditados
              </p>
            </Tarjeta>
          </div>

          <Tarjeta titulo={`Detalle por nivel · ${reporte.periodo.nombre}`} icono={BarChart3}
            extra={`${reporte.calificacionesPendientes} calificaciones pendientes`}>
            {reporte.porNivel.length === 0 ? (
              <p className="text-sm text-tenue">No hay grupos ni inscripciones en este periodo.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px] text-left">
                  <thead><tr className="border-b border-linea text-xs text-tenue">
                    <th className="py-2 pr-3">Nivel</th><th className="py-2 pr-3">Grupos</th>
                    <th className="py-2 pr-3">Inscripciones</th><th className="py-2 pr-3">Promedio publicado</th>
                    <th className="py-2 pr-3">Acreditados</th><th className="py-2 pr-3">No acreditados</th>
                    <th className="py-2">Pendientes</th>
                  </tr></thead>
                  <tbody>{reporte.porNivel.map((nivel) => (
                    <tr className="border-b border-linea last:border-0" key={nivel.numeroNivel}>
                      <td className="py-3 pr-3 font-medium">{nivel.numeroNivel}. {nivel.nivel}</td>
                      <td className="py-3 pr-3">{nivel.grupos}</td>
                      <td className="py-3 pr-3">{nivel.alumnosInscritos}</td>
                      <td className="py-3 pr-3">
                        {nivel.promedioPublicado == null ? '—' : numero(nivel.promedioPublicado)}
                      </td>
                      <td className="py-3 pr-3">{nivel.acreditados}</td>
                      <td className="py-3 pr-3">{nivel.noAcreditados}</td>
                      <td className="py-3">{nivel.calificacionesPendientes}</td>
                    </tr>
                  ))}</tbody>
                </table>
              </div>
            )}
          </Tarjeta>
          <p className="text-xs text-tenue">
            Las calificaciones y promedios se calculan únicamente con actas cerradas. La calificación mínima aprobatoria es 70.
          </p>
        </>
      )}
    </div>
  );
}
