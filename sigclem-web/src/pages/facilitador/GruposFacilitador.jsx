import { useCallback, useEffect, useState } from 'react';
import { ClipboardCheck, Layers } from 'lucide-react';
import { mensajeError } from '../../api/cliente';
import { obtenerPeriodos } from '../../api/catalogos';
import { cerrarActa, guardarCalificaciones, listarGrupos, obtenerActa } from '../../api/grupos';
import { Alerta, Boton, Campo, Cargando, Tarjeta, claseEntrada } from '../../components/ui';

const DIAS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

function fechaLocal() {
  const hoy = new Date();
  return `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}-${String(hoy.getDate()).padStart(2, '0')}`;
}

export default function GruposFacilitador() {
  const [periodos, setPeriodos] = useState([]);
  const [periodoId, setPeriodoId] = useState('');
  const [grupos, setGrupos] = useState([]);
  const [acta, setActa] = useState(null);
  const [calificaciones, setCalificaciones] = useState({});
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [confirmarCierre, setConfirmarCierre] = useState(false);
  const [error, setError] = useState('');
  const [aviso, setAviso] = useState('');

  const cargarGrupos = useCallback(async () => {
    try {
      setError('');
      setGrupos(await listarGrupos(periodoId || undefined));
    } catch (e) {
      setError(mensajeError(e));
    } finally {
      setCargando(false);
    }
  }, [periodoId]);

  useEffect(() => {
    obtenerPeriodos().then((datos) => {
      setPeriodos(datos);
      const actual = fechaLocal();
      const vigente = datos.find((p) => p.fechaInicio <= actual && p.fechaFin >= actual);
      setPeriodoId(String(vigente?.id ?? datos[0]?.id ?? ''));
    }).catch((e) => setError(mensajeError(e)));
  }, []);

  useEffect(() => { setActa(null); cargarGrupos(); }, [cargarGrupos]);

  async function abrirActa(id) {
    try {
      setError('');
      setAviso('');
      setConfirmarCierre(false);
      const resultado = await obtenerActa(id);
      setActa(resultado);
      setCalificaciones(Object.fromEntries(resultado.alumnos.map((a) => [a.numeroControl, a.calificacionFinal ?? ''])));
    } catch (e) {
      setError(mensajeError(e));
    }
  }

  function cambiarCalificacion(numeroControl, valor) {
    setCalificaciones((previo) => ({ ...previo, [numeroControl]: valor }));
  }

  async function guardar(evento) {
    evento.preventDefault();
    if (!acta) return;
    setGuardando(true);
    setError('');
    setAviso('');
    try {
      const actualizada = await guardarCalificaciones(acta.grupo.id, acta.alumnos.map((alumno) => ({
        numeroControl: alumno.numeroControl,
        calificacion: calificaciones[alumno.numeroControl] === '' ? null : Number(calificaciones[alumno.numeroControl]),
      })));
      setActa(actualizada);
      setAviso('Las calificaciones quedaron guardadas. El acta permanece abierta hasta que la cierres.');
    } catch (e) {
      setError(mensajeError(e));
    } finally {
      setGuardando(false);
    }
  }

  async function cerrar() {
    if (!acta) return;
    setGuardando(true);
    setError('');
    setAviso('');
    try {
      const calificacionesGuardadas = await guardarCalificaciones(acta.grupo.id, acta.alumnos.map((alumno) => ({
        numeroControl: alumno.numeroControl,
        calificacion: Number(calificaciones[alumno.numeroControl]),
      })));
      setActa(calificacionesGuardadas);
      const cerrada = await cerrarActa(acta.grupo.id);
      setActa(cerrada);
      setConfirmarCierre(false);
      setAviso('Acta cerrada. Las calificaciones y el avance de nivel ya no pueden modificarse.');
      await cargarGrupos();
    } catch (e) {
      setError(mensajeError(e));
    } finally {
      setGuardando(false);
    }
  }

  const todasCapturadas = acta?.alumnos.length > 0
    && acta.alumnos.every((alumno) => calificaciones[alumno.numeroControl] !== ''
      && Number.isFinite(Number(calificaciones[alumno.numeroControl]))
      && Number(calificaciones[alumno.numeroControl]) >= 0
      && Number(calificaciones[alumno.numeroControl]) <= 100);
  const periodoEditable = acta && fechaLocal() >= acta.grupo.fechaInicioPeriodo
    && fechaLocal() <= acta.grupo.fechaFinPeriodo;

  return (
    <div className="grid gap-[18px] xl:grid-cols-[0.8fr_1.2fr]">
      {error && <Alerta tipo="error" className="xl:col-span-2">{error}</Alerta>}
      <Tarjeta titulo="Mis grupos" icono={Layers}>
        <Campo etiqueta="Periodo" id="periodo">
          <select className={claseEntrada} id="periodo" value={periodoId} onChange={(e) => setPeriodoId(e.target.value)}>
            {periodos.map((periodo) => <option key={periodo.id} value={periodo.id}>{periodo.nombre}</option>)}
          </select>
        </Campo>
        {cargando ? <Cargando /> : grupos.length === 0 ? (
          <p className="mt-4 text-sm text-tenue">No tienes grupos asignados para este periodo.</p>
        ) : (
          <div className="mt-3 grid gap-2">
            {grupos.map((grupo) => (
              <button
                className={`rounded-lg border p-3 text-left transition hover:border-marino/40 ${acta?.grupo.id === grupo.id ? 'border-marino bg-info-fondo' : 'border-linea'}`}
                key={grupo.id}
                type="button"
                onClick={() => abrirActa(grupo.id)}
              >
                <span className="flex items-center justify-between gap-2 font-semibold">{grupo.nivel} · {grupo.clave}<span className="text-xs font-normal">{grupo.estatusActa}</span></span>
                <span className="mt-1 block text-xs text-tenue">{grupo.modalidad} · {grupo.aula} · {grupo.alumnosInscritos}/{grupo.cupo} alumnos</span>
                <span className="mt-1 block text-xs">{grupo.horarios.map((h) => `${DIAS[h.diaSemana - 1]} ${h.horaInicio.slice(0, 5)}–${h.horaFin.slice(0, 5)}`).join(' · ')}</span>
              </button>
            ))}
          </div>
        )}
      </Tarjeta>

      <Tarjeta titulo={acta ? `Acta · ${acta.grupo.nivel} ${acta.grupo.clave}` : 'Acta de calificaciones'} icono={ClipboardCheck}>
        {!acta ? <p className="text-sm text-tenue">Selecciona un grupo para consultar su lista y capturar las calificaciones finales.</p>
          : <>
            {aviso && <Alerta tipo="ok" className="mb-3">{aviso}</Alerta>}
            <p className="mb-3 text-xs text-tenue">{acta.grupo.periodo} · {acta.alumnos.length} alumnos · Estado: {acta.grupo.estatusActa}</p>
            {!periodoEditable && <Alerta tipo="info" className="mb-3">Este periodo está fuera de vigencia; el acta se muestra en modo de consulta.</Alerta>}
            {acta.alumnos.length === 0 ? (
              <p className="text-sm text-tenue">Aún no hay alumnos inscritos en este grupo.</p>
            ) : (
              <form onSubmit={guardar}>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[420px] text-left text-sm">
                    <thead className="border-b border-linea text-xs text-tenue">
                      <tr><th className="px-2 py-2">Número de control</th><th className="px-2 py-2">Alumno</th><th className="w-32 px-2 py-2">Calificación (0–100)</th></tr>
                    </thead>
                    <tbody>
                      {acta.alumnos.map((alumno) => (
                        <tr className="border-b border-linea last:border-0" key={alumno.numeroControl}>
                          <td className="px-2 py-2">{alumno.numeroControl}</td>
                          <td className="px-2 py-2">{alumno.nombreCompleto}</td>
                          <td className="px-2 py-2">
                            <input
                              aria-label={`Calificación de ${alumno.nombreCompleto}`}
                              className={`${claseEntrada} w-24`}
                              disabled={!periodoEditable || acta.grupo.estatusActa === 'Cerrada'}
                              max="100"
                              min="0"
                              type="number"
                              value={calificaciones[alumno.numeroControl]}
                              onChange={(e) => cambiarCalificacion(alumno.numeroControl, e.target.value)}
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {periodoEditable && acta.grupo.estatusActa !== 'Cerrada' && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Boton type="submit" disabled={guardando}>{guardando ? 'Guardando…' : 'Guardar calificaciones'}</Boton>
                    {!confirmarCierre
                      ? <Boton variante="exito" type="button" disabled={guardando || !todasCapturadas} onClick={() => setConfirmarCierre(true)}>Cerrar acta</Boton>
                      : <><span className="self-center text-xs text-tenue">Al cerrar, no podrás editar el acta.</span><Boton variante="peligro" type="button" disabled={guardando} onClick={cerrar}>Confirmar cierre</Boton><Boton variante="secundario" type="button" onClick={() => setConfirmarCierre(false)}>Cancelar</Boton></>}
                  </div>
                )}
              </form>
            )}
          </>}
      </Tarjeta>
    </div>
  );
}
