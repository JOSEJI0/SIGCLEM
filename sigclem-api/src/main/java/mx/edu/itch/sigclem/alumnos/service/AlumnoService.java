package mx.edu.itch.sigclem.alumnos.service;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;
import mx.edu.itch.sigclem.alumnos.domain.Alumno;
import mx.edu.itch.sigclem.alumnos.domain.AvanceNivel;
import mx.edu.itch.sigclem.alumnos.domain.EstatusAvance;
import mx.edu.itch.sigclem.alumnos.dto.AlumnoResumenDTO;
import mx.edu.itch.sigclem.alumnos.dto.AvanceDTO;
import mx.edu.itch.sigclem.alumnos.dto.ExpedienteDTO;
import mx.edu.itch.sigclem.alumnos.dto.RegistroAlumnoRequest;
import mx.edu.itch.sigclem.alumnos.repository.AlumnoRepository;
import mx.edu.itch.sigclem.alumnos.repository.AvanceNivelRepository;
import mx.edu.itch.sigclem.catalogos.domain.Carrera;
import mx.edu.itch.sigclem.catalogos.domain.Nivel;
import mx.edu.itch.sigclem.catalogos.repository.CarreraRepository;
import mx.edu.itch.sigclem.catalogos.repository.NivelRepository;
import mx.edu.itch.sigclem.comun.excepcion.ConflictoException;
import mx.edu.itch.sigclem.comun.excepcion.DatosInvalidosException;
import mx.edu.itch.sigclem.comun.excepcion.RecursoNoEncontradoException;
import mx.edu.itch.sigclem.seguridad.domain.Rol;
import mx.edu.itch.sigclem.seguridad.domain.RolSistema;
import mx.edu.itch.sigclem.seguridad.domain.Usuario;
import mx.edu.itch.sigclem.seguridad.repository.RolRepository;
import mx.edu.itch.sigclem.seguridad.repository.UsuarioRepository;

@Service
@RequiredArgsConstructor
public class AlumnoService {

    private static final int TAMANO_MAXIMO_PAGINA = 100;

    private final AlumnoRepository alumnoRepository;
    private final AvanceNivelRepository avanceRepository;
    private final CarreraRepository carreraRepository;
    private final NivelRepository nivelRepository;
    private final UsuarioRepository usuarioRepository;
    private final RolRepository rolRepository;
    private final PasswordEncoder passwordEncoder;

    /** CU-16/CU-21: consulta paginada y filtrable para coordinación y supervisión. */
    @Transactional(readOnly = true)
    public Page<AlumnoResumenDTO> buscar(String busqueda, Pageable pageable) {
        String criterio = busqueda == null ? "" : busqueda.trim();
        Pageable paginaSegura = pageable.getPageSize() > TAMANO_MAXIMO_PAGINA
                ? PageRequest.of(pageable.getPageNumber(), TAMANO_MAXIMO_PAGINA, pageable.getSort())
                : pageable;
        return alumnoRepository.buscarCoincidencias(criterio, paginaSegura)
                .map(alumno -> new AlumnoResumenDTO(
                        alumno.getNumeroControl(),
                        alumno.nombreCompleto(),
                        alumno.getCarrera().getNombre(),
                        alumno.getSemestre(),
                        alumno.getCorreo(),
                        alumno.getFechaInscripcion()));
    }

