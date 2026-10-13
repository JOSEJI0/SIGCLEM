import { api } from './cliente';

export const listarGrupos = (periodoId) =>
  api.get('/grupos', { params: periodoId ? { periodoId } : {} }).then((r) => r.data);
export const abrirGrupo = (datos) => api.post('/grupos', datos).then((r) => r.data);
export const obtenerActa = (id) => api.get(`/grupos/${encodeURIComponent(id)}`).then((r) => r.data);
export const guardarCalificaciones = (id, calificaciones) =>
  api.put(`/grupos/${encodeURIComponent(id)}/acta`, { calificaciones }).then((r) => r.data);
export const cerrarActa = (id) =>
  api.post(`/grupos/${encodeURIComponent(id)}/acta/cierre`).then((r) => r.data);
