'use client'
// app/admin/plans/page.tsx

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Plan } from '@/types'
import { Button, Input, Card } from '@/components/ui/index'

const EMPTY: Partial<Plan> = { name: '', lunches_per_week: 3, is_active: true }

export default function PlansPage() {
  const supabase = createClient()
  const [plans,   setPlans]   = useState<Plan[]>([])
  const [editing, setEditing] = useState<Partial<Plan> | null>(null)
  const [saving,  setSaving]  = useState(false)

  async function load() {
    const { data } = await supabase.from('plans').select('*').order('lunches_per_week')
    setPlans(data ?? [])
  }

  useEffect(() => { load() }, [])

  async function handleSave() {
    if (!editing?.name || !editing.lunches_per_week) return
    setSaving(true)

    if (editing.id) {
      await supabase.from('plans').update({
        name: editing.name,
        lunches_per_week: editing.lunches_per_week,
        is_active: editing.is_active,
      }).eq('id', editing.id)
    } else {
      await supabase.from('plans').insert({
        name: editing.name,
        lunches_per_week: editing.lunches_per_week,
        is_active: editing.is_active ?? true,
      })
    }

    await load()
    setEditing(null)
    setSaving(false)
  }

  async function toggleActive(plan: Plan) {
    await supabase.from('plans').update({ is_active: !plan.is_active }).eq('id', plan.id)
    setPlans(prev => prev.map(p => p.id === plan.id ? { ...p, is_active: !p.is_active } : p))
  }

  async function deletePlan(id: string) {
    if (!confirm('¿Eliminar este plan?')) return
    await supabase.from('plans').delete().eq('id', id)
    setPlans(prev => prev.filter(p => p.id !== id))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl text-stone-800">Planes</h1>
          <p className="text-stone-500 mt-1">Gestión de planes de almuerzo</p>
        </div>
        <Button onClick={() => setEditing(EMPTY)}>+ Nuevo plan</Button>
      </div>

      {/* Modal edición */}
      {editing && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center px-4" onClick={() => setEditing(null)}>
          <Card className="w-full max-w-sm space-y-4" onClick={e => e.stopPropagation()}>
            <h2 className="font-display text-xl text-stone-800">{editing.id ? 'Editar plan' : 'Nuevo plan'}</h2>
            <Input label="Nombre del plan" value={editing.name ?? ''}
              onChange={e => setEditing(prev => ({ ...prev, name: e.target.value }))} />
            <Input label="Almuerzos por semana" type="number" min={1} max={5}
              value={editing.lunches_per_week ?? 3}
              onChange={e => setEditing(prev => ({ ...prev, lunches_per_week: Number(e.target.value) }))} />
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={editing.is_active ?? true}
                onChange={e => setEditing(prev => ({ ...prev, is_active: e.target.checked }))}
                className="w-4 h-4 accent-[#E8611A]" />
              <span className="text-sm text-stone-700">Plan activo</span>
            </label>
            <div className="flex gap-3">
              <Button variant="ghost" onClick={() => setEditing(null)} className="flex-1">Cancelar</Button>
              <Button loading={saving} onClick={handleSave} className="flex-1">Guardar</Button>
            </div>
          </Card>
        </div>
      )}

      {/* Lista de planes */}
      <div className="bg-white rounded-2xl border border-stone-100 shadow-sm divide-y divide-stone-50">
        {plans.length === 0 && (
          <p className="text-center text-stone-400 py-16 text-sm">Sin planes aún</p>
        )}
        {plans.map(plan => (
          <div key={plan.id} className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-4">
              <span className={`h-2.5 w-2.5 rounded-full ${plan.is_active ? 'bg-green-400' : 'bg-stone-300'}`} />
              <div>
                <p className="font-medium text-stone-800">{plan.name}</p>
                <p className="text-sm text-stone-500">{plan.lunches_per_week} almuerzos / semana</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => toggleActive(plan)}
                className="text-xs text-stone-500 hover:text-stone-700 px-3 py-1.5 rounded-lg hover:bg-stone-100 transition">
                {plan.is_active ? 'Desactivar' : 'Activar'}
              </button>
              <button onClick={() => setEditing(plan)}
                className="text-xs text-[#E8611A] hover:bg-[#FFF0E6] px-3 py-1.5 rounded-lg transition">
                Editar
              </button>
              <button onClick={() => deletePlan(plan.id)}
                className="text-xs text-red-500 hover:bg-red-50 px-3 py-1.5 rounded-lg transition">
                Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
