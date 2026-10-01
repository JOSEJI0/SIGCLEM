package mx.edu.itch.sigclem.config;

import java.util.Map;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

/** Endpoint público para verificar que la API está en ejecución. */
@RestController
public class SaludController {

    @GetMapping("/api/v1/salud")
    public Map<String, String> salud() {
        return Map.of("estado", "ok");
    }
}
