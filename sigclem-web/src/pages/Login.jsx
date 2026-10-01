import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { ArrowRight, Award, Eye, EyeOff, IdCard, Lock, QrCode, User } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { rutaInicio } from '../auth/roles';
import { mensajeError } from '../api/cliente';
import { Alerta, Boton, Campo, claseEntrada } from '../components/ui';

/** CU-01 Iniciar sesión (Figura 37). */
export default function Login() {
  const { perfil, login, expirada } = useAuth();
  const navegar = useNavigate();
  const { state } = useLocation();
  const [usuario, setUsuario] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [ver, setVer] = useState(false);
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);

  if (perfil) return <Navigate to={rutaInicio(perfil.rol)} replace />;

  const enviar = async (e) => {
    e.preventDefault();
    if (!usuario.trim() || !contrasena) {
      setError('Ingresa tu usuario y tu contraseña.');
      return;
    }
    setEnviando(true);
    setError('');
    try {
      const p = await login(usuario.trim(), contrasena);
      const destino = state?.desde?.startsWith(rutaInicio(p.rol)) ? state.desde : rutaInicio(p.rol);
      navegar(destino, { replace: true });
    } catch (err) {
      setError(mensajeError(err, 'No fue posible iniciar sesión.'));
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="grid min-h-full lg:grid-cols-[1.1fr_1fr]">
      <section className="hidden flex-col justify-between bg-gradient-to-br from-marino to-[#0F2344] px-16 py-14 text-white lg:flex">
        <div>
          <div className="text-[13px] font-semibold tracking-[2px] text-[#D8B98C]">INSTITUTO TECNOLÓGICO DE CHILPANCINGO</div>
          <h1 className="mt-4 text-5xl font-bold tracking-wide">SIGCLEM</h1>
          <p className="mt-4 max-w-md text-base leading-relaxed text-[#C9D3E6]">
            Sistema web para la gestión de la información académica y administrativa de la Coordinación de Lenguas
            Extranjeras y Maternas.
          </p>
          <ul className="mt-8 grid gap-3.5 text-sm text-[#E3E9F5]">
            <li className="flex items-center gap-3"><IdCard className="h-5 w-5 text-[#D8B98C]" />Expediente digital y avance reticular</li>
            <li className="flex items-center gap-3"><QrCode className="h-5 w-5 text-[#D8B98C]" />Validación de comprobantes de pago con código QR</li>
            <li className="flex items-center gap-3"><Award className="h-5 w-5 text-[#D8B98C]" />Constancias de acreditación con folio único</li>
          </ul>
        </div>
        <div className="text-xs text-[#9FB0CE]">Coordinación de Lenguas Extranjeras y Maternas · Chilpancingo, Gro.</div>
      </section>

      <section className="flex items-center justify-center bg-[#F7F8FB] p-4">
        <form onSubmit={enviar} noValidate className="w-full max-w-[400px] rounded-2xl border border-linea bg-white p-8 shadow-[0_10px_30px_rgba(20,40,80,.08)]">
          <h2 className="text-[22px] font-bold">Iniciar sesión</h2>
          <p className="mb-6 mt-1 text-tenue">Ingresa con la cuenta que te asignó la coordinación.</p>
          <div className="grid gap-4">
            {expirada && <Alerta tipo="aviso">Tu sesión terminó. Vuelve a iniciar sesión.</Alerta>}
            {error && <Alerta tipo="error">{error}</Alerta>}
            <Campo etiqueta="Usuario" id="usuario" ayuda="Número de control o usuario institucional">
              <div className="relative">
                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-tenue" aria-hidden />
                <input id="usuario" autoComplete="username" className={`${claseEntrada} pl-9`} value={usuario}
                  onChange={(e) => setUsuario(e.target.value)} />
              </div>
            </Campo>
            <Campo etiqueta="Contraseña" id="contrasena">
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-tenue" aria-hidden />
                <input id="contrasena" type={ver ? 'text' : 'password'} autoComplete="current-password"
                  className={`${claseEntrada} px-9`} value={contrasena} onChange={(e) => setContrasena(e.target.value)} />
                <button type="button" onClick={() => setVer(!ver)} className="absolute right-3 top-1/2 -translate-y-1/2 text-tenue"
                  aria-label={ver ? 'Ocultar contraseña' : 'Mostrar contraseña'}>
                  {ver ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </Campo>
            <Boton type="submit" disabled={enviando} className="mt-1 py-2.5">
              {enviando ? 'Ingresando…' : <>Ingresar <ArrowRight className="h-4 w-4" /></>}
            </Boton>
            <p className="text-center text-xs text-tenue">
              ¿Olvidaste tu contraseña? Solicita el restablecimiento en la coordinación.
            </p>
            <p className="border-t border-linea pt-4 text-center text-[13px] text-tenue">
              ¿Eres alumno y aún no tienes cuenta?{' '}
              <Link to="/registro" className="font-semibold text-marino hover:underline">Regístrate</Link>
            </p>
          </div>
        </form>
      </section>
    </div>
  );
}
