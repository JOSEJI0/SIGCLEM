package mx.edu.itch.sigclem.alumnos.controller;

import java.net.URI;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import java.util.List;
import mx.edu.itch.sigclem.alumnos.dto.AlumnoResumenDTO;
import mx.edu.itch.sigclem.alumnos.dto.AvanceDTO;
import mx.edu.itch.sigclem.alumnos.dto.ExpedienteDTO;
import mx.edu.itch.sigclem.alumnos.dto.RegistroAlumnoRequest;
import mx.edu.itch.sigclem.alumnos.service.AlumnoService;

@RestController
@RequestMapping("/api/v1/alumnos")
@RequiredArgsConstructor
public class AlumnoController {

    private final AlumnoService alumnoService;

    /** CU-16/CU-21: buscar alumnos por nombre, número de control, carrera o correo. */
    @GetMapping
    @PreAuthorize("hasAnyRole('COORDINADOR','JEFA_DGTV')")
    public Page<AlumnoResumenDTO> buscar(
            @RequestParam(required = false) String busqueda,
            @PageableDefault(size = 20, sort = "apellidoPaterno") Pageable pageable) {
        return alumnoService.buscar(busqueda, pageable);
    }

    /** CU-02 Registrarse (público). */
    @PostMapping("/registro")
    public ResponseEntity<ExpedienteDTO> registrar(@Valid @RequestBody RegistroAlumnoRequest req) {
        ExpedienteDTO creado = alumnoService.registrar(req);
        return ResponseEntity.created(URI.create("/api/v1/alumnos/" + creado.numeroControl())).body(creado);
    }

    /**
     * CU-03 Consultar expediente.
     * En producción: @PreAuthorize("hasAnyRole('COORDINADOR','JEFA_DGTV') or (hasRole('ALUMNO') and #numeroControl == authentication.name)")
     */
    @GetMapping("/{numeroControl}")
    @PreAuthorize("hasAnyRole('COORDINADOR','JEFA_DGTV') or (hasRole('ALUMNO') and #numeroControl == authentication.name)")
    public ExpedienteDTO expediente(@PathVariable String numeroControl) {
        return alumnoService.expediente(numeroControl);
    }

    /**
     * CU-03 Consultar avance reticular de los diez niveles (Tabla 81).
     */
    @GetMapping("/{numeroControl}/avance")
    @PreAuthorize("hasAnyRole('COORDINADOR','JEFA_DGTV') or (hasRole('ALUMNO') and #numeroControl == authentication.name)")
    public List<AvanceDTO> avance(@PathVariable String numeroControl) {
        return alumnoService.avance(numeroControl);
    }
}
