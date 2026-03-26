import { createServerSupabaseClient } from '@/app/lib/supabase-server'
import KitForm from '../KitForm'

export default async function NuevoKitPage() {
  const supabase = await createServerSupabaseClient()
  const { data: productos } = await supabase
    .from('products')
    .select('id, nombre, categoria')
    .eq('activo', true)
    .order('categoria')

  return (
    <div className="p-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-xl font-semibold text-gray-900 mb-6">Nuevo kit</h1>
        <KitForm productos={productos ?? []} />
      </div>
    </div>
  )
}