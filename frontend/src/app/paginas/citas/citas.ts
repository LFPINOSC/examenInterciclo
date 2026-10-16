
 // ==========================================
 // COMPONENTE CITAS MEDICAS
 // SISTEMA DE CONTROL DE CITAS MEDICAS
 // ==========================================

 import {
   Component,
   OnInit,
   inject,
   signal
 } from '@angular/core';

 // Formularios y navegacion.
 import { FormsModule } from '@angular/forms';
 import { RouterLink } from '@angular/router';

 // Manejo de errores HTTP.
 import { HttpErrorResponse } from '@angular/common/http';

 // Permite cargar varias listas simultaneamente.
 import { forkJoin } from 'rxjs';

 // Servicio de citas.
 import {
   CitaService,
   Cita,
   CitaDatos
 } from '../../servicios/cita';

 // Servicios de pacientes y medicos.
 import {
   PacienteService,
   Paciente
 } from '../../servicios/paciente';

 import {
   MedicoService,
   Medico
 } from '../../servicios/medico';

 /**
  * CRUD COMPLETO DE CITAS MEDICAS
  *
  * FUNCIONES:
  * 1. Listar las citas registradas.
  * 2. Cargar pacientes y medicos.
  * 3. Registrar nuevas citas.
  * 4. Editar citas y sus estados.
  * 5. Eliminar citas.
  * 6. Buscar y filtrar resultados.
  * 7. Mostrar errores del backend.
  */
 @Component({
   selector: 'app-citas',
   standalone: true,
   imports: [FormsModule, RouterLink],
   templateUrl: './citas.html',
   styleUrl: './citas.css'
 })
 export class Citas implements OnInit {

   // ========================================
   // SERVICIOS DE SPRING BOOT
   // ========================================

   private readonly citaService = inject(CitaService);
   private readonly pacienteService = inject(PacienteService);
   private readonly medicoService = inject(MedicoService);

   // ========================================
   // LISTAS DEL SISTEMA
   // ========================================

   citas = signal<Cita[]>([]);
   pacientes = signal<Paciente[]>([]);
   medicos = signal<Medico[]>([]);

   // ========================================
   // ESTADOS DE LA INTERFAZ
   // ========================================

   cargando = signal(false);
   guardando = signal(false);
   eliminandoId = signal<number | null>(null);
   mostrarFormulario = signal(false);

   // Mensajes visuales.
   error = signal('');
   mensaje = signal('');

   // Filtros de busqueda.
   busqueda = '';
   filtroEstado = '';
   filtroFecha = '';

   // null = registrar nueva cita.
   idEdicion: number | null = null;

   // Fecha minima permitida.
   fechaMinima = this.obtenerFechaActual();

   // Datos del formulario.
   formulario: CitaDatos = this.formularioVacio();

   // ========================================
   // 1. INICIALIZAR COMPONENTE
   // ========================================

   ngOnInit(): void {
     this.cargarDatos();
   }

   // ========================================
   // 2. OBTENER FECHA ACTUAL
   // ========================================

   /**
    * Obtiene la fecha local en formato
    * YYYY-MM-DD, utilizado por input date.
    */
   private obtenerFechaActual(): string {

     const hoy = new Date();

     const anio = hoy.getFullYear();

     const mes = String(
       hoy.getMonth() + 1
     ).padStart(2, '0');

     const dia = String(
       hoy.getDate()
     ).padStart(2, '0');

     return `${anio}-${mes}-${dia}`;
   }

   // ========================================
   // 3. CREAR FORMULARIO VACIO
   // ========================================

   private formularioVacio(): CitaDatos {

     return {
       fecha: '',
       hora: '',
       motivo: '',
       estado: 'PENDIENTE',
       pacienteId: 0,
       medicoId: 0
     };
   }

   // ========================================
   // 4. CARGAR CITAS, PACIENTES Y MEDICOS
   // ========================================

   /**
    * Consulta simultaneamente las tres APIs.
    *
    * Las listas de pacientes y medicos
    * se utilizan en los select del formulario.
    */
   cargarDatos(): void {

     this.cargando.set(true);
     this.error.set('');

     forkJoin({
       citas: this.citaService.listar(),
       pacientes: this.pacienteService.listar(),
       medicos: this.medicoService.listar()
     }).subscribe({

       next: (datos) => {

         this.citas.set(datos.citas);
         this.pacientes.set(datos.pacientes);
         this.medicos.set(datos.medicos);

         this.cargando.set(false);
       },

       error: (err: HttpErrorResponse) => {

         this.cargando.set(false);

         this.error.set(
           this.obtenerMensajeError(err)
         );
       }
     });
   }

   // ========================================
   // 5. RECARGAR SOLAMENTE LAS CITAS
   // ========================================

   /**
    * Actualiza la tabla despues de
    * registrar, editar o eliminar.
    */
   cargarCitas(): void {

     this.cargando.set(true);

     this.citaService.listar().subscribe({

       next: (datos: Cita[]) => {

         this.citas.set(datos);
         this.cargando.set(false);
       },

       error: (err: HttpErrorResponse) => {

         this.cargando.set(false);
         this.error.set(
           this.obtenerMensajeError(err)
         );
       }
     });
   }

   // ========================================
   // 6. BUSCAR Y FILTRAR CITAS
   // ========================================

   /**
    * Filtra las citas por paciente, medico,
    * fecha y estado.
    */
   get citasFiltradas(): Cita[] {

     const texto = this.busqueda.trim().toLowerCase();

     return this.citas().filter((cita: Cita) => {

       // Obtener los nombres relacionados.
       const paciente = cita.paciente
         ? `${cita.paciente.nombre} ${cita.paciente.apellido}`
         : '';

       const medico = cita.medico
         ? `${cita.medico.nombre} ${cita.medico.apellido}`
         : '';

       // Coincidencia con la busqueda.
       const coincideTexto =
         !texto ||
         cita.id.toString().includes(texto) ||
         paciente.toLowerCase().includes(texto) ||
         medico.toLowerCase().includes(texto) ||
         (cita.motivo || '').toLowerCase().includes(texto);

       // Coincidencia con el estado.
       const coincideEstado =
         !this.filtroEstado ||
         cita.estado === this.filtroEstado;

       // Coincidencia con la fecha.
       const coincideFecha =
         !this.filtroFecha ||
         cita.fecha === this.filtroFecha;

       return (
         coincideTexto &&
         coincideEstado &&
         coincideFecha
       );
     });
   }

   // ========================================
   // 7. NUEVA CITA
   // ========================================

   nuevo(): void {

     this.idEdicion = null;

     this.fechaMinima = this.obtenerFechaActual();

     this.formulario = this.formularioVacio();

     this.error.set('');
     this.mensaje.set('');

     this.mostrarFormulario.set(true);
   }

   // ========================================
   // 8. EDITAR CITA
   // ========================================

   /**
    * Copia la informacion de la cita
    * para editarla en el formulario.
    */
   editar(cita: Cita): void {

     this.idEdicion = cita.id;

     // El formato de input time es HH:mm.
     const horaFormulario = cita.hora
       ? cita.hora.substring(0, 5)
       : '';

     this.formulario = {
       fecha: cita.fecha,
       hora: horaFormulario,
       motivo: cita.motivo || '',
       estado: cita.estado,
       pacienteId: cita.paciente?.id ?? 0,
       medicoId: cita.medico?.id ?? 0
     };

     this.error.set('');
     this.mensaje.set('');

     this.mostrarFormulario.set(true);
   }

   // ========================================
   // 9. CANCELAR FORMULARIO
   // ========================================

   cancelar(): void {

     if (this.guardando()) {
       return;
     }

     this.mostrarFormulario.set(false);
     this.idEdicion = null;
     this.formulario = this.formularioVacio();

     this.error.set('');
   }

   // ========================================
   // 10. GUARDAR CITA
   // ========================================

   /**
    * Registra una cita nueva o actualiza
    * una cita existente.
    *
    * El backend verifica que el medico
    * no tenga otra cita activa en la
    * misma fecha y hora.
    */
   guardar(): void {

     // Impedir solicitudes repetidas.
     if (this.guardando()) {
       return;
     }

     this.error.set('');
     this.mensaje.set('');

     // Identificar tipo de operacion.
     const editando = this.idEdicion !== null;

     // Preparar datos para Spring Boot.
     const datos: CitaDatos = {
       fecha: this.formulario.fecha,
       hora: this.formulario.hora,
       motivo: this.formulario.motivo.trim(),
       estado: editando
         ? this.formulario.estado
         : 'PENDIENTE',
       pacienteId: Number(this.formulario.pacienteId),
       medicoId: Number(this.formulario.medicoId)
     };

     // Validar datos obligatorios.
     if (
       !datos.fecha ||
       !datos.hora ||
       !datos.motivo ||
       datos.pacienteId <= 0 ||
       datos.medicoId <= 0
     ) {

       this.error.set(
         'Complete todos los campos y seleccione un paciente y un médico.'
       );

       return;
     }

     // Comprobar fecha de una nueva cita.
     if (!editando) {

       const fechaHora = new Date(
         `${datos.fecha}T${datos.hora}`
       );

       if (
         Number.isNaN(fechaHora.getTime()) ||
         fechaHora.getTime() <= Date.now()
       ) {

         this.error.set(
           'La cita debe programarse para una fecha y hora futuras.'
         );

         return;
       }
     }

     this.guardando.set(true);

     // Elegir POST o PUT.
     const peticion = editando

       ? this.citaService.actualizar(
           this.idEdicion!,
           datos
         )

       : this.citaService.crear(datos);

     // Enviar la solicitud a Spring Boot.
     peticion.subscribe({

       next: () => {

         this.guardando.set(false);
         this.mostrarFormulario.set(false);

         this.idEdicion = null;
         this.formulario = this.formularioVacio();

         this.mensaje.set(
           editando
             ? 'Cita actualizada correctamente.'
             : 'Cita registrada correctamente.'
         );

         // Actualizar la tabla.
         this.cargarCitas();
       },

       error: (err: HttpErrorResponse) => {

         this.guardando.set(false);

         this.error.set(
           this.obtenerMensajeError(err)
         );
       }
     });
   }

   // ========================================
   // 11. ELIMINAR CITA
   // ========================================

   eliminar(cita: Cita): void {

     if (this.eliminandoId() !== null || this.guardando()) {
       return;
     }

     const confirmado = window.confirm(
       `¿Está seguro de eliminar la cita N.º ${cita.id}?`
     );

     if (!confirmado) {
       return;
     }

     this.error.set('');
     this.mensaje.set('');

     this.eliminandoId.set(cita.id);

     // DELETE /api/citas/{id}
     this.citaService.eliminar(cita.id).subscribe({

       next: () => {

         this.eliminandoId.set(null);

         this.mensaje.set(
           'Cita eliminada correctamente.'
         );

         this.cargarCitas();
       },

       error: (err: HttpErrorResponse) => {

         this.eliminandoId.set(null);

         this.error.set(
           this.obtenerMensajeError(err)
         );
       }
     });
   }

   // ========================================
   // 12. MENSAJES DE ERROR
   // ========================================

   private obtenerMensajeError(
     err: HttpErrorResponse
   ): string {

     if (err.status === 0) {
       return 'No se pudo conectar con Spring Boot. Verifique que la API esté encendida.';
     }

     if (err.status === 401) {
       return 'La sesión expiró. Inicie sesión nuevamente.';
     }

     if (err.status === 403) {
       return 'No tiene permisos para realizar esta operación.';
     }

     if (err.status === 404) {
       return 'No se encontró la cita, el paciente o el médico solicitado.';
     }

     if (err.status === 409) {
       return 'No se pudo agendar la cita. El médico podría tener una cita activa en ese horario.';
     }

     // Priorizar mensajes enviados por la API.
     if (typeof err.error?.mensaje === 'string') {
       return err.error.mensaje;
     }

     if (typeof err.error?.message === 'string') {
       return err.error.message;
     }

     if (err.status === 400) {
       return 'Revise la fecha, hora y los datos ingresados.';
     }

     return 'Ocurrió un error al procesar la cita.';
   }

 }
