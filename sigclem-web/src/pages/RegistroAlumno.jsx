import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { UserPlus } from 'lucide-react';
import { obtenerCarreras } from '../api/catalogos';
import { registrarAlumno } from '../api/alumnos';
import { erroresDeCampo, mensajeError } from '../api/cliente';
import { Alerta, Boton, Campo, claseEntrada } from '../components/ui';

const INICIAL = {
  numeroControl: '', nombre: '', apellidoPaterno: '', apellidoMaterno: '',
  idCarrera: '', semestre: '', correo: '', contrasena: '', confirmacion: '',
};

function validar(f) {
  const e = {};
  if (!/^[A-Z0-9]{1,10}$/.test(f.numeroControl)) e.numeroControl = 'Solo letras mayúsculas y dígitos, máximo 10.';
  if (!f.nombre.trim()) e.nombre = 'Obligatorio.';
  if (!f.apellidoPaterno.trim()) e.apellidoPaterno = 'Obligatorio.';
  if (!f.idCarrera) e.idCarrera = 'Selecciona tu carrera.';
  if (!(Number(f.semestre) >= 1 && Number(f.semestre) <= 12)) e.semestre = 'Entre 1 y 12.';
  if (f.correo && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.correo)) e.correo = 'Correo no válido.';
  if (f.contrasena.length < 8) e.contrasena = 'Mínimo 8 caracteres.';
  if (f.confirmacion !== f.contrasena) e.confirmacion = 'Las contraseñas no coinciden.';
  return e;
}

/** CU-02 Registrarse (el registro público siempre crea una cuenta de alumno). */
export default function RegistroAlumno() {
  const [f, setF] = useState(INICIAL);
  const [carreras, setCarreras] = useState([]);
  const [errores, setErrores] = useState({});
  const [error, setError] = useState('');
  const [listo, setListo] = useState(null);
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    obtenerCarreras().then(setCarreras).catch((e) => setError(mensajeError(e)));
  }, []);

  const cambiar = (campo) => (e) => {
    const v = campo === 'numeroControl' ? e.target.value.toUpperCase().trim() : e.target.value;
    setF({ ...f, [campo]: v });
  };

  const enviar = async (e) => {
    e.preventDefault();
    const v = validar(f);
    setErrores(v);
    if (Object.keys(v).length) return;
    setEnviando(true);
    setError('');
    try {
      const { confirmacion, ...datos } = f;
      const creado = await registrarAlumno({ ...datos, idCarrera: Number(f.idCarrera), semestre: Number(f.semestre),
        correo: f.correo || null, apellidoMaterno: f.apellidoMaterno || null });
      setListo(creado);
    } catch (err) {
      setErrores(erroresDeCampo(err));
      setError(mensajeError(err));
    } finally {
      setEnviando(false);
    }
  };

  const entrada = (campo, props = {}) => (
    <input id={campo} className={claseEntrada} value={f[campo]} onChange={cambiar(campo)}
      aria-invalid={!!errores[campo]} {...props} />
  );

  return (
    <div className="flex min-h-full items-center justify-center bg-[#F7F8FB] p-4">
      <div className="w-full max-w-2xl rounded-2xl border border-linea bg-white p-8">
        <h1 className="flex items-center gap-2 text-[22px] font-bold"><UserPlus className="h-5 w-5" />Registro de alumno</h1>
        <p className="mb-6 mt-1 text-tenue">Crea tu cuenta para consultar tu expediente y realizar tus trámites de inglés.</p>
        {listo ? (
          <div className="grid gap-4">
            <Alerta tipo="ok">
              Tu cuenta quedó registrada. Tu usuario es tu número de control <b>{listo.numeroControl}</b> y tu nivel
              inicial es <b>{listo.nivelActual}</b>.
            </Alerta>
            <Link to="/login" className="text-center font-semibold text-marino hover:underline">Ir a iniciar sesión</Link>
          </div>
        ) : (
          <form onSubmit={enviar} noValidate className="grid gap-4 sm:grid-cols-2">
            {error && <div className="sm:col-span-2"><Alerta tipo="error">{error}</Alerta></div>}
            <Campo etiqueta="Número de control" id="numeroControl" error={errores.numeroControl}>{entrada('numeroControl', { autoComplete: 'username' })}</Campo>
            <Campo etiqueta="Correo electrónico (opcional)" id="correo" error={errores.correo}>{entrada('correo', { type: 'email' })}</Campo>
            <Campo etiqueta="Nombre(s)" id="nombre" error={errores.nombre}>{entrada('nombre')}</Campo>
            <Campo etiqueta="Apellido paterno" id="apellidoPaterno" error={errores.apellidoPaterno}>{entrada('apellidoPaterno')}</Campo>
            <Campo etiqueta="Apellido materno" id="apellidoMaterno" error={errores.apellidoMaterno}>{entrada('apellidoMaterno')}</Campo>
            <Campo etiqueta="Semestre" id="semestre" error={errores.semestre}>{entrada('semestre', { type: 'number', min: 1, max: 12 })}</Campo>
            <div className="sm:col-span-2">
              <Campo etiqueta="Carrera" id="idCarrera" error={errores.idCarrera}>
                <select id="idCarrera" className={claseEntrada} value={f.idCarrera} onChange={cambiar('idCarrera')} aria-invalid={!!errores.idCarrera}>
                  <option value="">Selecciona…</option>
                  {carreras.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                </select>
              </Campo>
            </div>
            <Campo etiqueta="Contraseña" id="contrasena" error={errores.contrasena}>{entrada('contrasena', { type: 'password', autoComplete: 'new-password' })}</Campo>
            <Campo etiqueta="Confirmar contraseña" id="confirmacion" error={errores.confirmacion}>{entrada('confirmacion', { type: 'password', autoComplete: 'new-password' })}</Campo>
            <div className="flex items-center justify-between gap-3 sm:col-span-2">
              <Link to="/login" className="text-[13px] text-tenue hover:underline">Ya tengo cuenta</Link>
              <Boton type="submit" disabled={enviando}>{enviando ? 'Registrando…' : 'Crear cuenta'}</Boton>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
