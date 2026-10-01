package mx.edu.itch.sigclem.seguridad.controller;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import mx.edu.itch.sigclem.seguridad.dto.AuthResponse;
import mx.edu.itch.sigclem.seguridad.dto.LoginRequest;
import mx.edu.itch.sigclem.seguridad.dto.PerfilResponse;
import mx.edu.itch.sigclem.seguridad.service.IntentosLoginService;
import mx.edu.itch.sigclem.seguridad.service.JwtService;
import mx.edu.itch.sigclem.seguridad.service.PerfilService;
import mx.edu.itch.sigclem.seguridad.service.UsuarioAutenticado;

/** CU-01 Iniciar sesión. */
@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final PerfilService perfilService;
    private final IntentosLoginService intentos;

    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest req) {
        String usuario = req.usuario().trim();
        intentos.verificarNoBloqueado(usuario);
        Authentication auth;
        try {
            auth = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(usuario, req.contrasena()));
        } catch (BadCredentialsException ex) {
            intentos.registrarFallo(usuario);
            throw ex;
        }
        intentos.registrarExito(usuario);
        UsuarioAutenticado u = (UsuarioAutenticado) auth.getPrincipal();
        return new AuthResponse(jwtService.generarToken(u), "Bearer", jwtService.getExpiracionSegundos(),
                perfilService.perfil(u));
    }

    @GetMapping("/perfil")
    public PerfilResponse perfil(@AuthenticationPrincipal UsuarioAutenticado usuario) {
        return perfilService.perfil(usuario);
    }
}
