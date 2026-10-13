package mx.edu.itch.sigclem.alumnos.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.LocalDate;
import java.util.List;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.security.crypto.password.PasswordEncoder;

import mx.edu.itch.sigclem.alumnos.domain.Alumno;
import mx.edu.itch.sigclem.alumnos.dto.AlumnoResumenDTO;
import mx.edu.itch.sigclem.alumnos.repository.AlumnoRepository;
import mx.edu.itch.sigclem.alumnos.repository.AvanceNivelRepository;
import mx.edu.itch.sigclem.catalogos.domain.Carrera;
import mx.edu.itch.sigclem.catalogos.repository.CarreraRepository;
import mx.edu.itch.sigclem.catalogos.repository.NivelRepository;
import mx.edu.itch.sigclem.seguridad.repository.RolRepository;
import mx.edu.itch.sigclem.seguridad.repository.UsuarioRepository;

@ExtendWith(MockitoExtension.class)
class AlumnoServiceTest {

    @Mock
    private AlumnoRepository alumnoRepository;
    @Mock
    private AvanceNivelRepository avanceRepository;
    @Mock
    private CarreraRepository carreraRepository;
    @Mock
    private NivelRepository nivelRepository;
    @Mock
    private UsuarioRepository usuarioRepository;
    @Mock
    private RolRepository rolRepository;
    @Mock
    private PasswordEncoder passwordEncoder;
    @InjectMocks
    private AlumnoService service;

    @Test
    void buscarRecortaElFiltroYDevuelveResumenDelAlumno() {
        Carrera carrera = org.mockito.Mockito.mock(Carrera.class);
        when(carrera.getNombre()).thenReturn("Sistemas");
        Alumno alumno = new Alumno();
        alumno.setNumeroControl("A12345678");
        alumno.setNombre("Ana");
        alumno.setApellidoPaterno("López");
        alumno.setApellidoMaterno("García");
        alumno.setCarrera(carrera);
        alumno.setSemestre(4);
        alumno.setCorreo("ana@example.edu.mx");
        alumno.setFechaInscripcion(LocalDate.of(2026, 1, 15));

        var pageable = PageRequest.of(0, 20, Sort.by("apellidoPaterno"));
        when(alumnoRepository.buscarCoincidencias("Ana López", pageable))
                .thenReturn(new PageImpl<>(List.of(alumno), pageable, 1));

        var resultado = service.buscar(" Ana López ", pageable);

        assertEquals(1, resultado.getTotalElements());
        assertEquals(new AlumnoResumenDTO(
                "A12345678", "Ana López García", "Sistemas", 4, "ana@example.edu.mx", LocalDate.of(2026, 1, 15)),
                resultado.getContent().getFirst());
        verify(alumnoRepository).buscarCoincidencias("Ana López", pageable);
    }

    @Test
    void buscarLimitaElTamanoMaximoSolicitado() {
        var solicitado = PageRequest.of(0, 500, Sort.by("apellidoPaterno"));
        var paginaLimitada = PageRequest.of(0, 100, Sort.by("apellidoPaterno"));
        when(alumnoRepository.buscarCoincidencias("", paginaLimitada))
                .thenReturn(new PageImpl<>(List.of(), paginaLimitada, 0));

        service.buscar(null, solicitado);

        verify(alumnoRepository).buscarCoincidencias("", paginaLimitada);
    }
}
