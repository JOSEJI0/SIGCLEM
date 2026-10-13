package mx.edu.itch.sigclem.examenes.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import mx.edu.itch.sigclem.examenes.domain.ResultadoCriterio;
import mx.edu.itch.sigclem.examenes.domain.ResultadoCriterioId;

public interface ResultadoCriterioRepository extends JpaRepository<ResultadoCriterio, ResultadoCriterioId> {

    @Query("SELECT r FROM ResultadoCriterio r JOIN FETCH r.criterio WHERE r.id.idExamen = :idExamen ORDER BY r.criterio.id ASC")
    List<ResultadoCriterio> findConCriterioByIdExamen(@Param("idExamen") Integer idExamen);

    void deleteByIdIdExamen(Integer idExamen);
}
