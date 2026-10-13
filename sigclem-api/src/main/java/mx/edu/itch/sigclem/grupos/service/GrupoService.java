package mx.edu.itch.sigclem.grupos.service;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;
import mx.edu.itch.sigclem.alumnos.domain.AvanceNivel;
import mx.edu.itch.sigclem.alumnos.domain.AvanceNivelId;
import mx.edu.itch.sigclem.alumnos.domain.EstatusAvance;
import mx.edu.itch.sigclem.alumnos.repository.AvanceNivelRepository;
import mx.edu.itch.sigclem.catalogos.domain.Aula;
import mx.edu.itch.sigclem.catalogos.domain.Modalidad;
import mx.edu.itch.sigclem.catalogos.domain.Nivel;
import mx.edu.itch.sigclem.catalogos.domain.Periodo;
import mx.edu.itch.sigclem.catalogos.repository.AulaRepository;
import mx.edu.itch.sigclem.catalogos.repository.ModalidadRepository;
import mx.edu.itch.sigclem.catalogos.repository.NivelRepository;
import mx.edu.itch.sigclem.catalogos.repository.PeriodoRepository;
import mx.edu.itch.sigclem.comun.excepcion.ConflictoException;
import mx.edu.itch.sigclem.comun.excepcion.DatosInvalidosException;
import mx.edu.itch.sigclem.comun.excepcion.RecursoNoEncontradoException;
import mx.edu.itch.sigclem.comun.excepcion.ReglaNegocioException;
import mx.edu.itch.sigclem.facilitadores.domain.Facilitador;
import mx.edu.itch.sigclem.facilitadores.repository.FacilitadorRepository;
import mx.edu.itch.sigclem.grupos.domain.Grupo;
import mx.edu.itch.sigclem.grupos.domain.Horario;
import mx.edu.itch.sigclem.grupos.domain.Inscripcion;
import mx.edu.itch.sigclem.grupos.dto.ActaDTO;
import mx.edu.itch.sigclem.grupos.dto.CalificacionesRequest;
import mx.edu.itch.sigclem.grupos.dto.CrearGrupoRequest;
import mx.edu.itch.sigclem.grupos.dto.GrupoDTO;
import mx.edu.itch.sigclem.grupos.dto.HorarioRequest;
import mx.edu.itch.sigclem.grupos.repository.GrupoRepository;
import mx.edu.itch.sigclem.grupos.repository.HorarioRepository;
import mx.edu.itch.sigclem.grupos.repository.InscripcionRepository;

@Service
@RequiredArgsConstructor
public class GrupoService {

    private static final LocalTime INICIO_INSTITUCIONAL = LocalTime.of(10, 0);
    private static final LocalTime FIN_INSTITUCIONAL = LocalTime.of(17, 0);

    private final GrupoRepository grupoRepository;
    private final HorarioRepository horarioRepository;
    private final InscripcionRepository inscripcionRepository;
    private final PeriodoRepository periodoRepository;
    private final NivelRepository nivelRepository;
    private final ModalidadRepository modalidadRepository;
    private final AulaRepository aulaRepository;
    private final FacilitadorRepository facilitadorRepository;
    private final AvanceNivelRepository avanceNivelRepository;

    @Transactional
    public GrupoDTO abrir(CrearGrupoRequest req) {
        Periodo periodo = periodoRepository.findById(req.idPeriodo())
                .orElseThrow(() -> new DatosInvalidosException("GRU-001", "El periodo seleccionado no existe."));
        if (periodo.getFechaFin().isBefore(LocalDate.now())) {
            throw new ReglaNegocioException("GRU-002", "No se pueden abrir grupos en un periodo concluido.");
        }
        Nivel nivel = nivelRepository.findById(req.idNivel())
                .orElseThrow(() -> new DatosInvalidosException("GRU-003", "El nivel seleccionado no existe."));
        Modalidad modalidad = modalidadRepository.findById(req.idModalidad())
                .orElseThrow(() -> new DatosInvalidosException("GRU-004", "La modalidad seleccionada no existe."));
        Facilitador facilitador = facilitadorRepository.findById(req.idFacilitador())
                .orElseThrow(() -> new DatosInvalidosException("GRU-005", "El facilitador seleccionado no existe."));
        if (!facilitador.getUsuario().isActivo()) {
            throw new ReglaNegocioException("GRU-006", "No se pueden asignar grupos a un facilitador inactivo.");
        }
        Aula aula = aulaRepository.findById(req.idAula())
                .orElseThrow(() -> new DatosInvalidosException("GRU-007", "El aula seleccionada no existe."));
        String clave = req.clave().trim().toUpperCase();
        if (grupoRepository.existsByPeriodoIdAndNivelIdAndModalidadIdAndClave(
                periodo.getId(), nivel.getId(), modalidad.getId(), clave)) {
            throw new ConflictoException("GRU-008", "Ya existe esa clave de grupo para el nivel, modalidad y periodo.");
        }

        validarHorarios(req.horarios(), facilitador, aula, periodo.getId());
        Grupo grupo = new Grupo();
        grupo.setClave(clave);
        grupo.setNivel(nivel);
        grupo.setPeriodo(periodo);
        grupo.setModalidad(modalidad);
        grupo.setFacilitador(facilitador);
        grupo.setAula(aula);
        grupo.setCupo(req.cupo());
        req.horarios().forEach(h -> {
            Horario horario = new Horario();
            horario.setDiaSemana(h.diaSemana());
            horario.setHoraInicio(h.horaInicio());
            horario.setHoraFin(h.horaFin());
            grupo.agregarHorario(horario);
        });
        Grupo creado = grupoRepository.save(grupo);
        return GrupoDTO.desde(creado, 0);
    }

