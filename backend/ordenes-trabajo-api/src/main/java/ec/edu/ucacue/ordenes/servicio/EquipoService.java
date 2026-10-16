package ec.edu.ucacue.ordenes.servicio;

import ec.edu.ucacue.ordenes.dto.EquipoRequest;
import ec.edu.ucacue.ordenes.dto.EquipoResponse;
import ec.edu.ucacue.ordenes.entidad.Equipo;
import ec.edu.ucacue.ordenes.excepcion.RecursoDuplicadoException;
import ec.edu.ucacue.ordenes.excepcion.RecursoNoEncontradoException;
import ec.edu.ucacue.ordenes.excepcion.ReglaNegocioException;
import ec.edu.ucacue.ordenes.repositorio.EquipoRepository;
import ec.edu.ucacue.ordenes.repositorio.OrdenTrabajoRepository;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class EquipoService {

    private final EquipoRepository equipoRepository;
    private final OrdenTrabajoRepository ordenRepository;
    private final ClienteService clienteService;

    public EquipoService(EquipoRepository equipoRepository, OrdenTrabajoRepository ordenRepository,
                         ClienteService clienteService) {
        this.equipoRepository = equipoRepository;
        this.ordenRepository = ordenRepository;
        this.clienteService = clienteService;
    }

    /** Todos los equipos, o solo los de un cliente si se indica clienteId. */
    @Transactional(readOnly = true)
    public List<EquipoResponse> listar(Long clienteId) {
        List<Equipo> lista = clienteId == null ? equipoRepository.findAll() : equipoRepository.findByClienteIdOrderByTipo(clienteId);
        return lista.stream().map(this::aResponse).toList();
    }

    @Transactional(readOnly = true)
    public EquipoResponse buscarPorId(Long id) {
        return aResponse(obtener(id));
    }

    @Transactional
    public EquipoResponse crear(EquipoRequest request) {
        String serie = ClienteService.vacioANulo(request.serie());
        if (serie != null && equipoRepository.existsBySerie(serie)) {
            throw new RecursoDuplicadoException("Ya existe un equipo con la serie " + serie);
        }
        Equipo e = new Equipo();
        copiar(e, request, serie);
        return aResponse(equipoRepository.save(e));
    }

    @Transactional
    public EquipoResponse actualizar(Long id, EquipoRequest request) {
        Equipo e = obtener(id);
        String serie = ClienteService.vacioANulo(request.serie());
        if (serie != null && equipoRepository.existsBySerieAndIdNot(serie, id)) {
            throw new RecursoDuplicadoException("Ya existe otro equipo con la serie " + serie);
        }
        // Un equipo con ordenes no puede cambiar de dueno: se romperia la coherencia de esas ordenes.
        if (!e.getCliente().getId().equals(request.clienteId()) && ordenRepository.existsByEquipoId(id)) {
            throw new ReglaNegocioException("El equipo tiene ordenes: no se puede cambiar de cliente");
        }
        copiar(e, request, serie);
        return aResponse(equipoRepository.save(e));
    }

    @Transactional
    public void eliminar(Long id) {
        Equipo e = obtener(id);
        if (ordenRepository.existsByEquipoId(id)) {
            throw new ReglaNegocioException("No se puede eliminar el equipo porque tiene ordenes asociadas");
        }
        equipoRepository.delete(e);
    }

    public Equipo obtener(Long id) {
        return equipoRepository.findById(id).orElseThrow(() -> new RecursoNoEncontradoException("Equipo", id));
    }

    private void copiar(Equipo e, EquipoRequest r, String serie) {
        e.setCliente(clienteService.obtener(r.clienteId()));
        e.setTipo(r.tipo().trim());
        e.setMarca(ClienteService.vacioANulo(r.marca()));
        e.setModelo(ClienteService.vacioANulo(r.modelo()));
        e.setSerie(serie);
    }

    private EquipoResponse aResponse(Equipo e) {
        return new EquipoResponse(e.getId(), e.getCliente().getId(), e.getCliente().getNombre(), e.getTipo(),
                e.getMarca(), e.getModelo(), e.getSerie());
    }
}
