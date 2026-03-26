import { createServerSupabaseClient } from '@/app/lib/supabase-server'
import Link from 'next/link'

export default async function KitsPage() {
  const supabase = await createServerSupabaseClient()

  const { data: kits } = await supabase
    .from('kits')
    .select('*, kit_items(cantidad, products(nombre, categoria))')
    .order('nombre')

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-xl font-semibold text-gray-900">Kits y combos</h1>
          <Link href="/kits/nuevo"
            className="text-sm px-4 py-2 bg-gray-900 text-white rounded hover:bg-gray-700 transition-colors">
            + Nuevo kit
          </Link>
        </div>

        {!kits?.length ? (
          <div className="text-center py-20 text-gray-400">
            <p className="text-lg mb-2">No hay kits todavía</p>
            <Link href="/kits/nuevo" className="text-sm text-gray-600 underline">
              Crear primer kit
            </Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {kits.map(kit => (
              <div key={kit.id} className="bg-white border rounded-xl p-4">
                <div className="flex justify-between items-start">
                  <div className="flex gap-3 items-start">
                    {kit.imagen_url && (
                      <img src={kit.imagen_url} alt={kit.nombre}
                        className="w-12 h-12 object-contain rounded border bg-gray-50 p-1 flex-shrink-0" />
                    )}
                    <div>
                      <p className="font-medium text-gray-900">{kit.nombre}</p>
                      {kit.descripcion && (
                        <p className="text-sm text-gray-500 mt-0.5">{kit.descripcion}</p>
                      )}
                      <div className="flex flex-wrap gap-1 mt-2">
                        {kit.kit_items?.map((item: { cantidad: number; products: { nombre: string } | null }) => (
                          <span key={item.products?.nombre}
                            className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">
                            {item.cantidad}× {item.products?.nombre}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0 ml-4">
                    <p className="font-semibold text-gray-900">
                      RD${Number(kit.precio).toLocaleString('es-DO')}
                    </p>
                    <Link href={`/kits/${kit.id}`}
                      className="text-xs text-gray-500 hover:text-gray-900 underline">
                      Editar
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}