    /**
     * CU-02: crea la cuenta (siempre con rol Alumno), el expediente y el avance reticular inicial:
     * Básico 1 habilitado y los demás niveles no permitidos (RF-03, RF-04).
     */
    @Transactional
    public ExpedienteDTO registrar(RegistroAlumnoRequest req) {
        String nc = req.numeroControl().trim();
        if (alumnoRepository.existsById(nc) || usuarioRepository.existsByNombreUsuario(nc)) {
            throw new ConflictoException("ALUM-001", "El número de control " + nc + " ya está registrado.");
        }
        Carrera carrera = carreraRepository.findById(req.idCarrera())
                .orElseThrow(() -> new DatosInvalidosException("ALUM-002", "La carrera seleccionada no existe."));
        Rol rolAlumno = rolRepository.findByNombre(RolSistema.ALUMNO.nombreBd())
                .orElseThrow(() -> new IllegalStateException("Falta el rol Alumno en el catálogo"));

        Usuario usuario = usuarioRepository.save(
                new Usuario(nc, passwordEncoder.encode(req.contrasena()), rolAlumno));

        Alumno alumno = new Alumno();
        alumno.setNumeroControl(nc);
        alumno.setUsuario(usuario);
        alumno.setNombre(req.nombre().trim());
        alumno.setApellidoPaterno(req.apellidoPaterno().trim());
        alumno.setApellidoMaterno(req.apellidoMaterno() == null || req.apellidoMaterno().isBlank()
                ? null : req.apellidoMaterno().trim());
        alumno.setCarrera(carrera);
        alumno.setSemestre(req.semestre());
        alumno.setCorreo(req.correo());
        alumno.setFechaInscripcion(LocalDate.now());
        alumnoRepository.save(alumno);

        List<AvanceNivel> avance = nivelRepository.findAllByOrderByNumeroAsc().stream()
                .map(n -> new AvanceNivel(nc, n.getId(),
                        n.getNumero() == 1 ? EstatusAvance.HABILITADO : EstatusAvance.NO_PERMITIDO))
                .toList();
        avanceRepository.saveAll(avance);

        return armarExpediente(alumno, avance);
    }

    @Transactional(readOnly = true)
    public ExpedienteDTO expediente(String numeroControl) {
        Alumno alumno = alumnoRepository.findConCarreraByNumeroControl(numeroControl)
                .orElseThrow(() -> new RecursoNoEncontradoException("ALUM-003",
                        "No existe un alumno con número de control " + numeroControl + "."));
        return armarExpediente(alumno, avanceRepository.findByIdNumeroControl(numeroControl));
    }

    @Transactional(readOnly = true)
    public List<AvanceDTO> avance(String numeroControl) {
        if (!alumnoRepository.existsById(numeroControl)) {
            throw new RecursoNoEncontradoException("ALUM-003",
                    "No existe un alumno con número de control " + numeroControl + ".");
        }
        List<AvanceNivel> avance = avanceRepository.findByIdNumeroControl(numeroControl);
        Map<Integer, AvanceNivel> porNivel = avance.stream()
                .collect(Collectors.toMap(a -> a.getId().getIdNivel(), Function.identity()));
        List<Nivel> niveles = nivelRepository.findAllByOrderByNumeroAsc();

        return niveles.stream().map(n -> {
            AvanceNivel a = porNivel.get(n.getId());
            EstatusAvance e = a == null ? EstatusAvance.NO_PERMITIDO : a.getEstatus();
            return new AvanceDTO(n.getNumero(), n.getNombre(), n.getNivelMcer(), e.etiqueta(),
                    a == null ? null : a.getOrigen());
        }).toList();
    }

    private ExpedienteDTO armarExpediente(Alumno alumno, List<AvanceNivel> avance) {
        Map<Integer, AvanceNivel> porNivel = avance.stream()
                .collect(Collectors.toMap(a -> a.getId().getIdNivel(), Function.identity()));
        List<Nivel> niveles = nivelRepository.findAllByOrderByNumeroAsc();

        List<AvanceDTO> detalle = niveles.stream().map(n -> {
            AvanceNivel a = porNivel.get(n.getId());
            EstatusAvance e = a == null ? EstatusAvance.NO_PERMITIDO : a.getEstatus();
            return new AvanceDTO(n.getNumero(), n.getNombre(), n.getNivelMcer(), e.etiqueta(),
                    a == null ? null : a.getOrigen());
        }).toList();

        int cubiertos = (int) avance.stream().filter(a -> a.getEstatus().cubreNivel()).count();
        String nivelActual = niveles.stream()
                .filter(n -> {
                    AvanceNivel a = porNivel.get(n.getId());
                    return a == null || !a.getEstatus().cubreNivel();
                })
                .map(Nivel::getNombre)
                .findFirst()
                .orElse("Idioma acreditado");

        return new ExpedienteDTO(alumno.getNumeroControl(), alumno.nombreCompleto(), alumno.getCarrera().getNombre(),
                alumno.getSemestre(), alumno.getCorreo(), alumno.getFechaInscripcion(), nivelActual, cubiertos,
                detalle);
    }
}
