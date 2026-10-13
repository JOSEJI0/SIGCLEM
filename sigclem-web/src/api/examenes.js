import { api } from './cliente';

/** CU-04 Solicitar examen de colocación o cuatro habilidades. */
export const solicitarExamen = (datos) => api.post('/examenes', datos).then((r) => r.data);

/** CU-05 Programar fecha y hora del examen. */
export const programarExamen = (id, datos) =>
  api.put(`/examenes/${encodeURIComponent(id)}/programacion`, datos).then((r) => r.data);

/** CU-06 Capturar puntajes de los criterios y asignar nivel. */
export const capturarResultadoExamen = (id, datos) =>
  api.put(`/examenes/${encodeURIComponent(id)}/resultado`, datos).then((r) => r.data);

/** Consultar exámenes con filtros opcionales (?numeroControl, ?tipo, ?pendientes). */
export const listarExamenes = (params = {}) => api.get('/examenes', { params }).then((r) => r.data);

/** Obtener examen por identificador. */
export const obtenerExamen = (id) => api.get(`/examenes/${encodeURIComponent(id)}`).then((r) => r.data);

/** Catálogo de criterios de la rúbrica (ART-05, ART-06). */
export const obtenerCriteriosExamen = () => api.get('/examenes/criterios').then((r) => r.data);
