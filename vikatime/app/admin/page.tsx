// app/admin/page.tsx
import { createClient } from '@/lib/supabase/server'
import { ORDER_STATUS_COLORS, ORDER_STATUS_LABELS, type OrderStatus } from '@/types'

export default async function AdminDashboard() {
  const supabase = await createClient()

  const [
    { count: totalOrders },
    { count: pendingOrders },
    { count: activePlans },
    { data: recentOrders },
  ] = await Promise.all([
    supabase.from('orders').select('*', { count: 'exact', head: true }),
    supabase.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'pendiente'),
    supabase.from('plans').select('*', { count: 'exact', head: true }).eq('is_active', true),
    supabase.from('orders').select('*').order('created_at', { ascending: false }).limit(5),
  ])

  const stats = [
    { label: 'Pedidos totales',  value: totalOrders   ?? 0, icon: '📋', color: 'bg-blue-50   text-blue-700'  },
    { label: 'Pendientes',       value: pendingOrders ?? 0, icon: '⏳', color: 'bg-amber-50  text-amber-700' },
    { label: 'Planes activos',   value: activePlans   ?? 0, icon: '📦', color: 'bg-green-50  text-green-700' },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl text-stone-800">Dashboard</h1>
        <p className="text-stone-500 mt-1">Resumen general de VikaTime</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {stats.map(s => (
          <div key={s.label} className={`rounded-2xl p-6 ${s.color} bg-opacity-60`}>
            <p className="text-2xl">{s.icon}</p>
            <p className="text-3xl font-bold mt-2">{s.value}</p>
            <p className="text-sm font-medium mt-1 opacity-80">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Pedidos recientes */}
      <div className="bg-white rounded-2xl border border-stone-100 shadow-sm">
        <div className="p-6 border-b border-stone-100">
          <h2 className="font-display text-xl text-stone-800">Pedidos recientes</h2>
        </div>
        <div className="divide-y divide-stone-50">
          {recentOrders?.map(order => (
            <div key={order.id} className="flex items-center justify-between px-6 py-4 hover:bg-stone-50 transition">
              <div>
                <p className="font-medium text-stone-800">{order.customer_name}</p>
                <p className="text-sm text-stone-500">{order.plan_name} · {new Date(order.created_at).toLocaleDateString('es-CL')}</p>
              </div>
              <span className={`text-xs font-semibold px-3 py-1 rounded-full ${ORDER_STATUS_COLORS[order.status as OrderStatus]}`}>
                {ORDER_STATUS_LABELS[order.status as OrderStatus]}
              </span>
            </div>
          ))}
          {!recentOrders?.length && (
            <p className="text-center text-stone-400 py-10 text-sm">Sin pedidos aún</p>
          )}
        </div>
      </div>
    </div>
  )
}
