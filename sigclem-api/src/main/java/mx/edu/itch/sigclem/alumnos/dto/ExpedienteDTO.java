package mx.edu.itch.sigclem.alumnos.dto;

import java.time.LocalDate;
import java.util.List;

/** Expediente digital con su avance reticular (CU-03). */
public record ExpedienteDTO(
        String numeroControl,
        String nombreCompleto,
        String carrera,
        Integer semestre,
        String correo,
        LocalDate fechaInscripcion,
        String nivelActual,
        int nivelesCubiertos,
        List<AvanceDTO> avance) {
}
