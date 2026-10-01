import { Layers } from 'lucide-react';
import { Tarjeta } from '../../components/ui';

export default function PanelFacilitador() {
  return (
    <Tarjeta titulo="Mis grupos del periodo" icono={Layers}>
      <p className="text-tenue">Aquí se listarán tus grupos asignados por nivel y horario (CU-09) y el acceso a sus actas (CU-10).</p>
    </Tarjeta>
  );
}
