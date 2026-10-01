import { api } from './cliente';

export async function iniciarSesion(usuario, contrasena) {
  const { data } = await api.post('/auth/login', { usuario, contrasena });
  return data; // { token, tipo, expiraEnSegundos, perfil }
}

export async function obtenerPerfil() {
  const { data } = await api.get('/auth/perfil');
  return data;
}
