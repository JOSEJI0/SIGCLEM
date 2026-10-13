package mx.edu.itch.sigclem.examenes.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import mx.edu.itch.sigclem.examenes.domain.Examen;

public interface ExamenRepository extends JpaRepository<Examen, Integer> {

    @EntityGraph(attributePaths = {"alumno", "alumno.carrera", "evaluador", "nivelAsignado"})
    Optional<Examen> findConDetallesById(Integer id);

    @EntityGraph(attributePaths = {"alumno", "alumno.carrera", "evaluador", "nivelAsignado"})
    List<Examen> findByAlumnoNumeroControlOrderByFechaHoraAplicacionDesc(String numeroControl);

    @EntityGraph(attributePaths = {"alumno", "alumno.carrera", "evaluador", "nivelAsignado"})
    List<Examen> findAllByOrderByFechaHoraAplicacionDesc();

    @EntityGraph(attributePaths = {"alumno", "alumno.carrera", "evaluador", "nivelAsignado"})
    List<Examen> findByPuntajeTotalIsNullOrderByFechaHoraAplicacionAsc();

    @Query("SELECT COUNT(e) > 0 FROM Examen e WHERE e.alumno.numeroControl = :nc AND e.tipo = :tipo AND e.puntajeTotal IS NULL")
    boolean existeExamenPendiente(@Param("nc") String numeroControl, @Param("tipo") String tipo);
}
