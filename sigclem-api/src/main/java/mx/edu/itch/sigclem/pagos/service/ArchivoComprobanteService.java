package mx.edu.itch.sigclem.pagos.service;

import java.io.IOException;
import java.io.InputStream;
import java.io.UncheckedIOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import mx.edu.itch.sigclem.comun.excepcion.DatosInvalidosException;
import mx.edu.itch.sigclem.comun.excepcion.RecursoNoEncontradoException;

@Service
public class ArchivoComprobanteService {

    private static final byte[] JPEG_HEADER = new byte[] { (byte) 0xff, (byte) 0xd8, (byte) 0xff };

    private final Path directorio;

    public ArchivoComprobanteService(@Value("${app.archivos.directorio:./archivos}") String directorio) {
        this.directorio = Path.of(directorio).toAbsolutePath().normalize();
    }

    public String guardar(MultipartFile archivo) {
        if (archivo.isEmpty() || archivo.getSize() > 5 * 1024 * 1024) {
            throw new DatosInvalidosException("PAG-001", "Adjunta una imagen JPG de hasta 5 MB.");
        }
        verificarFirmaJpeg(archivo);

        String nombre = UUID.randomUUID() + ".jpg";
        Path destino = directorio.resolve(nombre).normalize();
        if (!destino.getParent().equals(directorio)) {
            throw new IllegalStateException("La ruta del comprobante no es válida.");
        }
        try {
            Files.createDirectories(directorio);
            try (InputStream contenido = archivo.getInputStream()) {
                Files.copy(contenido, destino);
            }
            return nombre;
        } catch (IOException e) {
            throw new UncheckedIOException("No se pudo almacenar el comprobante de pago.", e);
        }
    }

    public Resource cargar(String nombre) {
        if (nombre == null || !nombre.matches("[0-9a-fA-F-]{36}\\.(?:jpg|pdf)")) {
            throw new RecursoNoEncontradoException("PAG-002", "No se encontró el archivo del comprobante.");
        }
        Path ruta = directorio.resolve(nombre).normalize();
        if (!ruta.getParent().equals(directorio) || !Files.isRegularFile(ruta)) {
            throw new RecursoNoEncontradoException("PAG-002", "No se encontró el archivo del comprobante.");
        }
        try {
            return new UrlResource(ruta.toUri());
        } catch (IOException e) {
            throw new UncheckedIOException("No se pudo abrir el comprobante.", e);
        }
    }

    private void verificarFirmaJpeg(MultipartFile archivo) {
        try (InputStream contenido = archivo.getInputStream()) {
            byte[] firma = contenido.readNBytes(JPEG_HEADER.length);
            if (!java.util.Arrays.equals(firma, JPEG_HEADER)) {
                throw new DatosInvalidosException("PAG-003", "El archivo adjunto debe ser una imagen JPG válida.");
            }
        } catch (IOException e) {
            throw new UncheckedIOException("No se pudo leer el archivo adjunto.", e);
        }
    }
}
