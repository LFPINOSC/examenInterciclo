// ==========================================
// COMPONENTE PACIENTES
// SISTEMA DE CONTROL DE CITAS MEDICAS
// ==========================================

// Component permite crear la pantalla.
// OnInit permite cargar datos al ingresar.
// inject permite utilizar servicios.
// signal administra estados de la interfaz.
import {
  Component,
  OnInit,
  inject,
  signal
} from '@angular/core';

// FormsModule permite utilizar ngModel.
import { FormsModule } from '@angular/forms';

// RouterLink permite regresar al dashboard.
import { RouterLink } from '@angular/router';

// Permite identificar errores de solicitudes HTTP.
import { HttpErrorResponse } from '@angular/common/http';

// Servicio y modelos de pacientes.
import {
  PacienteService,
  Paciente,
  PacienteDatos
} from '../../servicios/paciente';

/**
 * COMPONENTE PACIENTES
 *
 * Administra el CRUD completo:
 *
 * 1. Listar pacientes.
 * 2. Registrar pacientes.
 * 3. Buscar pacientes.
 * 4. Editar pacientes.
 * 5. Eliminar pacientes.
 * 6. Mostrar errores y mensajes.
 *
 * Se conecta con Spring Boot mediante
 * PacienteService y utiliza JWT
 * automaticamente mediante el interceptor.
 */
@Component({
  selector: 'app-pacientes',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './pacientes.html',
  styleUrl: './pacientes.css'
})
export class Pacientes implements OnInit {

  // ==========================================
  // INYECCION DE SERVICIOS
  // ==========================================

  private readonly pacienteService = inject(PacienteService);

  // ==========================================
  // VARIABLES Y ESTADOS
  // ==========================================

  // Lista de pacientes obtenidos desde la API.
  pacientes = signal<Paciente[]>([]);

  // Controla el estado de carga de la tabla.
  cargando = signal(false);

  // Impide enviar el formulario varias veces.
  guardando = signal(false);

  // Guarda el ID del paciente que se elimina.
  eliminandoId = signal<number | null>(null);

  // Controla si se muestra el formulario.
  mostrarFormulario = signal(false);

  // Mensajes de error y confirmacion.
  error = signal('');
  mensaje = signal('');

  // Texto utilizado para buscar pacientes.
  busqueda = '';

  // ID del paciente que se edita.
  // null significa registrar uno nuevo.
  idEdicion: number | null = null;

  // Datos iniciales del formulario.
  formulario: PacienteDatos = this.formularioVacio();

  // ==========================================
  // INICIALIZACION
  // ==========================================

  /**
   * Al ingresar a la pantalla,
   * consultar los pacientes registrados.
   */
  ngOnInit(): void {
    this.cargarPacientes();
  }

  // ==========================================
  // FORMULARIO VACIO
  // ==========================================

  /**
   * Devuelve un formulario sin datos.
   */
  private formularioVacio(): PacienteDatos {
    return {
      nombre: '',
      apellido: '',
      cedula: '',
      telefono: '',
      correo: ''
    };
  }

  // ==========================================
  // LISTAR PACIENTES
  // ==========================================

  /**
   * GET /api/pacientes
   *
   * Obtiene los pacientes desde Spring Boot.
   */
  cargarPacientes(): void {

    this.cargando.set(true);
    this.error.set('');

    this.pacienteService.listar().subscribe({

      next: (datos: Paciente[]) => {

        this.pacientes.set(datos);

        this.cargando.set(false);
      },

      error: (err: HttpErrorResponse) => {

        this.cargando.set(false);

        this.error.set(this.obtenerMensajeError(err));
      }
    });
  }

  // ==========================================
  // BUSCAR PACIENTES
  // ==========================================

  /**
   * Filtra la lista por:
   *
   * - ID
   * - Nombre
   * - Apellido
   * - Cedula
   */
  get pacientesFiltrados(): Paciente[] {

    const texto = this.busqueda.trim().toLowerCase();

    if (!texto) {
      return this.pacientes();
    }

    return this.pacientes().filter((paciente: Paciente) => {

      return (
        paciente.id.toString().includes(texto) ||
        paciente.nombre.toLowerCase().includes(texto) ||
        paciente.apellido.toLowerCase().includes(texto) ||
        paciente.cedula.includes(texto)
      );
    });
  }

  // ==========================================
  // NUEVO PACIENTE
  // ==========================================

  /**
   * Abre el formulario para registrar
   * un nuevo paciente.
   */
  nuevo(): void {

    this.idEdicion = null;

    this.formulario = this.formularioVacio();

    this.error.set('');
    this.mensaje.set('');

    this.mostrarFormulario.set(true);
  }

  // ==========================================
  // EDITAR PACIENTE
  // ==========================================

  /**
   * Carga los datos del paciente seleccionado
   * en el formulario de edicion.
   */
  editar(paciente: Paciente): void {

    this.idEdicion = paciente.id;

    // Copiar los datos del paciente.
    this.formulario = {
      nombre: paciente.nombre,
      apellido: paciente.apellido,
      cedula: paciente.cedula,
      telefono: paciente.telefono,
      correo: paciente.correo
    };

    this.error.set('');
    this.mensaje.set('');

    this.mostrarFormulario.set(true);
  }

