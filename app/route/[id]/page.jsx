'use client'

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import dynamic from "next/dynamic"
import { supabase } from "../../../lib/supabaseClient"

// Dynamic Import Leaflet Components (WAJIB)
const MapContainer = dynamic(
  () => import("react-leaflet").then(mod => mod.MapContainer),
  { ssr: false }
)

const TileLayer = dynamic(
  () => import("react-leaflet").then(mod => mod.TileLayer),
  { ssr: false }
)

const Marker = dynamic(
  () => import("react-leaflet").then(mod => mod.Marker),
  { ssr: false }
)

const Polyline = dynamic(
  () => import("react-leaflet").then(mod => mod.Polyline),
  { ssr: false }
)

import "leaflet/dist/leaflet.css"

export default function RoutePage({ params }) {
  const { id } = params
  const router = useRouter()

  const [userPos, setUserPos] = useState(null)
  const [product, setProduct] = useState(null)
  const [routeCoords, setRouteCoords] = useState([])

  // Ambil lokasi user (client-side)
  useEffect(() => {
    if (typeof window === "undefined") return

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserPos([pos.coords.latitude, pos.coords.longitude])
      },
      (err) => {
        console.error(err)
        alert("Tidak dapat mengambil lokasi pengguna.")
      }
    )
  }, [])

  // Ambil data produk dari Supabase
  useEffect(() => {
    async function loadProduct() {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", id)
        .single()

      if (error) {
        console.error(error)
        alert("Produk tidak ditemukan")
        router.push("/dashboard")
        return
      }

      setProduct(data)
    }
    loadProduct()
  }, [id])

  // Ambil rute OSRM
  useEffect(() => {
    if (!product || !userPos) return

    const prodLat = product.location.coordinates[1]
    const prodLon = product.location.coordinates[0]
    const [userLat, userLon] = userPos

    async function getRoute() {
      const url = `https://router.project-osrm.org/route/v1/driving/${userLon},${userLat};${prodLon},${prodLat}?overview=full&geometries=geojson`

      const res = await fetch(url)
      const json = await res.json()

      if (!json.routes || json.routes.length === 0) {
        alert("Rute tidak ditemukan.")
        return
      }

      const coords = json.routes[0].geometry.coordinates.map(c => [c[1], c[0]])
      setRouteCoords(coords)
    }

    getRoute()
  }, [product, userPos])

  if (!product || !userPos) {
    return <div className="p-6">Memuat data rute...</div>
  }

  const prodLat = product.location.coordinates[1]
  const prodLon = product.location.coordinates[0]

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-xl font-bold">Rute ke: {product.name}</h1>

      {/* Peta */}
      <MapContainer
        center={userPos}
        zoom={14}
        scrollWheelZoom={true}
        style={{ height: "400px", width: "100%" }}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        {/* Marker user */}
        <Marker position={userPos}></Marker>

        {/* Marker produk */}
        <Marker position={[prodLat, prodLon]}></Marker>

        {/* Jalur rute */}
        {routeCoords.length > 0 && (
          <Polyline positions={routeCoords} />
        )}
      </MapContainer>

      <button
        className="p-2 bg-gray-300 rounded"
        onClick={() => router.back()}
      >
        Kembali
      </button>
    </div>
  )
}
