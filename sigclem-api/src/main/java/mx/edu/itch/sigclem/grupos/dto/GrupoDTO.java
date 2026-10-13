package mx.edu.itch.sigclem.grupos.dto;

import java.time.LocalDate;
import java.util.List;

import mx.edu.itch.sigclem.grupos.domain.Grupo;

public record GrupoDTO(
        Integer id,
        String clave,
        Integer nivelNumero,
        String nivel,
        String periodo,
        Integer idPeriodo,
        LocalDate fechaInicioPeriodo,
        LocalDate fechaFinPeriodo,
        String modalidad,
        String aula,
        String facilitador,
        Integer cupo,
        long alumnosInscritos,
        String estatusActa,
        List<HorarioDTO> horarios) {

    public static GrupoDTO desde(Grupo grupo, long alumnosInscritos) {
        return new GrupoDTO(grupo.getId(), grupo.getClave(), grupo.getNivel().getNumero(),
                grupo.getNivel().getNombre(), grupo.getPeriodo().getNombre(), grupo.getPeriodo().getId(),
                grupo.getPeriodo().getFechaInicio(), grupo.getPeriodo().getFechaFin(),
                grupo.getModalidad().getNombre(), grupo.getAula().getNombre(), grupo.getFacilitador().nombreCompleto(),
                grupo.getCupo(), alumnosInscritos, grupo.getEstatusActa(),
                grupo.getHorarios().stream().map(HorarioDTO::desde).toList());
    }
}
