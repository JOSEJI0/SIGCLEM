package mx.edu.itch.sigclem.alumnos.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import mx.edu.itch.sigclem.alumnos.domain.Alumno;

public interface AlumnoRepository extends JpaRepository<Alumno, String> {

    Optional<Alumno> findByUsuarioId(Integer idUsuario);

    @EntityGraph(attributePaths = "carrera")
    Optional<Alumno> findConCarreraByNumeroControl(String numeroControl);
}
