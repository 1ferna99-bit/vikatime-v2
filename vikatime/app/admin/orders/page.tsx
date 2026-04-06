'use client'
// app/admin/orders/page.tsx

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ORDER_STATUS_COLORS, ORDER_STATUS_LABELS, type Order, type OrderStatus } from '@/types'
import { Button } from '@/components/ui/index'

const ALL_STATUSES: OrderStatus[] = ['pendiente', 'confirmado', 'preparado', 'entregado', 'cancelado']

export default function OrdersPage() {
  const supabase = createClient()
  const [orders,        setOrders]        = useState<Order[]>([])
  const [loading,       setLoading]       = useState(true)
  const [filterStatus,  setFilterStatus]  = useState<OrderStatus | ''>('')
  const [filterClient,  setFilterClient]  = useState('')
  const [filterDate,    setFilterDate]    = useState('')
  const [expandedId,    setExpandedId]    = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    let query = supabase.from('orders').select('*, order_days(*)').order('created_at', { ascending: false })
    if (filterStatus)       query = query.eq('status', filterStatus)
    if (filterClient)       query = query.ilike('customer_name', `%${filterClient}%`)
    if (filterDate)         query = query.gte('created_at', `${filterDate}T00:00:00`).lte('created_at', `${filterDate}T23:59:59`)
    const { data } = await query
    setOrders((data as Order[]) ?? [])
    setLoading(false)
  }, [filterStatus, filterClient, filterDate])

  useEffect(() => { load() }, [load])

  async function updateStatus(id: string, status: OrderStatus) {
    await supabase.from('orders').update({ status }).eq('id', id)
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o))
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl text-stone-800">Pedidos</h1>
        <p className="text-stone-500 mt-1">Gestión y seguimiento de pedidos</p>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-4 flex flex-wrap gap-3">
        <input type="text" placeholder="Buscar cliente…" value={filterClient}
          onChange={e => setFilterClient(e.target.value)}
          className="flex-1 min-w-[160px] rounded-xl border border-stone-200 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#E8611A]/30 focus:border-[#E8611A]" />

        <input type="date" value={filterDate} onChange={e => setFilterDate(e.target.value)}
          className="rounded-xl border border-stone-200 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#E8611A]/30 focus:border-[#E8611A]" />

        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value as OrderStatus | '')}
          className="rounded-xl border border-stone-200 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#E8611A]/30 focus:border-[#E8611A]">
          <option value="">Todos los estados</option>
          {ALL_STATUSES.map(s => <option key={s} value={s}>{ORDER_STATUS_LABELS[s]}</option>)}
        </select>

        <Button variant="ghost" onClick={() => { setFilterStatus(''); setFilterClient(''); setFilterDate('') }}
          className="text-xs px-3 py-2">Limpiar</Button>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
        {loading ? (
          <p className="text-center text-stone-400 py-16 text-sm">Cargando pedidos…</p>
        ) : orders.length === 0 ? (
          <p className="text-center text-stone-400 py-16 text-sm">Sin pedidos con esos filtros</p>
        ) : (
          <div className="divide-y divide-stone-50">
            {orders.map(order => (
              <div key={order.id}>
                {/* Fila principal */}
                <button onClick={() => setExpandedId(expandedId === order.id ? null : order.id)}
                  className="w-full flex items-center gap-4 px-6 py-4 hover:bg-stone-50 transition text-left">
                  <div className="flex-1">
                    <p className="font-medium text-stone-800">{order.customer_name}</p>
                    <p className="text-xs text-stone-500">{order.customer_phone} · {order.plan_name}</p>
                  </div>
                  <p className="text-xs text-stone-400 hidden sm:block">
                    {new Date(order.created_at).toLocaleDateString('es-CL', { day:'2-digit', month:'short', year:'numeric' })}
                  </p>
                  <span className={`text-xs font-semibold px-3 py-1 rounded-full ${ORDER_STATUS_COLORS[order.status]}`}>
                    {ORDER_STATUS_LABELS[order.status]}
                  </span>
                  <span className="text-stone-400 text-xs">{expandedId === order.id ? '▲' : '▼'}</span>
                </button>

                {/* Detalle expandido */}
                {expandedId === order.id && (
                  <div className="bg-stone-50 border-t border-stone-100 px-6 py-5 space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-stone-400 text-xs font-medium uppercase tracking-wide">Dirección</p>
                        <p className="text-stone-700 mt-1">{order.customer_address}</p>
                      </div>
                      {order.customer_notes && (
                        <div>
                          <p className="text-stone-400 text-xs font-medium uppercase tracking-wide">Notas</p>
                          <p className="text-stone-700 mt-1">{order.customer_notes}</p>
                        </div>
                      )}
                    </div>

                    {/* Días del pedido */}
                    {order.order_days && order.order_days.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-xs font-semibold uppercase tracking-wide text-stone-400">Menú seleccionado</p>
                        {order.order_days.map(d => (
                          <div key={d.id} className="bg-white rounded-xl border border-stone-100 px-4 py-3 text-sm space-y-0.5">
                            <p className="font-semibold text-stone-700">{d.day_label}</p>
                            <p className="text-stone-600">🍽️ {d.protein_name}</p>
                            <p className="text-stone-600">🍝 {d.carb_name}</p>
                            {d.salads?.length > 0 && <p className="text-stone-600">🥗 {d.salads.join(', ')}</p>}
                            {d.delivery_time && <p className="text-stone-500 text-xs">🕐 {d.delivery_time}</p>}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Cambiar estado */}
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-stone-400 mb-2">Cambiar estado</p>
                      <div className="flex flex-wrap gap-2">
                        {ALL_STATUSES.map(s => (
                          <button key={s} onClick={() => updateStatus(order.id, s)}
                            className={`text-xs font-semibold px-3 py-1.5 rounded-full border-2 transition-all
                              ${order.status === s
                                ? ORDER_STATUS_COLORS[s] + ' border-transparent'
                                : 'border-stone-200 text-stone-500 hover:border-stone-300'}`}>
                            {ORDER_STATUS_LABELS[s]}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
