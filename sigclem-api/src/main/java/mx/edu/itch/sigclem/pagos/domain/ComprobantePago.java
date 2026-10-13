package mx.edu.itch.sigclem.pagos.domain;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import mx.edu.itch.sigclem.seguridad.domain.Usuario;

@Entity
@Table(name = "comprobante_pago")
@Getter
@Setter
@NoArgsConstructor
public class ComprobantePago {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_comprobante")
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_autorizacion", nullable = false)
    private AutorizacionPago autorizacion;

    @Column(name = "uuid_cfdi", unique = true, length = 36)
    private String uuidCfdi;

    @Column(name = "rfc_emisor", length = 13)
    private String rfcEmisor;

    @Column(precision = 10, scale = 2)
    private BigDecimal total;

    @Column(name = "contenido_qr", length = 255)
    private String contenidoQr;

    @Column(nullable = false, length = 255)
    private String archivo;

    @Column(name = "fecha_carga", nullable = false, insertable = false, updatable = false)
    private LocalDateTime fechaCarga;

    @Column(nullable = false, length = 15)
    private String estatus = "Pendiente";

    @Column(name = "motivo_rechazo", length = 200)
    private String motivoRechazo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_usuario_valida")
    private Usuario usuarioValida;
}
