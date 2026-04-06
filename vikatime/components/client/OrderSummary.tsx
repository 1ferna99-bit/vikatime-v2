// components/client/OrderSummary.tsx
import type { Plan, DaySelection } from '@/types'
import { Card } from '@/components/ui/index'

interface Props {
  customerName: string
  plan: Plan
  days: DaySelection[]
}

export function OrderSummary({ customerName, plan, days }: Props) {
  return (
    <Card className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-stone-100 pb-4">
        <span className="text-3xl">🟠</span>
        <div>
          <p className="font-display text-lg text-stone-800">Resumen de tu pedido</p>
          <p className="text-sm text-stone-500">Revisa antes de enviar</p>
        </div>
      </div>

      {/* Datos cliente */}
      <div className="space-y-1">
        <p className="text-sm text-stone-500 font-medium">👤 Cliente</p>
        <p className="font-semibold text-stone-800">{customerName}</p>
        <p className="text-sm text-[#E8611A] font-medium">📋 {plan.name} — {plan.lunches_per_week} almuerzos / semana</p>
      </div>

      {/* Días */}
      <div className="space-y-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-stone-400">📅 Menú de la semana</p>
        <div className="h-px bg-stone-100" />

        {days.map(day => (
          <div key={day.day_key} className="rounded-xl bg-[#FDFAF5] border border-stone-100 p-4 space-y-1.5">
            <p className="font-semibold text-stone-800 uppercase text-sm tracking-wide">{day.day_label}</p>
            <p className="text-sm text-stone-700">🍽️ <span className="font-medium">Proteína:</span> {day.protein_name}</p>
            <p className="text-sm text-stone-700">🍝 <span className="font-medium">Acompañamiento:</span> {day.carb_name}</p>
            {day.salads.length > 0 && (
              <p className="text-sm text-stone-700">🥗 <span className="font-medium">Ensalada:</span> {day.salads.join(', ')}</p>
            )}
            {day.delivery_time && (
              <p className="text-sm text-stone-500">🕐 {day.delivery_time}</p>
            )}
          </div>
        ))}
      </div>
    </Card>
  )
}
