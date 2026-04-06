'use client'
// app/page.tsx — Vista cliente principal

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/client'
import { buildWhatsAppMessage, buildWhatsAppUrl } from '@/lib/whatsapp'
import { DayMenuCard } from '@/components/client/DayMenuCard'
import { OrderSummary } from '@/components/client/OrderSummary'
import { Button, Input, Card, SectionTitle } from '@/components/ui/index'
import type { Plan, DayWithItems, DaySelection } from '@/types'

// ─── Validación ───────────────────────────────────────────────────
const customerSchema = z.object({
  customer_name:    z.string().min(2, 'Ingresa tu nombre'),
  customer_phone:   z.string().min(8, 'Teléfono inválido'),
  customer_address: z.string().min(5, 'Ingresa tu dirección'),
  customer_notes:   z.string().optional(),
  plan_id:          z.string().min(1, 'Selecciona un plan'),
})

type CustomerForm = z.infer<typeof customerSchema>

// ─── Componente ───────────────────────────────────────────────────
export default function ClientPage() {
  const supabase = createClient()

  const [plans, setPlans] = useState<Plan[]>([])
  const [days, setDays] = useState<DayWithItems[]>([])
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null)
  const [daySelections, setDaySelections] = useState<DaySelection[]>([])
  const [step, setStep] = useState<'form' | 'menu' | 'summary'>('form')
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, watch, formState: { errors } } = useForm<CustomerForm>({
    resolver: zodResolver(customerSchema),
  })

  const planId = watch('plan_id')

  // Cargar planes y días
  useEffect(() => {
    async function load() {
      const [{ data: plansData }, { data: daysData }] = await Promise.all([
        supabase.from('plans').select('*').eq('is_active', true).order('lunches_per_week'),
        supabase.from('weekly_menu_days').select('*').eq('is_active', true).order('sort_order'),
      ])
      setPlans(plansData ?? [])

      if (daysData) {
        const daysWithItems: DayWithItems[] = await Promise.all(
          daysData.map(async (day) => {
            const { data: items } = await supabase
              .from('menu_items')
              .select('*')
              .eq('day_id', day.id)
              .eq('is_active', true)
              .order('sort_order')
            return {
              ...day,
              proteins: items?.filter(i => i.category === 'protein') ?? [],
              carbs:    items?.filter(i => i.category === 'carb')    ?? [],
              salads:   items?.filter(i => i.category === 'salad')   ?? [],
            }
          })
        )
        setDays(daysWithItems)
      }
    }
    load()
  }, [])

  // Actualizar plan seleccionado
  useEffect(() => {
    const plan = plans.find(p => p.id === planId)
    setSelectedPlan(plan ?? null)
    setDaySelections([])
  }, [planId, plans])

  function handleDayToggle(day: DayWithItems, selection: DaySelection | null) {
    if (!selection) {
      setDaySelections(prev => prev.filter(s => s.day_key !== day.day_key))
    } else {
      const exists = daySelections.find(s => s.day_key === day.day_key)
      if (exists) {
        setDaySelections(prev => prev.map(s => s.day_key === day.day_key ? selection : s))
      } else {
        if (selectedPlan && daySelections.length < selectedPlan.lunches_per_week) {
          setDaySelections(prev => [...prev, selection])
        }
      }
    }
  }

  async function onSubmitForm(formData: CustomerForm) {
    const plan = plans.find(p => p.id === formData.plan_id)
    setSelectedPlan(plan ?? null)
    setStep('menu')
  }

  async function onConfirmOrder(formData: CustomerForm) {
    if (!selectedPlan) return
    setLoading(true)

    const orderData = {
      customer_name:    formData.customer_name,
      customer_phone:   formData.customer_phone,
      customer_address: formData.customer_address,
      customer_notes:   formData.customer_notes,
      plan_id:          formData.plan_id,
      plan_name:        selectedPlan.name,
      days:             daySelections,
    }

    const message = buildWhatsAppMessage(orderData)

    try {
      // Guardar en Supabase
      const { data: order, error } = await supabase
        .from('orders')
        .insert({
          customer_name:    orderData.customer_name,
          customer_phone:   orderData.customer_phone,
          customer_address: orderData.customer_address,
          customer_notes:   orderData.customer_notes,
          plan_id:          orderData.plan_id,
          plan_name:        orderData.plan_name,
          whatsapp_message: message,
          status:           'pendiente',
        })
        .select()
        .single()

      if (!error && order) {
        await supabase.from('order_days').insert(
          daySelections.map(d => ({
            order_id:        order.id,
            day_key:         d.day_key,
            day_label:       d.day_label,
            protein_item_id: d.protein_item_id,
            protein_name:    d.protein_name,
            carb_item_id:    d.carb_item_id,
            carb_name:       d.carb_name,
            salads:          d.salads,
            delivery_time:   d.delivery_time,
          }))
        )
      }

      // Abrir WhatsApp
      window.open(buildWhatsAppUrl(message), '_blank')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#FDFAF5]">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-stone-100 bg-white/90 backdrop-blur-sm">
        <div className="mx-auto max-w-2xl px-4 py-4 flex items-center gap-3">
          <span className="text-2xl">🟠</span>
          <span className="font-display text-xl text-stone-800">VikaTime</span>
        </div>
      </header>

      <div className="mx-auto max-w-2xl px-4 py-10 space-y-8">

        {/* Hero */}
        <div className="text-center animate-fade-up">
          <h1 className="font-display text-4xl text-stone-800 leading-tight">
            Tu menú de la semana
          </h1>
          <p className="mt-3 text-stone-500 text-base leading-relaxed">
            Elige tu plan, arma tu plato para cada día y recíbelo donde estés.
          </p>
        </div>

        {/* Paso 1: Formulario cliente */}
        {step === 'form' && (
          <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-6 animate-fade-up">
            <Card>
              <SectionTitle title="Tus datos" subtitle="Para coordinar tu entrega" />
              <div className="space-y-4">
                <Input label="Nombre completo" id="customer_name" placeholder="Francisca Pérez"
                  error={errors.customer_name?.message} {...register('customer_name')} />
                <Input label="Teléfono" id="customer_phone" placeholder="+56 9 1234 5678" type="tel"
                  error={errors.customer_phone?.message} {...register('customer_phone')} />
                <Input label="Dirección de entrega" id="customer_address" placeholder="Calle Ejemplo 123, depto 4B"
                  error={errors.customer_address?.message} {...register('customer_address')} />
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-stone-700">Notas adicionales</label>
                  <textarea rows={2} placeholder="Alergias, instrucciones especiales…"
                    className="w-full rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#E8611A]/40 focus:border-[#E8611A] transition resize-none"
                    {...register('customer_notes')} />
                </div>
              </div>
            </Card>

            <Card>
              <SectionTitle title="Elige tu plan" />
              {errors.plan_id && <p className="text-xs text-red-500 mb-3">{errors.plan_id.message}</p>}
              <div className="grid gap-3">
                {plans.map(plan => {
                  const isSelected = planId === plan.id
                  return (
                    <label key={plan.id} className={`flex items-center gap-4 rounded-xl border-2 p-4 cursor-pointer transition-all
                      ${isSelected ? 'border-[#E8611A] bg-[#FFF0E6]' : 'border-stone-200 hover:border-stone-300'}`}>
                      <input type="radio" value={plan.id} className="hidden" {...register('plan_id')} />
                      <span className={`h-5 w-5 rounded-full border-2 flex-shrink-0 transition-all
                        ${isSelected ? 'border-[#E8611A] bg-[#E8611A]' : 'border-stone-300'}`} />
                      <div>
                        <p className={`font-semibold ${isSelected ? 'text-[#E8611A]' : 'text-stone-800'}`}>{plan.name}</p>
                        <p className="text-sm text-stone-500">{plan.lunches_per_week} almuerzos / semana</p>
                      </div>
                    </label>
                  )
                })}
              </div>
            </Card>

            <Button type="submit" className="w-full py-4 text-base">
              Continuar al menú →
            </Button>
          </form>
        )}

        {/* Paso 2: Selección de menú */}
        {step === 'menu' && selectedPlan && (
          <div className="space-y-6 animate-fade-up">
            <div className="rounded-2xl bg-[#FFF0E6] border border-[#E8611A]/20 p-4 flex items-center gap-3">
              <span className="text-2xl">📋</span>
              <div>
                <p className="font-semibold text-[#E8611A]">{selectedPlan.name}</p>
                <p className="text-sm text-stone-600">
                  Selecciona {selectedPlan.lunches_per_week} día{selectedPlan.lunches_per_week > 1 ? 's' : ''} de la semana
                  &nbsp;· <span className="font-semibold">{daySelections.length} / {selectedPlan.lunches_per_week}</span> seleccionados
                </p>
              </div>
            </div>

            {days.map(day => (
              <DayMenuCard
                key={day.id}
                day={day}
                isSelected={!!daySelections.find(s => s.day_key === day.day_key)}
                canSelect={daySelections.length < selectedPlan.lunches_per_week}
                currentSelection={daySelections.find(s => s.day_key === day.day_key)}
                onToggle={(sel) => handleDayToggle(day, sel)}
              />
            ))}

            <div className="flex gap-3">
              <Button variant="ghost" onClick={() => setStep('form')} className="flex-1">
                ← Volver
              </Button>
              <Button
                disabled={daySelections.length < selectedPlan.lunches_per_week}
                onClick={() => setStep('summary')}
                className="flex-1"
              >
                Ver resumen →
              </Button>
            </div>
          </div>
        )}

        {/* Paso 3: Resumen y envío */}
        {step === 'summary' && selectedPlan && (
          <div className="space-y-6 animate-fade-up">
            <OrderSummary
              customerName={watch('customer_name')}
              plan={selectedPlan}
              days={daySelections}
            />
            <div className="flex gap-3">
              <Button variant="ghost" onClick={() => setStep('menu')} className="flex-1">
                ← Editar menú
              </Button>
              <Button
                variant="secondary"
                loading={loading}
                onClick={handleSubmit(onConfirmOrder)}
                className="flex-1 gap-2"
              >
                📲 Enviar por WhatsApp
              </Button>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
