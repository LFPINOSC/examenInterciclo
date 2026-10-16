import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts'
import {
  AlertTriangle, ArrowDownToLine, ArrowUpFromLine, Box, CalendarDays, DollarSign, FolderOpen,
  FolderPlus, History, PackagePlus, RefreshCw, ShoppingCart, Truck, Lock, BarChart3, Receipt, TrendingUp,
} from 'lucide-react'
import { api } from '../api/api'
import { useAuth } from '../context/AuthContext'
import Mensaje from '../components/Mensaje'
import Kpi from '../components/Kpi'
import { dinero, fecha } from '../utils/formato'
import { ESTADOS, estadoProducto, porReabastecer } from '../utils/inventario'

const COLORES_CATEGORIA = ['#2f6fed', '#ef4444', '#f5b301', '#1b9a4b', '#06b6d4', '#8b5cf6']
const DIAS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

// 📌 Inicio: indicadores, gráficos y tablas. TODO sale de la API real
export default function Dashboard() {
  const { usuario, esAdmin } = useAuth()
  const navigate = useNavigate()
  const [productos, setProductos] = useState([])
  const [movimientos, setMovimientos] = useState([])
  const [categorias, setCategorias] = useState([])
  const [proveedores, setProveedores] = useState([])
  const [resumen, setResumen] = useState(null)
  const [ventasHoy, setVentasHoy] = useState(null)
  const [error, setError] = useState('')

  // useEffect con [] = se ejecuta una vez al abrir la página
  useEffect(() => {
    // Todas las cifras salen de la API real (PostgreSQL), nada es simulado
    Promise.all([
      api.get('/productos'), api.get('/movimientos'), api.get('/categorias'),
      api.get('/proveedores'), api.get('/resumen'),
    ])
      .then(([p, m, c, pr, r]) => {
        setProductos(p); setMovimientos(m); setCategorias(c); setProveedores(pr); setResumen(r)
      })
      .catch((e) => setError(e.message))
    // Las ganancias solo las puede pedir el ADMIN (el backend responde 403 al empleado)
    if (esAdmin) api.get('/reportes/ventas?dias=1').then(setVentasHoy).catch(() => {})
  }, [esAdmin])

  const reabastecer = useMemo(() => porReabastecer(productos), [productos])
  const sinStock = productos.filter((p) => p.activo && p.stock === 0).length
  const activos = productos.filter((p) => p.activo).length

  // Para el EMPLEADO: sus propias ventas (salidas) de hoy
  const misVentasHoy = useMemo(() => {
    const hoy = new Date().toDateString()
    const mias = movimientos.filter((m) => m.tipo === 'SALIDA' && m.usuario.username === usuario.username
      && new Date(m.fecha).toDateString() === hoy)
    return {
      ventas: mias.length,
      unidades: mias.reduce((s, m) => s + m.cantidad, 0),
      total: mias.reduce((s, m) => s + Number(m.total || 0), 0),
    }
  }, [movimientos, usuario.username])

  // Gráfico de barras: unidades que entraron y salieron en los últimos 7 días
  // useMemo = guarda el cálculo y solo lo repite si cambian los datos
  const ultimos7 = useMemo(() => {
    const dias = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date()
      d.setHours(0, 0, 0, 0)
      d.setDate(d.getDate() - i)
      dias.push({ clave: d.toDateString(), dia: DIAS[d.getDay()], Entradas: 0, Salidas: 0 })
    }
    movimientos.forEach((m) => {
      const fila = dias.find((d) => d.clave === new Date(m.fecha).toDateString())
      if (fila) fila[m.tipo === 'ENTRADA' ? 'Entradas' : 'Salidas'] += m.cantidad
    })
    return dias
  }, [movimientos])

  // Dona 1: productos por categoría (las 5 con más productos + "Otros")
  const porCategoria = useMemo(() => {
    const conteo = {}
    productos.forEach((p) => { conteo[p.categoria.nombre] = (conteo[p.categoria.nombre] || 0) + 1 })
    const orden = Object.entries(conteo).sort((a, b) => b[1] - a[1])
    const top = orden.slice(0, 5).map(([nombre, valor]) => ({ nombre, valor }))
    const otros = orden.slice(5).reduce((s, [, v]) => s + v, 0)
    if (otros) top.push({ nombre: 'Otros', valor: otros })
    return top
  }, [productos])

  // Dona 2: estado del inventario
  const porEstado = useMemo(() => {
    const conteo = { ok: 0, bajo: 0, 'sin-stock': 0, inactivo: 0 }
    productos.forEach((p) => { conteo[estadoProducto(p)]++ })
    return Object.entries(conteo).map(([clave, valor]) => ({ clave, nombre: ESTADOS[clave].texto, valor, color: ESTADOS[clave].color }))
  }, [productos])

  const textoFecha = new Date().toLocaleDateString('es-EC', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  const hoy = textoFecha.charAt(0).toUpperCase() + textoFecha.slice(1)
  const primerNombre = usuario.nombre.split(' ')[0]

  // admin: true -> bloqueada para el empleado
  const acciones = [
    { texto: 'Nuevo producto', icono: PackagePlus, color: 'c-rojo', a: '/productos?nuevo=1', admin: true },
    { texto: 'Registrar venta', icono: ArrowUpFromLine, color: 'c-verde', a: '/movimientos?tipo=SALIDA' },
    { texto: 'Registrar entrada', icono: ArrowDownToLine, color: 'c-azul', a: '/movimientos?tipo=ENTRADA' },
    { texto: 'Nueva categoría', icono: FolderPlus, color: 'c-ambar', a: '/categorias?nuevo=1', admin: true },
    { texto: 'Reporte de ventas', icono: BarChart3, color: 'c-morado', a: '/reportes', admin: true },
    { texto: 'Ver kardex', icono: History, color: 'c-gris', a: '/movimientos' },
  ]

  return (
    <>
      <div className="encabezado">
        <div>
          <h1>Dashboard</h1>
          <p>
            Bienvenido, <strong>{primerNombre}</strong>.{' '}
            {esAdmin
              ? 'Aquí tienes el resumen de tu inventario.'
              : 'Aquí tienes el resumen del inventario para tu turno.'}
          </p>
        </div>
        <div className="fecha-tarjeta"><CalendarDays size={18} /> {hoy}</div>
      </div>
      <Mensaje texto={error} />

      <div className="kpis">
        <Kpi color="azul" icono={Box} titulo="Productos" valor={productos.length} detalle={`${activos} activos`} />
        <Kpi color="rojo" icono={AlertTriangle} titulo="Stock bajo" valor={reabastecer.length} detalle={`${sinStock} sin stock`} />
        {esAdmin ? (
          <>
            <Kpi color="verde" icono={Receipt} titulo="Ventas de hoy"
                 valor={ventasHoy ? dinero(ventasHoy.totales.ingresos) : '—'}
                 detalle={ventasHoy ? `${ventasHoy.totales.ventas} ventas · ${ventasHoy.totales.unidades} unidades` : ''} />
            <Kpi color="ambar" icono={TrendingUp} titulo="Ganancia de hoy"
                 valor={ventasHoy ? dinero(ventasHoy.totales.ganancia) : '—'}
                 detalle={ventasHoy ? `margen ${Number(ventasHoy.totales.margenPorcentaje).toFixed(1)} %` : ''} />
            <Kpi color="morado" icono={DollarSign} titulo="Valor del inventario"
                 valor={resumen ? dinero(resumen.valorInventario) : '—'} detalle="a precio de compra" />
          </>
        ) : (
          <>
            <Kpi color="verde" icono={Receipt} titulo="Mis ventas de hoy" valor={misVentasHoy.ventas}
                 detalle={`${misVentasHoy.unidades} unidades · ${dinero(misVentasHoy.total)}`} />
            <Kpi color="ambar" icono={FolderOpen} titulo="Categorías" valor={categorias.length} detalle="tipos de producto" />
            <Kpi color="morado" icono={Truck} titulo="Proveedores" valor={proveedores.length} detalle="registrados" />
          </>
        )}
      </div>

      <div className="fila-graficos">
        <section className="panel">
          <div className="panel-cabecera"><h2>Entradas y salidas · últimos 7 días</h2></div>
          <ResponsiveContainer width="100%" height={230}>
            <BarChart data={ultimos7} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e8ef" />
              <XAxis dataKey="dia" tickLine={false} axisLine={false} />
              <YAxis tickLine={false} axisLine={false} width={30} allowDecimals={false} />
              <Tooltip formatter={(v) => `${v} unidades`} cursor={{ fill: '#f3f5f9' }} />
              <Legend iconType="square" verticalAlign="top" align="right" height={30} />
              <Bar dataKey="Entradas" fill="#2f6fed" radius={[4, 4, 0, 0]} maxBarSize={22} />
              <Bar dataKey="Salidas" fill="#ef4444" radius={[4, 4, 0, 0]} maxBarSize={22} />
            </BarChart>
          </ResponsiveContainer>
        </section>

        <Dona titulo="Productos por categoría" datos={porCategoria.map((d, i) => ({ ...d, color: COLORES_CATEGORIA[i] }))} total={productos.length} />
        <Dona titulo="Estado del inventario" datos={porEstado} total={productos.length} />
      </div>

      <div className="fila-tablas">
        <section className="panel">
          <div className="panel-cabecera">
            <h2><AlertTriangle size={20} color="#dc2626" /> Productos con stock bajo</h2>
            <Link to="/productos?estado=bajo" className="enlace">Ver todos ({reabastecer.length})</Link>
          </div>
          <div className="tabla-scroll">
            <table>
              <thead>
                <tr><th>Código</th><th>Producto</th><th>Categoría</th><th className="centro">Stock</th><th className="centro">Mínimo</th><th className="centro">Reponer</th></tr>
              </thead>
              <tbody>
                {reabastecer.slice(0, 5).map((p) => (
                  <tr key={p.id}>
                    <td>{p.codigo}</td>
                    <td>{p.nombre}</td>
                    <td>{p.categoria.nombre}</td>
                    <td className="centro">
                      <span className={`etiqueta ${p.stock === 0 ? 'etiqueta-peligro' : 'etiqueta-aviso'}`}>{p.stock}</span>
                    </td>
                    <td className="centro">{p.stockMinimo}</td>
                    <td className="centro">
                      <button className="btn-carrito" title="Registrar entrada de este producto"
                              onClick={() => navigate(`/movimientos?tipo=ENTRADA&producto=${p.id}`)}>
                        <ShoppingCart size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
                {reabastecer.length === 0 && <tr><td colSpan={6} className="vacio">Todo el inventario tiene stock suficiente</td></tr>}
              </tbody>
            </table>
          </div>
        </section>

        <section className="panel">
          <div className="panel-cabecera">
            <h2><RefreshCw size={20} color="#dc2626" /> Últimos movimientos</h2>
            <Link to="/movimientos" className="enlace">Ver todos</Link>
          </div>
          <div className="tabla-scroll">
            <table>
              <thead>
                <tr><th>Fecha</th><th>Producto</th><th>Tipo</th><th className="num">Cantidad</th><th>Usuario</th></tr>
              </thead>
              <tbody>
                {movimientos.slice(0, 5).map((m) => (
                  <tr key={m.id}>
                    <td>{fecha(m.fecha)}</td>
                    <td>{m.producto.nombre}</td>
                    <td>
                      <span className={`etiqueta ${m.tipo === 'ENTRADA' ? 'etiqueta-ok' : 'etiqueta-peligro'}`}>
                        {m.tipo === 'ENTRADA' ? 'Entrada' : 'Salida'}
                      </span>
                    </td>
                    <td className="num" style={{ color: m.tipo === 'ENTRADA' ? '#1b9a4b' : '#dc2626', fontWeight: 700 }}>
                      {m.tipo === 'ENTRADA' ? '+' : '−'}{m.cantidad}
                    </td>
                    <td>{m.usuario.nombre}</td>
                  </tr>
                ))}
                {movimientos.length === 0 && <tr><td colSpan={5} className="vacio">Aún no hay movimientos</td></tr>}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      <section className="panel">
        <div className="panel-cabecera">
          <h2>Acciones rápidas</h2>
          {!esAdmin && <span className="texto-suave" style={{ fontSize: '.88rem' }}><Lock size={13} /> Las acciones bloqueadas son del administrador</span>}
        </div>
        <div className="acciones-rapidas">
          {acciones.map(({ texto, icono: Icono, color, a, admin }) => {
            const bloqueada = admin && !esAdmin
            return (
              <button key={texto} className={`accion ${color}`} disabled={bloqueada}
                      title={bloqueada ? 'Solo el administrador puede hacer esto' : texto}
                      onClick={() => navigate(a)}>
                {bloqueada && <Lock size={14} className="candado" />}
                <Icono size={22} /> {texto}
              </button>
            )
          })}
        </div>
      </section>
    </>
  )
}

function Dona({ titulo, datos, total }) {
  return (
    <section className="panel">
      <div className="panel-cabecera"><h2>{titulo}</h2></div>
      <div className="dona">
        <div className="dona-centro">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={datos} dataKey="valor" nameKey="nombre" innerRadius={52} outerRadius={80} paddingAngle={2} stroke="none">
                {datos.map((d) => <Cell key={d.nombre} fill={d.color} />)}
              </Pie>
              <Tooltip formatter={(v) => `${v} productos`} />
            </PieChart>
          </ResponsiveContainer>
          <div className="total"><strong>{total}</strong><span>Productos</span></div>
        </div>
        <ul className="leyenda">
          {datos.map((d) => (
            <li key={d.nombre}><span className="punto" style={{ background: d.color }} />{d.nombre}<b>{d.valor}</b></li>
          ))}
        </ul>
      </div>
    </section>
  )
}
