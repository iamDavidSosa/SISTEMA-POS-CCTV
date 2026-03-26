import { createServerSupabaseClient } from '@/app/lib/supabase-server'
import KitForm from '../KitForm'
import { notFound } from 'next/navigation'

export default async function EditarKitPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params as { id: string }
  const supabase = await createServerSupabaseClient()

  const [{ data: kit }, { data: productos }] = await Promise.all([
    supabase.from('kits').select('*, kit_items(product_id, cantidad, products(nombre))').eq('id', id).single(),
    supabase.from('products').select('id, nombre, categoria').eq('activo', true).order('categoria'),
  ])

  if (!kit) notFound()

  return (
    <div className="p-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-xl font-semibold text-gray-900 mb-6">Editar kit</h1>
        <KitForm
          productos={productos ?? []}
          kit={{
            id:          kit.id,
            nombre:      kit.nombre,
            descripcion: kit.descripcion ?? '',
            precio:      String(kit.precio),
            imagen_url:  kit.imagen_url ?? '',
            activo:      kit.activo,
            items:       kit.kit_items?.map((i: { product_id: string; cantidad: number; products: { nombre: string } | null }) => ({
              product_id: i.product_id,
              nombre:     i.products?.nombre ?? '',
              cantidad:   i.cantidad,
            })),
          }}
        />
      </div>
    </div>
  )
}