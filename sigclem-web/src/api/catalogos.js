import { api } from './cliente';

export const obtenerCarreras = () => api.get('/catalogos/carreras').then((r) => r.data);
export const obtenerNiveles = () => api.get('/catalogos/niveles').then((r) => r.data);
