package mx.edu.itch.sigclem.facilitadores.controller;

import java.net.URI;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
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
import mx.edu.itch.sigclem.facilitadores.dto.FacilitadorCreadoDTO;
import mx.edu.itch.sigclem.facilitadores.dto.FacilitadorDTO;
import mx.edu.itch.sigclem.facilitadores.dto.FacilitadorRequest;
import mx.edu.itch.sigclem.facilitadores.service.FacilitadorService;

@RestController
@RequestMapping("/api/v1/facilitadores")
@RequiredArgsConstructor
public class FacilitadorController {

    private final FacilitadorService facilitadorService;

    @PostMapping
    @PreAuthorize("hasRole('COORDINADOR')")
    public ResponseEntity<FacilitadorCreadoDTO> registrar(@Valid @RequestBody FacilitadorRequest req) {
        FacilitadorCreadoDTO creado = facilitadorService.registrar(req);
        return ResponseEntity.created(URI.create("/api/v1/facilitadores/" + creado.facilitador().id()))
                .body(creado);
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('COORDINADOR','JEFA_DGTV')")
    public List<FacilitadorDTO> listar() {
        return facilitadorService.listar();
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('COORDINADOR')")
    public FacilitadorDTO actualizar(@PathVariable Integer id, @Valid @RequestBody FacilitadorRequest req) {
        return facilitadorService.actualizar(id, req);
    }

    @PutMapping("/{id}/estado")
    @PreAuthorize("hasRole('COORDINADOR')")
    public FacilitadorDTO cambiarEstado(@PathVariable Integer id, @RequestParam boolean activo) {
        return facilitadorService.cambiarEstado(id, activo);
    }
}
