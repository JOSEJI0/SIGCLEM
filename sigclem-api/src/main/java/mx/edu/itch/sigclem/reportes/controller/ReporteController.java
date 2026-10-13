package mx.edu.itch.sigclem.reportes.controller;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;
import mx.edu.itch.sigclem.reportes.dto.ReporteAcademicoDTO;
import mx.edu.itch.sigclem.reportes.service.ReporteAcademicoService;

@RestController
@RequestMapping("/api/v1/reportes")
@RequiredArgsConstructor
public class ReporteController {

    private final ReporteAcademicoService reporteService;

    @GetMapping("/academico")
    @PreAuthorize("hasAnyRole('COORDINADOR','JEFA_DGTV')")
    public ReporteAcademicoDTO reporteAcademico(@RequestParam(required = false) Integer periodoId) {
        return reporteService.obtenerReporte(periodoId);
    }
}
