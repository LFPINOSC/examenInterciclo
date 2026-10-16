package ec.edu.ucacue.ordenes.servicio;

import ec.edu.ucacue.ordenes.dto.ClienteRequest;
import ec.edu.ucacue.ordenes.dto.ClienteResponse;
import ec.edu.ucacue.ordenes.entidad.Cliente;
import ec.edu.ucacue.ordenes.excepcion.RecursoDuplicadoException;
import ec.edu.ucacue.ordenes.excepcion.RecursoNoEncontradoException;
import ec.edu.ucacue.ordenes.excepcion.ReglaNegocioException;
import ec.edu.ucacue.ordenes.excepcion.SolicitudInvalidaException;
import ec.edu.ucacue.ordenes.repositorio.ClienteRepository;
import ec.edu.ucacue.ordenes.repositorio.EquipoRepository;
import ec.edu.ucacue.ordenes.repositorio.OrdenTrabajoRepository;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ClienteService {

    private final ClienteRepository clienteRepository;
    private final EquipoRepository equipoRepository;
    private final OrdenTrabajoRepository ordenRepository;

    public ClienteService(ClienteRepository clienteRepository, EquipoRepository equipoRepository,
                          OrdenTrabajoRepository ordenRepository) {
        this.clienteRepository = clienteRepository;
        this.equipoRepository = equipoRepository;
        this.ordenRepository = ordenRepository;
    }

    @Transactional(readOnly = true)
    public List<ClienteResponse> listar(String q) {
        String texto = q == null ? "" : q.trim();
        return clienteRepository.findByNombreContainingIgnoreCaseOrCedulaContainingOrderByNombre(texto, texto)
                .stream().map(this::aResponse).toList();
    }

    @Transactional(readOnly = true)
    public ClienteResponse buscarPorId(Long id) {
        return aResponse(obtener(id));
    }

    @Transactional
    public ClienteResponse crear(ClienteRequest request) {
        validarCedula(request.cedula());
        if (clienteRepository.existsByCedula(request.cedula())) {
            throw new RecursoDuplicadoException("Ya existe un cliente con la cedula " + request.cedula());
        }
        Cliente c = new Cliente();
        copiar(c, request);
        return aResponse(clienteRepository.save(c));
    }

    @Transactional
    public ClienteResponse actualizar(Long id, ClienteRequest request) {
        Cliente c = obtener(id);
        validarCedula(request.cedula());
        if (clienteRepository.existsByCedulaAndIdNot(request.cedula(), id)) {
            throw new RecursoDuplicadoException("Ya existe otro cliente con la cedula " + request.cedula());
        }
        copiar(c, request);
        return aResponse(clienteRepository.save(c));
    }

    @Transactional
    public void eliminar(Long id) {
        Cliente c = obtener(id);
        // Regla: se conserva el historial; un cliente con equipos u ordenes no se borra.
        if (ordenRepository.existsByClienteId(id) || equipoRepository.existsByClienteId(id)) {
            throw new ReglaNegocioException("No se puede eliminar el cliente porque tiene equipos u ordenes asociadas");
        }
        clienteRepository.delete(c);
    }

    public Cliente obtener(Long id) {
        return clienteRepository.findById(id).orElseThrow(() -> new RecursoNoEncontradoException("Cliente", id));
    }

    private void validarCedula(String cedula) {
        if (!ValidadorCedula.esValida(cedula)) {
            throw new SolicitudInvalidaException("La cedula ingresada no es una cedula ecuatoriana valida");
        }
    }

    private void copiar(Cliente c, ClienteRequest r) {
        c.setNombre(r.nombre().trim());
        c.setCedula(r.cedula());
        c.setTelefono(vacioANulo(r.telefono()));
        c.setCorreo(vacioANulo(r.correo()));
        c.setDireccion(vacioANulo(r.direccion()));
    }

    static String vacioANulo(String s) {
        return s == null || s.isBlank() ? null : s.trim();
    }

    private ClienteResponse aResponse(Cliente c) {
        return new ClienteResponse(c.getId(), c.getNombre(), c.getCedula(), c.getTelefono(), c.getCorreo(), c.getDireccion());
    }
}
