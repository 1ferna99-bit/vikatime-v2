// lib/whatsapp.ts
import type { OrderFormData } from '@/types'

export function buildWhatsAppMessage(data: OrderFormData): string {
  const lines: string[] = [
    `🟠 *NUEVA CONFIGURACIÓN VIKA*`,
    `👤 Cliente: ${data.customer_name}`,
    `📱 Teléfono: ${data.customer_phone}`,
    `📍 Dirección: ${data.customer_address}`,
    `📋 Plan: ${data.plan_name}`,
    ``,
    `📅 *MENÚ DE LA SEMANA*`,
    `─────────────────────`,
  ]

  for (const day of data.days) {
    lines.push(``)
    lines.push(`*${day.day_label.toUpperCase()}*`)
    lines.push(`🍽️ Proteína: ${day.protein_name}`)
    lines.push(`🍝 Acompañamiento: ${day.carb_name}`)
    if (day.salads.length > 0) {
      lines.push(`🥗 Ensalada: ${day.salads.join(', ')}`)
    }
    if (day.delivery_time) {
      lines.push(`🕐 Horario: ${day.delivery_time}`)
    }
  }

  if (data.customer_notes) {
    lines.push(``)
    lines.push(`📝 Notas: ${data.customer_notes}`)
  }

  return lines.join('\n')
}

export function buildWhatsAppUrl(message: string): string {
  const number = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? ''
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`
}
