
 // ==========================================
 // COMPONENTE USUARIOS
 // CONTROL DE CITAS MEDICAS
 // ==========================================

 // Herramientas para construir el componente.
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

 // Servicio del modulo de usuarios.
 import {
   UsuarioService,
   Usuario,
   RegistroUsuarioDatos,
   ActualizarUsuarioDatos
 } from '../../servicios/usuario';

 // Servicio para identificar la cuenta actual.
 import { Auth } from '../../servicios/auth';

 /**
  * MODULO DE ADMINISTRACION DE USUARIOS
  *
  * FUNCIONES:
  * 1. Listar usuarios registrados.
  * 2. Registrar nuevos usuarios.
  * 3. Editar nombre, rol y estado.
  * 4. Activar o desactivar cuentas.
  * 5. Cambiar contraseñas.
  * 6. Eliminar usuarios.
  * 7. Buscar y filtrar registros.
  */
 @Component({
   selector: 'app-usuarios',
   standalone: true,
   imports: [FormsModule, RouterLink],
   templateUrl: './usuarios.html',
   styleUrl: './usuarios.css'
 })
 export class Usuarios implements OnInit {

   // ========================================
   // INYECTAR SERVICIOS
   // ========================================

   private readonly usuarioService = inject(UsuarioService);
   private readonly auth = inject(Auth);

   // ========================================
   // LISTAS Y ESTADOS
   // ========================================

   usuarios = signal<Usuario[]>([]);

   cargando = signal(false);
   guardando = signal(false);
   guardandoClave = signal(false);
   eliminandoId = signal<number | null>(null);

   mostrarFormulario = signal(false);

   error = signal('');
   mensaje = signal('');

   // Buscador de usuarios.
   busqueda = '';

   // ID en edicion. null significa registro.
   idEdicion: number | null = null;

   // Formulario para registrar o editar.
   formulario = {
     username: '',
     password: '',
     rol: 'RECEPCIONISTA',
     activo: true
   };

   // Usuario al que se cambiara la contraseña.
   usuarioClave: Usuario | null = null;

   // Datos temporales del cambio de contraseña.
   nuevaPassword = '';
   confirmarPassword = '';

   // ========================================
   // INICIALIZAR EL COMPONENTE
   // ========================================

   ngOnInit(): void {
     this.cargarUsuarios();
   }

   // ========================================
   // 1. LISTAR USUARIOS
   // ========================================

   /**
    * GET /api/usuarios
    *
    * Obtiene los usuarios desde Spring Boot.
    */
   cargarUsuarios(): void {

     this.cargando.set(true);
     this.error.set('');

     this.usuarioService.listar().subscribe({

       next: (datos: Usuario[]) => {
         this.usuarios.set(datos);
         this.cargando.set(false);
       },

       error: (err: HttpErrorResponse) => {
         this.cargando.set(false);
         this.error.set(this.obtenerError(err));
       }
     });
   }

   // ========================================
   // 2. BUSCAR USUARIOS
   // ========================================

   /**
    * Filtra por ID, nombre, rol o estado.
    */
   get usuariosFiltrados(): Usuario[] {

     const texto = this.busqueda.trim().toLowerCase();

     if (!texto) {
       return this.usuarios();
     }

     return this.usuarios().filter(usuario => {

       const estado = usuario.activo
         ? 'activo'
         : 'inactivo';

       return (
         usuario.id.toString().includes(texto) ||
         usuario.username.toLowerCase().includes(texto) ||
         usuario.rol.toLowerCase().includes(texto) ||
         estado.includes(texto)
       );
     });
   }

   // ========================================
   // 3. IDENTIFICAR MI CUENTA
   // ========================================

   /**
    * Identifica la cuenta utilizada para
    * iniciar sesion y evita que desde esta
    * pantalla se elimine a si misma.
    */
   esMiCuenta(usuario: Usuario): boolean {
     return usuario.username === this.auth.obtenerUsuario();
   }

   // ========================================
   // 4. NUEVO USUARIO
   // ========================================

   nuevo(): void {

     this.idEdicion = null;

     this.formulario = {
       username: '',
       password: '',
       rol: 'RECEPCIONISTA',
       activo: true
     };

     this.usuarioClave = null;
     this.error.set('');
     this.mensaje.set('');

     this.mostrarFormulario.set(true);
   }

   // ========================================
   // 5. EDITAR USUARIO
   // ========================================

   editar(usuario: Usuario): void {

     // Evitar modificar la cuenta actual
     // mediante este formulario.
     if (this.esMiCuenta(usuario)) {
       this.error.set(
         'No modifique su propia cuenta desde esta pantalla.'
       );
       return;
     }

     this.idEdicion = usuario.id;

     // Cargar datos del usuario seleccionado.
     this.formulario = {
       username: usuario.username,
       password: '',
       rol: usuario.rol,
       activo: usuario.activo
     };

     this.usuarioClave = null;
     this.error.set('');
     this.mensaje.set('');

     this.mostrarFormulario.set(true);
   }

   // ========================================
   // 6. CANCELAR FORMULARIO
   // ========================================

   cancelar(): void {

     if (this.guardando()) {
       return;
     }

     this.mostrarFormulario.set(false);
     this.idEdicion = null;
     this.error.set('');
   }

   // ========================================
   // 7. GUARDAR USUARIO
   // ========================================

   /**
    * Registra o modifica usuarios.
    *
    * POST /api/usuarios
    * PUT  /api/usuarios/{id}
    */
   guardar(): void {

     if (this.guardando()) {
       return;
     }

     this.error.set('');
     this.mensaje.set('');

     const username = this.formulario.username.trim();

     if (!username) {
       this.error.set('Ingrese un nombre de usuario.');
       return;
     }

     // ======================================
     // REGISTRAR UN NUEVO USUARIO
     // ======================================

     if (this.idEdicion === null) {

       const password = this.formulario.password;

       if (password.length < 8) {
         this.error.set(
           'La contraseña debe tener al menos 8 caracteres.'
         );
         return;
       }

       const datos: RegistroUsuarioDatos = {
         username,
         password
       };

       this.guardando.set(true);

       this.usuarioService.registrar(datos).subscribe({

         next: () => {

           this.guardando.set(false);
           this.mostrarFormulario.set(false);

           this.mensaje.set(
             'Usuario registrado correctamente con rol RECEPCIONISTA.'
           );

           this.cargarUsuarios();
         },

         error: (err: HttpErrorResponse) => {
           this.guardando.set(false);
           this.error.set(this.obtenerError(err));
         }
       });

       return;
     }

     // ======================================
     // ACTUALIZAR UN USUARIO EXISTENTE
     // ======================================

     const datos: ActualizarUsuarioDatos = {
       username,
       rol: this.formulario.rol,
       activo: this.formulario.activo
     };

     this.guardando.set(true);

     this.usuarioService.actualizar(
       this.idEdicion,
       datos
     ).subscribe({

       next: () => {

         this.guardando.set(false);
         this.mostrarFormulario.set(false);
         this.idEdicion = null;

         this.mensaje.set(
           'Usuario actualizado correctamente.'
         );

         this.cargarUsuarios();
       },

       error: (err: HttpErrorResponse) => {
         this.guardando.set(false);
         this.error.set(this.obtenerError(err));
       }
     });
   }

   // ========================================
   // 8. ABRIR CAMBIO DE CONTRASEÑA
   // ========================================

   abrirCambioPassword(usuario: Usuario): void {

     this.usuarioClave = usuario;

     this.nuevaPassword = '';
     this.confirmarPassword = '';

     this.mostrarFormulario.set(false);
     this.error.set('');
     this.mensaje.set('');
   }

   // ========================================
   // 9. CANCELAR CAMBIO DE CONTRASEÑA
   // ========================================

   cancelarCambioPassword(): void {

     if (this.guardandoClave()) {
       return;
     }

     this.usuarioClave = null;
     this.nuevaPassword = '';
     this.confirmarPassword = '';
     this.error.set('');
   }

   // ========================================
   // 10. GUARDAR NUEVA CONTRASEÑA
   // ========================================

   /**
    * PUT /api/usuarios/{id}/password
    *
    * La contraseña se envia al backend
    * y alli se debe almacenar cifrada.
    */
   cambiarPassword(): void {

     if (!this.usuarioClave || this.guardandoClave()) {
       return;
     }

     this.error.set('');
     this.mensaje.set('');

     if (this.nuevaPassword.length < 8) {
       this.error.set(
         'La nueva contraseña debe tener al menos 8 caracteres.'
       );
       return;
     }

     if (this.nuevaPassword !== this.confirmarPassword) {
       this.error.set(
         'Las contraseñas no coinciden.'
       );
       return;
     }

     const id = this.usuarioClave.id;

     this.guardandoClave.set(true);

     this.usuarioService.cambiarPassword(
       id,
       this.nuevaPassword
     ).subscribe({

       next: () => {

         this.guardandoClave.set(false);
         this.usuarioClave = null;

         this.nuevaPassword = '';
         this.confirmarPassword = '';

         this.mensaje.set(
           'Contraseña actualizada correctamente.'
         );
       },

       error: (err: HttpErrorResponse) => {

         this.guardandoClave.set(false);
         this.error.set(this.obtenerError(err));
       }
     });
   }

   // ========================================
   // 11. ELIMINAR USUARIO
   // ========================================

   eliminar(usuario: Usuario): void {

     // No permitir la eliminacion de la
     // cuenta con la que se inicio sesion.
     if (this.esMiCuenta(usuario)) {
       this.error.set(
         'No puede eliminar su propia cuenta.'
       );
       return;
     }

     if (this.eliminandoId() !== null) {
       return;
     }

     const confirmado = window.confirm(
       `¿Desea eliminar al usuario ${usuario.username}?`
     );

     if (!confirmado) {
       return;
     }

     this.error.set('');
     this.mensaje.set('');
     this.eliminandoId.set(usuario.id);

     this.usuarioService.eliminar(usuario.id).subscribe({

       next: () => {

         this.eliminandoId.set(null);

         this.mensaje.set(
           'Usuario eliminado correctamente.'
         );

         this.cargarUsuarios();
       },

       error: (err: HttpErrorResponse) => {

         this.eliminandoId.set(null);
         this.error.set(this.obtenerError(err));
       }
     });
   }

   // ========================================
   // 12. MANEJO DE ERRORES HTTP
   // ========================================

   private obtenerError(
     err: HttpErrorResponse
   ): string {

     if (err.status === 0) {
       return 'No se pudo conectar con Spring Boot.';
     }

     if (err.status === 401) {
       return 'Su sesión ha expirado. Inicie sesión nuevamente.';
     }

     if (err.status === 403) {
       return 'Esta operación solo está permitida para administradores.';
     }

     if (err.status === 404) {
       return 'El usuario solicitado no existe.';
     }

     if (err.status === 409) {
       return 'El nombre de usuario ya existe o hay un conflicto de datos.';
     }

     if (typeof err.error?.mensaje === 'string') {
       return err.error.mensaje;
     }

     if (typeof err.error?.message === 'string') {
       return err.error.message;
     }

     if (err.status === 400) {
       return 'Revise los datos ingresados.';
     }

     return 'Ocurrió un error al procesar la solicitud.';
   }

 }
