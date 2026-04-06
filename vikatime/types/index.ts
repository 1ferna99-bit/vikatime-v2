// types/index.ts

export type Plan = {
  id: string
  name: string
  lunches_per_week: number
  is_active: boolean
  created_at: string
}

export type WeeklyMenuDay = {
  id: string
  day_key: string
  day_label: string
  is_active: boolean
  delivery_time: string | null
  sort_order: number
}

export type MenuItem = {
  id: string
  day_id: string
  category: 'protein' | 'carb' | 'salad'
  name: string
  emoji: string | null
  calories: number | null
  is_active: boolean
  sort_order: number
  created_at: string
}

export type DayWithItems = WeeklyMenuDay & {
  proteins: MenuItem[]
  carbs: MenuItem[]
  salads: MenuItem[]
}

export type DaySelection = {
  day_key: string
  day_label: string
  delivery_time: string | null
  protein_item_id: string
  protein_name: string
  carb_item_id: string
  carb_name: string
  salads: string[]
}

export type OrderFormData = {
  customer_name: string
  customer_phone: string
  customer_address: string
  customer_notes?: string
  plan_id: string
  plan_name: string
  days: DaySelection[]
}

export type Order = {
  id: string
  customer_name: string
  customer_phone: string
  customer_address: string
  customer_notes: string | null
  plan_id: string
  plan_name: string
  status: OrderStatus
  whatsapp_message: string | null
  created_at: string
  order_days?: OrderDay[]
}

export type OrderDay = {
  id: string
  order_id: string
  day_key: string
  day_label: string
  protein_item_id: string | null
  protein_name: string
  carb_item_id: string | null
  carb_name: string
  salads: string[]
  delivery_time: string | null
}

export type OrderStatus = 'pendiente' | 'confirmado' | 'preparado' | 'entregado' | 'cancelado'

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pendiente:   'Pendiente',
  confirmado:  'Confirmado',
  preparado:   'Preparado',
  entregado:   'Entregado',
  cancelado:   'Cancelado',
}

export const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  pendiente:  'bg-amber-100 text-amber-800',
  confirmado: 'bg-blue-100 text-blue-800',
  preparado:  'bg-purple-100 text-purple-800',
  entregado:  'bg-green-100 text-green-800',
  cancelado:  'bg-red-100 text-red-800',
}
