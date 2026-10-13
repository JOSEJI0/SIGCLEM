import { useCallback, useEffect, useState } from 'react';
import { CalendarDays, Plus, X } from 'lucide-react';
import { listarFacilitadores } from '../../api/facilitadores';
import { crearAula, crearPeriodo, obtenerAulas, obtenerModalidades, obtenerNiveles, obtenerPeriodos } from '../../api/catalogos';
import { abrirGrupo, listarGrupos } from '../../api/grupos';
import { mensajeError } from '../../api/cliente';
import { Alerta, Boton, Campo, Cargando, Tarjeta, claseEntrada } from '../../components/ui';

const DIAS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
const HORARIO_INICIAL = { diaSemana: '1', horaInicio: '10:00', horaFin: '11:00' };

function fechaLocal() {
  const hoy = new Date();
  return `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}-${String(hoy.getDate()).padStart(2, '0')}`;
}

export default function Grupos() {
  const [catalogos, setCatalogos] = useState({ niveles: [], periodos: [], modalidades: [], aulas: [], facilitadores: [] });
  const [grupos, setGrupos] = useState([]);
  const [form, setForm] = useState({ clave: '', idNivel: '', idPeriodo: '', idModalidad: '', idFacilitador: '', idAula: '', cupo: '30' });
  const [horarios, setHorarios] = useState([HORARIO_INICIAL]);
  const [nuevoPeriodo, setNuevoPeriodo] = useState({ nombre: '', fechaInicio: '', fechaFin: '' });
  const [nuevaAula, setNuevaAula] = useState('');
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');
  const [aviso, setAviso] = useState('');

  const cargarCatalogos = useCallback(async () => {
    try {
      const [niveles, periodos, modalidades, aulas, facilitadores] = await Promise.all([
        obtenerNiveles(), obtenerPeriodos(), obtenerModalidades(), obtenerAulas(), listarFacilitadores(),
      ]);
      setCatalogos({ niveles, periodos, modalidades, aulas, facilitadores: facilitadores.filter((f) => f.activo) });
      setForm((previo) => ({
        ...previo,
        idNivel: previo.idNivel || String(niveles[0]?.id ?? ''),
        idPeriodo: previo.idPeriodo || String(periodos.find((p) => p.fechaFin >= fechaLocal())?.id ?? ''),
        idModalidad: previo.idModalidad || String(modalidades[0]?.id ?? ''),
        idFacilitador: previo.idFacilitador || String(facilitadores.find((f) => f.activo)?.id ?? ''),
        idAula: previo.idAula || String(aulas[0]?.id ?? ''),
      }));
    } catch (e) {
      setError(mensajeError(e));
    } finally {
      setCargando(false);
    }
  }, []);

  const cargarGrupos = useCallback(async (periodoId) => {
    try {
      setError('');
      setGrupos(await listarGrupos(periodoId));
    } catch (e) {
      setError(mensajeError(e));
    }
  }, []);

  useEffect(() => { cargarCatalogos(); }, [cargarCatalogos]);
  useEffect(() => { if (form.idPeriodo) cargarGrupos(form.idPeriodo); }, [form.idPeriodo, cargarGrupos]);

  function cambiar(evento) {
    setForm((previo) => ({ ...previo, [evento.target.name]: evento.target.value }));
  }

  function cambiarHorario(index, evento) {
    setHorarios((previo) => previo.map((horario, i) => i === index
      ? { ...horario, [evento.target.name]: evento.target.value }
      : horario));
  }

  async function guardarGrupo(evento) {
    evento.preventDefault();
    setGuardando(true);
    setError('');
    setAviso('');
    try {
      await abrirGrupo({
        ...form,
        idNivel: Number(form.idNivel),
        idPeriodo: Number(form.idPeriodo),
        idModalidad: Number(form.idModalidad),
        idFacilitador: Number(form.idFacilitador),
        idAula: Number(form.idAula),
        cupo: Number(form.cupo),
        horarios: horarios.map((h) => ({ ...h, diaSemana: Number(h.diaSemana) })),
      });
      setAviso('El grupo quedó abierto y disponible para inscripción.');
      setForm((previo) => ({ ...previo, clave: '' }));
      await cargarGrupos(form.idPeriodo);
    } catch (e) {
      setError(mensajeError(e));
    } finally {
      setGuardando(false);
    }
  }

  async function guardarPeriodo(evento) {
    evento.preventDefault();
    try {
      setError('');
      const creado = await crearPeriodo(nuevoPeriodo);
      setNuevoPeriodo({ nombre: '', fechaInicio: '', fechaFin: '' });
      await cargarCatalogos();
      setForm((previo) => ({ ...previo, idPeriodo: String(creado.id) }));
      setAviso('Periodo agregado al catálogo.');
    } catch (e) {
      setError(mensajeError(e));
    }
  }

  async function guardarAula(evento) {
    evento.preventDefault();
    try {
      setError('');
      const creada = await crearAula({ nombre: nuevaAula });
      setNuevaAula('');
      await cargarCatalogos();
      setForm((previo) => ({ ...previo, idAula: String(creada.id) }));
      setAviso('Aula agregada al catálogo.');
    } catch (e) {
      setError(mensajeError(e));
    }
  }

  return (
    <div className="grid gap-[18px] xl:grid-cols-[minmax(350px,0.9fr)_1.1fr]">
      <div className="grid content-start gap-[18px]">
        <Tarjeta titulo="Abrir grupo y asignar horario" icono={CalendarDays}>
          {cargando ? <Cargando /> : (
            <form className="grid gap-3" onSubmit={guardarGrupo}>
              <div className="grid gap-3 sm:grid-cols-2">
                <Campo etiqueta="Clave (A–Z)" id="clave">
                  <input className={claseEntrada} id="clave" name="clave" value={form.clave} maxLength="2" pattern="[A-Za-z]{1,2}" onChange={(e) => cambiar({ target: { name: e.target.name, value: e.target.value.toUpperCase() } })} required />
                </Campo>
                <Campo etiqueta="Cupo" id="cupo">
                  <input className={claseEntrada} id="cupo" name="cupo" type="number" min="1" max="255" value={form.cupo} onChange={cambiar} required />
                </Campo>
                <Selector id="idNivel" etiqueta="Nivel" valor={form.idNivel} onChange={cambiar} opciones={catalogos.niveles.map((x) => [x.id, `${x.numero}. ${x.nombre}`])} />
                <Selector id="idPeriodo" etiqueta="Periodo" valor={form.idPeriodo} onChange={cambiar} opciones={catalogos.periodos.map((x) => [x.id, x.nombre])} />
                <Selector id="idModalidad" etiqueta="Modalidad" valor={form.idModalidad} onChange={cambiar} opciones={catalogos.modalidades.map((x) => [x.id, x.nombre])} />
                <Selector id="idAula" etiqueta="Aula" valor={form.idAula} onChange={cambiar} opciones={catalogos.aulas.map((x) => [x.id, x.nombre])} />
                <div className="sm:col-span-2">
                  <Selector id="idFacilitador" etiqueta="Facilitador" valor={form.idFacilitador} onChange={cambiar} opciones={catalogos.facilitadores.map((x) => [x.id, x.nombreCompleto])} />
                </div>
              </div>
              <div className="grid gap-2">
                <div className="flex items-center justify-between text-xs font-semibold text-[#3A4556]">
                  <span>Sesiones (10:00 a 17:00)</span>
                  <button className="text-marino underline" type="button" onClick={() => setHorarios((x) => [...x, HORARIO_INICIAL])}>Agregar sesión</button>
                </div>
                {horarios.map((h, index) => (
                  <div className="grid grid-cols-[1fr_1fr_1fr_auto] items-end gap-2" key={index}>
                    <Campo etiqueta="Día" id={`dia-${index}`}>
                      <select className={claseEntrada} id={`dia-${index}`} name="diaSemana" value={h.diaSemana} onChange={(e) => cambiarHorario(index, e)}>
                        {DIAS.map((dia, i) => <option key={dia} value={i + 1}>{dia}</option>)}
                      </select>
                    </Campo>
                    <Campo etiqueta="Inicio" id={`inicio-${index}`}>
                      <input className={claseEntrada} id={`inicio-${index}`} type="time" name="horaInicio" value={h.horaInicio} onChange={(e) => cambiarHorario(index, e)} required />
                    </Campo>
                    <Campo etiqueta="Fin" id={`fin-${index}`}>
                      <input className={claseEntrada} id={`fin-${index}`} type="time" name="horaFin" value={h.horaFin} onChange={(e) => cambiarHorario(index, e)} required />
                    </Campo>
                    <button aria-label="Quitar sesión" className="mb-2 text-tenue disabled:opacity-30" type="button" disabled={horarios.length === 1} onClick={() => setHorarios((x) => x.filter((_, i) => i !== index))}><X className="h-4 w-4" /></button>
                  </div>
                ))}
              </div>
              {error && <Alerta tipo="error">{error}</Alerta>}
              {aviso && <Alerta tipo="ok">{aviso}</Alerta>}
              <Boton type="submit" disabled={guardando || !catalogos.periodos.length || !catalogos.aulas.length || !catalogos.facilitadores.length}>
                <Plus className="h-4 w-4" /> {guardando ? 'Guardando…' : 'Abrir grupo'}
              </Boton>
            </form>
          )}
        </Tarjeta>

        <Tarjeta titulo="Catálogos para grupos">
          <div className="grid gap-4 md:grid-cols-2">
            <form className="grid gap-2" onSubmit={guardarPeriodo}>
              <strong className="text-xs">Agregar periodo</strong>
              <input aria-label="Nombre del periodo" className={claseEntrada} maxLength="30" placeholder="2026-2" value={nuevoPeriodo.nombre} onChange={(e) => setNuevoPeriodo({ ...nuevoPeriodo, nombre: e.target.value })} required />
              <div className="grid grid-cols-2 gap-2">
                <input aria-label="Inicio del periodo" className={claseEntrada} type="date" value={nuevoPeriodo.fechaInicio} onChange={(e) => setNuevoPeriodo({ ...nuevoPeriodo, fechaInicio: e.target.value })} required />
                <input aria-label="Fin del periodo" className={claseEntrada} type="date" value={nuevoPeriodo.fechaFin} onChange={(e) => setNuevoPeriodo({ ...nuevoPeriodo, fechaFin: e.target.value })} required />
              </div>
              <Boton variante="secundario" type="submit">Agregar periodo</Boton>
            </form>
            <form className="grid content-start gap-2" onSubmit={guardarAula}>
              <strong className="text-xs">Agregar aula</strong>
              <input aria-label="Nombre del aula" className={claseEntrada} maxLength="30" placeholder="Aula 1" value={nuevaAula} onChange={(e) => setNuevaAula(e.target.value)} required />
              <Boton variante="secundario" type="submit">Agregar aula</Boton>
            </form>
          </div>
        </Tarjeta>
      </div>

      <Tarjeta titulo="Grupos del periodo" extra={`${grupos.length} grupos`}>
        {!form.idPeriodo ? <p className="text-sm text-tenue">Agrega o selecciona un periodo para consultar sus grupos.</p>
          : grupos.length === 0 ? <p className="text-sm text-tenue">No hay grupos registrados en este periodo.</p>
            : <div className="grid gap-3">
              {grupos.map((g) => <article className="rounded-lg border border-linea p-3" key={g.id}>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <strong>{g.nivel} · Grupo {g.clave}</strong><span className="rounded-full bg-info-fondo px-2 py-1 text-xs">{g.estatusActa}</span>
                </div>
                <p className="mt-1 text-xs text-tenue">{g.modalidad} · {g.aula} · {g.facilitador} · {g.alumnosInscritos}/{g.cupo} alumnos</p>
                <p className="mt-2 text-xs">{g.horarios.map((h) => `${DIAS[h.diaSemana - 1]} ${h.horaInicio.slice(0, 5)}–${h.horaFin.slice(0, 5)}`).join(' · ')}</p>
              </article>)}
            </div>}
      </Tarjeta>
    </div>
  );
}

function Selector({ id, etiqueta, valor, onChange, opciones }) {
  return (
    <Campo etiqueta={etiqueta} id={id}>
      <select className={claseEntrada} id={id} name={id} value={valor} onChange={onChange} required>
        <option value="">Selecciona…</option>
        {opciones.map(([key, nombre]) => <option key={key} value={key}>{nombre}</option>)}
      </select>
    </Campo>
  );
}
