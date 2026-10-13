import { useCallback, useEffect, useState } from 'react';
import { Mail, MailOpen, Send } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { ROLES } from '../auth/roles';
import { enviarMensaje, listarMensajes, marcarMensajeLeido } from '../api/notificaciones';
import { mensajeError } from '../api/cliente';
import { Alerta, Boton, Campo, Cargando, Tarjeta, claseEntrada } from '../components/ui';

const FORMULARIO_INICIAL = { asunto: '', mensaje: '' };

function fechaHora(fecha) {
  return fecha
    ? new Date(fecha).toLocaleString('es-MX', { dateStyle: 'medium', timeStyle: 'short' })
    : 'Fecha no disponible';
}

export default function Mensajes() {
  const { perfil } = useAuth();
  const coordinador = perfil?.rol === ROLES.COORDINADOR;
  const [mensajes, setMensajes] = useState([]);
  const [formulario, setFormulario] = useState(FORMULARIO_INICIAL);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');
  const [aviso, setAviso] = useState('');

  const cargar = useCallback(async () => {
    setError('');
    try {
      setMensajes(await listarMensajes());
    } catch (e) {
      setError(mensajeError(e));
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  async function enviar(evento) {
    evento.preventDefault();
    setGuardando(true);
    setError('');
    setAviso('');
    try {
      await enviarMensaje(formulario);
      setFormulario(FORMULARIO_INICIAL);
      setAviso('El mensaje se envió a la jefatura del DGTV.');
      await cargar();
    } catch (e) {
      setError(mensajeError(e));
    } finally {
      setGuardando(false);
    }
  }

  async function marcarLeido(id) {
    setError('');
    setAviso('');
    try {
      const actualizado = await marcarMensajeLeido(id);
      setMensajes((actuales) => actuales.map((mensaje) => mensaje.id === id ? actualizado : mensaje));
    } catch (e) {
      setError(mensajeError(e));
    }
  }

  return (
    <div className="grid gap-[18px]">
      {coordinador && (
        <Tarjeta titulo="Enviar mensaje a la jefatura del DGTV" icono={Send}>
          <form className="grid gap-3" onSubmit={enviar}>
            <Campo etiqueta="Asunto" id="asunto">
              <input
                className={claseEntrada}
                id="asunto"
                value={formulario.asunto}
                onChange={(evento) => setFormulario((anterior) => ({ ...anterior, asunto: evento.target.value }))}
                maxLength="100"
                required
              />
            </Campo>
            <Campo etiqueta="Mensaje" id="mensaje">
              <textarea
                className={`${claseEntrada} min-h-28 resize-y`}
                id="mensaje"
                value={formulario.mensaje}
                onChange={(evento) => setFormulario((anterior) => ({ ...anterior, mensaje: evento.target.value }))}
                maxLength="500"
                required
              />
            </Campo>
            {error && <Alerta tipo="error">{error}</Alerta>}
            {aviso && <Alerta tipo="ok">{aviso}</Alerta>}
            <div><Boton type="submit" disabled={guardando}><Send className="h-4 w-4" />{guardando ? 'Enviando…' : 'Enviar mensaje'}</Boton></div>
          </form>
        </Tarjeta>
      )}

      <Tarjeta
        titulo={coordinador ? 'Mensajes enviados' : 'Mensajes del coordinador'}
        icono={coordinador ? Mail : MailOpen}
        extra={`${mensajes.length} recientes`}
      >
        {!coordinador && error && <Alerta tipo="error" className="mb-3">{error}</Alerta>}
        {!coordinador && aviso && <Alerta tipo="ok" className="mb-3">{aviso}</Alerta>}
        {cargando ? <Cargando /> : mensajes.length === 0 ? (
          <p className="text-sm text-tenue">No hay mensajes todavía.</p>
        ) : (
          <ul className="grid gap-3">
            {mensajes.map((mensaje) => (
              <li className={`rounded-lg border border-linea p-4 ${mensaje.leida ? 'bg-white' : 'bg-info-fondo'}`} key={mensaje.id}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="font-semibold">{mensaje.asunto}</h3>
                    <p className="mt-1 whitespace-pre-wrap text-sm">{mensaje.mensaje}</p>
                    <p className="mt-2 text-xs text-tenue">
                      {coordinador ? `Para: ${mensaje.destinatario}` : `De: ${mensaje.remitente}`} · {fechaHora(mensaje.fechaEnvio)}
                    </p>
                  </div>
                  {!coordinador && !mensaje.leida && (
                    <Boton variante="secundario" type="button" onClick={() => marcarLeido(mensaje.id)}>
                      Marcar como leído
                    </Boton>
                  )}
                  {!coordinador && mensaje.leida && <span className="text-xs text-tenue">Leído</span>}
                </div>
              </li>
            ))}
          </ul>
        )}
      </Tarjeta>
    </div>
  );
}
