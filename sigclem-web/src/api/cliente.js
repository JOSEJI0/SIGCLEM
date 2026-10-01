import axios from 'axios';

export const CLAVE_SESION = 'sigclem.sesion';
export const EVENTO_SESION_EXPIRADA = 'sigclem:sesion-expirada';

/** Cliente HTTP único de la SPA (componente "Cliente API" de la Figura 29). */
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api/v1',
  timeout: 20000,
});

export function leerSesion() {
  try {
    const sesion = JSON.parse(localStorage.getItem(CLAVE_SESION));
    if (!sesion?.token || !sesion?.expiraEn || Date.now() >= sesion.expiraEn) return null;
    return sesion;
  } catch {
    return null;
  }
}

api.interceptors.request.use((config) => {
  const sesion = leerSesion();
  if (sesion) config.headers.Authorization = `Bearer ${sesion.token}`;
  return config;
});

api.interceptors.response.use(
  (respuesta) => respuesta,
  (error) => {
    const url = error.config?.url || '';
    if (error.response?.status === 401 && !url.includes('/auth/login')) {
      window.dispatchEvent(new Event(EVENTO_SESION_EXPIRADA));
    }
    return Promise.reject(error);
  },
);

/**
 * Obtiene un mensaje legible a partir de una respuesta de error RFC 7807
 * ({ title, detail, codigo, errores }).
 */
export function mensajeError(error, porDefecto = 'No fue posible completar la operación.') {
  const datos = error?.response?.data;
  if (!error?.response) return 'No hay conexión con el servidor. Verifica tu red e intenta de nuevo.';
  if (datos?.errores) return Object.values(datos.errores).join(' ');
  return datos?.detail || datos?.title || porDefecto;
}

export function erroresDeCampo(error) {
  return error?.response?.data?.errores || {};
}
