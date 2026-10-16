// ==========================================
// CONFIGURACION PRINCIPAL DE ANGULAR
// SISTEMA DE CONTROL DE CITAS MEDICAS
// ==========================================

// Permite definir la configuracion general
// de nuestra aplicacion Angular.
import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection
} from '@angular/core';

// Permite configurar las rutas de navegacion.
import { provideRouter } from '@angular/router';

// Permite consumir la API REST de Spring Boot
// y registrar interceptores HTTP.
import {
  provideHttpClient,
  withInterceptors
} from '@angular/common/http';

// Importamos las rutas de la aplicacion.
import { routes } from './app.routes';

// Importamos el interceptor de seguridad JWT.
import { authInterceptor } from './interceptores/auth.interceptor';

/**
 * ==========================================
 * CONFIGURACION GENERAL DE LA APLICACION
 * ==========================================
 *
 * Este archivo configura:
 *
 * 1. Manejo global de errores del navegador.
 * 2. Deteccion de cambios de Angular 21.
 * 3. Navegacion entre las pantallas.
 * 4. Comunicacion HTTP con Spring Boot.
 * 5. Envio automatico del token JWT.
 *
 * Angular utiliza esta configuracion
 * al iniciar la aplicacion.
 */
export const appConfig: ApplicationConfig = {

  providers: [

    // ======================================
    // 1. MANEJO GLOBAL DE ERRORES
    // ======================================

    // Registra errores globales del navegador
    // para facilitar su deteccion.
    provideBrowserGlobalErrorListeners(),

    // ======================================
    // 2. DETECCION DE CAMBIOS
    // ======================================

    // Utiliza la deteccion de cambios
    // sin Zone.js de Angular 21.
    provideZonelessChangeDetection(),

    // ======================================
    // 3. CONFIGURACION DE RUTAS
    // ======================================

    // Habilita la navegacion entre Login,
    // Dashboard, Pacientes, Medicos,
    // Citas y Usuarios.
    provideRouter(routes),

    // ======================================
    // 4. CONFIGURACION HTTP Y JWT
    // ======================================

    // HttpClient permite realizar:
    // GET, POST, PUT y DELETE.
    //
    // withInterceptors registra nuestro
    // interceptor para enviar automaticamente
    // Authorization: Bearer TOKEN
    // hacia la API Spring Boot.
    provideHttpClient(
      withInterceptors([
        authInterceptor
      ])
    )

  ]
};