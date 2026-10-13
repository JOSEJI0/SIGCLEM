package mx.edu.itch.sigclem.pagos.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record ConceptoRequest(
        @NotBlank @Size(max = 30) String nombre,
        @NotNull Boolean requiereNivel) {
}
