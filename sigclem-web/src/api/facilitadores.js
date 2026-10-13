import { api } from './cliente';

export const listarFacilitadores = () => api.get('/facilitadores').then((r) => r.data);
export const registrarFacilitador = (datos) => api.post('/facilitadores', datos).then((r) => r.data);
export const actualizarFacilitador = (id, datos) =>
  api.put(`/facilitadores/${encodeURIComponent(id)}`, datos).then((r) => r.data);
export const cambiarEstadoFacilitador = (id, activo) =>
  api.put(`/facilitadores/${encodeURIComponent(id)}/estado`, null, { params: { activo } }).then((r) => r.data);
