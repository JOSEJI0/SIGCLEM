package mx.edu.itch.sigclem.examenes.controller;

import java.net.URI;
import java.security.Principal;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
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
import mx.edu.itch.sigclem.examenes.domain.CriterioEvaluacion;
import mx.edu.itch.sigclem.examenes.dto.CapturaResultadoRequest;
import mx.edu.itch.sigclem.examenes.dto.ExamenDTO;
import mx.edu.itch.sigclem.examenes.dto.ProgramacionExamenRequest;
import mx.edu.itch.sigclem.examenes.dto.SolicitudExamenRequest;
import mx.edu.itch.sigclem.examenes.service.ExamenService;

@RestController
@RequestMapping("/api/v1/examenes")
@RequiredArgsConstructor
public class ExamenController {

    private final ExamenService examenService;

    /** CU-04: Solicitar examen de colocación o de cuatro habilidades (Tabla 81). */
    @PostMapping
    @PreAuthorize("hasRole('ALUMNO')")
    public ResponseEntity<ExamenDTO> solicitar(
            @Valid @RequestBody SolicitudExamenRequest req,
            Principal principal) {
        ExamenDTO dto = examenService.solicitar(req, principal.getName());
        return ResponseEntity.created(URI.create("/api/v1/examenes/" + dto.id())).body(dto);
    }

    /** CU-05: Programar fecha y horario del examen (Tabla 81). */
    @PutMapping("/{id}/programacion")
    @PreAuthorize("hasRole('COORDINADOR')")
    public ExamenDTO programar(
            @PathVariable Integer id,
            @Valid @RequestBody ProgramacionExamenRequest req) {
        return examenService.programar(id, req);
    }

    /** CU-06: Capturar puntajes y asignar nivel (Tabla 81). */
    @PutMapping("/{id}/resultado")
    @PreAuthorize("hasRole('COORDINADOR')")
    public ExamenDTO capturarResultado(
            @PathVariable Integer id,
            @Valid @RequestBody CapturaResultadoRequest req,
            Principal principal) {
        String evaluador = principal != null ? principal.getName() : null;
        return examenService.capturarResultado(id, req, evaluador);
    }

    /** Listado de exámenes con filtros opcionales. */
    @GetMapping
    @PreAuthorize("hasAnyRole('ALUMNO','COORDINADOR')")
    public List<ExamenDTO> listar(
            @RequestParam(required = false) String numeroControl,
            @RequestParam(required = false) String tipo,
            @RequestParam(required = false) Boolean pendientes,
            Authentication authentication) {
        boolean coordinador = authentication.getAuthorities().stream()
                .anyMatch(authority -> authority.getAuthority().equals("ROLE_COORDINADOR"));
        if (!coordinador && numeroControl != null && !numeroControl.isBlank()
                && !numeroControl.equals(authentication.getName())) {
            throw new AccessDeniedException("Solo puedes consultar tus propios exámenes.");
        }
        String numeroControlVisible = coordinador ? numeroControl : authentication.getName();
        return examenService.listar(numeroControlVisible, tipo, pendientes);
    }

    /** Detalle de un examen por ID. */
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ALUMNO','COORDINADOR')")
    public ExamenDTO obtenerPorId(@PathVariable Integer id, Authentication authentication) {
        ExamenDTO examen = examenService.obtenerPorId(id);
        boolean coordinador = authentication.getAuthorities().stream()
                .anyMatch(authority -> authority.getAuthority().equals("ROLE_COORDINADOR"));
        if (!coordinador && !examen.numeroControl().equals(authentication.getName())) {
            throw new AccessDeniedException("Solo puedes consultar tus propios exámenes.");
        }
        return examen;
    }

    /** Catálogo de criterios de evaluación de la rúbrica. */
    @GetMapping("/criterios")
    @PreAuthorize("hasRole('COORDINADOR')")
    public List<CriterioEvaluacion> listarCriterios() {
        return examenService.listarCriterios();
    }
}
