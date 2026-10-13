package mx.edu.itch.sigclem.examenes.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.access.AccessDeniedException;

import lombok.RequiredArgsConstructor;
import mx.edu.itch.sigclem.alumnos.domain.Alumno;
import mx.edu.itch.sigclem.alumnos.domain.AvanceNivel;
import mx.edu.itch.sigclem.alumnos.domain.EstatusAvance;
import mx.edu.itch.sigclem.alumnos.repository.AlumnoRepository;
import mx.edu.itch.sigclem.alumnos.repository.AvanceNivelRepository;
import mx.edu.itch.sigclem.catalogos.domain.Nivel;
import mx.edu.itch.sigclem.catalogos.repository.NivelRepository;
import mx.edu.itch.sigclem.comun.excepcion.ConflictoException;
import mx.edu.itch.sigclem.comun.excepcion.DatosInvalidosException;
import mx.edu.itch.sigclem.comun.excepcion.RecursoNoEncontradoException;
import mx.edu.itch.sigclem.comun.excepcion.ReglaNegocioException;
import mx.edu.itch.sigclem.examenes.domain.CriterioEvaluacion;
import mx.edu.itch.sigclem.examenes.domain.Examen;
import mx.edu.itch.sigclem.examenes.domain.ResultadoCriterio;
import mx.edu.itch.sigclem.examenes.dto.CapturaResultadoRequest;
import mx.edu.itch.sigclem.examenes.dto.ExamenDTO;
import mx.edu.itch.sigclem.examenes.dto.ProgramacionExamenRequest;
import mx.edu.itch.sigclem.examenes.dto.ResultadoCriterioDTO;
import mx.edu.itch.sigclem.examenes.dto.SolicitudExamenRequest;
import mx.edu.itch.sigclem.examenes.repository.CriterioEvaluacionRepository;
import mx.edu.itch.sigclem.examenes.repository.ExamenRepository;
import mx.edu.itch.sigclem.examenes.repository.ResultadoCriterioRepository;
import mx.edu.itch.sigclem.seguridad.domain.Usuario;
import mx.edu.itch.sigclem.seguridad.repository.UsuarioRepository;

@Service
@RequiredArgsConstructor
public class ExamenService {

    private final ExamenRepository examenRepository;
    private final ResultadoCriterioRepository resultadoCriterioRepository;
    private final CriterioEvaluacionRepository criterioRepository;
    private final AlumnoRepository alumnoRepository;
    private final AvanceNivelRepository avanceRepository;
    private final NivelRepository nivelRepository;
    private final UsuarioRepository usuarioRepository;

    /** CU-04: Solicitar examen de colocación o de cuatro habilidades. */
    @Transactional
    public ExamenDTO solicitar(SolicitudExamenRequest req, String usuarioActual) {
        if (usuarioActual == null || usuarioActual.isBlank()) {
            throw new AccessDeniedException("La solicitud requiere una sesión de alumno autenticada.");
        }
        String nc = usuarioActual.trim();
        if (req.numeroControl() != null && !req.numeroControl().isBlank()
                && !nc.equals(req.numeroControl().trim())) {
            throw new AccessDeniedException("Solo puedes solicitar exámenes para tu propio expediente.");
        }

        Alumno alumno = alumnoRepository.findConCarreraByNumeroControl(nc)
                .orElseThrow(() -> new RecursoNoEncontradoException("EXAM-001",
                        "No se encontró al alumno con número de control " + nc));

        if (examenRepository.existeExamenPendiente(nc, req.tipo())) {
            throw new ConflictoException("EXAM-002",
                    "Ya existe una solicitud pendiente de examen de " + req.tipo() + " para el alumno " + nc);
        }

        LocalDateTime fechaAplicacion = req.fechaHoraTentativa() != null
                ? req.fechaHoraTentativa()
                : LocalDateTime.now().plusDays(3).withHour(10).withMinute(0).withSecond(0).withNano(0);

        Examen examen = new Examen();
        examen.setAlumno(alumno);
        examen.setTipo(req.tipo());
        examen.setFechaHoraAplicacion(fechaAplicacion);

        Examen guardado = examenRepository.save(examen);
        return mapearDTO(guardado, List.of());
    }

