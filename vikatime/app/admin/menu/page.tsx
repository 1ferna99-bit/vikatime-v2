'use client'
// app/admin/menu/page.tsx

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { DayWithItems, MenuItem, WeeklyMenuDay } from '@/types'
import { Button, Input, Card } from '@/components/ui/index'
import { cn } from '@/lib/utils'

type Category = 'protein' | 'carb' | 'salad'
const CATEGORY_LABELS: Record<Category, string> = {
  protein: '🍽️ Proteínas',
  carb:    '🍝 Acompañamientos',
  salad:   '🥗 Ensaladas',
}

type ItemForm = { name: string; emoji: string; category: Category }
const EMPTY_ITEM: ItemForm = { name: '', emoji: '', category: 'protein' }

export default function MenuPage() {
  const supabase  = createClient()
  const [days,    setDays]    = useState<DayWithItems[]>([])
  const [selDay,  setSelDay]  = useState<DayWithItems | null>(null)
  const [newItem, setNewItem] = useState<ItemForm>(EMPTY_ITEM)
  const [saving,  setSaving]  = useState(false)
  const [editDay, setEditDay] = useState<Partial<WeeklyMenuDay> | null>(null)

  async function load() {
    const { data: daysData } = await supabase
      .from('weekly_menu_days').select('*').order('sort_order')
    if (!daysData) return

    const daysWithItems = await Promise.all(daysData.map(async day => {
      const { data: items } = await supabase
        .from('menu_items').select('*').eq('day_id', day.id).order('sort_order')
      return {
        ...day,
        proteins: items?.filter(i => i.category === 'protein') ?? [],
        carbs:    items?.filter(i => i.category === 'carb')    ?? [],
        salads:   items?.filter(i => i.category === 'salad')   ?? [],
      }
    }))
    setDays(daysWithItems)
    if (selDay) setSelDay(daysWithItems.find(d => d.id === selDay.id) ?? null)
  }

  useEffect(() => { load() }, [])

  async function handleAddItem() {
    if (!selDay || !newItem.name) return
    setSaving(true)
    await supabase.from('menu_items').insert({
      day_id:     selDay.id,
      category:   newItem.category,
      name:       newItem.name,
      emoji:      newItem.emoji || null,
      sort_order: 0,
    })
    setNewItem(EMPTY_ITEM)
    await load()
    setSaving(false)
  }

  async function handleDeleteItem(id: string) {
    await supabase.from('menu_items').delete().eq('id', id)
    await load()
  }

  async function handleToggleItem(item: MenuItem) {
    await supabase.from('menu_items').update({ is_active: !item.is_active }).eq('id', item.id)
    await load()
  }

  async function handleToggleDay(day: DayWithItems) {
    await supabase.from('weekly_menu_days').update({ is_active: !day.is_active }).eq('id', day.id)
    await load()
  }

  async function handleSaveDay() {
    if (!editDay?.id) return
    setSaving(true)
    await supabase.from('weekly_menu_days').update({
      delivery_time: editDay.delivery_time,
      is_active:     editDay.is_active,
    }).eq('id', editDay.id)
    await load()
    setEditDay(null)
    setSaving(false)
  }

  const categories: Category[] = ['protein', 'carb', 'salad']

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl text-stone-800">Menú semanal</h1>
        <p className="text-stone-500 mt-1">Edita los ítems disponibles por día</p>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Lista de días */}
        <div className="col-span-4 space-y-2">
          {days.map(day => (
            <button key={day.id} onClick={() => setSelDay(day)}
              className={cn(
                'w-full text-left rounded-2xl border-2 p-4 transition-all',
                selDay?.id === day.id ? 'border-[#E8611A] bg-[#FFF0E6]' : 'border-stone-200 bg-white hover:border-stone-300'
              )}>
              <div className="flex items-center justify-between">
                <p className={cn('font-semibold', selDay?.id === day.id ? 'text-[#E8611A]' : 'text-stone-800')}>
                  {day.day_label}
                </p>
                <span className={`text-xs rounded-full px-2 py-0.5 font-medium
                  ${day.is_active ? 'bg-green-100 text-green-700' : 'bg-stone-100 text-stone-400'}`}>
                  {day.is_active ? 'Activo' : 'Inactivo'}
                </span>
              </div>
              <p className="text-xs text-stone-500 mt-1">
                {day.delivery_time ?? 'Sin horario'} ·{' '}
                {day.proteins.length + day.carbs.length + day.salads.length} ítems
              </p>
            </button>
          ))}
        </div>

        {/* Panel del día seleccionado */}
        <div className="col-span-8">
          {!selDay ? (
            <div className="flex items-center justify-center h-64 rounded-2xl border-2 border-dashed border-stone-200">
              <p className="text-stone-400 text-sm">Selecciona un día para editarlo</p>
            </div>
          ) : (
            <div className="space-y-5">
              {/* Acciones del día */}
              <Card className="flex items-center justify-between">
                <div>
                  <p className="font-display text-lg text-stone-800">{selDay.day_label}</p>
                  <p className="text-sm text-stone-500">Horario: {selDay.delivery_time ?? '—'}</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" className="text-xs" onClick={() => setEditDay(selDay)}>
                    Editar día
                  </Button>
                  <Button variant={selDay.is_active ? 'danger' : 'primary'} className="text-xs"
                    onClick={() => handleToggleDay(selDay)}>
                    {selDay.is_active ? 'Desactivar' : 'Activar'}
                  </Button>
                </div>
              </Card>

              {/* Modal editar día */}
              {editDay && (
                <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center px-4" onClick={() => setEditDay(null)}>
                  <Card className="w-full max-w-sm space-y-4" onClick={e => e.stopPropagation()}>
                    <h2 className="font-display text-xl">Editar {editDay.day_label}</h2>
                    <Input label="Horario de entrega" value={editDay.delivery_time ?? ''}
                      onChange={e => setEditDay(prev => prev ? { ...prev, delivery_time: e.target.value } : null)}
                      placeholder="12:00–13:00" />
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" checked={editDay.is_active ?? true}
                        onChange={e => setEditDay(prev => prev ? { ...prev, is_active: e.target.checked } : null)}
                        className="w-4 h-4 accent-[#E8611A]" />
                      <span className="text-sm text-stone-700">Día activo</span>
                    </label>
                    <div className="flex gap-3">
                      <Button variant="ghost" onClick={() => setEditDay(null)} className="flex-1">Cancelar</Button>
                      <Button loading={saving} onClick={handleSaveDay} className="flex-1">Guardar</Button>
                    </div>
                  </Card>
                </div>
              )}

              {/* Ítems por categoría */}
              {categories.map(cat => {
                const items = cat === 'protein' ? selDay.proteins : cat === 'carb' ? selDay.carbs : selDay.salads
                return (
                  <Card key={cat} className="space-y-3">
                    <p className="font-semibold text-stone-800">{CATEGORY_LABELS[cat]}</p>
                    <div className="space-y-2">
                      {items.map(item => (
                        <div key={item.id} className="flex items-center justify-between bg-stone-50 rounded-xl px-4 py-2.5">
                          <p className={cn('text-sm', !item.is_active && 'line-through text-stone-400')}>
                            {item.emoji} {item.name}
                          </p>
                          <div className="flex gap-2">
                            <button onClick={() => handleToggleItem(item)}
                              className="text-xs text-stone-500 hover:text-stone-700 px-2 py-1 rounded hover:bg-stone-200 transition">
                              {item.is_active ? 'Ocultar' : 'Mostrar'}
                            </button>
                            <button onClick={() => handleDeleteItem(item.id)}
                              className="text-xs text-red-500 hover:bg-red-50 px-2 py-1 rounded transition">
                              ✕
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Agregar ítem inline */}
                    <div className="flex gap-2 pt-1">
                      <input type="text" placeholder="Emoji" value={newItem.category === cat ? newItem.emoji : ''}
                        onChange={e => setNewItem({ ...newItem, emoji: e.target.value, category: cat })}
                        className="w-14 rounded-xl border border-stone-200 px-2 py-2 text-sm text-center focus:outline-none focus:ring-2 focus:ring-[#E8611A]/30 focus:border-[#E8611A]" />
                      <input type="text" placeholder={`Nuevo ${cat === 'protein' ? 'proteína' : cat === 'carb' ? 'acompañamiento' : 'ensalada'}…`}
                        value={newItem.category === cat ? newItem.name : ''}
                        onChange={e => setNewItem({ ...newItem, name: e.target.value, category: cat })}
                        onKeyDown={e => { if (e.key === 'Enter' && newItem.category === cat) handleAddItem() }}
                        className="flex-1 rounded-xl border border-stone-200 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#E8611A]/30 focus:border-[#E8611A]" />
                      <Button loading={saving && newItem.category === cat} onClick={handleAddItem}
                        disabled={newItem.category !== cat || !newItem.name}
                        className="px-4 py-2 text-xs">
                        Agregar
                      </Button>
                    </div>
                  </Card>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
