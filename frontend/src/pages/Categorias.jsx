import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { api } from '../api/api'
import Modal from '../components/Modal'
import Campo from '../components/Campo'
import Mensaje from '../components/Mensaje'
import BotonAdmin from '../components/BotonAdmin'
import AvisoPermiso from '../components/AvisoPermiso'

const VACIO = { nombre: '', descripcion: '' }

// 📌 CRUD de categorías (patrón que se repite en Proveedores y Usuarios)
export default function Categorias() {
  const [params, setParams] = useSearchParams()
  const [lista, setLista] = useState([])
  const [form, setForm] = useState(VACIO)
  const [editandoId, setEditandoId] = useState(null)
  const [modal, setModal] = useState(false)
  const [errores, setErrores] = useState({})
  const [mensaje, setMensaje] = useState({ tipo: '', texto: '' })

  // READ: trae la lista desde la API
  const cargar = () => api.get('/categorias').then(setLista).catch((e) => setMensaje({ tipo: 'error', texto: e.message }))
  useEffect(() => { cargar() }, [])

  // Si se llega desde las acciones rápidas del dashboard (?nuevo=1)
  useEffect(() => {
    if (params.get('nuevo')) {
      abrirNuevo()
      setParams({}, { replace: true })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params])

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

  // CREATE o UPDATE: si hay editandoId -> PUT, si no -> POST
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

  // DELETE: pide confirmación y luego llama a la API
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
        <BotonAdmin icono={<Plus size={17} />} onClick={abrirNuevo}>Nueva categoría</BotonAdmin>
      </div>
      <AvisoPermiso texto="Como empleado puedes consultar las categorías, pero no crearlas, editarlas ni eliminarlas." />
      <Mensaje tipo={mensaje.tipo} texto={mensaje.texto} onCerrar={() => setMensaje({})} />

      <section className="panel">
        <table>
          <thead><tr><th>Nombre</th><th>Descripción</th><th className="acciones">Acciones</th></tr></thead>
          <tbody>
            {lista.map((c) => (
              <tr key={c.id}>
                <td>{c.nombre}</td>
                <td>{c.descripcion}</td>
                <td className="acciones">
                    <BotonAdmin className="btn btn-secundario" icono={<Pencil size={15} />} onClick={() => abrirEditar(c)}>Editar</BotonAdmin>
                    <BotonAdmin className="btn btn-peligro" icono={<Trash2 size={15} />} onClick={() => eliminar(c)}>Eliminar</BotonAdmin>
                  </td>
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
