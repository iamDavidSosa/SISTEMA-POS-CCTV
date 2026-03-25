'use client'  // ← necesario porque usamos hooks (useState)

import { useState } from 'react'
import ProductCard, { type Producto } from '../components/ProductCard'

// Datos de ejemplo — en la Fase 2 estos vendrán de Supabase
const PRODUCTOS: Producto[] = [
  {
    id: 1,
    nombre: 'Cámara Domo 8MP 4K',
    specs: '8MP · H.265 · IR 40m · 20fps',
    precio: 6200,
    categoria: 'camara',
    bitrateMbps: 3.5,
    imagen: 'https://hikvisioncolombia.com/wp-content/uploads/2023/05/DS-2CD3145G0-IS.jpg',
  },
  {
    id: 2,
    nombre: 'Cámara Bullet 4MP',
    specs: '4MP · H.265+ · IR 30m · 15fps',
    precio: 3800,
    categoria: 'camara',
    bitrateMbps: 1.5,
    imagen: 'https://w7.pngwing.com/pngs/849/298/png-transparent-hikvision-cctv-camera.png',
  },
  {
    id: 3,
    nombre: 'NVR 8 Canales 4K',
    specs: '8 canales · 2 SATA · H.265+',
    precio: 8900,
    categoria: 'dvr',
    imagen: 'https://w7.pngwing.com/pngs/943/340/png-transparent-inkovideo-v-200-4m-black-4mp-fullhd-poe-bullet-onvif-ip-cam-schwarz-network-video-recorder-ip-camera-power-over-ethernet-others-electronics-stereophonic-sound-electronic-device.png',
  },
  {
    id: 4,
    nombre: 'HDD Vigilancia 4TB',
    specs: 'Seagate SkyHawk · 5400RPM',
    precio: 5800,
    categoria: 'hdd',
    capacidadTB: 4,
    imagen: 'https://w7.pngwing.com/pngs/872/155/png-transparent-laptop-hewlett-packard-hard-drives-hp-pavilion-serial-ata-hard-disc-electronics-computer-hard-disk-drive.png',
  },
  {
    id: 5,
    nombre: 'HDD Vigilancia 2TB',
    specs: 'Seagate SkyHawk · 5400RPM',
    precio: 3200,
    categoria: 'hdd',
    capacidadTB: 2,
    imagen: 'https://w7.pngwing.com/pngs/485/544/png-transparent-hard-drives-hybrid-drive-seagate-barracuda-serial-ata-solid-state-drive-hard-disk-miscellaneous-electronics-hard-disk-drive.png',
  },
  {
    id: 6,
    nombre: 'Switch PoE 8 puertos',
    specs: 'PoE+ · 120W · VLAN',
    precio: 4200,
    categoria: 'accesorio',
    imagen: 'https://w7.pngwing.com/pngs/703/443/png-transparent-network-switch-stackable-switch-power-over-ethernet-gigabit-ethernet-port-switch-cisco-computer-network-twisted-pair-network-switch.png',
  },
]

// Tipo para cada ítem del carrito
interface ItemCarrito {
  producto: Producto
  cantidad: number
}

