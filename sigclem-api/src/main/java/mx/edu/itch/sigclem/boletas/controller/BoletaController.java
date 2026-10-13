package mx.edu.itch.sigclem.boletas.controller;

import java.util.List;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;
import mx.edu.itch.sigclem.boletas.dto.BoletaDTO;
import mx.edu.itch.sigclem.boletas.service.BoletaService;

@RestController
@RequestMapping("/api/v1/boletas")
@RequiredArgsConstructor
public class BoletaController {

    private final BoletaService boletaService;

    @GetMapping("/mias")
    @PreAuthorize("hasRole('ALUMNO')")
    public List<BoletaDTO> misBoletas(Authentication authentication) {
        return boletaService.obtenerBoletas(authentication.getName());
    }
}
