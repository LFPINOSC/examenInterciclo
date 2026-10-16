package ec.edu.ucacue.ordenes.servicio;

import ec.edu.ucacue.ordenes.dto.EstadoRequest;
import ec.edu.ucacue.ordenes.dto.OrdenRequest;
import ec.edu.ucacue.ordenes.dto.OrdenResponse;
import ec.edu.ucacue.ordenes.dto.ResumenResponse;
import ec.edu.ucacue.ordenes.dto.TareaRequest;
import ec.edu.ucacue.ordenes.dto.TareaResponse;
import ec.edu.ucacue.ordenes.entidad.Cliente;
import ec.edu.ucacue.ordenes.entidad.Equipo;
import ec.edu.ucacue.ordenes.entidad.EstadoOrden;
import ec.edu.ucacue.ordenes.entidad.OrdenTrabajo;
import ec.edu.ucacue.ordenes.entidad.Prioridad;
import ec.edu.ucacue.ordenes.entidad.Rol;
import ec.edu.ucacue.ordenes.entidad.Tarea;
import ec.edu.ucacue.ordenes.entidad.Usuario;
import ec.edu.ucacue.ordenes.excepcion.AccesoDenegadoException;
import ec.edu.ucacue.ordenes.excepcion.RecursoNoEncontradoException;
import ec.edu.ucacue.ordenes.excepcion.ReglaNegocioException;
import ec.edu.ucacue.ordenes.excepcion.SolicitudInvalidaException;
import ec.edu.ucacue.ordenes.repositorio.OrdenTrabajoRepository;
import ec.edu.ucacue.ordenes.repositorio.TareaRepository;
import ec.edu.ucacue.ordenes.repositorio.UsuarioRepository;
import java.time.LocalDate;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Logica de las ordenes de trabajo y sus tareas.
 * Regla de acceso: el ADMIN lo ve y modifica todo; el TECNICO solo las ordenes que tiene asignadas.
 */
@Service
public class OrdenService {

    private final OrdenTrabajoRepository ordenRepository;
    private final TareaRepository tareaRepository;
    private final UsuarioRepository usuarioRepository;
    private final ClienteService clienteService;
    private final EquipoService equipoService;

    public OrdenService(OrdenTrabajoRepository ordenRepository, TareaRepository tareaRepository,
                        UsuarioRepository usuarioRepository, ClienteService clienteService,
                        EquipoService equipoService) {
        this.ordenRepository = ordenRepository;
        this.tareaRepository = tareaRepository;
        this.usuarioRepository = usuarioRepository;
        this.clienteService = clienteService;
        this.equipoService = equipoService;
    }

    /* ---------------- ordenes ---------------- */

    @Transactional(readOnly = true)
    public List<OrdenResponse> listar(String username, EstadoOrden estado, String q) {
        Usuario actual = usuario(username);
        List<OrdenTrabajo> base = actual.getRol() == Rol.ADMIN
                ? ordenRepository.findAllByOrderByIdDesc()
                : ordenRepository.findByTecnicoIdOrderByIdDesc(actual.getId());
        String texto = q == null ? "" : q.trim().toLowerCase();
        return base.stream()
                .filter(o -> estado == null || o.getEstado() == estado)
                .filter(o -> texto.isEmpty() || o.getCodigo().toLowerCase().contains(texto)
                        || o.getCliente().getNombre().toLowerCase().contains(texto))
                .map(this::aResponse).toList();
    }

    @Transactional(readOnly = true)
    public OrdenResponse buscarPorId(Long id, String username) {
        return aResponse(ordenAccesible(id, usuario(username)));
    }

    @Transactional
    public OrdenResponse crear(OrdenRequest request, String username) {
        OrdenTrabajo o = new OrdenTrabajo();
        o.setCreadoPor(usuario(username));
        // Codigo provisional unico; se reemplaza por OT-00001 al conocer el id generado.
        o.setCodigo("TMP-" + UUID.randomUUID().toString().substring(0, 15));
        copiar(o, request);
        OrdenTrabajo guardada = ordenRepository.save(o);
        guardada.setCodigo(String.format("OT-%05d", guardada.getId()));
        return aResponse(ordenRepository.save(guardada));
    }

    @Transactional
    public OrdenResponse actualizar(Long id, OrdenRequest request) {
        OrdenTrabajo o = ordenRepository.findById(id).orElseThrow(() -> new RecursoNoEncontradoException("Orden", id));
        copiar(o, request);
        return aResponse(ordenRepository.save(o));
    }

    /** ADMIN o el tecnico asignado. Al completar la orden se registra la fecha de entrega si faltaba. */
    @Transactional
    public OrdenResponse cambiarEstado(Long id, EstadoRequest request, String username) {
        OrdenTrabajo o = ordenAccesible(id, usuario(username));
        o.setEstado(request.estado());
        if (request.estado() == EstadoOrden.COMPLETADA && o.getFechaEntrega() == null) {
            o.setFechaEntrega(LocalDate.now());
        }
        return aResponse(ordenRepository.save(o));
    }

    @Transactional
    public void eliminar(Long id) {
        OrdenTrabajo o = ordenRepository.findById(id).orElseThrow(() -> new RecursoNoEncontradoException("Orden", id));
        ordenRepository.delete(o); // las tareas se eliminan en cascada
    }

    /* ---------------- tareas ---------------- */

