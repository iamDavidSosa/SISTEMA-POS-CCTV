'use client'

import { useState } from 'react'
import ProductCard, { type Producto } from '../components/ProductCard'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { calcularRetencion } from '../lib/retencion'
import { PDFDownloadLink } from '@react-pdf/renderer'
import CotizacionPDF from '../lib/CotizacionesPDF'
import { createClient } from '../lib/supabase'


interface ItemCarrito {
  producto: Producto
  cantidad: number
}

export default function PosClient({ productos }: { productos: Producto[] }) {
  const [carrito, setCarrito] = useState<ItemCarrito[]>([])
  const [categoriaActiva, setCategoriaActiva] = useState<string>('todas')
  const [clienteNombre, setClienteNombre] = useState('')
  const [guardando, setGuardando] = useState(false)
  const [cotizacionGuardada, setCotizacionGuardada] = useState(false)
  

  function agregarAlCarrito(producto: Producto) {
    setCarrito(prev => {
      const existe = prev.find(item => item.producto.id === producto.id)
      if (existe) {
        return prev.map(item =>
          item.producto.id === producto.id
            ? { ...item, cantidad: item.cantidad + 1 }
            : item
        )
      }
      return [...prev, { producto, cantidad: 1 }]
    })
  }

  function cambiarCantidad(id: string, delta: number) {
    setCarrito(prev =>
      prev
        .map(item =>
          item.producto.id === id
            ? { ...item, cantidad: item.cantidad + delta }
            : item
        )
        .filter(item => item.cantidad > 0)
    )
  }

  const subtotal = carrito.reduce((acc, item) => acc + item.producto.precio * item.cantidad, 0)
  const itbis = Math.round(subtotal * 0.18)
  const total = subtotal + itbis

  const retencion = calcularRetencion(
    carrito.map(item => ({
      categoria: item.producto.categoria,
      bitrateMbps: item.producto.bitrateMbps,
      capacidadTB: item.producto.capacidadTB,
      cantidad: item.cantidad,
    }))
  )

  const productosFiltrados = categoriaActiva === 'todas'
    ? productos
    : productos.filter(p => p.categoria === categoriaActiva)

  const categorias = [
    { id: 'todas', label: 'Todos' },
    { id: 'camara', label: 'Cámaras' },
    { id: 'dvr', label: 'DVR / NVR' },
    { id: 'hdd', label: 'Discos' },
    { id: 'accesorio', label: 'Accesorios' },
  ]
  
  async function guardarCotizacion() {
    if (!clienteNombre.trim() || carrito.length === 0) return
    setGuardando(true)

    const supabase = createClient()
    const numero = `COT-${new Date().getTime()}`

    const { data: quote, error: quoteError } = await supabase
      .from('quotes')
      .insert({
        numero,
        cliente_nombre: clienteNombre,
        subtotal,
        itbis,
        total,
        dias_retencion: retencion?.diasRetencion ?? null,
        estado: 'pendiente',
      })
      .select()
      .single()

    if (quoteError || !quote) {
      console.error('Error guardando cotización:', quoteError)
      setGuardando(false)
      return
    }

    const items = carrito.map(item => ({
      quote_id: quote.id,
      product_id: item.producto.id,
      nombre: item.producto.nombre,
      precio: item.producto.precio,
      cantidad: item.cantidad,
      total: item.producto.precio * item.cantidad,
    }))

    await supabase.from('quote_items').insert(items)

    setCotizacionGuardada(true)
    setGuardando(false)
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <div className="flex-1 p-6 overflow-y-auto">
        <h1 className="text-xl font-semibold text-gray-900 mb-4">Catálogo</h1>
        <div className="flex gap-2 mb-4 flex-wrap">
          {categorias.map(cat => (
            <button
              key={cat.id}
              onClick={() => setCategoriaActiva(cat.id)}
              className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                categoriaActiva === cat.id
                  ? 'bg-gray-900 text-white border-gray-900'
                  : 'bg-white text-gray-600 border-gray-300 hover:border-gray-500'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-3">
          {productosFiltrados.map(producto => (
            <ProductCard
              key={producto.id}
              producto={producto}
              onAgregar={agregarAlCarrito}
            />
          ))}
        </div>
      </div>

      <div className="w-80 bg-white border-l flex flex-col">
        <div className="p-4 border-b">
          <h2 className="font-semibold text-gray-900">Cotización</h2>
          {carrito.length > 0 && (
            <Badge variant="secondary" className="mt-1">{carrito.length} producto(s)</Badge>
          )}
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          {carrito.length === 0 ? (
            <p className="text-sm text-gray-400 text-center mt-8">Agrega productos del catálogo</p>
          ) : (
            <div className="space-y-3">
              {carrito.map(item => (
                <div key={item.producto.id} className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{item.producto.nombre}</p>
                    <p className="text-xs text-gray-400">RD${item.producto.precio.toLocaleString('es-DO')}</p>
                  </div>
                  <div className="flex items-center gap-2 ml-2">
                    <button onClick={() => cambiarCantidad(item.producto.id, -1)}
                      className="w-5 h-5 border rounded text-xs hover:bg-gray-100">−</button>
                    <span className="text-sm w-4 text-center">{item.cantidad}</span>
                    <button onClick={() => cambiarCantidad(item.producto.id, 1)}
                      className="w-5 h-5 border rounded text-xs hover:bg-gray-100">+</button>
                  </div>
                </div>
              ))}
            </div>
          )}
          {retencion && (
            <div className="mt-4 p-3 rounded-lg border text-sm bg-gray-50">
              <div className="flex items-center justify-between mb-1">
                <p className="font-medium text-gray-700">Retención estimada</p>
                <Badge variant={retencion.suficiente ? 'default' : 'destructive'}>
                  {retencion.suficiente ? 'Suficiente' : 'Insuficiente'}
                </Badge>
              </div>
              <p className="text-2xl font-bold text-gray-900">{retencion.diasRetencion} días</p>
              <Separator className="my-2" />
              <p className="text-xs text-gray-500">
                {retencion.totalBitrateMbps} Mbps · {retencion.totalTB} TB · {retencion.porcentajeUsado}% usado
              </p>
            </div>
          )}
        </div>
        <div className="p-4 border-t space-y-2">
          <input
            type="text"
            placeholder="Nombre del cliente"
            value={clienteNombre}
            onChange={e => { setClienteNombre(e.target.value); setCotizacionGuardada(false) }}
            className="w-full px-3 py-2 border rounded text-sm focus:outline-none focus:ring-1 focus:ring-gray-400"
          />
          <div className="space-y-1 text-sm">
            <div className="flex justify-between text-gray-500">
              <span>Subtotal</span><span>RD${subtotal.toLocaleString('es-DO')}</span>
            </div>
            <div className="flex justify-between text-gray-500">
              <span>ITBIS (18%)</span><span>RD${itbis.toLocaleString('es-DO')}</span>
            </div>
            <div className="flex justify-between font-semibold text-gray-900 pt-2 border-t">
              <span>Total</span><span>RD${total.toLocaleString('es-DO')}</span>
            </div>
          </div>
          <button
            onClick={guardarCotizacion}
            disabled={carrito.length === 0 || !clienteNombre.trim() || guardando}
            className="w-full py-2 border border-gray-300 rounded text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-40 transition-colors"
          >
            {guardando ? 'Guardando...' : cotizacionGuardada ? '✓ Cotización guardada' : 'Guardar cotización'}
          </button>
          {carrito.length > 0 ? (
            <PDFDownloadLink
              document={
                <CotizacionPDF
                  items={carrito}
                  retencion={retencion}
                  numeroCotizacion={cotizacionGuardada ? carrito[0]?.producto.id.slice(0,8) ?? 'DRAFT' : 'DRAFT'}
                  clienteNombre={clienteNombre || 'Cliente'}
                  empresaNombre="Mi Tienda CCTV"
                  empresaRNC="1-30-12345-6"
                  empresaTel="809-555-1234"
                />
              }
              fileName={`cotizacion-${clienteNombre || 'cliente'}.pdf`}
              className="block w-full py-2 bg-gray-900 text-white rounded text-sm font-medium text-center hover:bg-gray-700 transition-colors"
            >
              {({ loading }) => loading ? 'Generando PDF...' : 'Descargar cotización PDF'}
            </PDFDownloadLink>
          ) : (
            <button disabled className="w-full py-2 bg-gray-900 text-white rounded text-sm font-medium opacity-40">
              Descargar cotización PDF
            </button>
          )}
        </div>
      </div>
    </div>
  )
}