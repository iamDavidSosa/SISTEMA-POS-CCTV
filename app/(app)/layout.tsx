import Link from 'next/link'
import { createServerSupabaseClient } from '../lib/supabase-server'
import { redirect } from 'next/navigation'

const NAV = [
  { href: '/dashboard',    label: 'Dashboard',     icon: '▦' },
  { href: '/pos',          label: 'POS',            icon: '⊞' },
  { href: '/cotizaciones', label: 'Cotizaciones',   icon: '◧' },
  { href: '/productos',    label: 'Productos',      icon: '⊟' },
  { href: '/clientes',     label: 'Clientes',       icon: '◯' },
  { href: '/kits',         label: 'Kits',           icon: '⊕' },
  { href: '/configuracion',label: 'Configuración',  icon: '◈' },
]

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: tenant } = await supabase
    .from('tenants')
    .select('nombre')
    .single()

  return (
    <div className="flex h-screen bg-gray-50">

      {/* Sidebar */}
      <aside className="w-52 bg-white border-r flex flex-col flex-shrink-0">

        {/* Logo / Nombre de tienda */}
        <div className="p-4 border-b">
          <p className="font-semibold text-gray-900 text-sm truncate">
            {tenant?.nombre ?? 'CCTV POS'}
          </p>
          <p className="text-xs text-gray-400 mt-0.5 truncate">{user.email}</p>
        </div>

        {/* Navegación */}
        <nav className="flex-1 p-2">
          {NAV.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors mb-0.5"
            >
              <span className="text-base w-5 text-center">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Cerrar sesión */}
        <div className="p-2 border-t">
          <form action="/api/logout" method="POST">
            <button
              type="submit"
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition-colors"
            >
              <span className="text-base w-5 text-center">→</span>
              Cerrar sesión
            </button>
          </form>
        </div>
      </aside>

      {/* Contenido principal */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>

    </div>
  )
}