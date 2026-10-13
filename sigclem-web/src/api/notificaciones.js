import { api } from './cliente';

export const listarMensajes = () => api.get('/notificaciones').then((respuesta) => respuesta.data);
export const enviarMensaje = (datos) => api.post('/notificaciones', datos).then((respuesta) => respuesta.data);
export const marcarMensajeLeido = (id) =>
  api.patch(`/notificaciones/${encodeURIComponent(id)}/leida`).then((respuesta) => respuesta.data);
