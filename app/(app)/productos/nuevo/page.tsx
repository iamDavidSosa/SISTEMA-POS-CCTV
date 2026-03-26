import ProductoForm from '../ProductoForm'

export default function NuevoProductoPage() {
  return (
    <div className="p-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-xl font-semibold text-gray-900 mb-6">Nuevo producto</h1>
        <ProductoForm />
      </div>
    </div>
  )
}