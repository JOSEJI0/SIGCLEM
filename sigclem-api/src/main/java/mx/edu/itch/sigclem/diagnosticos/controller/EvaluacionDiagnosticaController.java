package mx.edu.itch.sigclem.diagnosticos.controller;

import java.net.URI;
import java.security.Principal;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import mx.edu.itch.sigclem.diagnosticos.dto.EvaluacionDiagnosticaDTO;
import mx.edu.itch.sigclem.diagnosticos.dto.ProgramarDiagnosticoRequest;
import mx.edu.itch.sigclem.diagnosticos.dto.ResultadoDiagnosticoRequest;
import mx.edu.itch.sigclem.diagnosticos.service.EvaluacionDiagnosticaService;

@RestController
@RequestMapping("/api/v1/diagnosticos")
@RequiredArgsConstructor
public class EvaluacionDiagnosticaController {

    private final EvaluacionDiagnosticaService service;

    @PostMapping
    @PreAuthorize("hasRole('ALUMNO')")
    public ResponseEntity<EvaluacionDiagnosticaDTO> solicitar(Principal principal) {
        EvaluacionDiagnosticaDTO diagnostico = service.solicitar(principal.getName());
        return ResponseEntity.created(URI.create("/api/v1/diagnosticos/" + diagnostico.id())).body(diagnostico);
    }

    @GetMapping("/mias")
    @PreAuthorize("hasRole('ALUMNO')")
    public List<EvaluacionDiagnosticaDTO> listarPropias(Principal principal) {
        return service.listarPropias(principal.getName());
    }

    @GetMapping
    @PreAuthorize("hasRole('COORDINADOR')")
    public List<EvaluacionDiagnosticaDTO> listarTodas() {
        return service.listarTodas();
    }

    @PutMapping("/{id}/programacion")
    @PreAuthorize("hasRole('COORDINADOR')")
    public EvaluacionDiagnosticaDTO programar(
            @PathVariable Integer id,
            @Valid @RequestBody ProgramarDiagnosticoRequest solicitud,
            Principal principal) {
        return service.programar(id, solicitud, principal.getName());
    }

    @PutMapping("/{id}/resultado")
    @PreAuthorize("hasRole('COORDINADOR')")
    public EvaluacionDiagnosticaDTO registrarResultado(
            @PathVariable Integer id,
            @Valid @RequestBody ResultadoDiagnosticoRequest solicitud) {
        return service.registrarResultado(id, solicitud);
    }
}
