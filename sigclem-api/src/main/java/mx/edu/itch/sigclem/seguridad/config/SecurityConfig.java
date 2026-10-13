package mx.edu.itch.sigclem.seguridad.config;

import java.util.Arrays;
import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import lombok.RequiredArgsConstructor;
import mx.edu.itch.sigclem.seguridad.service.CustomUserDetailsService;
import mx.edu.itch.sigclem.seguridad.service.JwtService;

/**
 * Configuración de seguridad (apartado 4.2.4 y Tabla 59).
 * Regla clave del cambio 01: la jefa del DGTV solo puede leer; cualquier método que no sea GET
 * (salvo marcar un mensaje como leído) exige un rol operativo.
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtService jwtService;
    private final CustomUserDetailsService userDetailsService;
    private final RespuestasSeguridad respuestas;

    @Value("${app.cors.origenes}")
    private String origenes;

    @Bean
    public SecurityFilterChain cadenaSeguridad(HttpSecurity http) throws Exception {
        http
            .cors(Customizer.withDefaults())
            .csrf(AbstractHttpConfigurer::disable)
            .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .exceptionHandling(e -> e.authenticationEntryPoint(respuestas).accessDeniedHandler(respuestas))
            .authorizeHttpRequests(auth -> auth
                // Público
                .requestMatchers(HttpMethod.POST, "/api/v1/auth/login", "/api/v1/alumnos/registro").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/v1/salud", "/api/v1/catalogos/**", "/api/v1/alumnos/**").permitAll()
                .requestMatchers("/api/v1/docs/**").permitAll()
                // Lectura: cualquier usuario autenticado (la propiedad se valida en cada controlador)
                .requestMatchers(HttpMethod.GET, "/api/v1/**").authenticated()
                // Única escritura permitida a la jefa del DGTV
                .requestMatchers(HttpMethod.PATCH, "/api/v1/notificaciones/*/leida").authenticated()
                // Escritura: solo roles operativos; la jefa del DGTV recibe 403
                .requestMatchers("/api/v1/**").hasAnyRole("ALUMNO", "FACILITADOR", "COORDINADOR")
                .anyRequest().denyAll())
            .addFilterBefore(new JwtAuthFilter(jwtService, userDetailsService), UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(10);
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        List<String> lista = Arrays.stream(origenes.split(",")).map(String::trim).filter(s -> !s.isEmpty()).toList();
        CorsConfiguration cfg = new CorsConfiguration();
        cfg.setAllowedOrigins(lista);
        cfg.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        cfg.setAllowedHeaders(List.of("Authorization", "Content-Type", "Accept"));
        cfg.setExposedHeaders(List.of("Location", "Content-Disposition"));
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/api/**", cfg);
        return source;
    }
}
