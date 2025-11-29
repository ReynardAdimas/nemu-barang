'use client'

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import dynamic from "next/dynamic"
import { supabase } from "../../../lib/supabaseClient"

// Dynamic Import Leaflet Components (WAJIB untuk Next.js)
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

import "leaflet/dist/leaflet.css"

export default function ProductDetail({ params }) {
  const { id } = params
  const router = useRouter()

  const [product, setProduct] = useState(null)

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

  if (!product) return <div className="p-6">Memuat detail produk...</div>

  const lat = product.location.coordinates[1]
  const lon = product.location.coordinates[0]

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">{product.name}</h1>
      <p className="text-lg font-semibold">Rp {product.price}</p>

      {/* Gambar Produk */}
      <img
        src={product.image_url}
        className="w-full max-w-md rounded shadow"
        alt="Product Image"
      />

      {/* Deskripsi */}
      <p className="text-gray-700">{product.description}</p>

      {/* Peta Lokasi */}
<div>
  <h2 className="font-bold mb-2">Lokasi Produk</h2>

  {lat && lon ? (
    <MapContainer
      center={[lat, lon]}
      zoom={15}
      scrollWheelZoom={false}
      style={{ height: "300px", width: "100%" }}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <Marker position={[lat, lon]} />
    </MapContainer>
  ) : (
    <div className="p-4 text-gray-600">Lokasi tidak valid...</div>
  )}
</div>


      {/* Tombol Lihat Rute */}
      <button
        className="p-3 bg-blue-600 text-white rounded"
        onClick={() => router.push(`/route/${product.id}`)}
      >
        Lihat Rute ke Lokasi
      </button>

      {/* Tombol Kembali */}
      <button
        className="p-2 bg-gray-300 rounded"
        onClick={() => router.back()}
      >
        Kembali
      </button>
    </div>
  )
}
