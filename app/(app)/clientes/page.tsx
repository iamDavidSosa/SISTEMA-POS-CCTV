import { createServerSupabaseClient } from '@/app/lib/supabase-server'
import Link from 'next/link'

export default async function ClientesPage() {
  const supabase = await createServerSupabaseClient()

  const { data: clientes } = await supabase
    .from('clients')
    .select('*')
    .order('nombre')

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-xl font-semibold text-gray-900">Clientes</h1>
          <Link href="/clientes/nuevo"
            className="text-sm px-4 py-2 bg-gray-900 text-white rounded hover:bg-gray-700 transition-colors">
            + Nuevo cliente
          </Link>
        </div>

        {!clientes?.length ? (
          <div className="text-center py-20 text-gray-400">
            <p className="text-lg mb-2">No hay clientes todavía</p>
            <Link href="/clientes/nuevo" className="text-sm text-gray-600 underline">
              Agregar primer cliente
            </Link>
          </div>
        ) : (
          <div className="bg-white border rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b">
                  <th className="text-left p-4 font-medium text-gray-600">Nombre</th>
                  <th className="text-left p-4 font-medium text-gray-600">RNC</th>
                  <th className="text-left p-4 font-medium text-gray-600">Teléfono</th>
                  <th className="text-left p-4 font-medium text-gray-600">Email</th>
                  <th className="text-left p-4 font-medium text-gray-600">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {clientes.map((c, i) => (
                  <tr key={c.id} className={`border-b last:border-0 hover:bg-gray-50 ${i % 2 === 0 ? '' : 'bg-gray-50/50'}`}>
                    <td className="p-4 font-medium text-gray-900">{c.nombre}</td>
                    <td className="p-4 text-gray-600">{c.rnc ?? '—'}</td>
                    <td className="p-4 text-gray-600">{c.telefono ?? '—'}</td>
                    <td className="p-4 text-gray-600">{c.email ?? '—'}</td>
                    <td className="p-4">
                      <Link href={`/clientes/${c.id}`}
                        className="text-xs text-gray-500 hover:text-gray-900 underline">
                        Editar
                      </Link>
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