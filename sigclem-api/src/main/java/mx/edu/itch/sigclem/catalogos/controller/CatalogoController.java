package mx.edu.itch.sigclem.catalogos.controller;

import java.util.List;

import org.springframework.data.domain.Sort;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;
import mx.edu.itch.sigclem.catalogos.dto.CarreraDTO;
import mx.edu.itch.sigclem.catalogos.dto.NivelDTO;
import mx.edu.itch.sigclem.catalogos.repository.CarreraRepository;
import mx.edu.itch.sigclem.catalogos.repository.NivelRepository;

/** Catálogos de solo lectura (Tabla 66: GET /catalogos/{tipo}). */
@RestController
@RequestMapping("/api/v1/catalogos")
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CatalogoController {

    private final CarreraRepository carreraRepository;
    private final NivelRepository nivelRepository;

    @GetMapping("/carreras")
    public List<CarreraDTO> carreras() {
        return carreraRepository.findAll(Sort.by("nombre")).stream().map(CarreraDTO::desde).toList();
    }

    @GetMapping("/niveles")
    public List<NivelDTO> niveles() {
        return nivelRepository.findAllByOrderByNumeroAsc().stream().map(NivelDTO::desde).toList();
    }
}
