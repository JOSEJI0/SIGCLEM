package mx.edu.itch.sigclem.examenes.dto;

import java.time.LocalDateTime;
import java.util.List;

public record ExamenDTO(
        Integer id,
        String numeroControl,
        String nombreAlumno,
        String carrera,
        String tipo,
        LocalDateTime fechaHoraAplicacion,
        Integer puntajeTotal,
        String observaciones,
        String evaluador,
        Integer idNivelAsignado,
        String nombreNivelAsignado,
        boolean concluido,
        List<ResultadoCriterioDTO> criterios) {
}
