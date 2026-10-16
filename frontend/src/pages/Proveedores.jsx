import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { api } from '../api/api'
import Modal from '../components/Modal'
import Campo from '../components/Campo'
import Mensaje from '../components/Mensaje'
import BotonAdmin from '../components/BotonAdmin'
import AvisoPermiso from '../components/AvisoPermiso'

const VACIO = { ruc: '', razonSocial: '', telefono: '', email: '', direccion: '' }

export default function Proveedores() {
  const [params, setParams] = useSearchParams()
  const [lista, setLista] = useState([])
  const [form, setForm] = useState(VACIO)
  const [editandoId, setEditandoId] = useState(null)
  const [modal, setModal] = useState(false)
  const [errores, setErrores] = useState({})
  const [mensaje, setMensaje] = useState({})

  const cargar = () => api.get('/proveedores').then(setLista).catch((e) => setMensaje({ tipo: 'error', texto: e.message }))
  useEffect(() => { cargar() }, [])

  // Si se llega desde las acciones rápidas del dashboard (?nuevo=1)
  useEffect(() => {
    if (params.get('nuevo')) {
      abrirNuevo()
      setParams({}, { replace: true })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params])

  const cambiar = (campo) => (e) => setForm({ ...form, [campo]: e.target.value })

  function abrirNuevo() {
    setForm(VACIO); setEditandoId(null); setErrores({}); setModal(true)
  }

  function abrirEditar(p) {
    setForm({
      ruc: p.ruc, razonSocial: p.razonSocial, telefono: p.telefono || '',
      email: p.email || '', direccion: p.direccion || '',
    })
    setEditandoId(p.id); setErrores({}); setModal(true)
  }

  function validar() {
    const e = {}
    if (!/^\d{13}$/.test(form.ruc)) e.ruc = 'El RUC debe tener exactamente 13 dígitos'
    if (!form.razonSocial.trim()) e.razonSocial = 'La razón social es obligatoria'
    if (form.telefono && !/^\d{7,10}$/.test(form.telefono)) e.telefono = 'Entre 7 y 10 dígitos'
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Correo no válido'
    setErrores(e)
    return Object.keys(e).length === 0
  }

  async function guardar(ev) {
    ev.preventDefault()
    if (!validar()) return
    try {
      if (editandoId) await api.put(`/proveedores/${editandoId}`, form)
      else await api.post('/proveedores', form)
      setModal(false)
      setMensaje({ tipo: 'exito', texto: editandoId ? 'Proveedor actualizado' : 'Proveedor creado' })
      cargar()
    } catch (e) {
      setErrores({ ...e.errores, general: e.message })
    }
  }

  async function eliminar(p) {
    if (!window.confirm(`¿Eliminar al proveedor "${p.razonSocial}"?`)) return
    try {
      await api.delete(`/proveedores/${p.id}`)
      setMensaje({ tipo: 'exito', texto: 'Proveedor eliminado' })
      cargar()
    } catch (e) {
      setMensaje({ tipo: 'error', texto: e.message })
    }
  }

  return (
    <>
      <div className="encabezado">
        <h1>Proveedores</h1>
        <BotonAdmin icono={<Plus size={17} />} onClick={abrirNuevo}>Nuevo proveedor</BotonAdmin>
      </div>
      <AvisoPermiso texto="Como empleado puedes consultar los proveedores, pero no crearlos, editarlos ni eliminarlos." />
      <Mensaje tipo={mensaje.tipo} texto={mensaje.texto} onCerrar={() => setMensaje({})} />

      <section className="panel">
        <table>
          <thead>
            <tr><th>RUC</th><th>Razón social</th><th>Teléfono</th><th>Correo</th><th>Dirección</th><th className="acciones">Acciones</th></tr>
          </thead>
          <tbody>
            {lista.map((p) => (
              <tr key={p.id}>
                <td>{p.ruc}</td>
                <td>{p.razonSocial}</td>
                <td>{p.telefono}</td>
                <td>{p.email}</td>
                <td>{p.direccion}</td>
                <td className="acciones">
                    <BotonAdmin className="btn btn-secundario" icono={<Pencil size={15} />} onClick={() => abrirEditar(p)}>Editar</BotonAdmin>
                    <BotonAdmin className="btn btn-peligro" icono={<Trash2 size={15} />} onClick={() => eliminar(p)}>Eliminar</BotonAdmin>
                  </td>
              </tr>
            ))}
            {lista.length === 0 && <tr><td colSpan={6} className="vacio">No hay proveedores registrados</td></tr>}
          </tbody>
        </table>
      </section>

      <Modal titulo={editandoId ? 'Editar proveedor' : 'Nuevo proveedor'} abierto={modal} onCerrar={() => setModal(false)}>
        <form onSubmit={guardar} noValidate>
          <Mensaje texto={errores.general} />
          <div className="rejilla">
            <Campo etiqueta="RUC *" error={errores.ruc}>
              <input maxLength={13} value={form.ruc} onChange={cambiar('ruc')} />
            </Campo>
            <Campo etiqueta="Teléfono" error={errores.telefono}>
              <input maxLength={10} value={form.telefono} onChange={cambiar('telefono')} />
            </Campo>
          </div>
          <Campo etiqueta="Razón social *" error={errores.razonSocial}>
            <input value={form.razonSocial} onChange={cambiar('razonSocial')} />
          </Campo>
          <Campo etiqueta="Correo" error={errores.email}>
            <input type="email" value={form.email} onChange={cambiar('email')} />
          </Campo>
          <Campo etiqueta="Dirección" error={errores.direccion}>
            <input value={form.direccion} onChange={cambiar('direccion')} />
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
