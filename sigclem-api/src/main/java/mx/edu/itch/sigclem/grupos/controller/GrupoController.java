package mx.edu.itch.sigclem.grupos.controller;

import java.net.URI;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import mx.edu.itch.sigclem.grupos.dto.ActaDTO;
import mx.edu.itch.sigclem.grupos.dto.CalificacionesRequest;
import mx.edu.itch.sigclem.grupos.dto.CrearGrupoRequest;
import mx.edu.itch.sigclem.grupos.dto.GrupoDTO;
import mx.edu.itch.sigclem.grupos.service.GrupoService;

@RestController
@RequestMapping("/api/v1/grupos")
@RequiredArgsConstructor
public class GrupoController {

    private final GrupoService grupoService;

    @PostMapping
    @PreAuthorize("hasRole('COORDINADOR')")
    public ResponseEntity<GrupoDTO> abrir(@Valid @RequestBody CrearGrupoRequest req) {
        GrupoDTO creado = grupoService.abrir(req);
        return ResponseEntity.created(URI.create("/api/v1/grupos/" + creado.id())).body(creado);
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('FACILITADOR','COORDINADOR','JEFA_DGTV')")
    public List<GrupoDTO> listar(
            @RequestParam(required = false) Integer periodoId,
            Authentication authentication) {
        return grupoService.listar(periodoId, authentication);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('FACILITADOR','COORDINADOR','JEFA_DGTV')")
    public ActaDTO obtenerActa(@PathVariable Integer id, Authentication authentication) {
        return grupoService.obtenerActa(id, authentication);
    }

    @PutMapping("/{id}/acta")
    @PreAuthorize("hasRole('FACILITADOR')")
    public ActaDTO guardarCalificaciones(
            @PathVariable Integer id,
            @Valid @RequestBody CalificacionesRequest req,
            Authentication authentication) {
        return grupoService.guardarCalificaciones(id, req, authentication);
    }

    @PostMapping("/{id}/acta/cierre")
    @PreAuthorize("hasRole('FACILITADOR')")
    public ActaDTO cerrarActa(@PathVariable Integer id, Authentication authentication) {
        return grupoService.cerrarActa(id, authentication);
    }
}
