package mx.edu.itch.sigclem.alumnos.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/**
 * Datos del registro público de un alumno (CU-02). No existe campo de rol: el registro
 * siempre crea una cuenta con rol Alumno.
 */
public record RegistroAlumnoRequest(
        @NotBlank @Pattern(regexp = "[A-Z0-9]{1,10}", message = "Solo letras mayúsculas y dígitos, máximo 10")
        String numeroControl,
        @NotBlank @Size(max = 60) String nombre,
        @NotBlank @Size(max = 40) String apellidoPaterno,
        @Size(max = 40) String apellidoMaterno,
        @NotNull Integer idCarrera,
        @NotNull @Min(1) @Max(12) Integer semestre,
        @Email @Size(max = 80) String correo,
        @NotBlank @Size(min = 8, max = 72, message = "La contraseña debe tener entre 8 y 72 caracteres")
        String contrasena) {
}
