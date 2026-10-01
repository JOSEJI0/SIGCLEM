package mx.edu.itch.sigclem.seguridad.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;
import mx.edu.itch.sigclem.alumnos.repository.AlumnoRepository;
import mx.edu.itch.sigclem.seguridad.domain.RolSistema;
import mx.edu.itch.sigclem.seguridad.dto.PerfilResponse;

/** Obtiene el nombre para mostrar según el rol del usuario autenticado. */
@Service
@RequiredArgsConstructor
public class PerfilService {

    private final AlumnoRepository alumnoRepository;

    @Transactional(readOnly = true)
    public PerfilResponse perfil(UsuarioAutenticado u) {
        String nombre = u.getUsername();
        if (u.rol() == RolSistema.ALUMNO) {
            nombre = alumnoRepository.findByUsuarioId(u.id())
                    .map(a -> a.getNombre() + " " + a.getApellidoPaterno())
                    .orElse(nombre);
        }
        // TODO (módulo docentes): nombre del facilitador desde la tabla FACILITADOR.
        return new PerfilResponse(u.id(), u.getUsername(), nombre, u.rol().name());
    }
}
