import { useEffect, useState } from 'react'
import { api } from '../api/api'
import { useAuth } from '../context/AuthContext'
import Modal from '../components/Modal'
import Campo from '../components/Campo'
import Mensaje from '../components/Mensaje'

const VACIO = { nombre: '', descripcion: '' }

export default function Categorias() {
  const { esAdmin } = useAuth()
  const [lista, setLista] = useState([])
  const [form, setForm] = useState(VACIO)
  const [editandoId, setEditandoId] = useState(null)
  const [modal, setModal] = useState(false)
  const [errores, setErrores] = useState({})
  const [mensaje, setMensaje] = useState({ tipo: '', texto: '' })

  const cargar = () => api.get('/categorias').then(setLista).catch((e) => setMensaje({ tipo: 'error', texto: e.message }))
  useEffect(() => { cargar() }, [])

  function abrirNuevo() {
    setForm(VACIO); setEditandoId(null); setErrores({}); setModal(true)
  }

  function abrirEditar(c) {
    setForm({ nombre: c.nombre, descripcion: c.descripcion || '' })
    setEditandoId(c.id); setErrores({}); setModal(true)
  }

  function validar() {
    const e = {}
    if (!form.nombre.trim()) e.nombre = 'El nombre es obligatorio'
    else if (form.nombre.length > 60) e.nombre = 'Máximo 60 caracteres'
    if (form.descripcion.length > 255) e.descripcion = 'Máximo 255 caracteres'
    setErrores(e)
    return Object.keys(e).length === 0
  }

  async function guardar(ev) {
    ev.preventDefault()
    if (!validar()) return
    try {
      if (editandoId) await api.put(`/categorias/${editandoId}`, form)
      else await api.post('/categorias', form)
      setModal(false)
      setMensaje({ tipo: 'exito', texto: editandoId ? 'Categoría actualizada' : 'Categoría creada' })
      cargar()
    } catch (e) {
      setErrores({ ...e.errores, general: e.message })
    }
  }

  async function eliminar(c) {
    if (!window.confirm(`¿Eliminar la categoría "${c.nombre}"?`)) return
    try {
      await api.delete(`/categorias/${c.id}`)
      setMensaje({ tipo: 'exito', texto: 'Categoría eliminada' })
      cargar()
    } catch (e) {
      setMensaje({ tipo: 'error', texto: e.message })
    }
  }

  return (
    <>
      <div className="encabezado">
        <h1>Categorías</h1>
        {esAdmin && <button className="btn btn-primario" onClick={abrirNuevo}>+ Nueva categoría</button>}
      </div>
      <Mensaje tipo={mensaje.tipo} texto={mensaje.texto} onCerrar={() => setMensaje({})} />

      <section className="panel">
        <table>
          <thead><tr><th>Nombre</th><th>Descripción</th>{esAdmin && <th className="acciones">Acciones</th>}</tr></thead>
          <tbody>
            {lista.map((c) => (
              <tr key={c.id}>
                <td>{c.nombre}</td>
                <td>{c.descripcion}</td>
                {esAdmin && (
                  <td className="acciones">
                    <button className="btn btn-secundario" onClick={() => abrirEditar(c)}>Editar</button>
                    <button className="btn btn-peligro" onClick={() => eliminar(c)}>Eliminar</button>
                  </td>
                )}
              </tr>
            ))}
            {lista.length === 0 && <tr><td colSpan={3} className="vacio">No hay categorías registradas</td></tr>}
          </tbody>
        </table>
      </section>

      <Modal titulo={editandoId ? 'Editar categoría' : 'Nueva categoría'} abierto={modal} onCerrar={() => setModal(false)}>
        <form onSubmit={guardar} noValidate>
          <Mensaje texto={errores.general} />
          <Campo etiqueta="Nombre *" error={errores.nombre}>
            <input value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} />
          </Campo>
          <Campo etiqueta="Descripción" error={errores.descripcion}>
            <textarea rows={3} value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} />
          </Campo>
          <div className="modal-pie">
            <button type="button" className="btn btn-claro" onClick={() => setModal(false)}>Cancelar</button>
            <button className="btn btn-primario">Guardar</button>
          </div>
        </form>
      </Modal>
    </>
  )
}
