package com.andres.odontologia_api.controlador;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.andres.odontologia_api.dto.PacienteDTO;
import com.andres.odontologia_api.modelo.Paciente;
import com.andres.odontologia_api.servicio.PacienteServicio;

import jakarta.validation.Valid;

// Controlador REST encargado del CRUD de pacientes
@RestController
@RequestMapping("/api/pacientes")
public class PacienteControlador {

    // Servicio que contiene la logica de negocio
    private final PacienteServicio pacienteServicio;

    // Inyeccion de dependencias
    public PacienteControlador(PacienteServicio pacienteServicio) {
        this.pacienteServicio = pacienteServicio;
    }

    // Convertir una entidad Paciente a DTO
    // Evita devolver el usuario y su contrasena
    private PacienteDTO convertirDTO(Paciente paciente) {

        return new PacienteDTO(
                paciente.getId(),
                paciente.getCedula(),
                paciente.getNombre(),
                paciente.getApellido(),
                paciente.getTelefono(),
                paciente.getCorreo(),
                paciente.getDireccion()
        );
    }

    // Convertir los datos recibidos a entidad
    private Paciente convertirEntidad(PacienteDTO datos) {

        Paciente paciente = new Paciente();

        paciente.setCedula(datos.cedula());
        paciente.setNombre(datos.nombre());
        paciente.setApellido(datos.apellido());
        paciente.setTelefono(datos.telefono());
        paciente.setCorreo(datos.correo());
        paciente.setDireccion(datos.direccion());

        return paciente;
    }

    // GET: obtener todos los pacientes
    // URL: GET /api/pacientes
    @GetMapping
    public List<PacienteDTO> listar() {

        return pacienteServicio.listar()
                .stream()
                .map(this::convertirDTO)
                .toList();
    }

    // GET: buscar paciente por ID
    // URL: GET /api/pacientes/1
    @GetMapping("/{id}")
    public PacienteDTO buscar(@PathVariable Long id) {

        Paciente paciente = pacienteServicio.buscarPorId(id);

        return convertirDTO(paciente);
    }

    // GET: buscar por cedula
    // URL: GET /api/pacientes/cedula/0102030405
    @GetMapping("/cedula/{cedula}")
    public PacienteDTO buscarCedula(@PathVariable String cedula) {

        Paciente paciente = pacienteServicio.buscarPorCedula(cedula);

        return convertirDTO(paciente);
    }

    // POST: registrar un paciente
    // URL: POST /api/pacientes
    @PostMapping
    public ResponseEntity<PacienteDTO> guardar(
            @Valid @RequestBody PacienteDTO datos) {

        Paciente paciente = convertirEntidad(datos);

        Paciente guardado = pacienteServicio.guardar(paciente);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(convertirDTO(guardado));
    }

    // PUT: actualizar los datos del paciente
    // URL: PUT /api/pacientes/1
    @PutMapping("/{id}")
    public PacienteDTO actualizar(
            @PathVariable Long id,
            @Valid @RequestBody PacienteDTO datos) {

        Paciente paciente = convertirEntidad(datos);

        Paciente actualizado =
                pacienteServicio.actualizar(id, paciente);

        return convertirDTO(actualizado);
    }

    // DELETE: eliminar un paciente por ID
    // URL: DELETE /api/pacientes/1
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {

        pacienteServicio.eliminar(id);

        return ResponseEntity.noContent().build();
    }
}