
 // ==========================================
 // COMPONENTE MEDICOS
 // SISTEMA DE CONTROL DE CITAS MEDICAS
 // ==========================================

 import {
   Component,
   OnInit,
   inject,
   signal
 } from '@angular/core';

 // Permite utilizar ngModel en formularios.
 import { FormsModule } from '@angular/forms';

 // Permite regresar al dashboard.
 import { RouterLink } from '@angular/router';

 // Permite interpretar errores HTTP.
 import { HttpErrorResponse } from '@angular/common/http';

 // Servicio y modelos para consumir la API.
 import {
   MedicoService,
   Medico,
   MedicoDatos
 } from '../../servicios/medico';

 /**
  * CRUD DE MEDICOS
  *
  * Funciones:
  * - Listar medicos.
  * - Registrar medicos.
  * - Editar medicos.
  * - Eliminar medicos.
  * - Buscar por ID, nombre o especialidad.
  * - Mostrar errores y mensajes de exito.
  */
 @Component({
   selector: 'app-medicos',
   standalone: true,
   imports: [FormsModule, RouterLink],
   templateUrl: './medicos.html',
   styleUrl: './medicos.css'
 })
 export class Medicos implements OnInit {

   // ========================================
   // SERVICIO
   // ========================================

   private readonly medicoService = inject(MedicoService);

   // ========================================
   // ESTADOS DEL COMPONENTE
   // ========================================

   // Medicos obtenidos desde Spring Boot.
   medicos = signal<Medico[]>([]);

   // Estados para controlar la carga.
   cargando = signal(false);
   guardando = signal(false);
   eliminandoId = signal<number | null>(null);

   // Control de visibilidad del formulario.
   mostrarFormulario = signal(false);

   // Mensajes del sistema.
   error = signal('');
   mensaje = signal('');

   // Campo de busqueda.
   busqueda = '';

   // Identificador del medico en edicion.
   // null representa un nuevo registro.
   idEdicion: number | null = null;

   // Modelo del formulario.
   formulario: MedicoDatos = this.formularioVacio();

   // ========================================
   // 1. INICIALIZAR COMPONENTE
   // ========================================

   ngOnInit(): void {
     this.cargarMedicos();
   }

   // ========================================
   // 2. FORMULARIO VACIO
   // ========================================

   private formularioVacio(): MedicoDatos {
     return {
       nombre: '',
       apellido: '',
       especialidad: '',
       telefono: ''
     };
   }

   // ========================================
   // 3. CONSULTAR MEDICOS
   // ========================================

   cargarMedicos(): void {

     this.cargando.set(true);
     this.error.set('');

     // GET /api/medicos
     this.medicoService.listar().subscribe({

       next: (datos: Medico[]) => {
         this.medicos.set(datos);
         this.cargando.set(false);
       },

       error: (err: HttpErrorResponse) => {
         this.cargando.set(false);
         this.error.set(this.obtenerMensajeError(err));
       }
     });
   }

   // ========================================
   // 4. BUSCAR EN LA TABLA
   // ========================================

   get medicosFiltrados(): Medico[] {

     const texto = this.busqueda.trim().toLowerCase();

     if (!texto) {
       return this.medicos();
     }

     return this.medicos().filter((medico: Medico) =>
       medico.id.toString().includes(texto) ||
       medico.nombre.toLowerCase().includes(texto) ||
       medico.apellido.toLowerCase().includes(texto) ||
       medico.especialidad.toLowerCase().includes(texto) ||
       (medico.telefono || '').includes(texto)
     );
   }

   // ========================================
   // 5. NUEVO MEDICO
   // ========================================

   nuevo(): void {

     this.idEdicion = null;
     this.formulario = this.formularioVacio();

     this.error.set('');
     this.mensaje.set('');

     this.mostrarFormulario.set(true);
   }

   // ========================================
   // 6. EDITAR MEDICO
   // ========================================

   editar(medico: Medico): void {

     // Guardar el identificador original.
     this.idEdicion = medico.id;

     // Copiar datos antes de modificar.
     this.formulario = {
       nombre: medico.nombre,
       apellido: medico.apellido,
       especialidad: medico.especialidad,
       telefono: medico.telefono || ''
     };

     this.error.set('');
     this.mensaje.set('');

     this.mostrarFormulario.set(true);
   }

   // ========================================
   // 7. CANCELAR FORMULARIO
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
   // 8. GUARDAR O ACTUALIZAR MEDICO
   // ========================================

   guardar(): void {

     // Evitar peticiones duplicadas.
     if (this.guardando()) {
       return;
     }

     this.error.set('');
     this.mensaje.set('');

     // Preparar los datos para el backend.
     const datos: MedicoDatos = {
       nombre: this.formulario.nombre.trim(),
       apellido: this.formulario.apellido.trim(),
       especialidad: this.formulario.especialidad.trim(),
       telefono: this.formulario.telefono.trim()
     };

     // Validar campos obligatorios.
     if (
       !datos.nombre ||
       !datos.apellido ||
       !datos.especialidad ||
       !datos.telefono
     ) {
       this.error.set('Complete todos los campos.');
       return;
     }

     // Validar telefono.
     if (!/^[0-9+() -]{7,20}$/.test(datos.telefono)) {
       this.error.set(
         'Ingrese un teléfono válido de 7 a 20 caracteres.'
       );
       return;
     }

     this.guardando.set(true);

     // Identificar si se registra o actualiza.
     const editando = this.idEdicion !== null;

     // Seleccionar la operacion HTTP correspondiente.
     const peticion = editando
       ? this.medicoService.actualizar(this.idEdicion!, datos)
       : this.medicoService.crear(datos);

     peticion.subscribe({

       next: () => {

         this.guardando.set(false);
         this.mostrarFormulario.set(false);

         this.idEdicion = null;
         this.formulario = this.formularioVacio();

         // Confirmar la operacion.
         this.mensaje.set(
           editando
             ? 'Médico actualizado correctamente.'
             : 'Médico registrado correctamente.'
         );

         // Recargar datos actualizados.
         this.cargarMedicos();
       },

       error: (err: HttpErrorResponse) => {
         this.guardando.set(false);
         this.error.set(this.obtenerMensajeError(err));
       }
     });
   }

   // ========================================
   // 9. ELIMINAR MEDICO
   // ========================================

   eliminar(medico: Medico): void {

     // Impedir varias eliminaciones simultaneas.
     if (this.eliminandoId() !== null || this.guardando()) {
       return;
     }

     // Solicitar confirmacion al usuario.
     const confirmado = window.confirm(
       `¿Desea eliminar al médico ${medico.nombre} ${medico.apellido}?`
     );

     if (!confirmado) {
       return;
     }

     this.error.set('');
     this.mensaje.set('');
     this.eliminandoId.set(medico.id);

     // DELETE /api/medicos/{id}
     this.medicoService.eliminar(medico.id).subscribe({

       next: () => {
         this.eliminandoId.set(null);
         this.mensaje.set('Médico eliminado correctamente.');
         this.cargarMedicos();
       },

       error: (err: HttpErrorResponse) => {
         this.eliminandoId.set(null);
         this.error.set(this.obtenerMensajeError(err));
       }
     });
   }

   // ========================================
   // 10. MANEJAR ERRORES DEL BACKEND
   // ========================================

   private obtenerMensajeError(err: HttpErrorResponse): string {

     if (err.status === 0) {
       return 'No se pudo conectar con Spring Boot. Verifique que la API esté encendida.';
     }

     if (err.status === 401) {
       return 'La sesión ha expirado o el token no es válido.';
     }

     if (err.status === 403) {
       return 'No tiene permisos para realizar esta operación.';
     }

     if (err.status === 404) {
       return 'El médico solicitado no existe.';
     }

     if (err.status === 409) {
       return 'No se puede completar la operación. El médico puede tener citas asociadas.';
     }

     // Utilizar un mensaje del backend, si existe.
     if (typeof err.error?.mensaje === 'string') {
       return err.error.mensaje;
     }

     if (typeof err.error?.message === 'string') {
       return err.error.message;
     }

     if (err.status === 400) {
       return 'Verifique la información ingresada.';
     }

     return 'Ocurrió un error al procesar la solicitud.';
   }

 }
