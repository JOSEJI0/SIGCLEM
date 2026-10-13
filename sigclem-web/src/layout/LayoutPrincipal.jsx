import { useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { ETIQUETA_ROL } from '../auth/roles';
import { IconoNotificaciones, MENUS } from './menus';

function iniciales(nombre = '') {
  return nombre.split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0]).join('').toUpperCase() || 'U';
}

/** Distribución común: menú lateral por rol y barra superior (guía de estilo, Tabla 64). */
export default function LayoutPrincipal() {
  const { perfil, cerrarSesion } = useAuth();
  const [abierto, setAbierto] = useState(false);
  const { pathname } = useLocation();
  const navegar = useNavigate();
  const menu = MENUS[perfil?.rol] || MENUS.COORDINADOR;
  const actual = [...menu.elementos].reverse().find((e) => (e.fin ? pathname === e.a : pathname.startsWith(e.a)));

  const salir = () => {
    cerrarSesion();
    navegar('/login', { replace: true });
  };

  return (
    <div className="flex min-h-full">
      {abierto && <div className="fixed inset-0 z-30 bg-black/30 lg:hidden" onClick={() => setAbierto(false)} />}
      <aside className={`fixed inset-y-0 left-0 z-40 flex w-[236px] flex-col bg-marino text-white transition-transform lg:static lg:translate-x-0 ${abierto ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="border-b border-white/10 px-5 pb-4 pt-5">
          <div className="flex items-center justify-between">
            <b className="text-xl tracking-wide">SIGCLEM</b>
            <button className="lg:hidden" onClick={() => setAbierto(false)} aria-label="Cerrar menú"><X className="h-5 w-5" /></button>
          </div>
          <small className="mt-1 block text-[11px] leading-snug text-[#C9D3E6]">Coordinación de Lenguas Extranjeras y Maternas · ITCH</small>
        </div>
        <nav className="flex-1 overflow-y-auto px-2.5 py-3" aria-label="Menú principal">
          <div className="mx-2.5 mb-1.5 mt-3 text-[10.5px] uppercase tracking-wider text-[#9FB0CE]">{menu.seccion}</div>
          {menu.elementos.map((e) => (
            <div key={e.a}>
              {e.seccion && <div className="mx-2.5 mb-1.5 mt-4 text-[10.5px] uppercase tracking-wider text-[#9FB0CE]">{e.seccion}</div>}
              <NavLink
                to={e.a}
                end={e.fin}
                onClick={() => setAbierto(false)}
                className={({ isActive }) =>
                  `mb-0.5 flex items-center gap-2.5 rounded-lg px-2.5 py-2 transition ${isActive ? 'bg-white font-semibold text-marino' : 'text-[#DCE4F2] hover:bg-white/10'}`}
              >
                <e.icono className="h-4 w-4" aria-hidden />
                {e.etiqueta}
              </NavLink>
            </div>
          ))}
        </nav>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-[62px] items-center gap-4 border-b border-linea bg-white px-4 sm:px-6">
          <button className="lg:hidden" onClick={() => setAbierto(true)} aria-label="Abrir menú"><Menu className="h-5 w-5" /></button>
          <div>
            <h1 className="text-lg font-semibold leading-tight">{actual?.etiqueta ?? 'SIGCLEM'}</h1>
            <div className="text-xs text-tenue">{menu.seccion}</div>
          </div>

          <div className="ml-auto flex items-center gap-4">
            {perfil?.rol === 'COORDINADOR' ? (
              <Link to="/coordinacion/mensajes" aria-label="Abrir mensajes" title="Mensajes">
                <IconoNotificaciones className="h-5 w-5 text-tenue" />
              </Link>
            ) : perfil?.rol === 'JEFA_DGTV' ? (
              <Link to="/supervision/mensajes" aria-label="Abrir mensajes" title="Mensajes">
                <IconoNotificaciones className="h-5 w-5 text-tenue" />
              </Link>
            ) : (
              <IconoNotificaciones className="h-5 w-5 text-tenue" aria-label="Notificaciones" />
            )}
            <div className="flex items-center gap-2.5">
              <div className="flex h-[34px] w-[34px] items-center justify-center rounded-full bg-marino text-[13px] font-semibold text-white">
                {iniciales(perfil?.nombre)}
              </div>
              <div className="hidden sm:block">
                <div className="text-[13px] font-semibold leading-tight">{perfil?.nombre}</div>
                <div className="text-[11.5px] text-tenue">{ETIQUETA_ROL[perfil?.rol]}</div>
              </div>
            </div>
            <button
              type="button"
              onClick={salir}
              className="inline-flex items-center gap-2 whitespace-nowrap rounded-lg border border-[#C9D1DD] px-2.5 py-2 text-[13px] font-semibold text-marino transition hover:bg-fondo sm:px-3"
              aria-label="Cerrar sesión"
              title="Cerrar sesión"
            >
              <LogOut className="h-4 w-4" aria-hidden />
              <span className="hidden sm:inline">Cerrar sesión</span>
            </button>
          </div>
        </header>
        <main className="flex flex-col gap-[18px] p-4 sm:px-6 sm:py-[22px]">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
