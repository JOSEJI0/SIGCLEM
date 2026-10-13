package mx.edu.itch.sigclem.examenes.dto;

import java.util.List;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/** Captura de puntajes y asignación de nivel (CU-06). */
public record CapturaResultadoRequest(
        @NotNull(message = "El nivel asignado es obligatorio")
        Integer idNivelAsignado,
        String observaciones,
        String firmaEvaluador,
        @NotNull @Size(min = 1, message = "Debe capturar los puntajes de los criterios evaluados")
        List<@Valid ResultadoCriterioDTO> criterios) {
}
