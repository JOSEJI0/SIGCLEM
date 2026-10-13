package mx.edu.itch.sigclem.grupos.dto;

import mx.edu.itch.sigclem.grupos.domain.Inscripcion;

public record AlumnoActaDTO(String numeroControl, String nombreCompleto, Integer calificacionFinal) {

    public static AlumnoActaDTO desde(Inscripcion inscripcion) {
        return new AlumnoActaDTO(inscripcion.getAlumno().getNumeroControl(),
                inscripcion.getAlumno().nombreCompleto(), inscripcion.getCalificacionFinal());
    }
}
