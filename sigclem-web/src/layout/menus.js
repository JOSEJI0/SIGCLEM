import {
  Award, BarChart3, Bell, CalendarDays, ClipboardCheck, ClipboardList, CreditCard, Eye, FileText, Home,
  IdCard, Languages, Layers, Mail, MailOpen, NotebookPen, Receipt, UserSquare, Users, LayoutDashboard,
} from 'lucide-react';

/** Menú lateral de cada rol, conforme a la matriz de permisos (Tabla 59) y los mockups (Figuras 37 a 45). */
export const MENUS = {
  ALUMNO: {
    seccion: 'Alumno',
    elementos: [
      { a: '/alumno', etiqueta: 'Mi expediente', icono: IdCard, fin: true },
      { a: '/alumno/diagnostico', etiqueta: 'Evaluación de diagnóstico', icono: ClipboardCheck },
      { a: '/alumno/pagos', etiqueta: 'Pagos', icono: CreditCard },
      { a: '/alumno/boletas', etiqueta: 'Boletas', icono: FileText },
      { a: '/alumno/constancias', etiqueta: 'Constancias', icono: Award },
      { a: '/alumno/lengua-materna', etiqueta: 'Lengua materna', icono: Languages },
    ],
  },
  FACILITADOR: {
    seccion: 'Facilitador',
    elementos: [
      { a: '/facilitador', etiqueta: 'Inicio', icono: Home, fin: true },
      { a: '/facilitador/grupos', etiqueta: 'Mis grupos', icono: Layers },
      { a: '/facilitador/actas', etiqueta: 'Actas de calificaciones', icono: NotebookPen },
    ],
  },
  COORDINADOR: {
    seccion: 'Coordinación',
    elementos: [
      { a: '/coordinacion', etiqueta: 'Panel', icono: LayoutDashboard, fin: true },
      { a: '/coordinacion/alumnos', etiqueta: 'Alumnos', icono: Users },
      { a: '/coordinacion/diagnosticos', etiqueta: 'Diagnósticos y exámenes', icono: ClipboardList },
      { a: '/coordinacion/facilitadores', etiqueta: 'Facilitadores', icono: UserSquare },
      { a: '/coordinacion/grupos', etiqueta: 'Grupos y horarios', icono: CalendarDays },
      { a: '/coordinacion/comprobantes', etiqueta: 'Comprobantes', icono: Receipt },
      { a: '/coordinacion/constancias', etiqueta: 'Constancias', icono: Award },
      { a: '/coordinacion/lenguas-maternas', etiqueta: 'Lenguas maternas', icono: Languages },
      { a: '/coordinacion/reportes', etiqueta: 'Reportes', icono: BarChart3 },
      { a: '/coordinacion/mensajes', etiqueta: 'Mensajes a la jefa', icono: Mail, seccion: 'Comunicación' },
    ],
  },
  JEFA_DGTV: {
    seccion: 'Supervisión',
    elementos: [
      { a: '/supervision', etiqueta: 'Panorama general', icono: Eye, fin: true },
      { a: '/supervision/alumnos', etiqueta: 'Alumnos', icono: Users },
      { a: '/supervision/facilitadores', etiqueta: 'Facilitadores', icono: UserSquare },
      { a: '/supervision/grupos', etiqueta: 'Grupos', icono: CalendarDays },
      { a: '/supervision/reportes', etiqueta: 'Reportes', icono: BarChart3 },
      { a: '/supervision/mensajes', etiqueta: 'Mensajes', icono: MailOpen },
    ],
  },
};

export const IconoNotificaciones = Bell;
