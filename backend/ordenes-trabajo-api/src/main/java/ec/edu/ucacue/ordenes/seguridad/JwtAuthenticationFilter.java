package ec.edu.ucacue.ordenes.seguridad;

import ec.edu.ucacue.ordenes.entidad.Usuario;
import ec.edu.ucacue.ordenes.repositorio.UsuarioRepository;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.List;
import java.util.Optional;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

/**
 * Se ejecuta una vez por peticion, antes del controlador. Lee "Authorization: Bearer <token>",
 * valida el JWT y registra al usuario como autenticado. Si el token falta o es invalido NO corta
 * la peticion: solo no autentica, y SecurityConfig decide si la ruta era publica o responde 401.
 */
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    /** Atributo donde se deja el motivo del fallo para que el EntryPoint lo muestre. */
    public static final String ATRIBUTO_ERROR = "jwt_error";

    private final JwtService jwtService;
    private final UsuarioRepository usuarioRepository;

    public JwtAuthenticationFilter(JwtService jwtService, UsuarioRepository usuarioRepository) {
        this.jwtService = jwtService;
        this.usuarioRepository = usuarioRepository;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
                                    FilterChain chain) throws ServletException, IOException {
        String cabecera = request.getHeader("Authorization");
        if (cabecera == null || !cabecera.startsWith("Bearer ")) {
            chain.doFilter(request, response);
            return;
        }

        try {
            Claims claims = jwtService.validar(cabecera.substring(7));

            // Se consulta la BD en cada peticion: si el admin desactiva la cuenta o cambia el rol,
            // el efecto es inmediato aunque el token todavia no haya expirado.
            Optional<Usuario> encontrado = usuarioRepository.findByUsername(claims.getSubject());
            if (encontrado.isEmpty()) {
                request.setAttribute(ATRIBUTO_ERROR, "El usuario del token ya no existe");
            } else if (!encontrado.get().getActivo()) {
                request.setAttribute(ATRIBUTO_ERROR, "La cuenta esta desactivada y ya no tiene acceso");
            } else {
                Usuario usuario = encontrado.get();
                var autoridades = List.of(new SimpleGrantedAuthority("ROLE_" + usuario.getRol().name()));
                SecurityContextHolder.getContext().setAuthentication(
                        new UsernamePasswordAuthenticationToken(usuario.getUsername(), null, autoridades));
            }
        } catch (ExpiredJwtException e) {
            request.setAttribute(ATRIBUTO_ERROR, "El token ha expirado, inicie sesion nuevamente");
        } catch (JwtException | IllegalArgumentException e) {
            request.setAttribute(ATRIBUTO_ERROR, "El token no es valido o fue alterado");
        }

        chain.doFilter(request, response);
    }
}
