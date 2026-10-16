package com.sistema.tecnosoporte.config;
import com.sistema.tecnosoporte.entidades.*;
import com.sistema.tecnosoporte.enums.*;
import com.sistema.tecnosoporte.repositorios.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;
import java.math.BigDecimal;
import java.util.List;
@Configuration
public class DatosPrueba {
 @Bean CommandLineRunner sembrar(UsuarioRepositorio usuarios,TecnicoRepositorio tecnicos,EquipoRepositorio equipos,
  ServicioRepositorio servicios,TicketRepositorio tickets,DetalleServicioRepositorio detalles,PasswordEncoder pass,
  @Value("${app.admin.email}") String adminCorreo,@Value("${app.admin.password}") String adminClave,
  @Value("${app.demo.seed}") boolean demo,@Value("${app.demo.client-password}") String clienteClave) {
  return args->{
   if(!adminClave.isBlank()&&!usuarios.existsByCorreoIgnoreCase(adminCorreo)) {
    if(adminClave.length()<8)throw new IllegalStateException("ADMIN_PASSWORD debe tener minimo 8 caracteres");
    Usuario a=new Usuario();a.setNombre("Administrador");a.setApellido("TecnoSoporte");a.setCorreo(adminCorreo.toLowerCase());
    a.setContrasenaHash(pass.encode(adminClave));a.setRol(Rol.ADMIN);a.setActivo(true);usuarios.save(a);
   }
   if(!demo)return;
   Tecnico uno=tecnico(tecnicos,"Carlos","Vega","Hardware","0998765432");
   Tecnico dos=tecnico(tecnicos,"Lucia","Mora","Redes y software","0987654321");
   tecnico(tecnicos,"Diego","Torres","Impresoras","0976543210");
   Servicio diagnostico=servicio(servicios,"Diagnostico de hardware","Revision de componentes","15.00");
   Servicio limpieza=servicio(servicios,"Limpieza preventiva","Limpieza de ventiladores y placa","20.00");
   Servicio windows=servicio(servicios,"Instalacion de sistema","Instalacion y configuracion","35.00");
   servicio(servicios,"Configuracion de red","Configuracion LAN y WiFi","25.00");
   servicio(servicios,"Mantenimiento de impresora","Revision y limpieza","18.00");
   if(clienteClave.isBlank())return; // No crear usuarios de prueba con claves embebidas en codigo.
   if(clienteClave.length()<8)throw new IllegalStateException("DEMO_CLIENT_PASSWORD debe tener minimo 8 caracteres");
   Usuario ana=cliente(usuarios,pass,"Ana","Lopez","ana.cliente@demo.local",clienteClave,"0991234567");
   Usuario juan=cliente(usuarios,pass,"Juan","Perez","juan.cliente@demo.local",clienteClave,"0981234567");
   Equipo hp=equipo(equipos,ana,TipoEquipo.LAPTOP,"HP","Pavilion","DEMO-HP-001");
   Equipo dell=equipo(equipos,juan,TipoEquipo.PC_ESCRITORIO,"Dell","OptiPlex","DEMO-DELL-002");
   equipo(equipos,ana,TipoEquipo.IMPRESORA,"Epson","EcoTank","DEMO-EPSON-003");
   if(tickets.count()==0){
    Ticket t1=new Ticket();t1.setEquipo(hp);t1.setTecnico(uno);t1.setDescripcionProblema("La laptop se calienta y funciona lentamente");
    t1.setPrioridad(Prioridad.MEDIA);t1.setEstado(EstadoTicket.EN_PROCESO);t1.setDiagnostico("Ventiladores con polvo");tickets.save(t1);
    detalle(detalles,t1,diagnostico,"Diagnostico inicial");detalle(detalles,t1,limpieza,"Limpieza interna");
    Ticket t2=new Ticket();t2.setEquipo(dell);t2.setTecnico(dos);t2.setDescripcionProblema("El equipo no inicia el sistema operativo");
    t2.setPrioridad(Prioridad.ALTA);t2.setEstado(EstadoTicket.RESUELTO);t2.setDiagnostico("Sistema danado");t2.setSolucion("Sistema reinstalado y verificado");tickets.save(t2);
    detalle(detalles,t2,windows,"Instalacion realizada");
   }
  };
 }
 private Tecnico tecnico(TecnicoRepositorio r,String n,String a,String esp,String tel){
  return r.findAll().stream().filter(t->t.getNombre().equals(n)&&t.getApellido().equals(a)).findFirst().orElseGet(()->{
   Tecnico t=new Tecnico();t.setNombre(n);t.setApellido(a);t.setEspecialidad(esp);t.setTelefono(tel);t.setActivo(true);return r.save(t);
  });
 }
 private Servicio servicio(ServicioRepositorio r,String n,String d,String p){return r.findByNombreIgnoreCase(n).orElseGet(()->{
  Servicio s=new Servicio();s.setNombre(n);s.setDescripcion(d);s.setPrecio(new BigDecimal(p));s.setActivo(true);return r.save(s);
 });}
 private Usuario cliente(UsuarioRepositorio r,PasswordEncoder e,String n,String a,String c,String clave,String tel){return r.findByCorreoIgnoreCase(c).orElseGet(()->{
  Usuario u=new Usuario();u.setNombre(n);u.setApellido(a);u.setCorreo(c);u.setTelefono(tel);u.setContrasenaHash(e.encode(clave));u.setRol(Rol.CLIENTE);u.setActivo(true);return r.save(u);
 });}
 private Equipo equipo(EquipoRepositorio r,Usuario c,TipoEquipo tipo,String m,String mod,String serie){return r.findByNumeroSerieIgnoreCase(serie).orElseGet(()->{
  Equipo e=new Equipo();e.setCliente(c);e.setTipo(tipo);e.setMarca(m);e.setModelo(mod);e.setNumeroSerie(serie);e.setActivo(true);return r.save(e);
 });}
 private void detalle(DetalleServicioRepositorio r,Ticket t,Servicio s,String nota){
  DetalleServicio d=new DetalleServicio();d.setTicket(t);d.setServicio(s);d.setPrecioAplicado(s.getPrecio());d.setObservacion(nota);r.save(d);
 }
}
