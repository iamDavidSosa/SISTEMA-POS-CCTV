'use client'

import { useState } from 'react'
import { createClient } from '../lib/supabase'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleLogin() {
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError('Email o contraseña incorrectos')
    } else {
      router.push('/pos')
    }

    setLoading(false)
  }

  async function handleRegister() {
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.signUp({ email, password })

    if (error) {
      setError(error.message)
    } else {
      setError('Revisa tu email para confirmar tu cuenta')
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white border rounded-xl p-8 w-full max-w-sm">
        <h1 className="text-xl font-semibold text-gray-900 mb-1">CCTV POS</h1>
        <p className="text-sm text-gray-500 mb-6">Inicia sesión para continuar</p>

        <div className="space-y-3">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-gray-400"
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
            className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-gray-400"
          />
        </div>

        {error && (
          <p className="text-xs mt-3 text-red-500">{error}</p>
        )}

        <div className="mt-4 space-y-2">
          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-700 disabled:opacity-40 transition-colors"
          >
            {loading ? 'Cargando...' : 'Iniciar sesión'}
          </button>
          <button
            onClick={handleRegister}
            disabled={loading}
            className="w-full py-2 border rounded-lg text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition-colors"
          >
            Crear cuenta nueva
          </button>
        </div>
      </div>
    </div>
  )
}