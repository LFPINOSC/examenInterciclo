// ==========================================
// COMPONENTE PRINCIPAL DE ANGULAR
// SISTEMA DE CONTROL DE CITAS MEDICAS
// ==========================================

// Permite crear componentes Angular.
import { Component } from '@angular/core';

// Permite mostrar las paginas segun la URL.
import { RouterOutlet } from '@angular/router';

/**
 * COMPONENTE PRINCIPAL
 *
 * Es el componente raiz del sistema.
 *
 * Su funcion es:
 * 1. Iniciar la interfaz principal.
 * 2. Permitir la navegacion entre paginas.
 * 3. Mostrar Login, Dashboard, Pacientes,
 *    Medicos, Citas y Usuarios.
 */
@Component({
  selector: 'app-root',

  // Permite utilizar router-outlet.
  imports: [RouterOutlet],

  // Archivo HTML principal.
  templateUrl: './app.html',

  // Archivo CSS principal.
  styleUrl: './app.css'
})
export class App {

  // Nombre de la aplicacion.
  title = 'Control de Citas Medicas';

}