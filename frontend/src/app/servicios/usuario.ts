
 // ==========================================
 // SERVICIO DE USUARIOS
 // CONTROL DE CITAS MEDICAS
 // ==========================================

 // Permite crear un servicio disponible en Angular.
 import { Injectable, inject } from '@angular/core';

 // Permite realizar solicitudes HTTP a Spring Boot.
 import { HttpClient } from '@angular/common/http';

 // Representa las respuestas asincronas.
 import { Observable } from 'rxjs';

 // ==========================================
 // MODELO DE USUARIO
 // ==========================================

 /**
  * Datos que devuelve UsuarioController.
  *
  * La contraseña NO aparece en las respuestas.
  */
 export interface Usuario {
   id: number;
   username: string;
   rol: string;
   activo: boolean;
 }

 /**
  * Datos enviados al registrar un usuario.
  * El backend asigna RECEPCIONISTA inicialmente.
  */
 export interface RegistroUsuarioDatos {
   username: string;
   password: string;
 }

 /**
  * Datos enviados al modificar una cuenta.
  */
 export interface ActualizarUsuarioDatos {
   username: string;
   rol: string;
   activo: boolean;
 }

 /**
  * Datos para cambiar la contraseña.
  */
 export interface CambiarPasswordDatos {
   nuevaPassword: string;
 }

 // ==========================================
 // SERVICIO HTTP
 // ==========================================

 /**
  * Consume UsuarioController.java.
  *
  * GET    /api/usuarios
  * GET    /api/usuarios/{id}
  * POST   /api/usuarios
  * PUT    /api/usuarios/{id}
  * PUT    /api/usuarios/{id}/password
  * DELETE /api/usuarios/{id}
  *
  * Solo los administradores tienen acceso.
  * El interceptor envia automaticamente el JWT.
  */
 @Injectable({
   providedIn: 'root'
 })
 export class UsuarioService {

   private readonly http = inject(HttpClient);

   // Direccion de nuestra API REST.
   private readonly apiUrl =
     'http://localhost:8080/api/usuarios';

   // ========================================
   // 1. LISTAR USUARIOS
   // ========================================

   listar(): Observable<Usuario[]> {
     return this.http.get<Usuario[]>(this.apiUrl);
   }

   // ========================================
   // 2. BUSCAR USUARIO POR ID
   // ========================================

   buscarPorId(id: number): Observable<Usuario> {
     return this.http.get<Usuario>(
       `${this.apiUrl}/${id}`
     );
   }

   // ========================================
   // 3. REGISTRAR USUARIO
   // ========================================

   registrar(
     datos: RegistroUsuarioDatos
   ): Observable<Usuario> {

     return this.http.post<Usuario>(
       this.apiUrl,
       datos
     );
   }

   // ========================================
   // 4. ACTUALIZAR CUENTA Y ROL
   // ========================================

   actualizar(
     id: number,
     datos: ActualizarUsuarioDatos
   ): Observable<Usuario> {

     return this.http.put<Usuario>(
       `${this.apiUrl}/${id}`,
       datos
     );
   }

   // ========================================
   // 5. CAMBIAR CONTRASEÑA
   // ========================================

   cambiarPassword(
     id: number,
     nuevaPassword: string
   ): Observable<unknown> {

     const datos: CambiarPasswordDatos = {
       nuevaPassword
     };

     return this.http.put<unknown>(
       `${this.apiUrl}/${id}/password`,
       datos
     );
   }

   // ========================================
   // 6. ELIMINAR USUARIO
   // ========================================

   eliminar(id: number): Observable<void> {

     return this.http.delete<void>(
       `${this.apiUrl}/${id}`
     );
   }

 }
