package com.jordy.ambulancias.seguridad;
import jakarta.servlet.*;import jakarta.servlet.http.*;import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import java.io.IOException;import java.util.List;
@Component public class JwtFiltro extends OncePerRequestFilter {
 private final JwtServicio jwt;public JwtFiltro(JwtServicio j){jwt=j;}
 @Override protected void doFilterInternal(HttpServletRequest req,HttpServletResponse res,FilterChain chain)throws ServletException,IOException{
  String h=req.getHeader("Authorization");if(h!=null&&h.startsWith("Bearer "))try{
   var claims=jwt.leer(h.substring(7));String rol=claims.get("rol",String.class);
   var auth=new UsernamePasswordAuthenticationToken(claims.getSubject(),null,List.of(new SimpleGrantedAuthority("ROLE_"+rol)));
   SecurityContextHolder.getContext().setAuthentication(auth);
  }catch(Exception ignored){SecurityContextHolder.clearContext();}
  chain.doFilter(req,res);
 }
}
