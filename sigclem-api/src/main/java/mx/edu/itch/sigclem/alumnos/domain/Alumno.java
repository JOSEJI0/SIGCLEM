package mx.edu.itch.sigclem.alumnos.domain;

import java.time.LocalDate;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import mx.edu.itch.sigclem.catalogos.domain.Carrera;
import mx.edu.itch.sigclem.seguridad.domain.Usuario;

/** Datos generales del expediente digital (ART-01). */
@Entity
@Table(name = "alumno")
@Getter
@Setter
@NoArgsConstructor
public class Alumno {

    @Id
    @Column(name = "numero_control", length = 10)
    private String numeroControl;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_usuario", unique = true)
    private Usuario usuario;

    @Column(nullable = false, length = 60)
    private String nombre;

    @Column(name = "apellido_paterno", nullable = false, length = 40)
    private String apellidoPaterno;

    @Column(name = "apellido_materno", length = 40)
    private String apellidoMaterno;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_carrera")
    private Carrera carrera;

    @Column(nullable = false)
    private Integer semestre;

    @Column(length = 80)
    private String correo;

    @Column(name = "fecha_inscripcion", nullable = false)
    private LocalDate fechaInscripcion;

    public String nombreCompleto() {
        return String.join(" ", nombre, apellidoPaterno, apellidoMaterno == null ? "" : apellidoMaterno).trim();
    }
}
