package mx.edu.itch.sigclem.notificaciones.controller;

import java.net.URI;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import mx.edu.itch.sigclem.notificaciones.dto.MensajeRequest;
import mx.edu.itch.sigclem.notificaciones.dto.NotificacionDTO;
import mx.edu.itch.sigclem.notificaciones.service.NotificacionService;

@RestController
@RequestMapping("/api/v1/notificaciones")
@RequiredArgsConstructor
public class NotificacionController {

    private final NotificacionService notificacionService;

    @GetMapping
    @PreAuthorize("hasAnyRole('COORDINADOR','JEFA_DGTV')")
    public List<NotificacionDTO> listar(Authentication authentication) {
        return notificacionService.listar(authentication.getName());
    }

    @GetMapping("/recibidas")
    @PreAuthorize("hasAnyRole('ALUMNO','COORDINADOR')")
    public List<NotificacionDTO> listarRecibidas(Authentication authentication) {
        return notificacionService.listarRecibidas(authentication.getName());
    }

    @PostMapping
    @PreAuthorize("hasRole('COORDINADOR')")
    public ResponseEntity<NotificacionDTO> enviar(
            @Valid @RequestBody MensajeRequest solicitud,
            Authentication authentication) {
        NotificacionDTO creada = notificacionService.enviar(solicitud, authentication.getName());
        return ResponseEntity.created(URI.create("/api/v1/notificaciones/" + creada.id())).body(creada);
    }

    @PatchMapping("/{id}/leida")
    @PreAuthorize("hasRole('JEFA_DGTV')")
    public NotificacionDTO marcarLeida(@PathVariable Integer id, Authentication authentication) {
        return notificacionService.marcarLeida(id, authentication.getName());
    }
}
