interface Producto {
  id: number
  nombre: string
  specs: string
  precio: number
  categoria: 'camara' | 'dvr' | 'hdd' | 'accesorio'
  bitrateMbps?: number
  capacidadTB?: number
  imagen: string
}

interface Props {
  producto: Producto
  onAgregar: (producto: Producto) => void
}

export default function ProductCard({ producto, onAgregar }: Props) {
  const categoriaLabel = {
    camara: 'Cámara',
    dvr: 'DVR / NVR',
    hdd: 'Disco duro',
    accesorio: 'Accesorio',
  }

  return (
    <div className="w-56 h-64 border rounded-lg overflow-hidden bg-white hover:border-gray-400 transition-colors flex flex-col flex-shrink-0">

      {/* Imagen — mitad superior */}
      <div className="w-full h-1/2 bg-gray-50 flex items-center justify-center p-2">
        <img
          src={producto.imagen}
          alt={producto.nombre}
          className="w-full h-full object-contain"
        />
      </div>

      {/* Datos — mitad inferior */}
      <div className="p-2 h-1/2 flex flex-col justify-between">
        <div>
          <span className="text-xs text-gray-400 uppercase tracking-wide">
            {categoriaLabel[producto.categoria]}
          </span>
          <h3 className="font-medium text-gray-900 text-xs leading-tight line-clamp-1 mt-0.5">
            {producto.nombre}
          </h3>
          <p className="text-xs text-gray-400 mt-1 line-clamp-2">{producto.specs}</p>
        </div>
        <div className="flex justify-between items-center">
          <span className="font-semibold text-xs">
            RD${producto.precio.toLocaleString('es-DO')}
          </span>
          <button
            onClick={() => onAgregar(producto)}
            className="text-xs px-2 py-1 border rounded hover:bg-gray-900 hover:text-white transition-colors"
          >
            +
          </button>
        </div>
      </div>
    </div>
  )
}

export type { Producto }