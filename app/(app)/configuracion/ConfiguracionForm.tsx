'use client'

import { useState } from 'react'
import { createClient } from '@/app/lib/supabase'

interface Tenant {
  id: string
  nombre: string
  ruc: string | null
  telefono: string | null
  email: string | null
  direccion: string | null
  logo_url?: string | null
}

export default function ConfiguracionForm({ tenant }: { tenant: Tenant }) {
  const supabase = createClient()
  const [guardando, setGuardando] = useState(false)
  const [subiendo, setSubiendo] = useState(false)
  const [guardado, setGuardado] = useState(false)
  const [form, setForm] = useState({
    nombre:    tenant.nombre       ?? '',
    ruc:       tenant.ruc          ?? '',
    telefono:  tenant.telefono     ?? '',
    email:     tenant.email        ?? '',
    direccion: tenant.direccion    ?? '',
    logo_url:  tenant.logo_url     ?? '',
  })

  function set(campo: string, valor: string) {
    setForm(prev => ({ ...prev, [campo]: valor }))
    setGuardado(false)
  }

  async function subirLogo(archivo: File) {
    setSubiendo(true)
    const ext = archivo.name.split('.').pop()
    const path = `logos/${tenant.id}.${ext}`

    const { error } = await supabase.storage
      .from('product-images')
      .upload(path, archivo, { upsert: true })

    if (!error) {
      const { data } = supabase.storage
        .from('product-images')
        .getPublicUrl(path)
      set('logo_url', data.publicUrl)
    }
    setSubiendo(false)
  }

  async function guardar() {
    if (!form.nombre.trim()) return
    setGuardando(true)

    await supabase.from('tenants').update({
      nombre:    form.nombre,
      ruc:       form.ruc       || null,
      telefono:  form.telefono  || null,
      email:     form.email     || null,
      direccion: form.direccion || null,
      logo_url:  form.logo_url  || null,
    }).eq('id', tenant.id)

    setGuardado(true)
    setGuardando(false)
  }

  const inputClass = "w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-gray-400"
  const labelClass = "block text-xs font-medium text-gray-600 mb-1"

  return (
    <div className="bg-white border rounded-xl p-6 space-y-5">

      {/* Logo */}
      <div>
        <label className={labelClass}>Logo de la empresa</label>
        <div className="flex items-center gap-4">
          {form.logo_url ? (
            <img src={form.logo_url} alt="logo"
              className="h-16 w-16 object-contain rounded border bg-gray-50 p-1" />
          ) : (
            <div className="h-16 w-16 rounded border bg-gray-50 flex items-center justify-center text-gray-300 text-2xl">
              ◈
            </div>
          )}
          <div>
            <input type="file" accept="image/*"
              onChange={e => e.target.files?.[0] && subirLogo(e.target.files[0])}
              className="w-full text-sm text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded file:border file:text-xs file:bg-gray-50 file:text-gray-700 hover:file:bg-gray-100" />
            {subiendo && <p className="text-xs text-gray-400 mt-1">Subiendo logo...</p>}
            <p className="text-xs text-gray-400 mt-1">
              Este logo aparecerá en las cotizaciones y facturas PDF
            </p>
          </div>
        </div>
      </div>

      <div className="border-t pt-4 grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className={labelClass}>Nombre de la empresa</label>
          <input type="text" value={form.nombre}
            onChange={e => set('nombre', e.target.value)}
            className={inputClass} placeholder="Mi Tienda CCTV, SRL" />
        </div>

        <div>
          <label className={labelClass}>RNC</label>
          <input type="text" value={form.ruc}
            onChange={e => set('ruc', e.target.value)}
            className={inputClass} placeholder="1-30-12345-6" />
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
            className={inputClass} placeholder="ventas@mitienda.com" />
        </div>

        <div>
          <label className={labelClass}>Dirección</label>
          <input type="text" value={form.direccion}
            onChange={e => set('direccion', e.target.value)}
            className={inputClass} placeholder="Av. 27 de Febrero #401, Santiago" />
        </div>
      </div>

      <div className="flex items-center gap-3 pt-2">
        <button onClick={guardar} disabled={guardando || subiendo}
          className="px-6 py-2 bg-gray-900 text-white rounded text-sm font-medium hover:bg-gray-700 disabled:opacity-40 transition-colors">
          {guardando ? 'Guardando...' : 'Guardar cambios'}
        </button>
        {guardado && (
          <span className="text-sm text-green-600">✓ Cambios guardados</span>
        )}
      </div>
    </div>
  )
}