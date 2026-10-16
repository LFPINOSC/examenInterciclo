// Gestión de usuarios del sistema (solo ADMIN)
import { api } from '../api.js';
import { abrirModal } from '../modal.js';
import { esc, formatoFecha, opciones, validarFormulario, mostrarErrores, toast, confirmar } from '../utils.js';

let contexto;
let roles = [];

const NOMBRE_ROL = { ADMIN: 'Administrador', ENFERMERO: 'Enfermería' };

export async function render(contenedor, ctx) {
  contexto = ctx;
  roles = await api('/roles');
  contenedor.innerHTML = `
    <div class="encabezado">
      <div><h1>Usuarios</h1><p>Personal con acceso al sistema</p></div>
      <button class="btn" id="btn-nuevo">+ Nuevo usuario</button>
    </div>
    <div class="tabla-contenedor">
      <table>
        <thead><tr><th>Nombre</th><th>Correo</th><th>Rol</th><th>Estado</th><th>Creado</th><th></th></tr></thead>
        <tbody id="filas"></tbody>
      </table>
    </div>`;

  contenedor.querySelector('#btn-nuevo').addEventListener('click', () => abrirFormulario());
  contenedor.querySelector('#filas').addEventListener('click', async (e) => {
    const boton = e.target.closest('button[data-accion]');
    if (!boton) return;
    const id = Number(boton.dataset.id);
    if (boton.dataset.accion === 'editar') abrirFormulario(await api(`/usuarios/${id}`));
    if (boton.dataset.accion === 'eliminar') {
      if (!confirmar(`¿Eliminar al usuario ${boton.dataset.nombre}?`)) return;
      try {
        await api(`/usuarios/${id}`, { metodo: 'DELETE' });
        toast('Usuario eliminado', 'exito');
        cargar();
      } catch (err) {
        toast(err.message, 'error');
      }
    }
  });
  await cargar();
}

async function cargar() {
  const usuarios = await api('/usuarios');
  document.getElementById('filas').innerHTML = usuarios.map((u) => `
    <tr>
      <td><strong>${esc(u.nombre)}</strong>${u.id === contexto.usuario.id ? ' <span class="chip info">Usted</span>' : ''}</td>
      <td>${esc(u.email)}</td>
      <td>${esc(NOMBRE_ROL[u.rol] || u.rol)}</td>
      <td><span class="chip ${u.activo ? 'ok' : 'gris'}">${u.activo ? 'Activo' : 'Inactivo'}</span></td>
      <td>${formatoFecha(u.creado_en)}</td>
      <td class="acciones">
        <button class="btn secundario chico" data-accion="editar" data-id="${u.id}">Editar</button>
        ${u.id !== contexto.usuario.id ? `<button class="btn peligro chico" data-accion="eliminar" data-id="${u.id}" data-nombre="${esc(u.nombre)}">Eliminar</button>` : ''}
      </td>
    </tr>`).join('');
}

function abrirFormulario(usuario = null) {
  const u = usuario || { rol_id: roles.find((r) => r.nombre === 'ENFERMERO')?.id, activo: 1 };
  abrirModal({
    titulo: usuario ? 'Editar usuario' : 'Nuevo usuario',
    cuerpo: `
      <div class="campo">
        <label for="nombre">Nombre completo <span class="req">*</span></label>
        <input id="nombre" name="nombre" required minlength="3" maxlength="100" value="${esc(u.nombre)}">
      </div>
      <div class="campo">
        <label for="email">Correo <span class="req">*</span></label>
        <input id="email" name="email" type="email" required maxlength="120" value="${esc(u.email)}">
      </div>
      <div class="fila">
        <div class="campo">
          <label for="rol_id">Rol <span class="req">*</span></label>
          <select id="rol_id" name="rol_id" required>
            ${opciones(roles, u.rol_id, { texto: (r) => NOMBRE_ROL[r.nombre] || r.nombre, vacio: 'Seleccione...' })}
          </select>
        </div>
        <div class="campo">
          <label for="activo">Estado</label>
          <select id="activo" name="activo">
            <option value="1" ${u.activo ? 'selected' : ''}>Activo</option>
            <option value="0" ${!u.activo ? 'selected' : ''}>Inactivo</option>
          </select>
        </div>
      </div>
      <div class="campo">
        <label for="password">Contraseña ${usuario ? '' : '<span class="req">*</span>'}</label>
        <input id="password" name="password" type="password" autocomplete="new-password" ${usuario ? '' : 'required'} minlength="8">
        <small>${usuario ? 'Déjela vacía para mantener la actual. ' : ''}Mínimo 8 caracteres, con letras y números.</small>
      </div>`,
    async alGuardar(form, cajaErrores) {
      const { datos, errores } = validarFormulario(form, [{
        campo: 'password',
        valida: (v) => (usuario && !v) || (v.length >= 8 && /\d/.test(v) && /[A-Za-z]/.test(v)),
        mensaje: 'La contraseña debe tener mínimo 8 caracteres, con letras y números',
      }]);
      if (errores.length) {
        mostrarErrores(cajaErrores, ['Revise los campos marcados', ...errores]);
        return false;
      }
      datos.activo = datos.activo === '1';
      if (usuario) await api(`/usuarios/${usuario.id}`, { metodo: 'PUT', datos });
      else await api('/usuarios', { metodo: 'POST', datos });
      toast(usuario ? 'Usuario actualizado' : 'Usuario creado', 'exito');
      await cargar();
    },
  });
}
