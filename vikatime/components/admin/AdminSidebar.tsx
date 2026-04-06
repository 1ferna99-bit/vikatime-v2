'use client'
// components/admin/AdminSidebar.tsx

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

const links = [
  { href: '/admin',        label: 'Dashboard',  icon: '📊' },
  { href: '/admin/orders', label: 'Pedidos',    icon: '📋' },
  { href: '/admin/menu',   label: 'Menú',       icon: '🍽️' },
  { href: '/admin/plans',  label: 'Planes',     icon: '📦' },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const router   = useRouter()
  const supabase = createClient()

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/admin/login')
  }

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-white border-r border-stone-100 flex flex-col z-20">
      {/* Logo */}
      <div className="p-6 border-b border-stone-100">
        <span className="text-xl">🟠</span>
        <span className="font-display text-lg text-stone-800 ml-2">VikaTime</span>
        <p className="text-xs text-stone-400 mt-0.5 ml-7">Panel Administrativo</p>
      </div>

      {/* Links */}
      <nav className="flex-1 p-4 space-y-1">
        {links.map(link => {
          const active = link.href === '/admin' ? pathname === '/admin' : pathname.startsWith(link.href)
          return (
            <Link key={link.href} href={link.href}
              className={cn(
                'flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-all',
                active
                  ? 'bg-[#FFF0E6] text-[#E8611A]'
                  : 'text-stone-600 hover:bg-stone-50 hover:text-stone-800'
              )}>
              <span>{link.icon}</span>
              {link.label}
            </Link>
          )
        })}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-stone-100">
        <button onClick={handleLogout}
          className="w-full flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium text-stone-500 hover:bg-stone-50 hover:text-stone-700 transition-all">
          <span>🚪</span> Cerrar sesión
        </button>
      </div>
    </aside>
  )
}
