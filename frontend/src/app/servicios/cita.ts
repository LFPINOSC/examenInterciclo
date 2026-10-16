
 // ==========================================
 // SERVICIO DE CITAS MEDICAS
 // CONTROL DE CITAS MEDICAS
 // ==========================================

 // Injectable permite utilizar el servicio en Angular.
 import { Injectable, inject } from '@angular/core';

 // HttpClient consume la API REST de Spring Boot.
 import {
   HttpClient,
   HttpParams
 } from '@angular/common/http';

 // Observable representa una respuesta asincrona.
 import { Observable } from 'rxjs';

 // Modelos existentes de Pacientes y Medicos.
 import { Paciente } from './paciente';
 import { Medico } from './medico';

 // ==========================================
 // MODELO DE CITA
 // ==========================================

 /**
  * Representa una cita almacenada en PostgreSQL.
  *
  * Las relaciones paciente y medico
  * llegan como objetos desde el backend.
  */
 export interface Cita {
   id: number;
   fecha: string;
   hora: string;
   motivo: string;
   estado: string;
   paciente: Paciente;
   medico: Medico;
 }

 /**
  * Datos enviados al backend para registrar
  * o actualizar una cita.
  *
  * Utilizamos IDs para relacionar las entidades.
  */
 export interface CitaDatos {
   fecha: string;
   hora: string;
   motivo: string;
   estado: string;
   pacienteId: number;
   medicoId: number;
 }

 // ==========================================
 // SERVICIO HTTP
 // ==========================================

 /**
  * Se conecta con CitaController.java.
  *
  * GET    /api/citas
  * GET    /api/citas/{id}
  * GET    /api/citas/paciente/{id}
  * GET    /api/citas/medico/{id}
  * GET    /api/citas/fecha/{fecha}
  * POST   /api/citas
  * PUT    /api/citas/{id}
  * DELETE /api/citas/{id}
  *
  * El interceptor JWT agrega automaticamente
  * el encabezado Authorization.
  */
 @Injectable({
   providedIn: 'root'
 })
 export class CitaService {

   // Servicio HTTP de Angular.
   private readonly http = inject(HttpClient);

   // Endpoint principal de la API.
   private readonly apiUrl =
     'http://localhost:8080/api/citas';

   // ========================================
   // 1. LISTAR TODAS LAS CITAS
   // ========================================

   listar(): Observable<Cita[]> {
     return this.http.get<Cita[]>(this.apiUrl);
   }

   // ========================================
   // 2. CONSULTAR UNA CITA POR ID
   // ========================================

   buscarPorId(id: number): Observable<Cita> {
     return this.http.get<Cita>(
       `${this.apiUrl}/${id}`
     );
   }

   // ========================================
   // 3. CONSULTAR CITAS DE UN PACIENTE
   // ========================================

   buscarPorPaciente(id: number): Observable<Cita[]> {
     return this.http.get<Cita[]>(
       `${this.apiUrl}/paciente/${id}`
     );
   }

   // ========================================
   // 4. CONSULTAR CITAS DE UN MEDICO
   // ========================================

   buscarPorMedico(id: number): Observable<Cita[]> {
     return this.http.get<Cita[]>(
       `${this.apiUrl}/medico/${id}`
     );
   }

   // ========================================
   // 5. CONSULTAR CITAS POR FECHA
   // ========================================

   buscarPorFecha(fecha: string): Observable<Cita[]> {
     return this.http.get<Cita[]>(
       `${this.apiUrl}/fecha/${fecha}`
     );
   }

   // ========================================
   // 6. REGISTRAR CITA
   // ========================================

   crear(datos: CitaDatos): Observable<Cita> {
     return this.http.post<Cita>(
       this.apiUrl,
       datos
     );
   }

   // ========================================
   // 7. ACTUALIZAR CITA
   // ========================================

   actualizar(
     id: number,
     datos: CitaDatos
   ): Observable<Cita> {

     return this.http.put<Cita>(
       `${this.apiUrl}/${id}`,
       datos
     );
   }

   // ========================================
   // 8. ELIMINAR CITA
   // ========================================

   eliminar(id: number): Observable<void> {
     return this.http.delete<void>(
       `${this.apiUrl}/${id}`
     );
   }

 }
