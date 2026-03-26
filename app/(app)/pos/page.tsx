import { createServerSupabaseClient } from '@/app/lib/supabase-server'
import PosClient from './PosClient'
import type { Producto } from '@/app/components/ProductCard'

export default async function PosPage() {
  const supabase = await createServerSupabaseClient()

  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('activo', true)
    .order('categoria')

  if (error) console.error('Error cargando productos:', error)

  const productos: Producto[] = (data ?? []).map(p => ({
    id: p.id,
    nombre: p.nombre,
    specs: p.specs ?? '',
    precio: p.precio,
    categoria: p.categoria,
    bitrateMbps: p.bitrate_mbps ?? undefined,
    capacidadTB: p.capacidad_tb ?? undefined,
    imagen: p.imagen_url ?? '',
  }))

  return <PosClient productos={productos} />
}