    @Transactional
    public TareaResponse agregarTarea(Long ordenId, TareaRequest request, String username) {
        OrdenTrabajo o = ordenAccesible(ordenId, usuario(username));
        Tarea t = new Tarea();
        t.setOrden(o);
        copiarTarea(t, request);
        return aResponse(tareaRepository.save(t));
    }

    @Transactional
    public TareaResponse actualizarTarea(Long tareaId, TareaRequest request, String username) {
        Tarea t = tarea(tareaId, username);
        copiarTarea(t, request);
        return aResponse(tareaRepository.save(t));
    }

    @Transactional
    public void eliminarTarea(Long tareaId, String username) {
        tareaRepository.delete(tarea(tareaId, username));
    }

    /* ---------------- resumen ---------------- */

    @Transactional(readOnly = true)
    public ResumenResponse resumen(String username) {
        Usuario actual = usuario(username);
        Map<String, Long> porEstado = new LinkedHashMap<>();
        for (EstadoOrden e : EstadoOrden.values()) {
            porEstado.put(e.name(), actual.getRol() == Rol.ADMIN
                    ? ordenRepository.countByEstado(e)
                    : ordenRepository.countByTecnicoIdAndEstado(actual.getId(), e));
        }
        return new ResumenResponse(porEstado);
    }

    /* ---------------- auxiliares ---------------- */

    private Usuario usuario(String username) {
        return usuarioRepository.findByUsername(username)
                .orElseThrow(() -> new AccesoDenegadoException("Usuario no valido"));
    }

    /** Devuelve la orden si el usuario puede acceder a ella; si no, 404/403. */
    private OrdenTrabajo ordenAccesible(Long id, Usuario actual) {
        OrdenTrabajo o = ordenRepository.findById(id).orElseThrow(() -> new RecursoNoEncontradoException("Orden", id));
        boolean asignada = o.getTecnico() != null && o.getTecnico().getId().equals(actual.getId());
        if (actual.getRol() != Rol.ADMIN && !asignada) {
            throw new AccesoDenegadoException("Esta orden no esta asignada a usted");
        }
        return o;
    }

    private Tarea tarea(Long tareaId, String username) {
        Tarea t = tareaRepository.findById(tareaId).orElseThrow(() -> new RecursoNoEncontradoException("Tarea", tareaId));
        ordenAccesible(t.getOrden().getId(), usuario(username));
        return t;
    }

    private void copiar(OrdenTrabajo o, OrdenRequest r) {
        Cliente cliente = clienteService.obtener(r.clienteId());
        Equipo equipo = equipoService.obtener(r.equipoId());
        if (!equipo.getCliente().getId().equals(cliente.getId())) {
            throw new SolicitudInvalidaException("El equipo seleccionado no pertenece al cliente");
        }
        Usuario tecnico = null;
        if (r.tecnicoId() != null) {
            tecnico = usuarioRepository.findById(r.tecnicoId())
                    .orElseThrow(() -> new RecursoNoEncontradoException("Tecnico", r.tecnicoId()));
            boolean mismoTecnico = o.getTecnico() != null && o.getTecnico().getId().equals(tecnico.getId());
            if (tecnico.getRol() != Rol.TECNICO || (!tecnico.getActivo() && !mismoTecnico)) {
                throw new ReglaNegocioException("El usuario asignado no es un tecnico activo");
            }
        }
        LocalDate ingreso = r.fechaIngreso() != null ? r.fechaIngreso()
                : (o.getFechaIngreso() != null ? o.getFechaIngreso() : LocalDate.now());
        if (r.fechaEntrega() != null && r.fechaEntrega().isBefore(ingreso)) {
            throw new SolicitudInvalidaException("La fecha de entrega no puede ser anterior a la de ingreso");
        }
        o.setCliente(cliente);
        o.setEquipo(equipo);
        o.setTecnico(tecnico);
        o.setDescripcion(r.descripcion().trim());
        o.setPrioridad(r.prioridad() != null ? r.prioridad() : (o.getPrioridad() != null ? o.getPrioridad() : Prioridad.MEDIA));
        o.setEstado(r.estado() != null ? r.estado() : (o.getEstado() != null ? o.getEstado() : EstadoOrden.PENDIENTE));
        o.setFechaIngreso(ingreso);
        o.setFechaEntrega(r.fechaEntrega());
    }

    private void copiarTarea(Tarea t, TareaRequest r) {
        t.setDescripcion(r.descripcion().trim());
        t.setHoras(r.horas());
        t.setCosto(r.costo());
        t.setCompletada(Boolean.TRUE.equals(r.completada()));
    }

    private OrdenResponse aResponse(OrdenTrabajo o) {
        Equipo e = o.getEquipo();
        String nombreEquipo = (e.getTipo() + " " + (e.getMarca() == null ? "" : e.getMarca())
                + " " + (e.getModelo() == null ? "" : e.getModelo())).trim();
        Usuario tec = o.getTecnico();
        return new OrdenResponse(o.getId(), o.getCodigo(), o.getCliente().getId(), o.getCliente().getNombre(),
                e.getId(), nombreEquipo, tec == null ? null : tec.getId(), tec == null ? null : tec.getNombre(),
                o.getDescripcion(), o.getPrioridad().name(), o.getEstado().name(), o.getFechaIngreso(),
                o.getFechaEntrega(), o.costoTotal(), o.getTareas().stream().map(this::aResponse).toList());
    }

    private TareaResponse aResponse(Tarea t) {
        return new TareaResponse(t.getId(), t.getOrden().getId(), t.getDescripcion(), t.getHoras(), t.getCosto(),
                t.getCompletada());
    }
}
