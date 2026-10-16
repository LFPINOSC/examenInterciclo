import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Layout() {
  const { usuario, esAdmin, cerrarSesion } = useAuth()
  const navigate = useNavigate()

  function salir() {
    cerrarSesion()
    navigate('/login')
  }

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="marca">
          <span className="marca-icono">▣</span>
          <div>
            <strong>Inventario</strong>
            <small>Comercial</small>
          </div>
        </div>

        <nav>
          <NavLink to="/" end>Inicio</NavLink>
          <NavLink to="/productos">Productos</NavLink>
          <NavLink to="/movimientos">Movimientos</NavLink>
          <NavLink to="/categorias">Categorías</NavLink>
          <NavLink to="/proveedores">Proveedores</NavLink>
          {esAdmin && <NavLink to="/usuarios">Usuarios</NavLink>}
        </nav>

        <div className="sesion">
          <div>
            <strong>{usuario.nombre}</strong>
            <span className={`rol rol-${usuario.rol.toLowerCase()}`}>{usuario.rol}</span>
          </div>
          <button className="btn btn-claro" onClick={salir}>Cerrar sesión</button>
        </div>
      </aside>

      <main className="contenido">
        <Outlet />
      </main>
    </div>
  )
}
