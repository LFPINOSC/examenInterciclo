import { useEffect, useState } from 'react'
import { api } from '../api/api'
import { useAuth } from '../context/AuthContext'
import Modal from '../components/Modal'
import Campo from '../components/Campo'
import Mensaje from '../components/Mensaje'
import { fecha } from '../utils/formato'

const VACIO = { nombre: '', username: '', password: '', rol: 'EMPLEADO', activo: true }

// 📌 CRUD de usuarios (solo ADMIN). Al editar, la contraseña es opcional
export default function Usuarios() {
  const { usuario: sesion } = useAuth()
  const [lista, setLista] = useState([])
  const [form, setForm] = useState(VACIO)
  const [editandoId, setEditandoId] = useState(null)
  const [modal, setModal] = useState(false)
  const [errores, setErrores] = useState({})
  const [mensaje, setMensaje] = useState({})

  const cargar = () => api.get('/usuarios').then(setLista).catch((e) => setMensaje({ tipo: 'error', texto: e.message }))
  useEffect(() => { cargar() }, [])

  const cambiar = (campo) => (e) =>
    setForm({ ...form, [campo]: e.target.type === 'checkbox' ? e.target.checked : e.target.value })

  function abrirNuevo() {
    setForm(VACIO); setEditandoId(null); setErrores({}); setModal(true)
  }

  function abrirEditar(u) {
    setForm({ nombre: u.nombre, username: u.username, password: '', rol: u.rol, activo: u.activo })
    setEditandoId(u.id); setErrores({}); setModal(true)
  }

  function validar() {
    const e = {}
    if (!form.nombre.trim()) e.nombre = 'El nombre es obligatorio'
    if (form.username.trim().length < 4) e.username = 'Mínimo 4 caracteres'
    else if (/\s/.test(form.username)) e.username = 'No debe contener espacios'
    if (!editandoId && form.password.length < 6) e.password = 'Mínimo 6 caracteres'
    if (editandoId && form.password && form.password.length < 6) e.password = 'Mínimo 6 caracteres'
    setErrores(e)
    return Object.keys(e).length === 0
  }

  async function guardar(ev) {
    ev.preventDefault()
    if (!validar()) return
    try {
      if (editandoId) await api.put(`/usuarios/${editandoId}`, form)
      else await api.post('/usuarios', form)
      setModal(false)
      setMensaje({ tipo: 'exito', texto: editandoId ? 'Usuario actualizado' : 'Usuario creado' })
      cargar()
    } catch (e) {
      setErrores({ ...e.errores, general: e.message })
    }
  }

  async function eliminar(u) {
    if (!window.confirm(`¿Eliminar al usuario "${u.username}"?`)) return
    try {
      await api.delete(`/usuarios/${u.id}`)
      setMensaje({ tipo: 'exito', texto: 'Usuario eliminado' })
      cargar()
    } catch (e) {
      setMensaje({ tipo: 'error', texto: e.message })
    }
  }

  return (
    <>
      <div className="encabezado">
        <h1>Usuarios</h1>
        <button className="btn btn-primario" onClick={abrirNuevo}>+ Nuevo usuario</button>
      </div>
      <Mensaje tipo={mensaje.tipo} texto={mensaje.texto} onCerrar={() => setMensaje({})} />

      <section className="panel">
        <table>
          <thead>
            <tr><th>Nombre</th><th>Usuario</th><th>Rol</th><th>Estado</th><th>Creado</th><th className="acciones">Acciones</th></tr>
          </thead>
          <tbody>
            {lista.map((u) => (
              <tr key={u.id} className={u.activo ? '' : 'inactivo'}>
                <td>{u.nombre}</td>
                <td>{u.username}</td>
                <td><span className={`rol rol-${u.rol.toLowerCase()}`}>{u.rol}</span></td>
                <td>{u.activo ? 'Activo' : 'Inactivo'}</td>
                <td>{fecha(u.fechaCreacion)}</td>
                <td className="acciones">
                  <button className="btn btn-secundario" onClick={() => abrirEditar(u)}>Editar</button>
                  {u.username !== sesion.username && (
                    <button className="btn btn-peligro" onClick={() => eliminar(u)}>Eliminar</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <Modal titulo={editandoId ? 'Editar usuario' : 'Nuevo usuario'} abierto={modal} onCerrar={() => setModal(false)}>
        <form onSubmit={guardar} noValidate>
          <Mensaje texto={errores.general} />
          <Campo etiqueta="Nombre completo *" error={errores.nombre}>
            <input value={form.nombre} onChange={cambiar('nombre')} />
          </Campo>
          <div className="rejilla">
            <Campo etiqueta="Usuario *" error={errores.username}>
              <input value={form.username} onChange={cambiar('username')} />
            </Campo>
            <Campo etiqueta="Rol *" error={errores.rol}>
              <select value={form.rol} onChange={cambiar('rol')}>
                <option value="EMPLEADO">EMPLEADO</option>
                <option value="ADMIN">ADMIN</option>
              </select>
            </Campo>
          </div>
          <Campo etiqueta={editandoId ? 'Nueva contraseña (dejar vacío para no cambiar)' : 'Contraseña *'} error={errores.password}>
            <input type="password" value={form.password} onChange={cambiar('password')} />
          </Campo>
          <label className="check">
            <input type="checkbox" checked={form.activo} onChange={cambiar('activo')} /> Usuario activo
          </label>
          <div className="modal-pie">
            <button type="button" className="btn btn-claro" onClick={() => setModal(false)}>Cancelar</button>
            <button className="btn btn-primario">Guardar</button>
          </div>
        </form>
      </Modal>
    </>
  )
}