    /** CU-05: Programar examen asignando fecha, horario y evaluador. */
    @Transactional
    public ExamenDTO programar(Integer idExamen, ProgramacionExamenRequest req) {
        Examen examen = examenRepository.findConDetallesById(idExamen)
                .orElseThrow(() -> new RecursoNoEncontradoException("EXAM-003",
                        "No se encontró el examen con identificador " + idExamen));

        if (examen.estaConcluido()) {
            throw new ConflictoException("EXAM-004", "El examen ya fue evaluado y no puede reprogramarse.");
        }

        examen.setFechaHoraAplicacion(req.fechaHoraAplicacion());

        if (req.idUsuarioEvaluador() != null) {
            Usuario evaluador = usuarioRepository.findById(req.idUsuarioEvaluador())
                    .orElseThrow(() -> new DatosInvalidosException("EXAM-005", "El usuario evaluador no existe."));
            examen.setEvaluador(evaluador);
        }

        Examen guardado = examenRepository.save(examen);
        List<ResultadoCriterio> resultados = resultadoCriterioRepository.findConCriterioByIdExamen(idExamen);
        return mapearDTO(guardado, resultados);
    }

    /** CU-06: Capturar resultado por criterios y asignar nivel aplicando RF-04 y RF-07. */
    @Transactional
    public ExamenDTO capturarResultado(Integer idExamen, CapturaResultadoRequest req, String usuarioEvaluador) {
        Examen examen = examenRepository.findConDetallesById(idExamen)
                .orElseThrow(() -> new RecursoNoEncontradoException("EXAM-006",
                        "No se encontró el examen con identificador " + idExamen));

        Nivel nivelAsignado = nivelRepository.findById(req.idNivelAsignado())
                .orElseThrow(() -> new DatosInvalidosException("EXAM-007", "El nivel asignado no existe."));

        // Validar límite secuencial de avance de niveles (RF-04, RF-07: máximo 3 niveles sobre el actual)
        String nc = examen.getAlumno().getNumeroControl();
        List<AvanceNivel> avancesActuales = avanceRepository.findByIdNumeroControl(nc);
        Map<Integer, AvanceNivel> avancePorIdNivel = avancesActuales.stream()
                .collect(Collectors.toMap(a -> a.getId().getIdNivel(), Function.identity()));

        List<Nivel> todosNiveles = nivelRepository.findAllByOrderByNumeroAsc();

        // Determinar nivel actual (el menor nivel no cubierto)
        int nivelActualNum = todosNiveles.stream()
                .filter(n -> {
                    AvanceNivel a = avancePorIdNivel.get(n.getId());
                    return a == null || !a.getEstatus().cubreNivel();
                })
                .map(Nivel::getNumero)
                .findFirst()
                .orElse(1);

        if (nivelAsignado.getNumero() > nivelActualNum + 3) {
            throw new ReglaNegocioException("EXAM-008",
                    "El resultado excede el avance máximo permitido de 3 niveles. Nivel actual: "
                            + nivelActualNum + ", máximo permitido: " + (nivelActualNum + 3));
        }

        // Guardar resultados por criterio
        Map<Integer, CriterioEvaluacion> criteriosMap = criterioRepository.findAll().stream()
                .collect(Collectors.toMap(CriterioEvaluacion::getId, Function.identity()));

        resultadoCriterioRepository.deleteByIdIdExamen(idExamen);

        int puntajeTotal = 0;
        List<ResultadoCriterio> resultadosAGuardar = new ArrayList<>();
        for (ResultadoCriterioDTO crDTO : req.criterios()) {
            CriterioEvaluacion criterio = criteriosMap.get(crDTO.idCriterio());
            if (criterio == null) {
                throw new DatosInvalidosException("EXAM-009",
                        "El criterio de evaluación con ID " + crDTO.idCriterio() + " no existe.");
            }
            if (crDTO.puntaje() < 0 || crDTO.puntaje() > 6) {
                throw new DatosInvalidosException("EXAM-010",
                        "El puntaje del criterio " + criterio.getNombre() + " debe estar entre 0 y 6.");
            }
            puntajeTotal += crDTO.puntaje();
            resultadosAGuardar.add(new ResultadoCriterio(examen, criterio, crDTO.puntaje(), crDTO.nota()));
        }
        resultadoCriterioRepository.saveAll(resultadosAGuardar);

        // Actualizar avance reticular del alumno:
        // Niveles anteriores al asignado: EXENTO
        // Nivel asignado: HABILITADO
        // Niveles posteriores: NO_PERMITIDO
        String origenExamen = "Colocación".equalsIgnoreCase(examen.getTipo())
                ? "Examen de colocación"
                : "Examen de cuatro habilidades";

        for (Nivel n : todosNiveles) {
            AvanceNivel an = avancePorIdNivel.get(n.getId());
            if (an == null) {
                an = new AvanceNivel(nc, n.getId(), EstatusAvance.NO_PERMITIDO);
                avancePorIdNivel.put(n.getId(), an);
            }

            if (n.getNumero() < nivelAsignado.getNumero()) {
                if (!an.getEstatus().cubreNivel()) {
                    an.setEstatus(EstatusAvance.EXENTO);
                    an.setOrigen(origenExamen);
                    an.setFechaRegistro(LocalDate.now());
                }
            } else if (n.getNumero().equals(nivelAsignado.getNumero())) {
                an.setEstatus(EstatusAvance.HABILITADO);
                an.setFechaRegistro(LocalDate.now());
            } else {
                if (!an.getEstatus().cubreNivel()) {
                    an.setEstatus(EstatusAvance.NO_PERMITIDO);
                    an.setFechaRegistro(LocalDate.now());
                }
            }
        }
        avanceRepository.saveAll(avancePorIdNivel.values());

        // Actualizar examen
        examen.setPuntajeTotal(puntajeTotal);
        examen.setObservaciones(req.observaciones());
        examen.setFirmaEvaluador(req.firmaEvaluador());
        examen.setNivelAsignado(nivelAsignado);

        if (examen.getEvaluador() == null && usuarioEvaluador != null) {
            usuarioRepository.findByNombreUsuario(usuarioEvaluador).ifPresent(examen::setEvaluador);
        }

        Examen guardado = examenRepository.save(examen);
        return mapearDTO(guardado, resultadosAGuardar);
    }

