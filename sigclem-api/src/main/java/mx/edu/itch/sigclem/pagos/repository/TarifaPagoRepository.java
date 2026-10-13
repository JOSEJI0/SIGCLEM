package mx.edu.itch.sigclem.pagos.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.EntityGraph;

import mx.edu.itch.sigclem.pagos.domain.TarifaPago;

public interface TarifaPagoRepository extends JpaRepository<TarifaPago, Integer> {

    @EntityGraph(attributePaths = "nivel")
    List<TarifaPago> findByActivaTrueOrderByConceptoAscIdAsc();

    @EntityGraph(attributePaths = "nivel")
    List<TarifaPago> findAllByOrderByConceptoAscIdAsc();

    @EntityGraph(attributePaths = "nivel")
    Optional<TarifaPago> findByIdAndActivaTrue(Integer id);

    List<TarifaPago> findAllByConceptoPagoIdAndActivaTrue(Integer idConcepto);

    boolean existsByConceptoAndNivelIdAndActivaTrue(String concepto, Integer nivelId);

    boolean existsByConceptoAndNivelIsNullAndActivaTrue(String concepto);
}
