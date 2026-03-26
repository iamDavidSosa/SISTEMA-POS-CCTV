import ClienteForm from '../ClienteForm'

export default function NuevoClientePage() {
  return (
    <div className="p-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-xl font-semibold text-gray-900 mb-6">Nuevo cliente</h1>
        <ClienteForm />
      </div>
    </div>
  )
}