    @Transactional(readOnly = true)
    public List<ExamenDTO> listar(String numeroControl, String tipo, Boolean soloPendientes) {
        List<Examen> lista;
        if (numeroControl != null && !numeroControl.isBlank()) {
            lista = examenRepository.findByAlumnoNumeroControlOrderByFechaHoraAplicacionDesc(numeroControl.trim());
        } else if (Boolean.TRUE.equals(soloPendientes)) {
            lista = examenRepository.findByPuntajeTotalIsNullOrderByFechaHoraAplicacionAsc();
        } else {
            lista = examenRepository.findAllByOrderByFechaHoraAplicacionDesc();
        }

        if (tipo != null && !tipo.isBlank()) {
            lista = lista.stream().filter(e -> e.getTipo().equalsIgnoreCase(tipo.trim())).toList();
        }

        return lista.stream().map(e -> {
            List<ResultadoCriterio> r = resultadoCriterioRepository.findConCriterioByIdExamen(e.getId());
            return mapearDTO(e, r);
        }).toList();
    }

    @Transactional(readOnly = true)
    public ExamenDTO obtenerPorId(Integer idExamen) {
        Examen examen = examenRepository.findConDetallesById(idExamen)
                .orElseThrow(() -> new RecursoNoEncontradoException("EXAM-011",
                        "No se encontró el examen con ID " + idExamen));
        List<ResultadoCriterio> r = resultadoCriterioRepository.findConCriterioByIdExamen(idExamen);
        return mapearDTO(examen, r);
    }

    @Transactional(readOnly = true)
    public List<CriterioEvaluacion> listarCriterios() {
        return criterioRepository.findAllByOrderByIdAsc();
    }

    private ExamenDTO mapearDTO(Examen e, List<ResultadoCriterio> resultados) {
        List<ResultadoCriterioDTO> criterios = resultados.stream()
                .map(r -> new ResultadoCriterioDTO(
                        r.getCriterio().getId(),
                        r.getCriterio().getNombre(),
                        r.getPuntaje(),
                        r.getNota()))
                .toList();

        return new ExamenDTO(
                e.getId(),
                e.getAlumno().getNumeroControl(),
                e.getAlumno().nombreCompleto(),
                e.getAlumno().getCarrera().getNombre(),
                e.getTipo(),
                e.getFechaHoraAplicacion(),
                e.getPuntajeTotal(),
                e.getObservaciones(),
                e.getEvaluador() != null ? e.getEvaluador().getNombreUsuario() : null,
                e.getNivelAsignado() != null ? e.getNivelAsignado().getId() : null,
                e.getNivelAsignado() != null ? e.getNivelAsignado().getNombre() : null,
                e.estaConcluido(),
                criterios);
    }
}
