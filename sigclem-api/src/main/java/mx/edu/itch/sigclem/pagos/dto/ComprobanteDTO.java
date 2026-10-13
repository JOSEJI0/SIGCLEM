package mx.edu.itch.sigclem.pagos.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import mx.edu.itch.sigclem.pagos.domain.ComprobantePago;

public record ComprobanteDTO(
        Integer id,
        Integer idAutorizacion,
        String numeroControl,
        String alumno,
        String concepto,
        Integer idNivel,
        String nivel,
        Integer idPeriodo,
        String periodo,
        BigDecimal montoEsperado,
        BigDecimal saldoPendiente,
        String uuidCfdi,
        String rfcEmisor,
        BigDecimal total,
        String contenidoQr,
        String estatus,
        String motivoRechazo,
        LocalDateTime fechaCarga) {

    public static ComprobanteDTO desde(ComprobantePago comprobante) {
        var autorizacion = comprobante.getAutorizacion();
        var alumno = autorizacion.getAlumno();
        return new ComprobanteDTO(comprobante.getId(), autorizacion.getId(), alumno.getNumeroControl(),
                alumno.nombreCompleto(), autorizacion.getConcepto(),
                autorizacion.getNivel() == null ? null : autorizacion.getNivel().getId(),
                autorizacion.getNivel() == null ? null : autorizacion.getNivel().getNombre(),
                autorizacion.getPeriodo().getId(), autorizacion.getPeriodo().getNombre(),
                autorizacion.getMontoEsperado(), autorizacion.getSaldoPendiente(),
                comprobante.getUuidCfdi(), comprobante.getRfcEmisor(),
                comprobante.getTotal(), comprobante.getContenidoQr(), comprobante.getEstatus(),
                comprobante.getMotivoRechazo(), comprobante.getFechaCarga());
    }
}
