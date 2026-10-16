import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Campo from '../components/Campo'
import Mensaje from '../components/Mensaje'
import { ShoppingCart } from 'lucide-react'

export default function Login() {
  const { usuario, iniciarSesion } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ username: '', password: '' })
  const [errores, setErrores] = useState({})
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(false)

  if (usuario) return <Navigate to="/" replace />

  function validar() {
    const e = {}
    if (!form.username.trim()) e.username = 'Ingrese su usuario'
    if (!form.password) e.password = 'Ingrese su contraseña'
    setErrores(e)
    return Object.keys(e).length === 0
  }

  async function enviar(ev) {
    ev.preventDefault()
    setError('')
    if (!validar()) return
    setCargando(true)
    try {
      await iniciarSesion(form.username.trim(), form.password)
      navigate('/')
    } catch (err) {
      setError(err.message)
    } finally {
      setCargando(false)
    }
  }

  return (
    <div className="login-pagina">
      <form className="login-tarjeta" onSubmit={enviar} noValidate>
        <span className="marca-icono"><ShoppingCart size={28} /></span>
        <h1>Inventario Comercial</h1>
        <p className="texto-suave">Ingrese sus credenciales para continuar</p>

        <Mensaje texto={error} />

        <Campo etiqueta="Usuario" error={errores.username}>
          <input
            autoFocus
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
          />
        </Campo>
        <Campo etiqueta="Contraseña" error={errores.password}>
          <input
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
        </Campo>

        <button className="btn btn-primario ancho" disabled={cargando}>
          {cargando ? 'Ingresando…' : 'Ingresar'}
        </button>

        {/* Atajo para la demostración: llena el formulario con una cuenta de prueba */}
        <div className="cuentas-prueba">
          <div>Cuentas de prueba:</div>
          <button type="button" onClick={() => setForm({ username: 'admin', password: 'admin123' })}>
            <span>admin / admin123</span> <span className="rol rol-admin">ADMIN</span>
          </button>
          <button type="button" onClick={() => setForm({ username: 'empleado', password: 'empleado123' })}>
            <span>empleado / empleado123</span> <span className="rol rol-empleado">EMPLEADO</span>
          </button>
        </div>
      </form>
    </div>
  )
}
