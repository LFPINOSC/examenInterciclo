// Punto de entrada: verifica la sesión y enruta entre pantallas usando el
// hash de la URL (#/pacientes, #/vacunas...). Es una SPA sencilla: la página
// no se recarga, solo se reemplaza el contenido de <main>.
import { obtenerSesion, cerrarSesion } from './api.js';
import { esc } from './utils.js';
import * as inicio from './modulos/inicio.js';
import * as pacientes from './modulos/pacientes.js';
import * as aplicaciones from './modulos/aplicaciones.js';
import * as vacunas from './modulos/vacunas.js';
import * as lotes from './modulos/lotes.js';
import * as usuarios from './modulos/usuarios.js';

const sesion = obtenerSesion();
if (!sesion) location.replace('index.html');

const RUTAS = { inicio, pacientes, aplicaciones, vacunas, lotes, usuarios };
const SOLO_ADMIN = ['usuarios'];
const esAdmin = sesion?.usuario.rol === 'ADMIN';

document.getElementById('usuario-nombre').textContent = sesion?.usuario.nombre ?? '';
document.getElementById('usuario-rol').textContent = sesion?.usuario.rol === 'ADMIN' ? 'Administrador' : 'Enfermería';
document.getElementById('btn-salir').addEventListener('click', cerrarSesion);
if (!esAdmin) document.querySelectorAll('[data-solo-admin]').forEach((el) => el.remove());

async function navegar() {
  let nombre = location.hash.replace('#/', '') || 'inicio';
  if (!RUTAS[nombre] || (SOLO_ADMIN.includes(nombre) && !esAdmin)) nombre = 'inicio';

  document.querySelectorAll('.sidebar a').forEach((a) => {
    a.classList.toggle('activo', a.getAttribute('href') === `#/${nombre}`);
  });

  const contenedor = document.getElementById('contenido');
  contenedor.innerHTML = '<p class="vacio">Cargando...</p>';
  try {
    await RUTAS[nombre].render(contenedor, { esAdmin, usuario: sesion.usuario });
  } catch (err) {
    contenedor.innerHTML = `<div class="errores">${esc(err.message)}</div>`;
  }
}

if (sesion) {
  window.addEventListener('hashchange', navegar);
  navegar();
}
