import { useCallback, useEffect, useState } from 'react';
import { BookOpen, Search, UserRound } from 'lucide-react';
import { buscarAlumnos, obtenerExpediente } from '../../api/alumnos';
import { mensajeError } from '../../api/cliente';
import { Alerta, Boton, Campo, Cargando, Insignia, Tarjeta, claseEntrada } from '../../components/ui';

function fecha(iso) {
  return iso ? new Date(`${iso}T00:00:00`).toLocaleDateString('es-MX') : '—';
}

/** Consulta paginada de alumnos y sus expedientes (CU-16, CU-21). */
export default function Alumnos() {
  const [busqueda, setBusqueda] = useState('');
  const [filtro, setFiltro] = useState('');
  const [pagina, setPagina] = useState(null);
  const [expediente, setExpediente] = useState(null);
  const [error, setError] = useState('');
  const [errorExpediente, setErrorExpediente] = useState('');
  const [cargando, setCargando] = useState(true);
  const [cargandoExpediente, setCargandoExpediente] = useState(false);

  const cargar = useCallback(async (criterio, numeroPagina) => {
    setCargando(true);
    setError('');
    try {
      setPagina(await buscarAlumnos({ busqueda: criterio, pagina: numeroPagina }));
    } catch (e) {
      setError(mensajeError(e));
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargar('', 0);
  }, [cargar]);

  async function seleccionar(alumno) {
    setExpediente(null);
    setErrorExpediente('');
    setCargandoExpediente(true);
    try {
      setExpediente(await obtenerExpediente(alumno.numeroControl));
    } catch (e) {
      setErrorExpediente(mensajeError(e));
    } finally {
      setCargandoExpediente(false);
    }
  }

  function buscar(evento) {
    evento.preventDefault();
    const criterio = busqueda.trim();
    setFiltro(criterio);
    setExpediente(null);
    cargar(criterio, 0);
  }

  function cambiarPagina(numeroPagina) {
    cargar(filtro, numeroPagina);
  }

  return (
    <div className="grid gap-[18px]">
      <Tarjeta titulo="Buscar alumnos" icono={Search}>
        <form className="flex flex-col gap-3 sm:flex-row sm:items-end" onSubmit={buscar}>
          <Campo etiqueta="Nombre, número de control, carrera o correo" id="busqueda">
            <input
              className={claseEntrada}
              id="busqueda"
              value={busqueda}
              onChange={(evento) => setBusqueda(evento.target.value)}
              maxLength="100"
              placeholder="Escribe para filtrar alumnos"
            />
          </Campo>
          <div className="flex gap-2">
            <Boton type="submit"><Search className="h-4 w-4" /> Buscar</Boton>
            {filtro && (
              <Boton variante="secundario" type="button" onClick={() => {
                setBusqueda('');
                setFiltro('');
                setExpediente(null);
                cargar('', 0);
              }}>
                Limpiar
              </Boton>
            )}
          </div>
        </form>
      </Tarjeta>

      {error && <Alerta tipo="error">{error}</Alerta>}

      <Tarjeta
        titulo="Alumnos registrados"
        icono={UserRound}
        extra={pagina ? `${pagina.totalElements} en total` : ''}
      >
        {cargando ? <Cargando /> : !pagina?.content.length ? (
          <p className="text-sm text-tenue">No se encontraron alumnos con esos criterios.</p>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[650px] text-left text-sm">
                <thead className="border-b border-linea text-xs text-tenue">
                  <tr>
                    <th className="px-2 py-2">Número de control</th>
                    <th className="px-2 py-2">Nombre</th>
                    <th className="px-2 py-2">Carrera</th>
                    <th className="px-2 py-2">Semestre</th>
                    <th className="px-2 py-2">Correo</th>
                    <th className="px-2 py-2">Expediente</th>
                  </tr>
                </thead>
                <tbody>
                  {pagina.content.map((alumno) => (
                    <tr className="border-b border-linea last:border-0" key={alumno.numeroControl}>
                      <td className="px-2 py-3 font-medium">{alumno.numeroControl}</td>
                      <td className="px-2 py-3">{alumno.nombreCompleto}</td>
                      <td className="px-2 py-3">{alumno.carrera}</td>
                      <td className="px-2 py-3">{alumno.semestre}.º</td>
                      <td className="px-2 py-3">{alumno.correo || '—'}</td>
                      <td className="px-2 py-3">
                        <button className="font-semibold text-marino underline" type="button" onClick={() => seleccionar(alumno)}>
                          Consultar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4 flex items-center justify-between gap-3">
              <span className="text-xs text-tenue">
                Página {pagina.number + 1} de {Math.max(pagina.totalPages, 1)}
              </span>
              <div className="flex gap-2">
                <Boton variante="secundario" type="button" disabled={pagina.first} onClick={() => cambiarPagina(pagina.number - 1)}>
                  Anterior
                </Boton>
                <Boton variante="secundario" type="button" disabled={pagina.last} onClick={() => cambiarPagina(pagina.number + 1)}>
                  Siguiente
                </Boton>
              </div>
            </div>
          </>
        )}
      </Tarjeta>

      {cargandoExpediente && <Cargando texto="Cargando expediente…" />}
      {errorExpediente && <Alerta tipo="error">{errorExpediente}</Alerta>}
      {expediente && (
        <Tarjeta titulo={`Expediente · ${expediente.numeroControl}`} icono={BookOpen}>
          <dl className="mb-5 grid gap-x-4 gap-y-2 text-sm sm:grid-cols-2 lg:grid-cols-3">
            <div><dt className="text-tenue">Nombre</dt><dd className="font-medium">{expediente.nombreCompleto}</dd></div>
            <div><dt className="text-tenue">Carrera</dt><dd>{expediente.carrera}</dd></div>
            <div><dt className="text-tenue">Semestre</dt><dd>{expediente.semestre}.º</dd></div>
            <div><dt className="text-tenue">Correo</dt><dd>{expediente.correo || '—'}</dd></div>
            <div><dt className="text-tenue">Fecha de alta</dt><dd>{fecha(expediente.fechaInscripcion)}</dd></div>
            <div><dt className="text-tenue">Nivel actual</dt><dd className="font-medium">{expediente.nivelActual}</dd></div>
          </dl>
          <h3 className="mb-2 text-sm font-semibold">Avance reticular de inglés</h3>
          <ol className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
            {expediente.avance.map((nivel) => (
              <li className="rounded-lg border border-linea p-3" key={nivel.numero}>
                <p className="text-xs text-tenue">Nivel {nivel.numero} · {nivel.nivelMcer}</p>
                <p className="my-1 text-sm font-medium">{nivel.nombre}</p>
                <Insignia estatus={nivel.estatus} />
              </li>
            ))}
          </ol>
        </Tarjeta>
      )}
    </div>
  );
}
