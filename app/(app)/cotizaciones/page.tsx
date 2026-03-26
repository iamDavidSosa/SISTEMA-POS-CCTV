import { createServerSupabaseClient } from '@/app/lib/supabase-server'
import Link from 'next/link'

export default async function CotizacionesPage() {
  const supabase = await createServerSupabaseClient()

  const { data: cotizaciones } = await supabase
    .from('quotes')
    .select('*')
    .order('creado_en', { ascending: false })

  const estadoColor: Record<string, string> = {
    pendiente: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    aprobada:  'bg-green-50 text-green-700 border-green-200',
    rechazada: 'bg-red-50 text-red-700 border-red-200',
    venta:     'bg-blue-50 text-blue-700 border-blue-200',
  }

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-xl font-semibold text-gray-900">Cotizaciones</h1>
          <Link href="/pos" className="text-sm px-4 py-2 bg-gray-900 text-white rounded hover:bg-gray-700 transition-colors">
            + Nueva cotización
          </Link>
        </div>

        {!cotizaciones?.length ? (
          <div className="text-center py-20 text-gray-400">
            <p className="text-lg mb-2">No hay cotizaciones todavía</p>
            <Link href="/pos" className="text-sm text-gray-600 underline">Crear primera cotización</Link>
          </div>
        ) : (
          <div className="bg-white border rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b">
                  <th className="text-left p-4 font-medium text-gray-600">Número</th>
                  <th className="text-left p-4 font-medium text-gray-600">Cliente</th>
                  <th className="text-left p-4 font-medium text-gray-600">Retención</th>
                  <th className="text-right p-4 font-medium text-gray-600">Total</th>
                  <th className="text-left p-4 font-medium text-gray-600">Estado</th>
                  <th className="text-left p-4 font-medium text-gray-600">Fecha</th>
                </tr>
              </thead>
              <tbody>
                {cotizaciones.map((cot, i) => (
                  <tr key={cot.id} className={`border-b last:border-0 hover:bg-gray-50 ${i % 2 === 0 ? '' : 'bg-gray-50/50'}`}>
                    <td className="p-4 font-mono text-xs text-gray-500">{cot.numero}</td>
                    <td className="p-4 font-medium text-gray-900">{cot.cliente_nombre}</td>
                    <td className="p-4 text-gray-600">
                      {cot.dias_retencion ? (
                        <span className={cot.dias_retencion >= 30 ? 'text-green-600 font-medium' : 'text-yellow-600 font-medium'}>
                          {cot.dias_retencion} días
                        </span>
                      ) : '—'}
                    </td>
                    <td className="p-4 text-right font-semibold text-gray-900">
                      RD${Number(cot.total).toLocaleString('es-DO')}
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs border ${estadoColor[cot.estado] ?? ''}`}>
                        {cot.estado}
                      </span>
                    </td>
                    <td className="p-4 text-gray-500 text-xs">
                      {new Date(cot.creado_en).toLocaleDateString('es-DO')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}