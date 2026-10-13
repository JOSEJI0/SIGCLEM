import { useEffect, useState } from 'react';
import { Calendar, CheckCircle, ClipboardList, Clock, Edit3, User } from 'lucide-react';
import { listarExamenes, programarExamen, capturarResultadoExamen, obtenerCriteriosExamen } from '../../api/examenes';
import { obtenerNiveles } from '../../api/catalogos';
import { mensajeError } from '../../api/cliente';
import { Alerta, Boton, Campo, Cargando, Insignia, Tarjeta, claseEntrada } from '../../components/ui';

function formatearFecha(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('es-MX', { dateStyle: 'medium', timeStyle: 'short' });
}

/** CU-05 Programar examen y CU-06 Capturar resultado y asignar nivel. */
export default function DiagnosticosExamenes() {
  const [examenes, setExamenes] = useState([]);
  const [niveles, setNiveles] = useState([]);
  const [criterios, setCriterios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [filtro, setFiltro] = useState('todos'); // 'todos' | 'pendientes' | 'concluidos'
  const [error, setError] = useState('');
  const [mensajeExito, setMensajeExito] = useState('');

  // Modal Programar (CU-05)
  const [examenProgramar, setExamenProgramar] = useState(null);
  const [nuevaFecha, setNuevaFecha] = useState('');
  const [guardandoProg, setGuardandoProg] = useState(false);
  const [errorProg, setErrorProg] = useState('');

  // Modal Capturar Resultado (CU-06)
  const [examenEvaluar, setExamenEvaluar] = useState(null);
  const [puntajes, setPuntajes] = useState({});
  const [notas, setNotas] = useState({});
  const [nivelAsignado, setNivelAsignado] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [firma, setFirma] = useState('Firma Digital Coordinación');
  const [guardandoEval, setGuardandoEval] = useState(false);
  const [errorEval, setErrorEval] = useState('');

  const cargar = () => {
    setCargando(true);
    Promise.all([listarExamenes(), obtenerNiveles(), obtenerCriteriosExamen()])
      .then(([dataEx, dataNiv, dataCrit]) => {
        setExamenes(dataEx);
        setNiveles(dataNiv);
        setCriterios(dataCrit);
        setError('');
      })
      .catch((err) => setError(mensajeError(err)))
      .finally(() => setCargando(false));
  };

  useEffect(() => {
    cargar();
  }, []);

  const abrirProgramar = (ex) => {
    setExamenProgramar(ex);
    setErrorProg('');
    // Formatear para datetime-local
    const d = ex.fechaHoraAplicacion ? new Date(ex.fechaHoraAplicacion) : new Date();
    const isoLocal = new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
    setNuevaFecha(isoLocal);
  };

  const guardarProgramacion = async (e) => {
    e.preventDefault();
    setGuardandoProg(true);
    setErrorProg('');
    try {
      await programarExamen(examenProgramar.id, {
        fechaHoraAplicacion: `${nuevaFecha}:00`,
      });
      setExamenProgramar(null);
      setMensajeExito(`Examen #${examenProgramar.id} programado con éxito.`);
      cargar();
    } catch (err) {
      setErrorProg(mensajeError(err));
    } finally {
      setGuardandoProg(false);
    }
  };

  const abrirEvaluar = (ex) => {
    setExamenEvaluar(ex);
    setErrorEval('');
    setObservaciones(ex.observaciones || '');
    setFirma(ex.evaluador || 'Firma Digital Coordinación');
    setNivelAsignado(ex.idNivelAsignado ? String(ex.idNivelAsignado) : '');

    const pInit = {};
    const nInit = {};
    criterios.forEach((c) => {
      const match = (ex.criterios || []).find((cr) => cr.idCriterio === c.id);
      pInit[c.id] = match ? match.puntaje : 0;
      nInit[c.id] = match ? (match.nota || '') : '';
    });
    setPuntajes(pInit);
    setNotas(nInit);
  };

  const puntajeTotal = Object.values(puntajes).reduce((acc, curr) => acc + (Number(curr) || 0), 0);

  const guardarEvaluacion = async (e) => {
    e.preventDefault();
    if (!nivelAsignado) {
      setErrorEval('Debes seleccionar el nivel asignado.');
      return;
    }
    setGuardandoEval(true);
    setErrorEval('');
    try {
      const payload = {
        idNivelAsignado: Number(nivelAsignado),
        observaciones: observaciones || null,
        firmaEvaluador: firma || null,
        criterios: criterios.map((c) => ({
          idCriterio: c.id,
          puntaje: Number(puntajes[c.id]) || 0,
          nota: notas[c.id] || null,
        })),
      };
      await capturarResultadoExamen(examenEvaluar.id, payload);
      setExamenEvaluar(null);
      setMensajeExito(`Resultado capturado y nivel asignado para ${examenEvaluar.nombreAlumno}.`);
      cargar();
    } catch (err) {
      setErrorEval(mensajeError(err));
    } finally {
      setGuardandoEval(false);
    }
  };

  const examenesFiltrados = examenes.filter((ex) => {
    if (filtro === 'pendientes') return !ex.concluido;
    if (filtro === 'concluidos') return ex.concluido;
    return true;
  });

  return (
    <div className="grid gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold">Gestión de Exámenes y Diagnósticos</h1>
          <p className="text-xs text-tenue">
            Programación de fechas (CU-05) y captura de rúbricas con asignación secuencial de nivel (CU-06).
          </p>
        </div>

        {/* Pestañas de filtro */}
        <div className="flex rounded-lg border border-linea bg-white p-1 text-xs">
          <button
            onClick={() => setFiltro('todos')}
            className={`rounded px-3 py-1 font-semibold transition ${filtro === 'todos' ? 'bg-marino text-white' : 'text-tenue hover:text-tinta'}`}
          >
            Todos ({examenes.length})
          </button>
          <button
            onClick={() => setFiltro('pendientes')}
            className={`rounded px-3 py-1 font-semibold transition ${filtro === 'pendientes' ? 'bg-marino text-white' : 'text-tenue hover:text-tinta'}`}
          >
            Pendientes ({examenes.filter((x) => !x.concluido).length})
          </button>
          <button
            onClick={() => setFiltro('concluidos')}
            className={`rounded px-3 py-1 font-semibold transition ${filtro === 'concluidos' ? 'bg-marino text-white' : 'text-tenue hover:text-tinta'}`}
          >
            Concluidos ({examenes.filter((x) => x.concluido).length})
          </button>
        </div>
      </div>

      {mensajeExito && <Alerta tipo="ok">{mensajeExito}</Alerta>}
      {error && <Alerta tipo="error">{error}</Alerta>}

      {cargando ? (
        <Cargando />
      ) : examenesFiltrados.length === 0 ? (
        <Tarjeta>
          <p className="py-6 text-center text-tenue">No se encontraron exámenes para el filtro seleccionado.</p>
        </Tarjeta>
      ) : (
        <div className="grid gap-3">
          {examenesFiltrados.map((ex) => (
            <Tarjeta key={ex.id}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#F0F4F8] text-marino">
                    <ClipboardList className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm">{ex.nombreAlumno}</span>
                      <span className="rounded bg-fondo px-1.5 py-0.5 text-[11px] font-mono text-tenue">
                        {ex.numeroControl}
                      </span>
                      <Insignia estatus={ex.concluido ? 'Concluido' : 'Programada'} />
                    </div>
                    <div className="mt-0.5 text-xs text-tenue">
                      {ex.carrera} · <b>Examen de {ex.tipo}</b>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <div className="rounded border border-linea px-2.5 py-1.5 text-tenue">
                    <span className="font-semibold text-tinta">Fecha:</span> {formatearFecha(ex.fechaHoraAplicacion)}
                  </div>
                  {ex.concluido ? (
                    <div className="rounded bg-[#F0FDF4] px-2.5 py-1.5 text-[#155E3D]">
                      <span className="font-semibold">Nivel:</span> {ex.nombreNivelAsignado} ({ex.puntajeTotal} pts)
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 rounded bg-aviso-fondo px-2.5 py-1.5 text-aviso">
                      <Clock className="h-3.5 w-3.5" /> Pendiente de evaluación
                    </div>
                  )}

                  <div className="flex gap-1.5">
                    <Boton variante="secundario" onClick={() => abrirProgramar(ex)}>
                      <Calendar className="h-3.5 w-3.5" /> Programar
                    </Boton>
                    <Boton onClick={() => abrirEvaluar(ex)}>
                      <Edit3 className="h-3.5 w-3.5" /> {ex.concluido ? 'Editar rúbrica' : 'Capturar resultado'}
                    </Boton>
                  </div>
                </div>
              </div>
            </Tarjeta>
          ))}
        </div>
      )}

      {/* Modal Programar Fecha (CU-05) */}
      {examenProgramar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl border border-linea bg-white p-6 shadow-xl">
            <h2 className="flex items-center gap-2 text-lg font-bold">
              <Calendar className="h-5 w-5 text-marino" /> Programar Examen #{examenProgramar.id}
            </h2>
            <p className="mt-1 text-xs text-tenue">
              Asigna la fecha y hora oficial de aplicación para {examenProgramar.nombreAlumno} (CU-05).
            </p>

            {errorProg && <div className="mt-3"><Alerta tipo="error">{errorProg}</Alerta></div>}

            <form onSubmit={guardarProgramacion} className="mt-4 grid gap-3.5">
              <Campo etiqueta="Fecha y hora de aplicación" id="nuevaFecha" ayuda="Debe ser una fecha futura dentro del horario institucional.">
                <input
                  id="nuevaFecha"
                  type="datetime-local"
                  required
                  className={claseEntrada}
                  value={nuevaFecha}
                  onChange={(e) => setNuevaFecha(e.target.value)}
                />
              </Campo>

              <div className="mt-2 flex justify-end gap-2">
                <Boton variante="secundario" type="button" onClick={() => setExamenProgramar(null)} disabled={guardandoProg}>
                  Cancelar
                </Boton>
                <Boton type="submit" disabled={guardandoProg}>
                  {guardandoProg ? 'Guardando…' : 'Confirmar programación'}
                </Boton>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Capturar Resultado (CU-06) */}
      {examenEvaluar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/40 p-4">
          <div className="my-8 w-full max-w-2xl rounded-2xl border border-linea bg-white p-6 shadow-xl">
            <h2 className="flex items-center gap-2 text-lg font-bold">
              <CheckCircle className="h-5 w-5 text-ok" /> Capturar Resultado de Examen
            </h2>
            <p className="mt-0.5 text-xs text-tenue">
              Alumno: <b>{examenEvaluar.nombreAlumno}</b> ({examenEvaluar.numeroControl}) · {examenEvaluar.tipo}
            </p>

            {errorEval && <div className="mt-3"><Alerta tipo="error">{errorEval}</Alerta></div>}

            <form onSubmit={guardarEvaluacion} className="mt-4 grid gap-4">
              <div className="rounded-xl border border-linea bg-[#FAFBFD] p-4">
                <h3 className="mb-2.5 font-bold text-xs uppercase tracking-wider text-tenue">
                  Rúbrica de Evaluación (0 a 6 puntos por criterio)
                </h3>
                <div className="grid gap-3">
                  {criterios.map((c) => (
                    <div key={c.id} className="grid grid-cols-[140px_80px_1fr] items-center gap-2">
                      <label className="text-xs font-semibold text-tinta">{c.nombre}</label>
                      <input
                        type="number"
                        min="0"
                        max="6"
                        required
                        className={`${claseEntrada} py-1 text-center font-bold`}
                        value={puntajes[c.id] ?? 0}
                        onChange={(e) => setPuntajes({ ...puntajes, [c.id]: e.target.value })}
                      />
                      <input
                        type="text"
                        placeholder="Nota u observación del criterio…"
                        className={`${claseEntrada} py-1 text-xs`}
                        value={notas[c.id] || ''}
                        onChange={(e) => setNotas({ ...notas, [c.id]: e.target.value })}
                      />
                    </div>
                  ))}
                </div>

                <div className="mt-3 flex items-center justify-between border-t border-linea pt-2 text-xs">
                  <span className="text-tenue">Puntaje total calculado:</span>
                  <span className="font-extrabold text-sm text-marino">{puntajeTotal} / 30 pts</span>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <Campo etiqueta="Nivel a asignar" id="nivelAsignado" ayuda="Máximo 3 niveles de avance sobre el actual (RF-04/RF-07).">
                  <select
                    id="nivelAsignado"
                    required
                    className={claseEntrada}
                    value={nivelAsignado}
                    onChange={(e) => setNivelAsignado(e.target.value)}
                  >
                    <option value="">Selecciona nivel…</option>
                    {niveles.map((n) => (
                      <option key={n.id} value={n.id}>
                        Nivel {n.numero}: {n.nombre} ({n.nivelMcer})
                      </option>
                    ))}
                  </select>
                </Campo>

                <Campo etiqueta="Firma digital del evaluador" id="firma">
                  <input
                    id="firma"
                    className={claseEntrada}
                    value={firma}
                    onChange={(e) => setFirma(e.target.value)}
                  />
                </Campo>
              </div>

              <Campo etiqueta="Observaciones generales" id="observaciones">
                <textarea
                  id="observaciones"
                  rows={2}
                  className={claseEntrada}
                  placeholder="Conclusiones o comentarios generales sobre el desempeño del alumno…"
                  value={observaciones}
                  onChange={(e) => setObservaciones(e.target.value)}
                />
              </Campo>

              <div className="mt-2 flex justify-end gap-2 border-t border-linea pt-3">
                <Boton variante="secundario" type="button" onClick={() => setExamenEvaluar(null)} disabled={guardandoEval}>
                  Cancelar
                </Boton>
                <Boton type="submit" disabled={guardandoEval}>
                  {guardandoEval ? 'Guardando…' : 'Guardar y asignar nivel'}
                </Boton>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
