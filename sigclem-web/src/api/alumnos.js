import { api } from './cliente';

export const registrarAlumno = (datos) => api.post('/alumnos/registro', datos).then((r) => r.data);
export const buscarAlumnos = ({ busqueda = '', pagina = 0, tamano = 20 } = {}) =>
  api.get('/alumnos', { params: { busqueda, page: pagina, size: tamano } }).then((r) => r.data);
export const obtenerExpediente = (numeroControl) =>
  api.get(`/alumnos/${encodeURIComponent(numeroControl)}`).then((r) => r.data);
