package mx.edu.itch.sigclem.constancias.service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.format.DateTimeFormatter;
import java.util.List;

import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.springframework.stereotype.Service;

import mx.edu.itch.sigclem.constancias.dto.ConstanciaDTO;

@Service
public class ConstanciaPdfService {

    private static final DateTimeFormatter FECHA = DateTimeFormatter.ofPattern("dd/MM/yyyy");

    public byte[] generar(ConstanciaDTO constancia) throws IOException {
        try (PDDocument documento = new PDDocument();
                ByteArrayOutputStream salida = new ByteArrayOutputStream()) {
            PDPage pagina = new PDPage(PDRectangle.LETTER);
            documento.addPage(pagina);
            try (PDPageContentStream contenido = new PDPageContentStream(documento, pagina)) {
                textoCentrado(contenido, "INSTITUTO TECNOLÓGICO DE CHILPANCINGO", PDType1Font.HELVETICA_BOLD, 15, 720);
                textoCentrado(contenido, "COORDINACIÓN DE LENGUAS", PDType1Font.HELVETICA_BOLD, 12, 698);
                textoCentrado(contenido, "CONSTANCIA DE ACREDITACIÓN", PDType1Font.HELVETICA_BOLD, 17, 646);
                textoCentrado(contenido, "Folio: " + constancia.folio(), PDType1Font.HELVETICA_BOLD, 11, 615);

                int y = 568;
                y = parrafo(contenido,
                        "La Coordinación de Lenguas hace constar que:",
                        PDType1Font.HELVETICA, 12, y);
                y -= 8;
                y = parrafoCentrado(contenido, constancia.nombreAlumno(),
                        PDType1Font.HELVETICA_BOLD, 16, y);
                y -= 6;
                y = parrafo(contenido,
                        "Número de control: " + constancia.numeroControl(),
                        PDType1Font.HELVETICA, 11, y);
                y = parrafo(contenido,
                        "Carrera: " + constancia.carrera(),
                        PDType1Font.HELVETICA, 11, y);
                y = parrafo(contenido,
                        "Clave del plan de estudios: " + constancia.clavePlan(),
                        PDType1Font.HELVETICA, 11, y);
                y -= 10;
                y = parrafo(contenido,
                        "Acreditó los " + constancia.nivelesAcreditados()
                                + " niveles del programa de " + constancia.idioma() + ".",
                        PDType1Font.HELVETICA, 12, y);
                y = parrafo(contenido,
                        "Total de horas cubiertas: " + constancia.totalHoras(),
                        PDType1Font.HELVETICA, 11, y);
                y = parrafo(contenido,
                        "Nivel del Marco Común Europeo de Referencia: " + constancia.nivelMcer(),
                        PDType1Font.HELVETICA, 11, y);
                y -= 10;
                parrafo(contenido,
                        "Fecha de expedición: " + constancia.fechaExpedicion().format(FECHA),
                        PDType1Font.HELVETICA, 11, y);

                textoCentrado(contenido, "Coordinación de Lenguas", PDType1Font.HELVETICA_BOLD, 11, 150);
                textoCentrado(contenido, "Instituto Tecnológico de Chilpancingo", PDType1Font.HELVETICA, 10, 133);
            }
            documento.save(salida);
            return salida.toByteArray();
        }
    }

    private int parrafo(
            PDPageContentStream contenido, String texto, PDType1Font fuente, float tamano, int y) throws IOException {
        for (String linea : ajustar(texto, fuente, tamano, 500)) {
            contenido.beginText();
            contenido.setFont(fuente, tamano);
            contenido.newLineAtOffset(56, y);
            contenido.showText(linea);
            contenido.endText();
            y -= Math.round(tamano * 1.6f);
        }
        return y;
    }

    private int parrafoCentrado(
            PDPageContentStream contenido, String texto, PDType1Font fuente, float tamano, int y) throws IOException {
        for (String linea : ajustar(texto, fuente, tamano, 500)) {
            textoCentrado(contenido, linea, fuente, tamano, y);
            y -= Math.round(tamano * 1.6f);
        }
        return y;
    }

    private void textoCentrado(
            PDPageContentStream contenido, String texto, PDType1Font fuente, float tamano, int y) throws IOException {
        float x = (PDRectangle.LETTER.getWidth() - fuente.getStringWidth(texto) / 1000 * tamano) / 2;
        contenido.beginText();
        contenido.setFont(fuente, tamano);
        contenido.newLineAtOffset(x, y);
        contenido.showText(texto);
        contenido.endText();
    }

    private List<String> ajustar(String texto, PDType1Font fuente, float tamano, float anchoMaximo) throws IOException {
        var lineas = new java.util.ArrayList<String>();
        StringBuilder linea = new StringBuilder();
        for (String palabra : texto.split("\\s+")) {
            String candidata = linea.isEmpty() ? palabra : linea + " " + palabra;
            if (!linea.isEmpty() && fuente.getStringWidth(candidata) / 1000 * tamano > anchoMaximo) {
                lineas.add(linea.toString());
                linea.setLength(0);
            }
            if (!linea.isEmpty()) linea.append(' ');
            linea.append(palabra);
        }
        if (!linea.isEmpty()) lineas.add(linea.toString());
        return lineas;
    }
}
