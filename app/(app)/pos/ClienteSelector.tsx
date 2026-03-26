'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/app/lib/supabase'

interface Cliente {
  id: string
  nombre: string
  rnc: string | null
  telefono: string | null
  email: string | null
}

interface Props {
  onSeleccionar: (cliente: Cliente | null) => void
  clienteSeleccionado: Cliente | null
}

export default function ClienteSelector({ onSeleccionar, clienteSeleccionado }: Props) {
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [busqueda, setBusqueda] = useState('')
  const [abierto, setAbierto] = useState(false)
  const [modoNuevo, setModoNuevo] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [nuevoCliente, setNuevoCliente] = useState({ nombre: '', rnc: '', telefono: '', email: '' })
  const supabase = createClient()

  useEffect(() => {
    async function cargarClientes() {
      const { data } = await supabase.from('clients').select('*').order('nombre')
      setClientes(data ?? [])
    }
    cargarClientes()
  }, [])

  const filtrados = clientes.filter(c =>
    c.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    c.rnc?.includes(busqueda) ||
    c.email?.toLowerCase().includes(busqueda.toLowerCase())
  )

  async function crearCliente() {
    if (!nuevoCliente.nombre.trim()) return
    setGuardando(true)

    const { data: { user } } = await supabase.auth.getUser()
    const { data: profile } = await supabase
      .from('profiles').select('tenant_id').eq('id', user!.id).single()

    const { data } = await supabase.from('clients').insert({
      tenant_id: profile!.tenant_id,
      nombre: nuevoCliente.nombre,
      rnc: nuevoCliente.rnc || null,
      telefono: nuevoCliente.telefono || null,
      email: nuevoCliente.email || null,
    }).select().single()

    if (data) {
      setClientes(prev => [...prev, data].sort((a, b) => a.nombre.localeCompare(b.nombre)))
      onSeleccionar(data)
      setAbierto(false)
      setModoNuevo(false)
      setNuevoCliente({ nombre: '', rnc: '', telefono: '', email: '' })
    }
    setGuardando(false)
  }

  if (clienteSeleccionado) {
    return (
      <div className="flex items-center justify-between p-2 bg-gray-50 border rounded-lg">
        <div>
          <p className="text-sm font-medium text-gray-900">{clienteSeleccionado.nombre}</p>
          {clienteSeleccionado.rnc && (
            <p className="text-xs text-gray-400">RNC: {clienteSeleccionado.rnc}</p>
          )}
        </div>
        <button
          onClick={() => onSeleccionar(null)}
          className="text-xs text-gray-400 hover:text-gray-600 ml-2"
        >
          ✕
        </button>
      </div>
    )
  }

  return (
    <div className="relative">
      <button
        onClick={() => setAbierto(!abierto)}
        className="w-full px-3 py-2 border rounded-lg text-sm text-left text-gray-500 hover:border-gray-400 transition-colors"
      >
        Seleccionar cliente...
      </button>

      {abierto && (
        <div className="absolute bottom-full left-0 right-0 mb-1 bg-white border rounded-lg shadow-lg z-50 max-h-72 flex flex-col">
          {!modoNuevo ? (
            <>
              <div className="p-2 border-b">
                <input
                  autoFocus
                  type="text"
                  placeholder="Buscar cliente..."
                  value={busqueda}
                  onChange={e => setBusqueda(e.target.value)}
                  className="w-full px-2 py-1.5 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-gray-400"
                />
              </div>
              <div className="overflow-y-auto flex-1">
                {filtrados.length === 0 ? (
                  <p className="text-xs text-gray-400 text-center py-4">Sin resultados</p>
                ) : (
                  filtrados.map(c => (
                    <button
                      key={c.id}
                      onClick={() => { onSeleccionar(c); setAbierto(false); setBusqueda('') }}
                      className="w-full text-left px-3 py-2 hover:bg-gray-50 border-b last:border-0 transition-colors"
                    >
                      <p className="text-sm font-medium text-gray-900">{c.nombre}</p>
                      {c.rnc && <p className="text-xs text-gray-400">RNC: {c.rnc}</p>}
                    </button>
                  ))
                )}
              </div>
              <div className="p-2 border-t">
                <button
                  onClick={() => setModoNuevo(true)}
                  className="w-full text-xs text-center text-gray-500 hover:text-gray-900 py-1"
                >
                  + Registrar cliente nuevo
                </button>
              </div>
            </>
          ) : (
            <div className="p-3 space-y-2">
              <p className="text-xs font-medium text-gray-700 mb-2">Nuevo cliente</p>
              {[
                { campo: 'nombre', placeholder: 'Nombre o razón social *', required: true },
                { campo: 'rnc', placeholder: 'RNC / Cédula' },
                { campo: 'telefono', placeholder: 'Teléfono' },
                { campo: 'email', placeholder: 'Email' },
              ].map(({ campo, placeholder }) => (
                <input
                  key={campo}
                  type="text"
                  placeholder={placeholder}
                  value={nuevoCliente[campo as keyof typeof nuevoCliente]}
                  onChange={e => setNuevoCliente(prev => ({ ...prev, [campo]: e.target.value }))}
                  className="w-full px-2 py-1.5 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-gray-400"
                />
              ))}
              <div className="flex gap-2 pt-1">
                <button
                  onClick={crearCliente}
                  disabled={guardando || !nuevoCliente.nombre.trim()}
                  className="flex-1 py-1.5 bg-gray-900 text-white rounded text-xs disabled:opacity-40 hover:bg-gray-700"
                >
                  {guardando ? 'Guardando...' : 'Crear cliente'}
                </button>
                <button
                  onClick={() => setModoNuevo(false)}
                  className="flex-1 py-1.5 border rounded text-xs text-gray-600 hover:bg-gray-50"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}