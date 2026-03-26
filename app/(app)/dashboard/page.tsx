import { createServerSupabaseClient } from '@/app/lib/supabase-server'
import Link from 'next/link'

export default async function DashboardPage() {
  const supabase = await createServerSupabaseClient()

  const [{ data: quotes }, { data: products }] = await Promise.all([
    supabase.from('quotes').select('*'),
    supabase.from('products').select('*'),
  ])

  const totalVentas = quotes?.filter(q => q.estado === 'venta')
    .reduce((acc, q) => acc + Number(q.total), 0) ?? 0

  const cotizacionesPendientes = quotes?.filter(q => q.estado === 'pendiente').length ?? 0
  const totalCotizaciones = quotes?.length ?? 0
  const totalProductos = products?.length ?? 0

  const metricas = [
    { label: 'Total en ventas',         valor: `RD$${totalVentas.toLocaleString('es-DO')}` },
    { label: 'Cotizaciones pendientes', valor: cotizacionesPendientes },
    { label: 'Cotizaciones totales',    valor: totalCotizaciones },
    { label: 'Productos en catálogo',   valor: totalProductos },
  ]

  const ultimasCotizaciones = quotes
    ?.sort((a, b) => new Date(b.creado_en).getTime() - new Date(a.creado_en).getTime())
    .slice(0, 5)

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-xl font-semibold text-gray-900">Dashboard</h1>
          <Link href="/cotizaciones" className="text-sm px-4 py-2 border rounded hover:bg-white transition-colors">
            Ver cotizaciones
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6 md:grid-cols-4">
          {metricas.map(m => (
            <div key={m.label} className="bg-white border rounded-xl p-4">
              <p className="text-xs text-gray-500 mb-1">{m.label}</p>
              <p className="text-xl font-semibold text-gray-900">{m.valor}</p>
            </div>
          ))}
        </div>

        <div className="bg-white border rounded-xl overflow-hidden">
          <div className="p-4 border-b flex justify-between items-center">
            <h2 className="font-medium text-gray-900">Últimas cotizaciones</h2>
            <Link href="/cotizaciones" className="text-xs text-gray-500 hover:text-gray-700">Ver todas →</Link>
          </div>
          {!ultimasCotizaciones?.length ? (
            <p className="text-sm text-gray-400 text-center py-8">Sin cotizaciones todavía</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b">
                  <th className="text-left p-3 font-medium text-gray-600">Cliente</th>
                  <th className="text-left p-3 font-medium text-gray-600">Retención</th>
                  <th className="text-right p-3 font-medium text-gray-600">Total</th>
                  <th className="text-left p-3 font-medium text-gray-600">Estado</th>
                </tr>
              </thead>
              <tbody>
                {ultimasCotizaciones.map(cot => (
                  <tr key={cot.id} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="p-3 font-medium text-gray-900">{cot.cliente_nombre}</td>
                    <td className="p-3 text-gray-600">{cot.dias_retencion ? `${cot.dias_retencion} días` : '—'}</td>
                    <td className="p-3 text-right font-semibold">RD${Number(cot.total).toLocaleString('es-DO')}</td>
                    <td className="p-3"><span className="text-xs text-gray-500">{cot.estado}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}