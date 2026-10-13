package mx.edu.itch.sigclem.constancias.service;

import static org.assertj.core.api.Assertions.assertThat;

import java.io.ByteArrayInputStream;
import java.time.LocalDate;

import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.junit.jupiter.api.Test;

import mx.edu.itch.sigclem.constancias.dto.ConstanciaDTO;

class ConstanciaPdfServiceTest {

    @Test
    void generaPdfConFolioYDatosDeAcreditacion() throws Exception {
        ConstanciaDTO constancia = new ConstanciaDTO(
                1, "22520001", "Ana López Ruiz", "Ingeniería Civil", "IC-2020",
                "ITCH2026A001", LocalDate.of(2026, 10, 13), LocalDate.of(2026, 10, 13), "Inglés",
                10, 300, "B1", "Emitida", null);

        byte[] pdf = new ConstanciaPdfService().generar(constancia);
        String contenido;
        try (PDDocument documento = PDDocument.load(new ByteArrayInputStream(pdf))) {
            contenido = new PDFTextStripper().getText(documento);
        }

        assertThat(new String(pdf, 0, 5, java.nio.charset.StandardCharsets.US_ASCII)).isEqualTo("%PDF-");
        assertThat(contenido).contains(
                "INSTITUTO TECNOLÓGICO DE CHILPANCINGO",
                "ITCH2026A001", "13/10/2026", "Ana López Ruiz", "22520001",
                "Ingeniería Civil", "IC-2020", "Inglés", "10 niveles",
                "300", "B1");
    }
}
