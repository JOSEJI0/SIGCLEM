package mx.edu.itch.sigclem.alumnos.dto;

import java.time.LocalDate;

/** Datos mínimos para la búsqueda administrativa de alumnos (CU-16, CU-21). */
public record AlumnoResumenDTO(
        String numeroControl,
        String nombreCompleto,
        String carrera,
        Integer semestre,
        String correo,
        LocalDate fechaInscripcion) {
}
