import { api } from './cliente';

export const registrarAlumno = (datos) => api.post('/alumnos/registro', datos).then((r) => r.data);
export const obtenerExpediente = (numeroControl) =>
  api.get(`/alumnos/${encodeURIComponent(numeroControl)}`).then((r) => r.data);
