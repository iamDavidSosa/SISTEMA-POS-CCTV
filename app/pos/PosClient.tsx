'use client'

import { useState } from 'react'
import ProductCard, { type Producto } from '../components/ProductCard'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

interface ItemCarrito {
  producto: Producto
  cantidad: number
}

export default function PosClient({ productos }: { productos: Producto[] }) {
  const [carrito, setCarrito] = useState<ItemCarrito[]>([])
  const [categoriaActiva, setCategoriaActiva] = useState<string>('todas')

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

  const totalBitrateMbps = carrito
    .filter(item => item.producto.categoria === 'camara')
    .reduce((acc, item) => acc + (item.producto.bitrateMbps ?? 0) * item.cantidad, 0)

  const totalTB = carrito
    .filter(item => item.producto.categoria === 'hdd')
    .reduce((acc, item) => acc + (item.producto.capacidadTB ?? 0) * item.cantidad, 0)

  const diasRetencion = totalBitrateMbps > 0 && totalTB > 0
    ? Math.floor((totalTB * 1e12) / ((totalBitrateMbps * 1e6 / 8) * 86400))
    : null

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
          {diasRetencion !== null && (
            <div className="mt-4 p-3 rounded-lg border text-sm bg-gray-50">
              <div className="flex items-center justify-between mb-1">
                <p className="font-medium text-gray-700">Retención estimada</p>
                <Badge variant={diasRetencion >= 30 ? 'default' : 'destructive'}>
                  {diasRetencion >= 30 ? 'Suficiente' : 'Insuficiente'}
                </Badge>
              </div>
              <p className="text-2xl font-bold text-gray-900">{diasRetencion} días</p>
              <Separator className="my-2" />
              <p className="text-xs text-gray-500">
                {totalBitrateMbps.toFixed(1)} Mbps · {totalTB} TB disponibles
              </p>
            </div>
          )}
        </div>
        <div className="p-4 border-t">
          <div className="space-y-1 text-sm mb-3">
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
            disabled={carrito.length === 0}
            className="w-full py-2 bg-gray-900 text-white rounded text-sm font-medium disabled:opacity-40 hover:bg-gray-700 transition-colors"
          >
            Generar cotización PDF
          </button>
        </div>
      </div>
    </div>
  )
}