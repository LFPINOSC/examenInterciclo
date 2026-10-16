package com.sistema.tecnosoporte.seguridad;
import com.sistema.tecnosoporte.repositorios.UsuarioRepositorio;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.List;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
@Component
public class FiltroJwt extends OncePerRequestFilter {
 private final JwtServicio jwt;
 private final UsuarioRepositorio usuarios;
 public FiltroJwt(JwtServicio jwt,UsuarioRepositorio usuarios) {this.jwt=jwt;this.usuarios=usuarios;}
 @Override protected void doFilterInternal(HttpServletRequest request,HttpServletResponse response,FilterChain chain) throws ServletException,IOException {
  String h=request.getHeader("Authorization");
  if(h!=null && h.startsWith("Bearer ") && SecurityContextHolder.getContext().getAuthentication()==null) {
   try {
    Long id=jwt.leer(h.substring(7));
    usuarios.findById(id).filter(u->u.isActivo()).ifPresent(u-> {
     var a=new UsernamePasswordAuthenticationToken(u.getId().toString(),null,List.of(new SimpleGrantedAuthority("ROLE_"+u.getRol().name())));
     SecurityContextHolder.getContext().setAuthentication(a);
    });
   } catch(JwtException|IllegalArgumentException ex) { SecurityContextHolder.clearContext(); }
  }
  chain.doFilter(request,response);
 }
}
