package mx.edu.itch.sigclem.grupos.dto;

import java.util.List;

import mx.edu.itch.sigclem.grupos.domain.Grupo;
import mx.edu.itch.sigclem.grupos.domain.Inscripcion;

public record ActaDTO(GrupoDTO grupo, List<AlumnoActaDTO> alumnos) {

    public static ActaDTO desde(Grupo grupo, List<Inscripcion> inscripciones) {
        return new ActaDTO(GrupoDTO.desde(grupo, inscripciones.size()),
                inscripciones.stream().map(AlumnoActaDTO::desde).toList());
    }
}
