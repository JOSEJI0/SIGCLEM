package mx.edu.itch.sigclem.constancias.controller;

import java.net.URI;
import java.util.List;

import org.springframework.core.io.Resource;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import mx.edu.itch.sigclem.constancias.dto.AutorizarConstanciaRequest;
import mx.edu.itch.sigclem.constancias.dto.ConstanciaDTO;
import mx.edu.itch.sigclem.constancias.dto.ElegibilidadConstanciaDTO;
import mx.edu.itch.sigclem.constancias.dto.RechazarConstanciaRequest;
import mx.edu.itch.sigclem.constancias.service.ConstanciaService;

@RestController
@RequestMapping("/api/v1/constancias")
@RequiredArgsConstructor
public class ConstanciaController {

    private final ConstanciaService service;

    @GetMapping("/disponibilidad")
    @PreAuthorize("hasRole('ALUMNO')")
    public ElegibilidadConstanciaDTO consultarElegibilidad(Authentication authentication) {
        return service.consultarElegibilidad(authentication.getName());
    }

    @PostMapping
    @PreAuthorize("hasRole('ALUMNO')")
    public ResponseEntity<ConstanciaDTO> solicitar(Authentication authentication) {
        ConstanciaDTO constancia = service.solicitar(authentication.getName());
        return ResponseEntity.created(URI.create("/api/v1/constancias/" + constancia.id())).body(constancia);
    }

    @GetMapping("/mias")
    @PreAuthorize("hasRole('ALUMNO')")
    public List<ConstanciaDTO> listarPropias(Authentication authentication) {
        return service.listarPropias(authentication.getName());
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('COORDINADOR','JEFA_DGTV')")
    public List<ConstanciaDTO> listar(@RequestParam(required = false) String estatus) {
        return service.listar(estatus);
    }

    @PostMapping("/{id}/autorizacion")
    @PreAuthorize("hasRole('COORDINADOR')")
    public ConstanciaDTO autorizar(
            @PathVariable Integer id,
            @Valid @RequestBody AutorizarConstanciaRequest solicitud,
            Authentication authentication) {
        return service.autorizar(id, solicitud, authentication.getName());
    }

    @PostMapping("/{id}/rechazo")
    @PreAuthorize("hasRole('COORDINADOR')")
    public ConstanciaDTO rechazar(
            @PathVariable Integer id,
            @Valid @RequestBody RechazarConstanciaRequest solicitud,
            Authentication authentication) {
        return service.rechazar(id, solicitud, authentication.getName());
    }

    @GetMapping("/{id}/pdf")
    @PreAuthorize("hasAnyRole('ALUMNO','COORDINADOR','JEFA_DGTV')")
    public ResponseEntity<Resource> descargarPdf(@PathVariable Integer id, Authentication authentication) {
        boolean esAlumno = authentication.getAuthorities().stream()
                .anyMatch(authority -> authority.getAuthority().equals("ROLE_ALUMNO"));
        Resource pdf = service.descargarPdf(id, authentication.getName(), esAlumno);
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        ContentDisposition.attachment().filename("constancia-" + id + ".pdf").build().toString())
                .body(pdf);
    }
}
