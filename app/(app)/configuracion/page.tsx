import { createServerSupabaseClient } from '@/app/lib/supabase-server'
import ConfiguracionForm from './ConfiguracionForm'

export default async function ConfiguracionPage() {
  const supabase = await createServerSupabaseClient()

  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase
    .from('profiles')
    .select('tenant_id')
    .eq('id', user!.id)
    .single()

  const { data: tenant } = await supabase
    .from('tenants')
    .select('*')
    .eq('id', profile!.tenant_id)
    .single()

  return (
    <div className="p-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-xl font-semibold text-gray-900 mb-6">Configuración de la empresa</h1>
        <ConfiguracionForm tenant={tenant} />
      </div>
    </div>
  )
}