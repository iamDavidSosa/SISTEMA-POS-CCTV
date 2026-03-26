import { createServerSupabaseClient } from '@/app/lib/supabase-server'
import ClienteForm from '../ClienteForm'
import { notFound } from 'next/navigation'

export default async function EditarClientePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params as { id: string }
  const supabase = await createServerSupabaseClient()

  const { data: cliente } = await supabase
    .from('clients')
    .select('*')
    .eq('id', id)
    .single()

  if (!cliente) notFound()

  return (
    <div className="p-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-xl font-semibold text-gray-900 mb-6">Editar cliente</h1>
        <ClienteForm cliente={{
          id:        cliente.id,
          nombre:    cliente.nombre,
          rnc:       cliente.rnc ?? '',
          telefono:  cliente.telefono ?? '',
          email:     cliente.email ?? '',
          direccion: cliente.direccion ?? '',
        }} />
      </div>
    </div>
  )
}