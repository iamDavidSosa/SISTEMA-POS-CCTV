import { createServerSupabaseClient } from '@/app/lib/supabase-server'
import ProductoForm from '../ProductoForm'
import { notFound } from 'next/navigation'

export default async function EditarProductoPage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createServerSupabaseClient()
  const { id } = await params
  const { data: producto } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single()

  if (!producto) notFound()

  return (
    <div className="p-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-xl font-semibold text-gray-900 mb-6">Editar producto</h1>
        <ProductoForm producto={{
          id:           producto.id,
          nombre:       producto.nombre,
          specs:        producto.specs ?? '',
          precio:       String(producto.precio),
          categoria:    producto.categoria,
          bitrate_mbps: String(producto.bitrate_mbps ?? ''),
          capacidad_tb: String(producto.capacidad_tb ?? ''),
          stock:        String(producto.stock ?? 0),
          activo:       producto.activo,
          imagen_url:   producto.imagen_url ?? '',
        }} />
      </div>
    </div>
  )
}