  // ==========================================
  // CANCELAR FORMULARIO
  // ==========================================

  /**
   * Cierra y limpia el formulario.
   */
  cancelar(): void {

    this.mostrarFormulario.set(false);

    this.idEdicion = null;

    this.formulario = this.formularioVacio();

    this.error.set('');
  }

  // ==========================================
  // GUARDAR PACIENTE
  // ==========================================

  /**
   * Registra o actualiza un paciente.
   *
   * POST /api/pacientes
   * PUT  /api/pacientes/{id}
   */
  guardar(): void {

    // Evitar solicitudes duplicadas.
    if (this.guardando()) {
      return;
    }

    this.error.set('');
    this.mensaje.set('');

    // Preparar los datos del formulario.
    const datos: PacienteDatos = {

      nombre: this.formulario.nombre.trim(),

      apellido: this.formulario.apellido.trim(),

      cedula: this.formulario.cedula.trim(),

      telefono: this.formulario.telefono.trim(),

      correo: this.formulario.correo.trim()
    };

    // Validar campos obligatorios.
    if (
      !datos.nombre ||
      !datos.apellido ||
      !datos.cedula ||
      !datos.telefono ||
      !datos.correo
    ) {

      this.error.set('Complete todos los campos.');

      return;
    }

    // Validar 10 digitos de la cedula.
    if (!/^\d{10}$/.test(datos.cedula)) {

      this.error.set(
        'La cédula debe contener exactamente 10 dígitos.'
      );

      return;
    }

    // Validar correo electronico.
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(datos.correo)) {

      this.error.set('Ingrese un correo electrónico válido.');

      return;
    }

    this.guardando.set(true);

    // Comprobar si estamos editando.
    const editando = this.idEdicion !== null;

    // Crear la peticion correspondiente.
    const peticion = editando

      ? this.pacienteService.actualizar(
          this.idEdicion!,
          datos
        )

      : this.pacienteService.crear(datos);

    // Ejecutar la solicitud HTTP.
    peticion.subscribe({

      next: () => {

        this.guardando.set(false);

        this.mostrarFormulario.set(false);

        this.idEdicion = null;

        this.formulario = this.formularioVacio();

        // Mostrar confirmacion.
        this.mensaje.set(
          editando
            ? 'Paciente actualizado correctamente.'
            : 'Paciente registrado correctamente.'
        );

        // Actualizar la lista.
        this.cargarPacientes();
      },

      error: (err: HttpErrorResponse) => {

        this.guardando.set(false);

        this.error.set(this.obtenerMensajeError(err));
      }
    });
  }

  // ==========================================
  // ELIMINAR PACIENTE
  // ==========================================

  /**
   * DELETE /api/pacientes/{id}
   *
   * Solicita confirmacion antes de eliminar.
   */
  eliminar(paciente: Paciente): void {

    const confirmado = window.confirm(
      `¿Desea eliminar al paciente ${paciente.nombre} ${paciente.apellido}?`
    );

    if (!confirmado) {
      return;
    }

    this.error.set('');
    this.mensaje.set('');

    this.eliminandoId.set(paciente.id);

    // Solicitar eliminacion a Spring Boot.
    this.pacienteService.eliminar(paciente.id).subscribe({

      next: () => {

        this.eliminandoId.set(null);

        this.mensaje.set(
          'Paciente eliminado correctamente.'
        );

        // Recargar registros.
        this.cargarPacientes();
      },

      error: (err: HttpErrorResponse) => {

        this.eliminandoId.set(null);

        this.error.set(this.obtenerMensajeError(err));
      }
    });
  }

  // ==========================================
  // MANEJO DE ERRORES
  // ==========================================

  /**
   * Convierte los errores HTTP del backend
   * en mensajes comprensibles para el usuario.
   */
  private obtenerMensajeError(
    err: HttpErrorResponse
  ): string {

    // Backend apagado o sin conexion.
    if (err.status === 0) {
      return 'No se pudo conectar con Spring Boot. Verifique que la API esté funcionando.';
    }

    // Token incorrecto o expirado.
    if (err.status === 401) {
      return 'Su sesión ha expirado. Inicie sesión nuevamente.';
    }

    // Usuario sin permisos.
    if (err.status === 403) {
      return 'No tiene permisos para realizar esta operación.';
    }

    // Registro inexistente.
    if (err.status === 404) {
      return 'El paciente solicitado no existe.';
    }

    // Conflicto de datos.
    if (err.status === 409) {
      return 'No se puede completar la operación. La cédula puede estar duplicada o el paciente tiene citas asociadas.';
    }

    // Mostrar mensajes enviados por el backend.
    const respuesta = err.error;

    if (typeof respuesta?.mensaje === 'string') {
      return respuesta.mensaje;
    }

    if (typeof respuesta?.message === 'string') {
      return respuesta.message;
    }

    return 'Ocurrió un error al procesar la solicitud.';
  }

}