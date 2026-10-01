import { Link } from 'react-router-dom';
import { Award, CalendarDays, ClipboardCheck, Receipt, Search } from 'lucide-react';
import { useAuth } from '../../auth/AuthContext';
import { Alerta, Tarjeta } from '../../components/ui';

const ACCESOS = [
  { a: '/coordinacion/comprobantes', texto: 'Comprobantes por validar', icono: Receipt, tono: 'bg-aviso-fondo text-aviso' },
  { a: '/coordinacion/constancias', texto: 'Solicitudes de constancia', icono: Award, tono: 'bg-info-fondo text-info' },
  { a: '/coordinacion/diagnosticos', texto: 'Diagnósticos por programar', icono: ClipboardCheck, tono: 'bg-[#EFE9F8] text-[#6B46C1]' },
  { a: '/coordinacion/grupos', texto: 'Grupos del periodo', icono: CalendarDays, tono: 'bg-ok-fondo text-ok' },
];

/** Panel principal del coordinador (Figura 40). Los contadores se conectarán con cada módulo. */
export default function PanelCoordinador() {
  const { perfil } = useAuth();
  return (
    <>
      <Alerta tipo="info">Bienvenido, {perfil.nombre}. Los indicadores se activarán conforme se implementen los módulos de la Fase 5.</Alerta>
      <div className="flex max-w-[620px] items-center gap-2 rounded-lg border border-[#C9D1DD] bg-white px-3 py-2 text-tenue">
        <Search className="h-4 w-4" /> Buscar alumno o facilitador por nombre, número de control, nivel o grupo…
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {ACCESOS.map((x) => (
          <Link key={x.a} to={x.a} className="flex items-center gap-3.5 rounded-[10px] border border-linea bg-white px-[18px] py-4 hover:border-marino/40">
            <span className={`flex h-[42px] w-[42px] items-center justify-center rounded-[10px] ${x.tono}`}><x.icono className="h-5 w-5" /></span>
            <span><span className="block text-2xl font-bold leading-none">—</span><span className="mt-1 block text-xs text-tenue">{x.texto}</span></span>
          </Link>
        ))}
      </div>
      <Tarjeta titulo="Pendientes">
        <p className="text-tenue">Aquí aparecerán los comprobantes, constancias, diagnósticos y documentos pendientes, ordenados por antigüedad.</p>
      </Tarjeta>
    </>
  );
}