    @Transactional(readOnly = true)
    public List<GrupoDTO> listar(Integer periodoId, Authentication auth) {
        Integer idPeriodo = periodoId == null
                ? periodoRepository.findFirstByFechaInicioLessThanEqualAndFechaFinGreaterThanEqualOrderByFechaInicioDesc(
                        LocalDate.now(), LocalDate.now()).map(Periodo::getId).orElse(null)
                : periodoId;
        if (idPeriodo == null) {
            return List.of();
        }
        List<Grupo> grupos;
        if (esFacilitador(auth)) {
            Facilitador facilitador = buscarFacilitador(auth.getName());
            grupos = grupoRepository.findByPeriodoIdAndFacilitadorId(idPeriodo, facilitador.getId());
        } else {
            grupos = grupoRepository.findByPeriodoId(idPeriodo);
        }
        return grupos.stream()
                .sorted(Comparator.comparing((Grupo g) -> g.getNivel().getNumero()).thenComparing(Grupo::getClave))
                .map(g -> GrupoDTO.desde(g, inscripcionRepository.countByGrupoId(g.getId())))
                .toList();
    }

    @Transactional(readOnly = true)
    public ActaDTO obtenerActa(Integer id, Authentication auth) {
        Grupo grupo = buscarGrupo(id);
        verificarPropietario(grupo, auth);
        return ActaDTO.desde(grupo, inscripcionRepository.findByGrupoId(grupo.getId()));
    }

    @Transactional
    public ActaDTO guardarCalificaciones(Integer id, CalificacionesRequest req, Authentication auth) {
        Grupo grupo = buscarGrupo(id);
        verificarPropietario(grupo, auth);
        verificarPeriodoEditable(grupo);
        verificarActaAbierta(grupo);
        List<Inscripcion> inscripciones = inscripcionRepository.findByGrupoId(grupo.getId());
        Map<String, Inscripcion> porAlumno = new HashMap<>();
        inscripciones.forEach(i -> porAlumno.put(i.getAlumno().getNumeroControl(), i));
        if (req.calificaciones().size() != porAlumno.size()) {
            throw new DatosInvalidosException("ACT-001", "Debes enviar la calificación de cada alumno inscrito.");
        }
        for (var calificacion : req.calificaciones()) {
            Inscripcion inscripcion = porAlumno.remove(calificacion.numeroControl());
            if (inscripcion == null) {
                throw new DatosInvalidosException("ACT-002",
                        "La matrícula " + calificacion.numeroControl() + " no pertenece a este grupo.");
            }
            inscripcion.setCalificacionFinal(calificacion.calificacion());
        }
        if (!porAlumno.isEmpty()) {
            throw new DatosInvalidosException("ACT-001", "Debes enviar la calificación de cada alumno inscrito.");
        }
        inscripcionRepository.saveAll(inscripciones);
        grupo.setEstatusActa("En captura");
        grupoRepository.save(grupo);
        return ActaDTO.desde(grupo, inscripciones);
    }

    @Transactional
    public ActaDTO cerrarActa(Integer id, Authentication auth) {
        Grupo grupo = buscarGrupo(id);
        verificarPropietario(grupo, auth);
        verificarPeriodoEditable(grupo);
        verificarActaAbierta(grupo);
        List<Inscripcion> inscripciones = inscripcionRepository.findByGrupoId(grupo.getId());
        if (inscripciones.isEmpty()) {
            throw new ReglaNegocioException("ACT-003", "No se puede cerrar un acta sin alumnos inscritos.");
        }
        if (inscripciones.stream().anyMatch(i -> i.getCalificacionFinal() == null)) {
            throw new ReglaNegocioException("ACT-004", "Captura todas las calificaciones antes de cerrar el acta.");
        }
        List<Nivel> niveles = nivelRepository.findAllByOrderByNumeroAsc();
        Map<Integer, Integer> siguienteNivelPorNivel = new HashMap<>();
        for (int index = 0; index + 1 < niveles.size(); index++) {
            siguienteNivelPorNivel.put(niveles.get(index).getId(), niveles.get(index + 1).getId());
        }
        for (Inscripcion inscripcion : inscripciones) {
            actualizarAvance(inscripcion, siguienteNivelPorNivel);
        }
        grupo.setEstatusActa("Cerrada");
        grupo.setFechaCierreActa(LocalDate.now());
        grupoRepository.save(grupo);
        return ActaDTO.desde(grupo, inscripciones);
    }

