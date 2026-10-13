import { useCallback, useEffect, useMemo, useState } from 'react';
import { Check, Download, Receipt, Search, Tags, X } from 'lucide-react';
import { buscarAlumnos } from '../../api/alumnos';
import { mensajeError } from '../../api/cliente';
import { obtenerNiveles, obtenerPeriodos } from '../../api/catalogos';
import { listarGrupos } from '../../api/grupos';
import {
  capturarDatosComprobante, crearAutorizacion, crearConcepto, crearTarifa, descargarComprobante,
  desactivarConcepto, desactivarTarifa, listarCargos, listarComprobantesPendientes, listarConceptos,
  listarTarifas, rechazarComprobante, validarComprobante,
} from '../../api/pagos';
import { Alerta, Boton, Campo, Cargando, Insignia, Tarjeta, claseEntrada } from '../../components/ui';

function moneda(valor) {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(valor);
}

const datosManualesVacios = () => ({ uuidCfdi: '', rfcEmisor: '', total: '' });

export default function Pagos() {
  const [conceptos, setConceptos] = useState([]);
  const [tarifas, setTarifas] = useState([]);
  const [niveles, setNiveles] = useState([]);
  const [periodos, setPeriodos] = useState([]);
  const [comprobantes, setComprobantes] = useState([]);
  const [grupos, setGrupos] = useState([]);
  const [concepto, setConcepto] = useState('');
  const [requiereNivel, setRequiereNivel] = useState(false);
  const [nombreConcepto, setNombreConcepto] = useState('');
  const [idTarifa, setIdTarifa] = useState('');
  const [idNivel, setIdNivel] = useState('');
  const [monto, setMonto] = useState('');
  const [busquedaAlumno, setBusquedaAlumno] = useState('');
  const [alumnos, setAlumnos] = useState([]);
  const [alumno, setAlumno] = useState(null);
  const [cargos, setCargos] = useState([]);
  const [idPeriodo, setIdPeriodo] = useState('');
  const [idGrupo, setIdGrupo] = useState({});
  const [motivos, setMotivos] = useState({});
  const [datosManuales, setDatosManuales] = useState({});
  const [guardando, setGuardando] = useState('');
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [aviso, setAviso] = useState('');

  const cargar = useCallback(async () => {
    setCargando(true);
    setError('');
    try {
      const [conceptosCargados, tarifasCargadas, nivelesCargados, periodosCargados, pendientes] = await Promise.all([
        listarConceptos(true),
        listarTarifas(true),
        obtenerNiveles(),
        obtenerPeriodos(),
        listarComprobantesPendientes(),
      ]);
      const periodosPendientes = [...new Set(pendientes.map((c) => c.idPeriodo))];
      const gruposPorPeriodo = await Promise.all(periodosPendientes.map((periodoId) => listarGrupos(periodoId)));
      setConceptos(conceptosCargados);
      setTarifas(tarifasCargadas);
      setNiveles(nivelesCargados);
      setPeriodos(periodosCargados);
      setComprobantes(pendientes);
      setGrupos(gruposPorPeriodo.flat());
      setConcepto((actual) => actual || conceptosCargados.find((item) => item.activo)?.nombre || '');
    } catch (e) {
      setError(mensajeError(e));
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  const conceptoSeleccionado = useMemo(
    () => conceptos.find((item) => item.nombre === concepto && item.activo),
    [conceptos, concepto],
  );
  const conceptosActivos = useMemo(() => conceptos.filter((item) => item.activo), [conceptos]);
  async function buscar(evento) {
    evento.preventDefault();
    setError('');
    setAlumno(null);
    setCargos([]);
    try {
      const resultado = await buscarAlumnos({ busqueda: busquedaAlumno.trim(), pagina: 0, tamano: 10 });
      setAlumnos(resultado.content || []);
      setAviso(resultado.content?.length ? '' : 'No se encontraron alumnos con ese criterio.');
    } catch (e) {
      setError(mensajeError(e));
    }
  }

  async function seleccionarAlumno(seleccionado) {
    setAlumno(seleccionado);
    setAlumnos([]);
    setError('');
    setAviso('');
    try {
      setCargos(await listarCargos(seleccionado.numeroControl));
    } catch (e) {
      setError(mensajeError(e));
    }
  }

  async function emitirCargo(evento) {
    evento.preventDefault();
    if (!alumno) return;
    setGuardando('cargo');
    setError('');
    setAviso('');
    try {
      const cargo = await crearAutorizacion({
        numeroControl: alumno.numeroControl,
        idTarifa: Number(idTarifa),
        idPeriodo: Number(idPeriodo),
      });
      setAviso(`Cargo #${cargo.id} emitido o ya existente para ${alumno.nombreCompleto}.`);
      setCargos(await listarCargos(alumno.numeroControl));
    } catch (e) {
      setError(mensajeError(e));
    } finally {
      setGuardando('');
    }
  }

  async function guardarConcepto(evento) {
    evento.preventDefault();
    setGuardando('concepto');
    setError('');
    setAviso('');
    try {
      const creado = await crearConcepto({ nombre: nombreConcepto.trim(), requiereNivel });
      setNombreConcepto('');
      setConcepto(creado.nombre);
      setAviso('Concepto de pago creado.');
      await cargar();
    } catch (e) {
      setError(mensajeError(e));
    } finally {
      setGuardando('');
    }
  }

  async function guardarTarifa(evento) {
    evento.preventDefault();
    setGuardando('tarifa');
    setError('');
    setAviso('');
    try {
      await crearTarifa({
        concepto,
        idNivel: conceptoSeleccionado.requiereNivel ? Number(idNivel) : null,
        monto: Number(monto),
      });
      setMonto('');
      setIdTarifa('');
      setAviso('Tarifa creada y disponible para nuevos cargos.');
      await cargar();
    } catch (e) {
      setError(mensajeError(e));
    } finally {
      setGuardando('');
    }
  }

  async function desactivar(id) {
    setGuardando(`tarifa-${id}`);
    setError('');
    setAviso('');
    try {
      await desactivarTarifa(id);
      setAviso('La tarifa fue desactivada. Los cargos emitidos conservan su importe.');
      await cargar();
    } catch (e) {
      setError(mensajeError(e));
    } finally {
      setGuardando('');
    }
  }

  async function desactivarConceptoExistente(id) {
    setGuardando(`concepto-${id}`);
    setError('');
    setAviso('');
    try {
      await desactivarConcepto(id);
      setAviso('El concepto y sus tarifas activas fueron desactivados.');
      await cargar();
    } catch (e) {
      setError(mensajeError(e));
    } finally {
      setGuardando('');
    }
  }

  function actualizarDatosManuales(id, campo, valor) {
    setDatosManuales((previos) => ({
      ...previos,
      [id]: { ...datosManualesVacios(), ...previos[id], [campo]: valor },
    }));
  }

  async function capturarManual(comprobante) {
    const datos = { ...datosManualesVacios(), ...datosManuales[comprobante.id] };
    if (!datos.uuidCfdi.trim() || !datos.rfcEmisor.trim() || !datos.total.trim()) {
      setError(`Completa UUID, RFC e importe para el comprobante de ${comprobante.alumno}.`);
      return;
    }
    setGuardando(`manual-${comprobante.id}`);
    setError('');
    setAviso('');
    try {
      await capturarDatosComprobante(comprobante.id, {
        uuidCfdi: datos.uuidCfdi.trim(),
        rfcEmisor: datos.rfcEmisor.trim(),
        total: Number(datos.total),
      });
      setAviso('Datos del comprobante capturados. Ahora puedes validar o rechazar la evidencia.');
      await cargar();
    } catch (e) {
      setError(mensajeError(e));
    } finally {
      setGuardando('');
    }
  }

  async function validar(comprobante) {
    const balance = Number(comprobante.saldoPendiente);
    const esLiquidacion = Math.abs(Number(comprobante.total) - balance) < 0.005;
    const grupoId = idGrupo[comprobante.id] || '';
    if (comprobante.concepto === 'Curso de nivel' && esLiquidacion && !grupoId) {
      setError(`Selecciona un grupo para la inscripción de ${comprobante.alumno}; este abono liquida el cargo.`);
      return;
    }
    setGuardando(`comprobante-${comprobante.id}`);
    setError('');
    setAviso('');
    try {
      await validarComprobante(comprobante.id, esLiquidacion ? grupoId : '');
      setAviso(esLiquidacion
        ? `Pago liquidado${comprobante.concepto === 'Curso de nivel' ? ' e inscripción aplicada' : ''}.`
        : `Abono validado. Saldo restante: ${moneda(balance - Number(comprobante.total))}.`);
      await cargar();
    } catch (e) {
      setError(mensajeError(e));
    } finally {
      setGuardando('');
    }
  }

  async function rechazar(comprobante) {
    const motivo = motivos[comprobante.id]?.trim();
    if (!motivo) {
      setError(`Escribe el motivo de rechazo del comprobante de ${comprobante.alumno}.`);
      return;
    }
    setGuardando(`comprobante-${comprobante.id}`);
    setError('');
    setAviso('');
    try {
      await rechazarComprobante(comprobante.id, motivo);
      setAviso('Comprobante rechazado. El saldo no se modificó y el alumno podrá enviar una evidencia corregida.');
      await cargar();
    } catch (e) {
      setError(mensajeError(e));
    } finally {
      setGuardando('');
    }
  }

  async function descargar(comprobante) {
    try {
      const blob = await descargarComprobante(comprobante.id);
      const url = URL.createObjectURL(blob);
      const enlace = document.createElement('a');
      enlace.href = url;
      enlace.download = `comprobante-${comprobante.id}.${blob.type === 'application/pdf' ? 'pdf' : 'jpg'}`;
      enlace.click();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (e) {
      setError(mensajeError(e));
    }
  }

  if (cargando) return <Cargando />;

  return (
    <div className="grid gap-[18px]">
      <div>
        <h1 className="flex items-center gap-2 text-xl font-bold"><Receipt className="h-5 w-5" /> Cargos, tarifas y comprobantes</h1>
        <p className="mt-1 text-sm text-tenue">Emite cargos, registra conceptos y revisa los abonos enviados por los alumnos.</p>
      </div>
      {error && <Alerta tipo="error">{error}</Alerta>}
      {aviso && <Alerta tipo="ok">{aviso}</Alerta>}

      <Tarjeta titulo="Emitir cargo a un alumno" icono={Search}>
        <form className="flex flex-col gap-3 sm:flex-row sm:items-end" onSubmit={buscar}>
          <Campo etiqueta="Nombre o número de control" id="buscarAlumnoPago">
            <input className={claseEntrada} id="buscarAlumnoPago" required maxLength="100" value={busquedaAlumno} onChange={(e) => setBusquedaAlumno(e.target.value)} />
          </Campo>
          <Boton type="submit"><Search className="h-4 w-4" /> Buscar alumno</Boton>
        </form>
        {alumnos.length > 0 && (
          <div className="mt-3 grid gap-2">
            {alumnos.map((item) => (
              <button key={item.numeroControl} type="button" className="rounded-lg border border-linea p-3 text-left text-sm hover:bg-fondo" onClick={() => seleccionarAlumno(item)}>
                <b>{item.nombreCompleto}</b> · {item.numeroControl} · {item.carrera}
              </button>
            ))}
          </div>
        )}
        {alumno && (
          <div className="mt-4 grid gap-3">
            <p className="text-sm"><b>Alumno seleccionado:</b> {alumno.nombreCompleto} · {alumno.numeroControl}</p>
            <form className="grid gap-3 sm:grid-cols-3 sm:items-end" onSubmit={emitirCargo}>
              <Campo etiqueta="Concepto y tarifa" id="tarifaCargo">
                <select className={claseEntrada} id="tarifaCargo" required value={idTarifa} onChange={(e) => setIdTarifa(e.target.value)}>
                  <option value="">Selecciona una tarifa</option>
                  {tarifas.filter((item) => item.activa).map((item) => (
                    <option key={item.id} value={item.id}>{item.concepto}{item.nivel ? ` · ${item.nivel}` : ''} — {moneda(item.monto)}</option>
                  ))}
                </select>
              </Campo>
              <Campo etiqueta="Periodo" id="periodoCargo">
                <select className={claseEntrada} id="periodoCargo" required value={idPeriodo} onChange={(e) => setIdPeriodo(e.target.value)}>
                  <option value="">Selecciona un periodo</option>
                  {periodos.map((item) => <option key={item.id} value={item.id}>{item.nombre}</option>)}
                </select>
              </Campo>
              <Boton type="submit" disabled={!idTarifa || !idPeriodo || guardando !== ''}>
                {guardando === 'cargo' ? 'Emitiendo…' : 'Emitir cargo'}
              </Boton>
            </form>
            <div className="grid gap-2">
              <h3 className="text-sm font-semibold">Cargos existentes</h3>
              {cargos.length === 0 ? <p className="text-sm text-tenue">Este alumno no tiene cargos.</p> : cargos.map((cargo) => (
                <div key={cargo.id} className="flex flex-wrap items-center gap-3 rounded-lg border border-linea p-3 text-sm">
                  <span>{cargo.concepto}{cargo.nivel ? ` · ${cargo.nivel}` : ''} · {cargo.periodo}</span>
                  <span>Saldo: <b>{moneda(cargo.saldoPendiente)}</b></span>
                  <Insignia estatus={cargo.estatusCargo}>{cargo.estatusCargo}</Insignia>
                </div>
              ))}
            </div>
          </div>
        )}
      </Tarjeta>

      <Tarjeta titulo="Conceptos y tarifas" icono={Tags}>
        <form className="grid gap-3 sm:grid-cols-[1fr_auto_auto]" onSubmit={guardarConcepto}>
          <Campo etiqueta="Nuevo concepto" id="nuevoConcepto">
            <input className={claseEntrada} id="nuevoConcepto" required maxLength="30" value={nombreConcepto} onChange={(e) => setNombreConcepto(e.target.value)} />
          </Campo>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={requiereNivel} onChange={(e) => setRequiereNivel(e.target.checked)} />
            Requiere nivel
          </label>
          <Boton type="submit" disabled={guardando !== '' || !nombreConcepto.trim()}>
            {guardando === 'concepto' ? 'Guardando…' : 'Crear concepto'}
          </Boton>
        </form>
        <form className="mt-4 grid gap-3 sm:grid-cols-4 sm:items-end" onSubmit={guardarTarifa}>
          <Campo etiqueta="Concepto" id="conceptoTarifa">
            <select className={claseEntrada} id="conceptoTarifa" required value={concepto} onChange={(e) => { setConcepto(e.target.value); setIdNivel(''); setIdTarifa(''); }}>
              <option value="">Selecciona concepto</option>
              {conceptosActivos.map((item) => <option key={item.id} value={item.nombre}>{item.nombre}</option>)}
            </select>
          </Campo>
          {conceptoSeleccionado?.requiereNivel && (
            <Campo etiqueta="Nivel" id="nivelTarifa">
              <select className={claseEntrada} id="nivelTarifa" required value={idNivel} onChange={(e) => setIdNivel(e.target.value)}>
                <option value="">Selecciona el nivel</option>
                {niveles.map((nivel) => <option key={nivel.id} value={nivel.id}>{nivel.nombre}</option>)}
              </select>
            </Campo>
          )}
          <Campo etiqueta="Monto (MXN)" id="montoTarifa">
            <input className={claseEntrada} id="montoTarifa" type="number" required min="0.01" step="0.01" value={monto} onChange={(e) => setMonto(e.target.value)} />
          </Campo>
          <Boton type="submit" disabled={guardando !== '' || !monto || !conceptoSeleccionado || (conceptoSeleccionado?.requiereNivel && !idNivel)}>
            {guardando === 'tarifa' ? 'Guardando…' : 'Crear tarifa'}
          </Boton>
        </form>
        <div className="mt-4 grid gap-2">
          {conceptos.map((item) => (
            <div key={item.id} className="flex flex-wrap items-center gap-2 rounded-lg border border-linea p-3 text-sm">
              <b>{item.nombre}</b>
              <span>{item.requiereNivel ? 'Requiere nivel' : 'Sin nivel'}</span>
              <Insignia estatus={item.activo ? 'Activo' : 'Inactivo'} />
              {item.activo && <Boton variante="secundario" className="ml-auto" type="button" disabled={guardando !== ''} onClick={() => desactivarConceptoExistente(item.id)}>Desactivar concepto</Boton>}
            </div>
          ))}
          {tarifas.map((tarifa) => (
            <div key={`tarifa-${tarifa.id}`} className="flex flex-wrap items-center gap-2 rounded-lg border border-linea p-3 text-sm">
              <span className="font-semibold">{tarifa.concepto}{tarifa.nivel ? ` · ${tarifa.nivel}` : ''}</span>
              <span>{moneda(tarifa.monto)}</span>
              <Insignia estatus={tarifa.activa ? 'Tarifa activa' : 'Tarifa inactiva'} />
              {tarifa.activa && <Boton variante="secundario" className="ml-auto" type="button" disabled={guardando !== ''} onClick={() => desactivar(tarifa.id)}>Desactivar tarifa</Boton>}
            </div>
          ))}
        </div>
      </Tarjeta>

      <section className="grid gap-3" aria-label="Comprobantes pendientes de validación">
        <h2 className="text-base font-semibold">Comprobantes pendientes ({comprobantes.length})</h2>
        {comprobantes.length === 0 ? <Tarjeta><p className="text-sm text-tenue">No hay comprobantes pendientes de revisión.</p></Tarjeta>
          : comprobantes.map((comprobante) => {
            const balance = Number(comprobante.saldoPendiente);
            const importe = Number(comprobante.total);
            const requiereCaptura = comprobante.uuidCfdi == null || comprobante.rfcEmisor == null || comprobante.total == null;
            const esLiquidacion = !requiereCaptura && Math.abs(importe - balance) < 0.005;
            const gruposElegibles = grupos.filter((grupo) =>
              grupo.idPeriodo === comprobante.idPeriodo
              && grupo.idNivel === comprobante.idNivel
              && grupo.estatusActa !== 'Cerrada'
              && grupo.alumnosInscritos < grupo.cupo);
            const datos = { ...datosManualesVacios(), ...datosManuales[comprobante.id] };
            return (
              <Tarjeta key={comprobante.id} titulo={`${comprobante.alumno} · ${comprobante.numeroControl}`} extra={<Insignia estatus={comprobante.estatus} />}>
                <div className="grid gap-2 text-sm sm:grid-cols-2">
                  <p><b>Concepto:</b> {comprobante.concepto}{comprobante.nivel ? ` · ${comprobante.nivel}` : ''}</p>
                  <p><b>Periodo:</b> {comprobante.periodo}</p>
                  <p><b>UUID:</b> <span className="break-all">{comprobante.uuidCfdi || 'Pendiente de captura manual'}</span></p>
                  <p><b>RFC:</b> {comprobante.rfcEmisor || 'Pendiente de captura manual'}</p>
                  <p><b>Abono:</b> {comprobante.total == null ? 'Pendiente de captura manual' : moneda(comprobante.total)}</p>
                  <p><b>Saldo previo:</b> {moneda(comprobante.saldoPendiente)}</p>
                  {comprobante.contenidoQr && <p className="sm:col-span-2"><b>Contenido QR:</b> {comprobante.contenidoQr}</p>}
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Boton variante="secundario" type="button" onClick={() => descargar(comprobante)}>
                    <Download className="h-4 w-4" /> Ver evidencia JPG
                  </Boton>
                </div>
                <Alerta tipo="aviso" className="mt-3">
                  Coteja la imagen con los datos del CFDI antes de aplicar el abono. {requiereCaptura ? 'El alumno no pudo leer el QR; captura los datos verificados.' : 'Confirma UUID, RFC e importe.'}
                </Alerta>
                {requiereCaptura && (
                  <div className="mt-3 grid gap-3 sm:grid-cols-3">
                    <Campo etiqueta="UUID del CFDI" id={`uuidManual-${comprobante.id}`}>
                      <input className={claseEntrada} id={`uuidManual-${comprobante.id}`} maxLength="36" value={datos.uuidCfdi} onChange={(e) => actualizarDatosManuales(comprobante.id, 'uuidCfdi', e.target.value)} />
                    </Campo>
                    <Campo etiqueta="RFC emisor" id={`rfcManual-${comprobante.id}`}>
                      <input className={claseEntrada} id={`rfcManual-${comprobante.id}`} maxLength="13" value={datos.rfcEmisor} onChange={(e) => actualizarDatosManuales(comprobante.id, 'rfcEmisor', e.target.value.toUpperCase())} />
                    </Campo>
                    <Campo etiqueta="Importe del abono (MXN)" id={`totalManual-${comprobante.id}`}>
                      <input className={claseEntrada} id={`totalManual-${comprobante.id}`} type="number" min="0.01" max={balance} step="0.01" value={datos.total} onChange={(e) => actualizarDatosManuales(comprobante.id, 'total', e.target.value)} />
                    </Campo>
                    <Boton className="sm:col-span-3 sm:justify-self-start" type="button" disabled={guardando !== ''} onClick={() => capturarManual(comprobante)}>
                      {guardando === `manual-${comprobante.id}` ? 'Guardando…' : 'Guardar captura manual'}
                    </Boton>
                  </div>
                )}
                {!requiereCaptura && comprobante.concepto === 'Curso de nivel' && esLiquidacion && (
                  <div className="mt-3">
                    <Campo etiqueta="Grupo para inscripción (solo al liquidar)" id={`grupo-${comprobante.id}`}>
                      <select className={claseEntrada} id={`grupo-${comprobante.id}`} required value={idGrupo[comprobante.id] || ''} onChange={(e) => setIdGrupo((previos) => ({ ...previos, [comprobante.id]: e.target.value }))}>
                        <option value="">Selecciona un grupo compatible</option>
                        {gruposElegibles.map((grupo) => (
                          <option key={grupo.id} value={grupo.id}>{grupo.clave} · {grupo.nivel} · {grupo.modalidad} · {grupo.alumnosInscritos}/{grupo.cupo}</option>
                        ))}
                      </select>
                    </Campo>
                    {gruposElegibles.length === 0 && <p className="mt-1 text-xs text-tenue">No hay grupos abiertos con cupo para el nivel y periodo autorizados.</p>}
                  </div>
                )}
                <Campo etiqueta="Motivo de rechazo (solo si rechazas)" id={`motivo-${comprobante.id}`}>
                  <textarea className={claseEntrada} id={`motivo-${comprobante.id}`} rows="2" maxLength="200" value={motivos[comprobante.id] || ''} onChange={(e) => setMotivos((previos) => ({ ...previos, [comprobante.id]: e.target.value }))} />
                </Campo>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Boton variante="exito" type="button" disabled={guardando !== '' || requiereCaptura || (comprobante.concepto === 'Curso de nivel' && esLiquidacion && !idGrupo[comprobante.id])} onClick={() => validar(comprobante)}>
                    <Check className="h-4 w-4" /> {guardando === `comprobante-${comprobante.id}` ? 'Procesando…' : esLiquidacion ? 'Validar, liquidar e inscribir' : 'Validar abono'}
                  </Boton>
                  <Boton variante="peligro" type="button" disabled={guardando !== '' || !motivos[comprobante.id]?.trim()} onClick={() => rechazar(comprobante)}>
                    <X className="h-4 w-4" /> Rechazar
                  </Boton>
                </div>
              </Tarjeta>
            );
          })}
      </section>
    </div>
  );
}
