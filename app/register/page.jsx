'use client'

import { useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { useRouter } from 'next/navigation'

export default function RegisterPage() {
  const [form, setForm] = useState({ email:'', password:'', full_name:'', phone:'', role:'pembeli' })
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      // 1) daftar ke Supabase Auth
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
      })
      if (signUpError) throw signUpError

      // 2) coba sign in agar mendapat user id (untuk dev lokal).
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: form.email,
        password: form.password,
      })
      if (signInError) throw signInError

      const userId = signInData.user.id

      // 3) masukkan ke tabel profiles
      const { error: insertError } = await supabase
        .from('profiles')
        .insert([{ id: userId, full_name: form.full_name, phone: form.phone, role: form.role }])
      if (insertError) throw insertError

      router.push('/dashboard')
    } catch (err) {
      alert(err.message || JSON.stringify(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <form onSubmit={handleSubmit} className="w-full max-w-md p-6 border rounded space-y-4">
        <h2 className="text-xl font-semibold">Register</h2>
        <input required placeholder="Nama" value={form.full_name} onChange={e=>setForm({...form, full_name: e.target.value})} className="w-full p-2 border rounded"/>
        <input required placeholder="Email" type="email" value={form.email} onChange={e=>setForm({...form, email: e.target.value})} className="w-full p-2 border rounded"/>
        <input required placeholder="No. Telp" value={form.phone} onChange={e=>setForm({...form, phone: e.target.value})} className="w-full p-2 border rounded"/>
        <select value={form.role} onChange={e=>setForm({...form, role: e.target.value})} className="w-full p-2 border rounded">
          <option value="pembeli">Pembeli</option>
          <option value="penjual">Penjual</option>
        </select>
        <input required placeholder="Password" type="password" value={form.password} onChange={(e)=>setForm({...form, password: e.target.value})} className="w-full p-2 border rounded"/>
        <button disabled={loading} type="submit" className="w-full p-2 bg-blue-600 text-white rounded">
          {loading ? 'Mendaftar...' : 'Daftar'}
        </button>
      </form>
    </div>
  )
}