    private void validarHorarios(
            List<HorarioRequest> horarios, Facilitador facilitador, Aula aula, Integer periodoId) {
        List<HorarioRequest> revisados = new ArrayList<>();
        for (HorarioRequest horario : horarios) {
            LocalTime inicio = horario.horaInicio();
            LocalTime fin = horario.horaFin();
            if (!inicio.isBefore(fin) || inicio.isBefore(INICIO_INSTITUCIONAL) || fin.isAfter(FIN_INSTITUCIONAL)) {
                throw new DatosInvalidosException("GRU-009",
                        "Cada sesión debe iniciar y terminar entre las 10:00 y las 17:00 horas.");
            }
            boolean traslapeEnSolicitud = revisados.stream().anyMatch(otro ->
                    otro.diaSemana().equals(horario.diaSemana())
                            && inicio.isBefore(otro.horaFin()) && fin.isAfter(otro.horaInicio()));
            if (traslapeEnSolicitud) {
                throw new ReglaNegocioException("GRU-010", "Las sesiones del grupo se traslapan entre sí.");
            }
            var conflicto = horarioRepository.buscarTraslape(horario.diaSemana(), inicio, fin,
                    periodoId, facilitador.getId(), aula.getId());
            if (conflicto.isPresent()) {
                throw new ReglaNegocioException("GRU-011",
                        "El horario se traslapa con el grupo " + conflicto.get().getGrupo().getClave()
                                + " del facilitador o del aula seleccionada.");
            }
            revisados.add(horario);
        }
    }

    private void actualizarAvance(Inscripcion inscripcion, Map<Integer, Integer> siguienteNivelPorNivel) {
        Integer idNivel = inscripcion.getGrupo().getNivel().getId();
        String numeroControl = inscripcion.getAlumno().getNumeroControl();
        AvanceNivel avance = avanceNivelRepository.findByIdNumeroControlAndIdIdNivel(numeroControl, idNivel)
                .orElseThrow(() -> new ReglaNegocioException("ACT-005",
                        "El expediente de " + numeroControl + " no tiene el nivel inscrito en su avance."));
        if (inscripcion.getCalificacionFinal() >= 70) {
            avance.setEstatus(EstatusAvance.ACREDITADO);
            avance.setOrigen("Curso");
            Integer siguienteId = siguienteNivelPorNivel.get(idNivel);
            if (siguienteId != null) {
                AvanceNivel siguiente = avanceNivelRepository.findById(new AvanceNivelId(numeroControl, siguienteId))
                        .orElse(null);
                if (siguiente != null && siguiente.getEstatus() == EstatusAvance.NO_PERMITIDO) {
                    siguiente.setEstatus(EstatusAvance.HABILITADO);
                }
            }
        } else {
            avance.setEstatus(EstatusAvance.REPROBADO);
            avance.setOrigen("Curso");
        }
    }

    private Grupo buscarGrupo(Integer id) {
        return grupoRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("GRU-012",
                        "No existe el grupo con identificador " + id + "."));
    }

    private void verificarActaAbierta(Grupo grupo) {
        if ("Cerrada".equals(grupo.getEstatusActa())) {
            throw new ReglaNegocioException("ACT-006", "El acta ya está cerrada y no puede modificarse.");
        }
    }

    private void verificarPeriodoEditable(Grupo grupo) {
        LocalDate hoy = LocalDate.now();
        Periodo periodo = grupo.getPeriodo();
        if (hoy.isBefore(periodo.getFechaInicio()) || hoy.isAfter(periodo.getFechaFin())) {
            throw new ReglaNegocioException("ACT-007",
                    "Los grupos de periodos anteriores o futuros solo pueden consultarse.");
        }
    }

    private void verificarPropietario(Grupo grupo, Authentication auth) {
        if (esFacilitador(auth)) {
            Facilitador facilitador = buscarFacilitador(auth.getName());
            if (!grupo.getFacilitador().getId().equals(facilitador.getId())) {
                throw new ReglaNegocioException("GRU-013", "Solo puedes consultar o modificar tus grupos asignados.");
            }
        }
    }

    private Facilitador buscarFacilitador(String correo) {
        return facilitadorRepository.findByCorreoIgnoreCase(correo)
                .orElseThrow(() -> new RecursoNoEncontradoException("FAC-002",
                        "No existe un perfil de facilitador para la cuenta autenticada."));
    }

    private boolean esFacilitador(Authentication auth) {
        return auth.getAuthorities().stream().anyMatch(a -> "ROLE_FACILITADOR".equals(a.getAuthority()));
    }
}
