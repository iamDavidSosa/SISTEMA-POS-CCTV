'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/app/lib/supabase'

interface ClienteData {
  id?: string
  nombre: string
  rnc: string
  telefono: string
  email: string
  direccion: string
}

interface Props {
  cliente?: ClienteData
}

export default function ClienteForm({ cliente }: Props) {
  const router = useRouter()
  const supabase = createClient()
  const [guardando, setGuardando] = useState(false)
  const [form, setForm] = useState<ClienteData>({
    nombre:    cliente?.nombre    ?? '',
    rnc:       cliente?.rnc       ?? '',
    telefono:  cliente?.telefono  ?? '',
    email:     cliente?.email     ?? '',
    direccion: cliente?.direccion ?? '',
  })

  function set(campo: keyof ClienteData, valor: string) {
    setForm(prev => ({ ...prev, [campo]: valor }))
  }

  async function guardar() {
    if (!form.nombre.trim()) return
    setGuardando(true)

    const { data: { user } } = await supabase.auth.getUser()
    const { data: profile } = await supabase
      .from('profiles')
      .select('tenant_id')
      .eq('id', user!.id)
      .single()

    const datos = {
      tenant_id: profile!.tenant_id,
      nombre:    form.nombre,
      rnc:       form.rnc || null,
      telefono:  form.telefono || null,
      email:     form.email || null,
      direccion: form.direccion || null,
    }

    if (cliente?.id) {
      await supabase.from('clients').update(datos).eq('id', cliente.id)
    } else {
      await supabase.from('clients').insert(datos)
    }

    setGuardando(false)
    router.push('/clientes')
    router.refresh()
  }

  const inputClass = "w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-gray-400"
  const labelClass = "block text-xs font-medium text-gray-600 mb-1"

  return (
    <div className="bg-white border rounded-xl p-6 space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className={labelClass}>Nombre o razón social</label>
          <input type="text" value={form.nombre}
            onChange={e => set('nombre', e.target.value)}
            className={inputClass} placeholder="Empresa o nombre del cliente" />
        </div>
        <div>
          <label className={labelClass}>RNC / Cédula</label>
          <input type="text" value={form.rnc}
            onChange={e => set('rnc', e.target.value)}
            className={inputClass} placeholder="1-01-12345-6" />
        </div>
        <div>
          <label className={labelClass}>Teléfono</label>
          <input type="text" value={form.telefono}
            onChange={e => set('telefono', e.target.value)}
            className={inputClass} placeholder="809-555-1234" />
        </div>
        <div>
          <label className={labelClass}>Email</label>
          <input type="email" value={form.email}
            onChange={e => set('email', e.target.value)}
            className={inputClass} placeholder="cliente@email.com" />
        </div>
        <div>
          <label className={labelClass}>Dirección</label>
          <input type="text" value={form.direccion}
            onChange={e => set('direccion', e.target.value)}
            className={inputClass} placeholder="Av. Principal #123, Santiago" />
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <button onClick={guardar} disabled={guardando}
          className="px-6 py-2 bg-gray-900 text-white rounded text-sm font-medium hover:bg-gray-700 disabled:opacity-40 transition-colors">
          {guardando ? 'Guardando...' : cliente?.id ? 'Guardar cambios' : 'Crear cliente'}
        </button>
        <button onClick={() => router.push('/clientes')}
          className="px-6 py-2 border rounded text-sm text-gray-600 hover:bg-gray-50 transition-colors">
          Cancelar
        </button>
      </div>
    </div>
  )
}