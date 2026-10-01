package mx.edu.itch.sigclem.alumnos.controller;

import java.net.URI;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import mx.edu.itch.sigclem.alumnos.dto.ExpedienteDTO;
import mx.edu.itch.sigclem.alumnos.dto.RegistroAlumnoRequest;
import mx.edu.itch.sigclem.alumnos.service.AlumnoService;

@RestController
@RequestMapping("/api/v1/alumnos")
@RequiredArgsConstructor
public class AlumnoController {

    private final AlumnoService alumnoService;

    /** CU-02 Registrarse (público). */
    @PostMapping("/registro")
    public ResponseEntity<ExpedienteDTO> registrar(@Valid @RequestBody RegistroAlumnoRequest req) {
        ExpedienteDTO creado = alumnoService.registrar(req);
        return ResponseEntity.created(URI.create("/api/v1/alumnos/" + creado.numeroControl())).body(creado);
    }

    /**
     * CU-03 Consultar expediente. El alumno solo puede ver el suyo (su usuario es su número de control);
     * el coordinador y la jefa del DGTV pueden consultar cualquiera.
     */
    @GetMapping("/{numeroControl}")
    @PreAuthorize("hasAnyRole('COORDINADOR','JEFA_DGTV') or (hasRole('ALUMNO') and #numeroControl == authentication.name)")
    public ExpedienteDTO expediente(@PathVariable String numeroControl) {
        return alumnoService.expediente(numeroControl);
    }
}
