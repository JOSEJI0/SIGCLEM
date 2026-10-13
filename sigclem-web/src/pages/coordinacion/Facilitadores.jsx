import { useCallback, useEffect, useState } from 'react';
import { KeyRound, Plus, UserRoundCog } from 'lucide-react';
import { actualizarFacilitador, cambiarEstadoFacilitador, listarFacilitadores, registrarFacilitador } from '../../api/facilitadores';
import { mensajeError } from '../../api/cliente';
import { Alerta, Boton, Campo, Cargando, Insignia, Tarjeta, claseEntrada } from '../../components/ui';

const inicial = { nombre: '', apellidoPaterno: '', apellidoMaterno: '', correo: '', telefono: '' };

export default function Facilitadores() {
  const [facilitadores, setFacilitadores] = useState([]);
  const [formulario, setFormulario] = useState(inicial);
  const [seleccionado, setSeleccionado] = useState(null);
  const [credenciales, setCredenciales] = useState(null);
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);

  const cargar = useCallback(async () => {
    try {
      setError('');
      setFacilitadores(await listarFacilitadores());
    } catch (e) {
      setError(mensajeError(e));
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  function cambiarCampo(evento) {
    setFormulario((actual) => ({ ...actual, [evento.target.name]: evento.target.value }));
  }

  function editar(facilitador) {
    setSeleccionado(facilitador);
    setFormulario({
      ...inicial,
      nombre: facilitador.nombre,
      apellidoPaterno: facilitador.apellidoPaterno,
      apellidoMaterno: facilitador.apellidoMaterno ?? '',
      correo: facilitador.correo,
      telefono: facilitador.telefono ?? '',
    });
    setError('');
  }

  async function guardar(evento) {
    evento.preventDefault();
    setGuardando(true);
    setError('');
    try {
      if (seleccionado) {
        await actualizarFacilitador(seleccionado.id, formulario);
        setSeleccionado(null);
      } else {
        setCredenciales(await registrarFacilitador(formulario));
      }
      setFormulario(inicial);
      await cargar();
    } catch (e) {
      setError(mensajeError(e));
    } finally {
      setGuardando(false);
    }
  }

  async function cambiarEstado(facilitador) {
    try {
      setError('');
      await cambiarEstadoFacilitador(facilitador.id, !facilitador.activo);
      await cargar();
    } catch (e) {
      setError(mensajeError(e));
    }
  }

  return (
    <div className="grid gap-[18px] xl:grid-cols-[minmax(300px,0.8fr)_1.2fr]">
      <Tarjeta titulo={seleccionado ? 'Editar facilitador' : 'Registrar facilitador'} icono={UserRoundCog}>
        <form className="grid gap-3" onSubmit={guardar}>
          <Campo etiqueta="Nombre" id="nombre">
            <input className={claseEntrada} id="nombre" name="nombre" maxLength="60" value={formulario.nombre} onChange={cambiarCampo} required />
          </Campo>
          <Campo etiqueta="Apellido paterno" id="apellidoPaterno">
            <input className={claseEntrada} id="apellidoPaterno" name="apellidoPaterno" maxLength="40" value={formulario.apellidoPaterno} onChange={cambiarCampo} required />
          </Campo>
          <Campo etiqueta="Apellido materno" id="apellidoMaterno">
            <input className={claseEntrada} id="apellidoMaterno" name="apellidoMaterno" maxLength="40" value={formulario.apellidoMaterno} onChange={cambiarCampo} />
          </Campo>
          <Campo etiqueta="Correo (será su usuario)" id="correo">
            <input className={claseEntrada} id="correo" name="correo" type="email" maxLength="80" value={formulario.correo} onChange={cambiarCampo} required />
          </Campo>
          <Campo etiqueta="Teléfono" id="telefono">
            <input className={claseEntrada} id="telefono" name="telefono" maxLength="15" value={formulario.telefono} onChange={cambiarCampo} />
          </Campo>
          {error && <Alerta tipo="error">{error}</Alerta>}
          <div className="flex gap-2">
            <Boton type="submit" disabled={guardando}>{guardando ? 'Guardando…' : seleccionado ? 'Guardar cambios' : <><Plus className="h-4 w-4" /> Crear cuenta</>}</Boton>
            {seleccionado && <Boton variante="secundario" type="button" onClick={() => { setSeleccionado(null); setFormulario(inicial); setError(''); }}>Cancelar</Boton>}
          </div>
        </form>
        {credenciales && (
          <div className="mt-4 rounded-lg border border-[#C7DAF0] bg-info-fondo p-3 text-sm">
            <div className="mb-2 flex items-center gap-2 font-semibold"><KeyRound className="h-4 w-4" /> Cuenta creada; entrega la contraseña al facilitador.</div>
            <p>Usuario: <strong>{credenciales.usuario}</strong></p>
            <p>Contraseña temporal: <strong className="break-all">{credenciales.contrasenaTemporal}</strong></p>
            <button className="mt-2 text-xs underline" type="button" onClick={() => setCredenciales(null)}>Ocultar credenciales</button>
          </div>
        )}
      </Tarjeta>

      <Tarjeta titulo="Facilitadores registrados" extra={`${facilitadores.length} en total`}>
        {cargando ? <Cargando /> : facilitadores.length === 0 ? (
          <p className="text-sm text-tenue">Aún no hay facilitadores registrados.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[620px] text-left text-sm">
              <thead className="border-b border-linea text-xs text-tenue">
                <tr><th className="px-2 py-2">Nombre</th><th className="px-2 py-2">Correo</th><th className="px-2 py-2">Teléfono</th><th className="px-2 py-2">Cuenta</th><th className="px-2 py-2">Acciones</th></tr>
              </thead>
              <tbody>
                {facilitadores.map((f) => (
                  <tr className="border-b border-linea last:border-0" key={f.id}>
                    <td className="px-2 py-3 font-medium">{f.nombreCompleto}</td>
                    <td className="px-2 py-3">{f.correo}</td>
                    <td className="px-2 py-3">{f.telefono || '—'}</td>
                    <td className="px-2 py-3"><Insignia estatus={f.activo ? 'Activa' : 'Inactiva'} /></td>
                    <td className="px-2 py-3">
                      <div className="flex gap-2">
                        <button className="text-marino underline" type="button" onClick={() => editar(f)}>Editar</button>
                        <button className="text-marino underline" type="button" onClick={() => cambiarEstado(f)}>{f.activo ? 'Desactivar' : 'Activar'}</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Tarjeta>
    </div>
  );
}
