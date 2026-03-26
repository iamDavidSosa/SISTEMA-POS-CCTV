import { createServerSupabaseClient } from '@/app/lib/supabase-server'
import Link from 'next/link'

export default async function ProductosPage() {
  const supabase = await createServerSupabaseClient()

  const { data: productos } = await supabase
    .from('products')
    .select('*')
    .order('categoria')

  const categoriaLabel: Record<string, string> = {
    camara: 'Cámara',
    dvr: 'DVR / NVR',
    hdd: 'Disco duro',
    accesorio: 'Accesorio',
  }

  return (
    <div className="p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-xl font-semibold text-gray-900">Productos</h1>
          <Link
            href="/productos/nuevo"
            className="text-sm px-4 py-2 bg-gray-900 text-white rounded hover:bg-gray-700 transition-colors"
          >
            + Nuevo producto
          </Link>
        </div>

        <div className="bg-white border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="text-left p-4 font-medium text-gray-600">Producto</th>
                <th className="text-left p-4 font-medium text-gray-600">Categoría</th>
                <th className="text-right p-4 font-medium text-gray-600">Precio</th>
                <th className="text-right p-4 font-medium text-gray-600">Stock</th>
                <th className="text-left p-4 font-medium text-gray-600">Estado</th>
                <th className="text-left p-4 font-medium text-gray-600">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {productos?.map((p, i) => (
                <tr key={p.id} className={`border-b last:border-0 hover:bg-gray-50 ${i % 2 === 0 ? '' : 'bg-gray-50/50'}`}>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      {p.imagen_url && (
                        <img src={p.imagen_url} alt={p.nombre}
                          className="w-10 h-10 object-contain rounded border bg-gray-50 p-1" />
                      )}
                      <div>
                        <p className="font-medium text-gray-900">{p.nombre}</p>
                        <p className="text-xs text-gray-400">{p.specs}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-gray-600">{categoriaLabel[p.categoria]}</td>
                  <td className="p-4 text-right font-medium">
                    RD${Number(p.precio).toLocaleString('es-DO')}
                  </td>
                  <td className="p-4 text-right">
                    <span className={p.stock <= 3 ? 'text-red-600 font-medium' : 'text-gray-700'}>
                      {p.stock}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs border ${
                      p.activo
                        ? 'bg-green-50 text-green-700 border-green-200'
                        : 'bg-gray-100 text-gray-500 border-gray-200'
                    }`}>
                      {p.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="p-4">
                    <Link
                      href={`/productos/${p.id}`}
                      className="text-xs text-gray-500 hover:text-gray-900 underline"
                    >
                      Editar
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}