import { api } from './cliente';

export const consultarElegibilidadConstancia = () =>
  api.get('/constancias/disponibilidad').then((respuesta) => respuesta.data);
export const solicitarConstancia = () =>
  api.post('/constancias').then((respuesta) => respuesta.data);
export const listarMisConstancias = () =>
  api.get('/constancias/mias').then((respuesta) => respuesta.data);
export const listarConstancias = (estatus) =>
  api.get('/constancias', { params: estatus ? { estatus } : {} }).then((respuesta) => respuesta.data);
export const autorizarConstancia = (id, folio) =>
  api.post(`/constancias/${encodeURIComponent(id)}/autorizacion`, { folio }).then((respuesta) => respuesta.data);
export const rechazarConstancia = (id, motivo) =>
  api.post(`/constancias/${encodeURIComponent(id)}/rechazo`, { motivo }).then((respuesta) => respuesta.data);
export const descargarPdfConstancia = (id) =>
  api.get(`/constancias/${encodeURIComponent(id)}/pdf`, { responseType: 'blob' });
