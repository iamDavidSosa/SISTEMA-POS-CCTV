import { createServerSupabaseClient } from '@/app/lib/supabase-server'
import PosClient from './PosClient'
import type { Producto } from '@/app/components/ProductCard'

export default async function PosPage() {
  const supabase = await createServerSupabaseClient()

  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase
    .from('profiles')
    .select('tenant_id')
    .eq('id', user!.id)
    .single()

  const [{ data: productsData }, { data: kitsData }, { data: tenant }] = await Promise.all([
    supabase.from('products').select('*').eq('activo', true).order('categoria'),
    supabase.from('kits')
      .select('*, kit_items(cantidad, products(bitrate_mbps, capacidad_tb, categoria))')
      .eq('activo', true).order('nombre'),
    supabase.from('tenants').select('nombre, ruc, telefono, email, logo_url')
      .eq('id', profile!.tenant_id).single(),
  ])

  const productos: Producto[] = (productsData ?? []).map(p => ({
    id: p.id,
    nombre: p.nombre,
    specs: p.specs ?? '',
    precio: p.precio,
    categoria: p.categoria,
    bitrateMbps: p.bitrate_mbps ?? undefined,
    capacidadTB: p.capacidad_tb ?? undefined,
    imagen: p.imagen_url ?? '',
    esKit: false,
  }))

  const kits: Producto[] = (kitsData ?? []).map(k => {
    const items = k.kit_items ?? []
    const bitrateMbps = items.reduce((acc: number, i: {cantidad: number; products: {bitrate_mbps: number | null; categoria: string} | null}) =>
      i.products?.categoria === 'camara' ? acc + (i.products.bitrate_mbps ?? 0) * i.cantidad : acc, 0)
    const capacidadTB = items.reduce((acc: number, i: {cantidad: number; products: {capacidad_tb: number | null; categoria: string} | null}) =>
      i.products?.categoria === 'hdd' ? acc + (i.products.capacidad_tb ?? 0) * i.cantidad : acc, 0)
    return {
      id: k.id,
      nombre: k.nombre,
      specs: k.descripcion ?? 'Kit de equipos',
      precio: k.precio,
      categoria: 'kit' as 'camara',
      bitrateMbps: bitrateMbps > 0 ? bitrateMbps : undefined,
      capacidadTB: capacidadTB > 0 ? capacidadTB : undefined,
      imagen: k.imagen_url ?? '',
      esKit: true,
      kitId: k.id,
    }
  })

  return (
    <PosClient
      productos={[...productos, ...kits]}
      tenant={tenant ?? { nombre: 'Mi Tienda CCTV', ruc: null, telefono: null, email: null, logo_url: null }}
    />
  )
}