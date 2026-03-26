'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/app/lib/supabase'

interface ProductoData {
  id?: string
  nombre: string
  specs: string
  precio: string
  categoria: string
  bitrate_mbps: string
  capacidad_tb: string
  stock: string
  activo: boolean
  imagen_url: string
}

interface Props {
  producto?: ProductoData
}

export default function ProductoForm({ producto }: Props) {
  const router = useRouter()
  const supabase = createClient()
  const [guardando, setGuardando] = useState(false)
  const [subiendo, setSubiendo] = useState(false)
  const [form, setForm] = useState<ProductoData>({
    nombre:       producto?.nombre       ?? '',
    specs:        producto?.specs        ?? '',
    precio:       producto?.precio       ?? '',
    categoria:    producto?.categoria    ?? 'camara',
    bitrate_mbps: producto?.bitrate_mbps ?? '',
    capacidad_tb: producto?.capacidad_tb ?? '',
    stock:        producto?.stock        ?? '0',
    activo:       producto?.activo       ?? true,
    imagen_url:   producto?.imagen_url   ?? '',
  })

  function set(campo: keyof ProductoData, valor: string | boolean) {
    setForm(prev => ({ ...prev, [campo]: valor }))
  }

  async function subirImagen(archivo: File) {
    setSubiendo(true)
    const ext = archivo.name.split('.').pop()
    const path = `${Date.now()}.${ext}`

    const { error } = await supabase.storage
      .from('product-images')
      .upload(path, archivo)

    if (!error) {
      const { data } = supabase.storage
        .from('product-images')
        .getPublicUrl(path)
      set('imagen_url', data.publicUrl)
    }
    setSubiendo(false)
  }

  async function guardar() {
    if (!form.nombre || !form.precio || !form.categoria) return
    setGuardando(true)

    const { data: { user } } = await supabase.auth.getUser()
    const { data: profile } = await supabase
      .from('profiles')
      .select('tenant_id')
      .eq('id', user!.id)
      .single()

    const datos = {
      tenant_id:    profile!.tenant_id,
      nombre:       form.nombre,
      specs:        form.specs,
      precio:       parseFloat(form.precio),
      categoria:    form.categoria,
      bitrate_mbps: form.bitrate_mbps ? parseFloat(form.bitrate_mbps) : null,
      capacidad_tb: form.capacidad_tb ? parseFloat(form.capacidad_tb) : null,
      stock:        parseInt(form.stock) || 0,
      activo:       form.activo,
      imagen_url:   form.imagen_url || null,
    }

    if (producto?.id) {
      await supabase.from('products').update(datos).eq('id', producto.id)
    } else {
      await supabase.from('products').insert(datos)
    }

    setGuardando(false)
    router.push('/productos')
    router.refresh()
  }

  const inputClass = "w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-gray-400"
  const labelClass = "block text-xs font-medium text-gray-600 mb-1"

  return (
    <div className="bg-white border rounded-xl p-6 space-y-4">

      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className={labelClass}>Nombre del producto</label>
          <input type="text" value={form.nombre}
            onChange={e => set('nombre', e.target.value)}
            className={inputClass} placeholder="Cámara Domo 8MP 4K" />
        </div>

        <div className="col-span-2">
          <label className={labelClass}>Especificaciones</label>
          <input type="text" value={form.specs}
            onChange={e => set('specs', e.target.value)}
            className={inputClass} placeholder="8MP · H.265 · IR 40m · 20fps" />
        </div>

        <div>
          <label className={labelClass}>Categoría</label>
          <select value={form.categoria}
            onChange={e => set('categoria', e.target.value)}
            className={inputClass}>
            <option value="camara">Cámara</option>
            <option value="dvr">DVR / NVR</option>
            <option value="hdd">Disco duro</option>
            <option value="accesorio">Accesorio</option>
          </select>
        </div>

        <div>
          <label className={labelClass}>Precio (RD$)</label>
          <input type="number" value={form.precio}
            onChange={e => set('precio', e.target.value)}
            className={inputClass} placeholder="6200" />
        </div>

        <div>
          <label className={labelClass}>Stock disponible</label>
          <input type="number" value={form.stock}
            onChange={e => set('stock', e.target.value)}
            className={inputClass} placeholder="10" />
        </div>

        {form.categoria === 'camara' && (
          <div>
            <label className={labelClass}>Bitrate (Mbps)</label>
            <input type="number" step="0.1" value={form.bitrate_mbps}
              onChange={e => set('bitrate_mbps', e.target.value)}
              className={inputClass} placeholder="3.5" />
          </div>
        )}

        {form.categoria === 'hdd' && (
          <div>
            <label className={labelClass}>Capacidad (TB)</label>
            <input type="number" step="0.5" value={form.capacidad_tb}
              onChange={e => set('capacidad_tb', e.target.value)}
              className={inputClass} placeholder="4" />
          </div>
        )}
      </div>

      {/* Imagen */}
      <div>
        <label className={labelClass}>Imagen del producto</label>
        <input type="file" accept="image/*"
          onChange={e => e.target.files?.[0] && subirImagen(e.target.files[0])}
          className="w-full text-sm text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded file:border file:text-xs file:bg-gray-50 file:text-gray-700 hover:file:bg-gray-100" />
        {subiendo && <p className="text-xs text-gray-400 mt-1">Subiendo imagen...</p>}
        {form.imagen_url && (
          <img src={form.imagen_url} alt="preview"
            className="mt-2 h-24 object-contain rounded border bg-gray-50 p-2" />
        )}
      </div>

      {/* Estado */}
      <div className="flex items-center gap-2">
        <input type="checkbox" id="activo" checked={form.activo}
          onChange={e => set('activo', e.target.checked)}
          className="rounded" />
        <label htmlFor="activo" className="text-sm text-gray-600">Producto activo</label>
      </div>

      {/* Botones */}
      <div className="flex gap-3 pt-2">
        <button onClick={guardar} disabled={guardando || subiendo}
          className="px-6 py-2 bg-gray-900 text-white rounded text-sm font-medium hover:bg-gray-700 disabled:opacity-40 transition-colors">
          {guardando ? 'Guardando...' : producto?.id ? 'Guardar cambios' : 'Crear producto'}
        </button>
        <button onClick={() => router.push('/productos')}
          className="px-6 py-2 border rounded text-sm text-gray-600 hover:bg-gray-50 transition-colors">
          Cancelar
        </button>
      </div>
    </div>
  )
}