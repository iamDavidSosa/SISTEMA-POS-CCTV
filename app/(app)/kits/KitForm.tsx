'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/app/lib/supabase'

interface Producto {
  id: string
  nombre: string
  categoria: string
}

interface KitItemForm {
  product_id: string
  nombre: string
  cantidad: number
}

interface KitData {
  id?: string
  nombre: string
  descripcion: string
  precio: string
  imagen_url: string
  activo: boolean
}

interface Props {
  kit?: KitData & { items?: KitItemForm[] }
  productos: Producto[]
}

export default function KitForm({ kit, productos }: Props) {
  const router = useRouter()
  const supabase = createClient()
  const [guardando, setGuardando] = useState(false)
  const [subiendo, setSubiendo] = useState(false)
  const [form, setForm] = useState<KitData>({
    nombre:      kit?.nombre      ?? '',
    descripcion: kit?.descripcion ?? '',
    precio:      kit?.precio      ?? '',
    imagen_url:  kit?.imagen_url  ?? '',
    activo:      kit?.activo      ?? true,
  })
  const [items, setItems] = useState<KitItemForm[]>(kit?.items ?? [])
  const [productoSeleccionado, setProductoSeleccionado] = useState('')

  function set(campo: keyof KitData, valor: string | boolean) {
    setForm(prev => ({ ...prev, [campo]: valor }))
  }

  function agregarProducto() {
    const producto = productos.find(p => p.id === productoSeleccionado)
    if (!producto) return
    const existe = items.find(i => i.product_id === productoSeleccionado)
    if (existe) {
      setItems(prev => prev.map(i =>
        i.product_id === productoSeleccionado
          ? { ...i, cantidad: i.cantidad + 1 }
          : i
      ))
    } else {
      setItems(prev => [...prev, { product_id: producto.id, nombre: producto.nombre, cantidad: 1 }])
    }
    setProductoSeleccionado('')
  }

  function cambiarCantidad(product_id: string, delta: number) {
    setItems(prev =>
      prev
        .map(i => i.product_id === product_id ? { ...i, cantidad: i.cantidad + delta } : i)
        .filter(i => i.cantidad > 0)
    )
  }

  async function subirImagen(archivo: File) {
    setSubiendo(true)
    const ext = archivo.name.split('.').pop()
    const path = `kits/${Date.now()}.${ext}`

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
    if (!form.nombre || !form.precio || items.length === 0) return
    setGuardando(true)

    const { data: { user } } = await supabase.auth.getUser()
    const { data: profile } = await supabase
      .from('profiles')
      .select('tenant_id')
      .eq('id', user!.id)
      .single()

    const datos = {
      tenant_id:   profile!.tenant_id,
      nombre:      form.nombre,
      descripcion: form.descripcion || null,
      precio:      parseFloat(form.precio),
      imagen_url:  form.imagen_url || null,
      activo:      form.activo,
    }

    let kitId = kit?.id

    if (kit?.id) {
      await supabase.from('kits').update(datos).eq('id', kit.id)
      await supabase.from('kit_items').delete().eq('kit_id', kit.id)
    } else {
      const { data: nuevoKit } = await supabase.from('kits').insert(datos).select().single()
      kitId = nuevoKit?.id
    }

    await supabase.from('kit_items').insert(
      items.map(i => ({ kit_id: kitId, product_id: i.product_id, cantidad: i.cantidad }))
    )

    setGuardando(false)
    router.push('/kits')
    router.refresh()
  }

  const inputClass = "w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-gray-400"
  const labelClass = "block text-xs font-medium text-gray-600 mb-1"

  return (
    <div className="bg-white border rounded-xl p-6 space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className={labelClass}>Nombre del kit</label>
          <input type="text" value={form.nombre}
            onChange={e => set('nombre', e.target.value)}
            className={inputClass} placeholder="Kit Básico 4 Cámaras" />
        </div>
        <div className="col-span-2">
          <label className={labelClass}>Descripción</label>
          <input type="text" value={form.descripcion}
            onChange={e => set('descripcion', e.target.value)}
            className={inputClass} placeholder="Kit completo para local comercial pequeño" />
        </div>
        <div>
          <label className={labelClass}>Precio del kit (RD$)</label>
          <input type="number" value={form.precio}
            onChange={e => set('precio', e.target.value)}
            className={inputClass} placeholder="35000" />
        </div>
        <div>
          <label className={labelClass}>Imagen del kit</label>
          <input type="file" accept="image/*"
            onChange={e => e.target.files?.[0] && subirImagen(e.target.files[0])}
            className="w-full text-sm text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded file:border file:text-xs file:bg-gray-50 file:text-gray-700 hover:file:bg-gray-100" />
          {subiendo && <p className="text-xs text-gray-400 mt-1">Subiendo imagen...</p>}
          {form.imagen_url && (
            <img src={form.imagen_url} alt="preview"
              className="mt-2 h-24 object-contain rounded border bg-gray-50 p-2" />
          )}
        </div>
      </div>

      {/* Productos del kit */}
      <div>
        <label className={labelClass}>Productos del kit</label>
        <div className="flex gap-2 mb-3">
          <select value={productoSeleccionado}
            onChange={e => setProductoSeleccionado(e.target.value)}
            className={`flex-1 ${inputClass}`}>
            <option value="">Seleccionar producto...</option>
            {productos.map(p => (
              <option key={p.id} value={p.id}>{p.nombre}</option>
            ))}
          </select>
          <button onClick={agregarProducto} disabled={!productoSeleccionado}
            className="px-4 py-2 border rounded-lg text-sm hover:bg-gray-50 disabled:opacity-40 transition-colors">
            + Agregar
          </button>
        </div>

        {items.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-4 border rounded-lg">
            Agrega productos al kit
          </p>
        ) : (
          <div className="border rounded-lg divide-y">
            {items.map(item => (
              <div key={item.product_id} className="flex justify-between items-center px-3 py-2">
                <span className="text-sm text-gray-700">{item.nombre}</span>
                <div className="flex items-center gap-2">
                  <button onClick={() => cambiarCantidad(item.product_id, -1)}
                    className="w-6 h-6 border rounded text-xs hover:bg-gray-100">−</button>
                  <span className="text-sm w-6 text-center">{item.cantidad}</span>
                  <button onClick={() => cambiarCantidad(item.product_id, 1)}
                    className="w-6 h-6 border rounded text-xs hover:bg-gray-100">+</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        <input type="checkbox" id="activo" checked={form.activo}
          onChange={e => set('activo', e.target.checked)} className="rounded" />
        <label htmlFor="activo" className="text-sm text-gray-600">Kit activo</label>
      </div>

      <div className="flex gap-3 pt-2">
        <button onClick={guardar} disabled={guardando || subiendo || items.length === 0}
          className="px-6 py-2 bg-gray-900 text-white rounded text-sm font-medium hover:bg-gray-700 disabled:opacity-40 transition-colors">
          {guardando ? 'Guardando...' : kit?.id ? 'Guardar cambios' : 'Crear kit'}
        </button>
        <button onClick={() => router.push('/kits')}
          className="px-6 py-2 border rounded text-sm text-gray-600 hover:bg-gray-50 transition-colors">
          Cancelar
        </button>
      </div>
    </div>
  )
}