export default function PosPage() {
  // useState es como una variable reactiva — cuando cambia, la pantalla se actualiza
  const [carrito, setCarrito] = useState<ItemCarrito[]>([])
  const [categoriaActiva, setCategoriaActiva] = useState<string>('todas')

  // Agregar producto al carrito
  function agregarAlCarrito(producto: Producto) {
    setCarrito(prev => {
      const existe = prev.find(item => item.producto.id === producto.id)
      if (existe) {
        // Si ya existe, aumenta la cantidad
        return prev.map(item =>
          item.producto.id === producto.id
            ? { ...item, cantidad: item.cantidad + 1 }
            : item
        )
      }
      // Si no existe, lo agrega
      return [...prev, { producto, cantidad: 1 }]
    })
  }

  // Cambiar cantidad de un ítem
  function cambiarCantidad(id: number, delta: number) {
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

  // Cálculos del carrito
  const subtotal = carrito.reduce((acc, item) => acc + item.producto.precio * item.cantidad, 0)
  const itbis = Math.round(subtotal * 0.18)
  const total = subtotal + itbis

  // Cálculo de retención — la lógica CCTV
  const totalBitrateMbps = carrito
    .filter(item => item.producto.categoria === 'camara')
    .reduce((acc, item) => acc + (item.producto.bitrateMbps ?? 0) * item.cantidad, 0)

  const totalTB = carrito
    .filter(item => item.producto.categoria === 'hdd')
    .reduce((acc, item) => acc + (item.producto.capacidadTB ?? 0) * item.cantidad, 0)

  const diasRetencion = totalBitrateMbps > 0 && totalTB > 0
    ? Math.floor((totalTB * 1e12) / ((totalBitrateMbps * 1e6 / 8) * 86400))
    : null

  // Filtrar productos por categoría
  const productosFiltrados = categoriaActiva === 'todas'
    ? PRODUCTOS
    : PRODUCTOS.filter(p => p.categoria === categoriaActiva)

  const categorias = [
    { id: 'todas', label: 'Todos' },
    { id: 'camara', label: 'Cámaras' },
    { id: 'dvr', label: 'DVR / NVR' },
    { id: 'hdd', label: 'Discos' },
    { id: 'accesorio', label: 'Accesorios' },
  ]

  return (
    <div className="flex h-screen bg-gray-50">

      {/* Panel izquierdo — catálogo */}
      <div className="flex-1 p-6 overflow-y-auto">
        <h1 className="text-xl font-semibold text-gray-900 mb-4">Catálogo</h1>

        {/* Filtros por categoría */}
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

        {/* Grid de productos */}
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

      {/* Panel derecho — cotización */}
      <div className="w-80 bg-white border-l flex flex-col">
        <div className="p-4 border-b">
          <h2 className="font-semibold text-gray-900">Cotización</h2>
          <p className="text-xs text-gray-400 mt-1">
            {carrito.length === 0 ? 'Sin productos' : `${carrito.length} producto(s)`}
          </p>
        </div>

        {/* Items del carrito */}
        <div className="flex-1 overflow-y-auto p-4">
          {carrito.length === 0 ? (
            <p className="text-sm text-gray-400 text-center mt-8">
              Agrega productos del catálogo
            </p>
          ) : (
            <div className="space-y-3">
              {carrito.map(item => (
                <div key={item.producto.id} className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{item.producto.nombre}</p>
                    <p className="text-xs text-gray-400">
                      RD${item.producto.precio.toLocaleString('es-DO')}
                    </p>
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

          {/* Cálculo de retención */}
          {diasRetencion !== null && (
            <div className={`mt-4 p-3 rounded-lg border text-sm ${
              diasRetencion >= 30
                ? 'bg-green-50 border-green-200 text-green-800'
                : 'bg-yellow-50 border-yellow-200 text-yellow-800'
            }`}>
              <p className="font-medium">Retención estimada</p>
              <p className="text-2xl font-bold mt-1">{diasRetencion} días</p>
              <p className="text-xs mt-1 opacity-75">
                {totalBitrateMbps.toFixed(1)} Mbps · {totalTB} TB disponibles
              </p>
            </div>
          )}
        </div>

        {/* Totales */}
        <div className="p-4 border-t">
          <div className="space-y-1 text-sm mb-3">
            <div className="flex justify-between text-gray-500">
              <span>Subtotal</span>
              <span>RD${subtotal.toLocaleString('es-DO')}</span>
            </div>
            <div className="flex justify-between text-gray-500">
              <span>ITBIS (18%)</span>
              <span>RD${itbis.toLocaleString('es-DO')}</span>
            </div>
            <div className="flex justify-between font-semibold text-gray-900 pt-2 border-t">
              <span>Total</span>
              <span>RD${total.toLocaleString('es-DO')}</span>
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