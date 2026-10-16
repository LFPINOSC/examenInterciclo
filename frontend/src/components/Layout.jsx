import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
  ArrowLeftRight, BarChart3, Bell, Eye, FolderOpen, Home, Lock, LogOut, Menu, Package,
  Search, ShieldCheck, ShoppingCart, Truck, Users,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { api } from '../api/api'
import { porReabastecer } from '../utils/inventario'
import Avatar from './Avatar'

// 📌 Opciones del menú lateral. soloAdmin = el empleado la ve bloqueada con candado
const MENU = [
  { a: '/', texto: 'Inicio', icono: Home, end: true },
  { a: '/productos', texto: 'Productos', icono: Package },
  { a: '/movimientos', texto: 'Movimientos', icono: ArrowLeftRight },
  { a: '/categorias', texto: 'Categorías', icono: FolderOpen },
  { a: '/proveedores', texto: 'Proveedores', icono: Truck },
  { a: '/reportes', texto: 'Reportes', icono: BarChart3, soloAdmin: true },
  { a: '/usuarios', texto: 'Usuarios', icono: Users, soloAdmin: true },
]

// 📌 Estructura común: menú lateral + barra superior + contenido de cada página (<Outlet />)
export default function Layout() {
  const { usuario, esAdmin, cerrarSesion } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [colapsado, setColapsado] = useState(false)
  const [busqueda, setBusqueda] = useState('')
  const [alertas, setAlertas] = useState([])
  const [verAlertas, setVerAlertas] = useState(false)

  // Las notificaciones (stock bajo) se recalculan cada vez que se cambia de pantalla
  useEffect(() => {
    api.get('/productos').then((p) => setAlertas(porReabastecer(p))).catch(() => {})
    setVerAlertas(false)
  }, [location.pathname])

  // Buscador superior: lleva a Productos con ?buscar=
  function buscar(e) {
    e.preventDefault()
    navigate(`/productos?buscar=${encodeURIComponent(busqueda.trim())}`)
  }

  function salir() {
    cerrarSesion()
    navigate('/login')
  }

  return (
    <div className={`app ${colapsado ? 'colapsado' : ''}`} data-rol={usuario.rol}>
      <aside className="sidebar">
        <div className="marca">
          <span className="marca-icono"><ShoppingCart size={24} /></span>
          <div className="marca-texto">
            <strong>Inventario</strong>
            <small>Comercial</small>
          </div>
        </div>

        <nav>
          {MENU.map(({ a, texto, icono: Icono, end, soloAdmin }) =>
            soloAdmin && !esAdmin ? (
              // El empleado VE la opción pero bloqueada, para que se note la diferencia de rol
              <span key={a} className="nav-item bloqueado" title="Solo el administrador puede ver esta sección">
                <Icono size={20} /> <span className="txt">{texto}</span>
                <Lock size={15} className="candado-nav" />
              </span>
            ) : (
              <NavLink key={a} to={a} end={end} className="nav-item" title={texto}>
                <Icono size={20} /> <span className="txt">{texto}</span>
              </NavLink>
            ),
          )}
        </nav>

        <div className="usuario-tarjeta">
          <Avatar nombre={usuario.nombre} />
          <div className="usuario-info">
            <strong>{usuario.nombre}</strong>
            <span>{esAdmin ? 'Administrador' : 'Empleado de bodega'}</span>
          </div>
        </div>
        <button className="btn-salir" onClick={salir} title="Cerrar sesión">
          <LogOut size={18} /> <span className="txt">Cerrar sesión</span>
        </button>
      </aside>

      <div className="principal">
        <header className="topbar">
          <button className="btn-icono" onClick={() => setColapsado(!colapsado)} aria-label="Mostrar u ocultar menú">
            <Menu size={24} />
          </button>
          <form className="buscador-global" onSubmit={buscar}>
            <Search size={18} />
            <input
              placeholder="Buscar productos por nombre o código…"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </form>

          <div className="topbar-derecha">
            <span className="pastilla-rol" title={esAdmin ? 'Acceso total' : 'Consulta y registro de movimientos'}>
              {esAdmin ? <ShieldCheck size={16} /> : <Eye size={16} />}
              <span className="oculto-movil">{esAdmin ? 'Modo administrador' : 'Modo empleado'}</span>
            </span>

            <div className="campana">
              <button onClick={() => setVerAlertas(!verAlertas)} aria-label="Notificaciones de stock bajo">
                <Bell size={20} />
                {alertas.length > 0 && <span className="contador">{alertas.length}</span>}
              </button>
              {verAlertas && (
                <div className="desplegable">
                  <h3>{alertas.length} productos por reabastecer</h3>
                  {alertas.slice(0, 6).map((p) => (
                    <Link key={p.id} to={`/movimientos?tipo=ENTRADA&producto=${p.id}`}>
                      <span>{p.nombre}</span>
                      <span className={`etiqueta ${p.stock === 0 ? 'etiqueta-peligro' : 'etiqueta-aviso'}`}>{p.stock}</span>
                    </Link>
                  ))}
                  {alertas.length > 6 && (
                    <Link to="/productos?estado=bajo" className="enlace">Ver todos</Link>
                  )}
                </div>
              )}
            </div>
          </div>
        </header>

        {!esAdmin && (
          <div className="banner-rol">
            <Eye size={18} />
            <span>
              <strong>Modo empleado:</strong> registra las ventas (salidas) y la mercadería que llega (entradas).
              Los reportes de ganancias y crear, editar o eliminar son del administrador <Lock size={13} />.
            </span>
          </div>
        )}

        <main className="contenido">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
