import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection
} from '@angular/core';

import { provideRouter } from '@angular/router';

import {
  provideHttpClient,
  withInterceptors
} from '@angular/common/http';

import { routes } from './app.routes';
import { authInterceptor } from './interceptors/auth.interceptor';

/**
 * Configuración general de Angular.
 * Aquí activamos las rutas, HttpClient
 * y el interceptor encargado del JWT.
 */
export const appConfig: ApplicationConfig = {

  providers: [

    provideBrowserGlobalErrorListeners(),

    provideZonelessChangeDetection(),

    // Activa las rutas de Angular
    provideRouter(routes),

    // Permite consumir la API REST
    // y agrega automáticamente el JWT.
    provideHttpClient(
      withInterceptors([
        authInterceptor
      ])
    )
  ]
};