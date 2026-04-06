'use client'
// app/admin/login/page.tsx

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button, Input } from '@/components/ui/index'

export default function AdminLoginPage() {
  const router   = useRouter()
  const supabase = createClient()
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [error,    setError]    = useState('')
  const [loading,  setLoading]  = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error: authError } = await supabase.auth.signInWithPassword({ email, password })

    if (authError) {
      setError('Correo o contraseña incorrectos')
      setLoading(false)
    } else {
      router.push('/admin')
    }
  }

  return (
    <div className="min-h-screen bg-[#FDFAF5] flex items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center">
          <span className="text-4xl">🟠</span>
          <h1 className="font-display text-2xl mt-3 text-stone-800">Panel VikaTime</h1>
          <p className="text-sm text-stone-500 mt-1">Acceso exclusivo para administradores</p>
        </div>

        <form onSubmit={handleLogin} className="bg-white rounded-2xl border border-stone-100 shadow-sm p-6 space-y-4">
          <Input label="Correo electrónico" id="email" type="email" value={email}
            onChange={e => setEmail(e.target.value)} placeholder="admin@vika.cl" />
          <Input label="Contraseña" id="password" type="password" value={password}
            onChange={e => setPassword(e.target.value)} placeholder="••••••••" />
          {error && <p className="text-xs text-red-500 text-center">{error}</p>}
          <Button type="submit" loading={loading} className="w-full">
            Iniciar sesión
          </Button>
        </form>
      </div>
    </div>
  )
}
