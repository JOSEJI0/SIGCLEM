package mx.edu.itch.sigclem.lenguasmaternas.controller;

import java.net.URI;
import java.util.List;

import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import mx.edu.itch.sigclem.lenguasmaternas.dto.EstatusLenguaRequest;
import mx.edu.itch.sigclem.lenguasmaternas.dto.LenguaMaternaDTO;
import mx.edu.itch.sigclem.lenguasmaternas.dto.LenguaMaternaRequest;
import mx.edu.itch.sigclem.lenguasmaternas.dto.RegistroLenguaDTO;
import mx.edu.itch.sigclem.lenguasmaternas.dto.RegistroLenguaRequest;
import mx.edu.itch.sigclem.lenguasmaternas.service.LenguaMaternaService;

@RestController
@RequestMapping("/api/v1/lenguas-maternas")
@RequiredArgsConstructor
public class LenguaMaternaController {

    private final LenguaMaternaService lenguaService;

    @GetMapping("/catalogo")
    @PreAuthorize("hasAnyRole('ALUMNO','COORDINADOR')")
    public List<LenguaMaternaDTO> listarLenguas() {
        return lenguaService.listarLenguas();
    }

    @PostMapping("/catalogo")
    @PreAuthorize("hasRole('COORDINADOR')")
    public ResponseEntity<LenguaMaternaDTO> crearLengua(@Valid @RequestBody LenguaMaternaRequest solicitud) {
        LenguaMaternaDTO creada = lenguaService.crearLengua(solicitud);
        return ResponseEntity.created(URI.create("/api/v1/lenguas-maternas/catalogo/" + creada.id())).body(creada);
    }

    @GetMapping("/registros/mios")
    @PreAuthorize("hasRole('ALUMNO')")
    public List<RegistroLenguaDTO> listarPropios(Authentication authentication) {
        return lenguaService.listarPropios(authentication.getName());
    }

    @PostMapping(value = "/registros", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('ALUMNO')")
    public ResponseEntity<RegistroLenguaDTO> registrar(
            @Valid @RequestPart("datos") RegistroLenguaRequest solicitud,
            @RequestPart("documento") MultipartFile documento,
            Authentication authentication) {
        LenguaMaternaService.ResultadoRegistro resultado =
                lenguaService.registrar(solicitud, documento, authentication.getName());
        URI ubicacion = URI.create("/api/v1/lenguas-maternas/registros/" + resultado.registro().id());
        return ResponseEntity.status(resultado.actualizado() ? 200 : 201).location(ubicacion)
                .body(resultado.registro());
    }

    @GetMapping("/registros")
    @PreAuthorize("hasRole('COORDINADOR')")
    public List<RegistroLenguaDTO> listarRegistros() {
        return lenguaService.listarRegistros();
    }

    @PatchMapping("/registros/{id}/estatus")
    @PreAuthorize("hasRole('COORDINADOR')")
    public RegistroLenguaDTO cambiarEstatus(
            @PathVariable Integer id,
            @Valid @RequestBody EstatusLenguaRequest solicitud,
            Authentication authentication) {
        return lenguaService.cambiarEstatus(id, solicitud, authentication.getName());
    }

    @GetMapping("/registros/{id}/documento")
    @PreAuthorize("hasAnyRole('ALUMNO','COORDINADOR')")
    public ResponseEntity<Resource> obtenerDocumento(@PathVariable Integer id, Authentication authentication) {
        boolean coordinacion = authentication.getAuthorities().stream()
                .anyMatch(authority -> authority.getAuthority().equals("ROLE_COORDINADOR"));
        LenguaMaternaService.DocumentoLengua documento = lenguaService.obtenerDocumento(
                id, authentication.getName(), coordinacion);
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(documento.tipoContenido()))
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline")
                .header("X-Content-Type-Options", "nosniff")
                .body(documento.recurso());
    }
}
