'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { useRouter } from 'next/navigation'
import dynamic from "next/dynamic"
import CheckLocation from '../components/CheckLocation'
import { getProductsByRadius } from "../../lib/getProductsByRadius"

const MapView = dynamic(() => import("../components/MapView"), { ssr: false })

// Convert POINT format
function parsePointWKT(wkt) {
  if (!wkt || typeof wkt !== "string") return null
  try {
    const cleaned = wkt.replace("POINT(", "").replace(")", "").trim()
    const parts = cleaned.split(" ")
    if (parts.length !== 2) return null

    const lon = parseFloat(parts[0])
    const lat = parseFloat(parts[1])
    if (isNaN(lat) || isNaN(lon)) return null

    return { lat, lon }
  } catch {
    return null
  }
}

export default function DashboardPage() {
  const [profile, setProfile] = useState(null)
  const [userPos, setUserPos] = useState(null)
  const [radius, setRadius] = useState(1000)
  const [products, setProducts] = useState([])

  const router = useRouter()

  // Redirect jika penjual
  useEffect(() => {
    if (!profile) return
    if (profile.role === 'penjual') {
      router.push("/dashboard/seller")
    }
  }, [profile])

  // GPS user
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => setUserPos([pos.coords.latitude, pos.coords.longitude]),
      () => alert("Tidak dapat mengambil lokasi. Aktifkan GPS!")
    )
  }, [])

  // Load product by radius
  useEffect(() => {
    if (!userPos) return

    async function loadProducts() {
      const [lat, lon] = userPos
      const data = await getProductsByRadius(lat, lon, radius)
      setProducts(data)
    }

    loadProducts()
  }, [userPos, radius])

  // Load profile
  useEffect(() => {
    async function loadProfile() {
      const { data } = await supabase.auth.getUser()
      const user = data.user

      if (!user) return router.push("/login")

      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single()

      setProfile(profileData)
    }

    loadProfile()
  }, [])

  if (!profile) return <div className="p-6">Loading Dashboard...</div>
  if (!userPos) return <div className="p-6">Mengambil lokasi Anda...</div>

  // === HANDLER UNTUK POPUP BUTTON ===
  function handleDetail(id) {
    router.push(`/product/${id}`)
  }

  function handleRoute(position) {
    window.open(
      `https://www.google.com/maps/dir/${userPos[0]},${userPos[1]}/${position[0]},${position[1]}`,
      "_blank"
    )
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Halo, {profile.full_name}</h1>
      <p>Role: <strong>{profile.role}</strong></p>

      {/* MAP */}
      <MapView
        center={userPos}
        userPosition={userPos}
        markers={products
          .map((p) => {
            const loc = parsePointWKT(p.location)
            if (!loc) return null

            return {
              id: p.id,
              position: [loc.lat, loc.lon],
              text: p.name,
            }
          })
          .filter(Boolean)}
        onDetail={handleDetail}
        onRoute={handleRoute}
      />

      {/* RADIUS SLIDER */}
      <div className="my-4">
        <label>Radius (meter): {radius}</label>
        <input
          type="range"
          min="100"
          max="5000"
          value={radius}
          onChange={(e) => setRadius(Number(e.target.value))}
          className="w-full"
        />
      </div>

      <CheckLocation />

      {/* LOGOUT */}
      <div>
        <button
          onClick={async () => {
            await supabase.auth.signOut()
            router.push("/login")
          }}
          className="p-2 bg-red-600 text-white rounded"
        >
          Logout
        </button>
      </div>
    </div>
  )
}
