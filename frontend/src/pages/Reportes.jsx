import { useEffect, useState } from 'react'
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { DollarSign, Package, Percent, Receipt, TrendingUp, Trophy, Users } from 'lucide-react'
import { api } from '../api/api'
import Mensaje from '../components/Mensaje'
import Kpi from '../components/Kpi'
import { dinero, fecha } from '../utils/formato'

const PERIODOS = [
  { dias: 1, texto: 'Hoy' },
  { dias: 7, texto: 'Últimos 7 días' },
  { dias: 30, texto: 'Últimos 30 días' },
]
const DIAS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

// "2026-10-16" -> "Vie 16" (se agrega la hora para que no cambie de día por la zona horaria)
const etiquetaDia = (iso) => {
  const d = new Date(`${iso}T12:00:00`)
  return `${DIAS[d.getDay()]} ${d.getDate()}`
}

/** Reporte de ventas y ganancias. Solo lo ve el ADMIN (ruta y endpoint protegidos). */
export default function Reportes() {
  const [dias, setDias] = useState(1)
  const [reporte, setReporte] = useState(null)
  const [error, setError] = useState('')

  // Cada vez que cambia el período (Hoy/7/30 días) vuelve a pedir el reporte
  useEffect(() => {
    setError('')
    api.get(`/reportes/ventas?dias=${dias}`).then(setReporte).catch((e) => setError(e.message))
  }, [dias])

  const t = reporte?.totales
  const serie = reporte?.porDia.map((d) => ({
    dia: etiquetaDia(d.fecha), Ingresos: Number(d.ingresos), Ganancia: Number(d.ganancia),
  })) || []

  return (
    <>
      <div className="encabezado">
        <div>
          <h1>Reporte de ventas</h1>
          <p>Qué se vendió, cuánto ingresó y cuánto se ganó. Ganancia = (precio de venta − costo) × cantidad.</p>
        </div>
        <div className="periodos">
          {PERIODOS.map((p) => (
            <button key={p.dias} className={`btn ${dias === p.dias ? 'btn-primario' : 'btn-secundario'}`} onClick={() => setDias(p.dias)}>
              {p.texto}
            </button>
          ))}
        </div>
      </div>
      <Mensaje texto={error} />

      {t && (
        <div className="kpis">
          <Kpi color="azul" icono={Receipt} titulo="Ventas" valor={t.ventas} detalle="transacciones" />
          <Kpi color="ambar" icono={Package} titulo="Unidades vendidas" valor={t.unidades} detalle="productos despachados" />
          <Kpi color="morado" icono={DollarSign} titulo="Ingresos" valor={dinero(t.ingresos)} detalle={`costo: ${dinero(t.costo)}`} />
          <Kpi color="verde" icono={TrendingUp} titulo="Ganancia" valor={dinero(t.ganancia)} detalle="ingresos − costo" />
          <Kpi color="rojo" icono={Percent} titulo="Margen" valor={`${Number(t.margenPorcentaje).toFixed(1)} %`} detalle="ganancia / ingresos" />
        </div>
      )}

      {reporte && dias > 1 && (
        <section className="panel" style={{ marginBottom: 20 }}>
          <div className="panel-cabecera"><h2>Ingresos y ganancia por día</h2></div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={serie} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e8ef" />
              <XAxis dataKey="dia" tickLine={false} axisLine={false} interval={dias > 7 ? 2 : 0} />
              <YAxis tickLine={false} axisLine={false} width={50} tickFormatter={(v) => `$${v}`} />
              <Tooltip formatter={(v) => dinero(v)} cursor={{ fill: '#f3f5f9' }} />
              <Legend iconType="square" verticalAlign="top" align="right" height={30} />
              <Bar dataKey="Ingresos" fill="#7c3aed" radius={[4, 4, 0, 0]} maxBarSize={26} />
              <Bar dataKey="Ganancia" fill="#1b9a4b" radius={[4, 4, 0, 0]} maxBarSize={26} />
            </BarChart>
          </ResponsiveContainer>
        </section>
      )}

      {reporte && (
        <div className="fila-tablas">
          <section className="panel">
            <div className="panel-cabecera"><h2><Trophy size={20} color="#e3a008" /> Productos más vendidos</h2></div>
            <div className="tabla-scroll">
              <table>
                <thead><tr><th>Producto</th><th className="num">Unid.</th><th className="num">Ingresos</th><th className="num">Ganancia</th></tr></thead>
                <tbody>
                  {reporte.topProductos.map((p) => (
                    <tr key={p.codigo}>
                      <td>{p.codigo} — {p.nombre}</td>
                      <td className="num">{p.unidades}</td>
                      <td className="num">{dinero(p.ingresos)}</td>
                      <td className="num ganancia">{dinero(p.ganancia)}</td>
                    </tr>
                  ))}
                  {reporte.topProductos.length === 0 && <tr><td colSpan={4} className="vacio">Sin ventas en este período</td></tr>}
                </tbody>
              </table>
            </div>
          </section>

          <section className="panel">
            <div className="panel-cabecera"><h2><Users size={20} color="#2f6fed" /> Ventas por empleado</h2></div>
            <div className="tabla-scroll">
              <table>
                <thead><tr><th>Empleado</th><th className="num">Ventas</th><th className="num">Unid.</th><th className="num">Ingresos</th></tr></thead>
                <tbody>
                  {reporte.porEmpleado.map((e) => (
                    <tr key={e.nombre}>
                      <td>{e.nombre}</td>
                      <td className="num">{e.ventas}</td>
                      <td className="num">{e.unidades}</td>
                      <td className="num">{dinero(e.ingresos)}</td>
                    </tr>
                  ))}
                  {reporte.porEmpleado.length === 0 && <tr><td colSpan={4} className="vacio">Sin ventas en este período</td></tr>}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      )}

      {reporte && (
        <section className="panel">
          <div className="panel-cabecera">
            <h2><Receipt size={20} color="#7c3aed" /> Detalle de ventas</h2>
            <span className="texto-suave">{reporte.ventas.length} ventas</span>
          </div>
          <div className="tabla-scroll">
            <table>
              <thead>
                <tr><th>Fecha</th><th>Producto</th><th className="num">Cant.</th><th className="num">P. unit.</th>
                  <th className="num">Total</th><th className="num">Ganancia</th><th>Vendido por</th></tr>
              </thead>
              <tbody>
                {reporte.ventas.map((v) => (
                  <tr key={v.id}>
                    <td>{fecha(v.fecha)}</td>
                    <td>{v.producto}</td>
                    <td className="num">{v.cantidad}</td>
                    <td className="num">{dinero(v.precioUnitario)}</td>
                    <td className="num"><strong>{dinero(v.total)}</strong></td>
                    <td className="num ganancia">{dinero(v.ganancia)}</td>
                    <td>{v.usuario}</td>
                  </tr>
                ))}
                {reporte.ventas.length === 0 && <tr><td colSpan={7} className="vacio">Sin ventas en este período</td></tr>}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </>
  )
}

