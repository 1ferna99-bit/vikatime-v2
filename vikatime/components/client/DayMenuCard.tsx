'use client'
// components/client/DayMenuCard.tsx

import { useState, useEffect } from 'react'
import type { DayWithItems, DaySelection, MenuItem } from '@/types'
import { cn } from '@/lib/utils'

interface Props {
  day: DayWithItems
  isSelected: boolean
  canSelect: boolean
  currentSelection?: DaySelection
  onToggle: (selection: DaySelection | null) => void
}

export function DayMenuCard({ day, isSelected, canSelect, currentSelection, onToggle }: Props) {
  const [protein, setProtein] = useState<MenuItem | null>(null)
  const [carb, setCarb]       = useState<MenuItem | null>(null)
  const [salads, setSalads]   = useState<string[]>([])
  const [open, setOpen]       = useState(false)

  // Inicializar desde selección existente
  useEffect(() => {
    if (currentSelection) {
      setProtein(day.proteins.find(p => p.id === currentSelection.protein_item_id) ?? null)
      setCarb(day.carbs.find(c => c.id === currentSelection.carb_item_id) ?? null)
      setSalads(currentSelection.salads)
    }
  }, [currentSelection, day])

  function buildSelection(): DaySelection | null {
    if (!protein || !carb) return null
    return {
      day_key:         day.day_key,
      day_label:       day.day_label,
      delivery_time:   day.delivery_time,
      protein_item_id: protein.id,
      protein_name:    protein.name,
      carb_item_id:    carb.id,
      carb_name:       carb.name,
      salads,
    }
  }

  function handleSelect() {
    if (isSelected) {
      setOpen(false)
      onToggle(null)
    } else if (canSelect) {
      setOpen(true)
    }
  }

  function handleSave() {
    const sel = buildSelection()
    if (sel) {
      onToggle(sel)
      setOpen(false)
    }
  }

  function toggleSalad(name: string) {
    setSalads(prev => prev.includes(name) ? prev.filter(s => s !== name) : [...prev, name])
  }

  return (
    <div className={cn(
      'rounded-2xl border-2 transition-all overflow-hidden',
      isSelected ? 'border-[#E8611A]' : 'border-stone-200',
      !canSelect && !isSelected && 'opacity-50 pointer-events-none'
    )}>
      {/* Header del día */}
      <button
        onClick={handleSelect}
        className="w-full flex items-center justify-between p-4 text-left"
      >
        <div className="flex items-center gap-3">
          <span className={cn(
            'h-6 w-6 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all',
            isSelected ? 'border-[#E8611A] bg-[#E8611A]' : 'border-stone-300'
          )}>
            {isSelected && <span className="text-white text-xs">✓</span>}
          </span>
          <div>
            <p className="font-semibold text-stone-800">{day.day_label}</p>
            {day.delivery_time && (
              <p className="text-xs text-stone-500">🕐 {day.delivery_time}</p>
            )}
          </div>
        </div>
        {isSelected && currentSelection && (
          <p className="text-xs text-stone-500 text-right max-w-[160px] truncate">
            {currentSelection.protein_name}
          </p>
        )}
      </button>

      {/* Panel de selección expandido */}
      {open && (
        <div className="border-t border-stone-100 p-4 space-y-5 bg-stone-50/50">

          {/* Proteína */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-stone-500 mb-2">🍽️ Proteína</p>
            <div className="grid grid-cols-1 gap-2">
              {day.proteins.map(item => (
                <button key={item.id} onClick={() => setProtein(item)}
                  className={cn(
                    'text-left rounded-xl border px-4 py-2.5 text-sm transition-all',
                    protein?.id === item.id
                      ? 'border-[#E8611A] bg-[#FFF0E6] text-[#E8611A] font-medium'
                      : 'border-stone-200 bg-white hover:border-stone-300'
                  )}>
                  {item.emoji} {item.name}
                </button>
              ))}
            </div>
          </div>

          {/* Carbohidrato */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-stone-500 mb-2">🍝 Acompañamiento</p>
            <div className="grid grid-cols-1 gap-2">
              {day.carbs.map(item => (
                <button key={item.id} onClick={() => setCarb(item)}
                  className={cn(
                    'text-left rounded-xl border px-4 py-2.5 text-sm transition-all',
                    carb?.id === item.id
                      ? 'border-[#E8611A] bg-[#FFF0E6] text-[#E8611A] font-medium'
                      : 'border-stone-200 bg-white hover:border-stone-300'
                  )}>
                  {item.emoji} {item.name}
                </button>
              ))}
            </div>
          </div>

          {/* Ensaladas */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-stone-500 mb-2">🥗 Ensalada (puedes elegir varias)</p>
            <div className="flex flex-wrap gap-2">
              {day.salads.map(item => (
                <button key={item.id} onClick={() => toggleSalad(item.name)}
                  className={cn(
                    'rounded-full border px-3 py-1.5 text-xs transition-all',
                    salads.includes(item.name)
                      ? 'border-[#2E7D5A] bg-[#E8F5EE] text-[#2E7D5A] font-medium'
                      : 'border-stone-200 bg-white hover:border-stone-300'
                  )}>
                  {item.emoji} {item.name}
                </button>
              ))}
            </div>
          </div>

          <button
            disabled={!protein || !carb}
            onClick={handleSave}
            className={cn(
              'w-full rounded-xl py-3 text-sm font-semibold transition-all',
              protein && carb
                ? 'bg-[#2E7D5A] hover:bg-[#246347] text-white'
                : 'bg-stone-200 text-stone-400 cursor-not-allowed'
            )}>
            Confirmar día ✓
          </button>
        </div>
      )}
    </div>
  )
}
