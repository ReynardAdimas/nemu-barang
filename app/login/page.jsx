'use client'

import { useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const router = useRouter()

  const handleLogin = async (e) => {
    e.preventDefault()
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      alert(error.message)
      return
    }
    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <form onSubmit={handleLogin} className="w-full max-w-md p-6 border rounded space-y-4">
        <h2 className="text-xl font-semibold">Login</h2>
        <input placeholder="Email" value={email} onChange={(e)=>setEmail(e.target.value)} className="w-full p-2 border rounded"/>
        <input placeholder="Password" type="password" value={password} onChange={(e)=>setPassword(e.target.value)} className="w-full p-2 border rounded"/>
        <button type="submit" className="w-full p-2 bg-green-600 text-white rounded">Login</button>
      </form>
    </div>
  )
}
