package mx.edu.itch.sigclem.pagos.dto;

import mx.edu.itch.sigclem.pagos.domain.ConceptoPago;

public record ConceptoDTO(Integer id, String nombre, boolean requiereNivel, boolean activo) {

    public static ConceptoDTO desde(ConceptoPago concepto) {
        return new ConceptoDTO(concepto.getId(), concepto.getNombre(),
                concepto.isRequiereNivel(), concepto.isActivo());
    }
}
