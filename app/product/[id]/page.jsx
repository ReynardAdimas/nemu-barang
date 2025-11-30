'use client'

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import dynamic from "next/dynamic"
import { supabase } from "../../../lib/supabaseClient"

// Dynamic Import Leaflet Components
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

  if (!product) return <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-500">Memuat detail produk...</div>

  // Mengambil koordinat (Pastikan format di DB sesuai)
  // Jika format PostGIS object: product.location.coordinates[1]
  const lat = product.location?.coordinates ? product.location.coordinates[1] : 0
  const lon = product.location?.coordinates ? product.location.coordinates[0] : 0

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 md:px-8 font-sans text-slate-800">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Navigation */}
        <div className="mb-6">
          <button 
            onClick={() => router.back()}
            className="flex items-center text-sm font-semibold text-gray-600 hover:text-gray-900 mb-4 transition"
          >
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
            Kembali ke Dashboard Pembeli
          </button>
          
          <div className="text-sm text-gray-500">
            <span>Home</span> / <span>Elektronik</span> / <span className="text-gray-900 font-medium">{product.name}</span>
          </div>
        </div>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* KOLOM KIRI: Galeri Gambar */}
          <div className="lg:col-span-2 space-y-4">
            {/* Main Image */}
            <div className="bg-gray-900 rounded-2xl overflow-hidden aspect-[4/3] flex items-center justify-center shadow-sm">
              <img
                src={product.image_url}
                className="w-full h-full object-contain"
                alt={product.name}
              />
            </div>
            
            {/* Thumbnails (Visual Placeholder sesuai desain) */}
            <div className="grid grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className={`aspect-square rounded-xl overflow-hidden cursor-pointer border-2 ${i === 0 ? 'border-blue-500' : 'border-transparent'}`}>
                  <img 
                    src={product.image_url} 
                    className="w-full h-full object-cover hover:opacity-80 transition" 
                    alt="thumbnail"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* KOLOM KANAN: Informasi & Detail */}
          <div className="space-y-6">
            
            {/* Card 1: Judul & Harga */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h1 className="text-2xl font-bold text-gray-900 mb-2 leading-snug">{product.name}</h1>
              <p className="text-3xl font-bold text-blue-600 mb-4">
                Rp {Number(product.price).toLocaleString('id-ID')}
              </p>
              
              <div className="flex gap-2 flex-wrap">
                <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full">Elektronik</span>
                <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-bold rounded-full">Audio</span>
                <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-bold rounded-full">Bekas</span>
              </div>
            </div>

            {/* Card 2: Deskripsi */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h2 className="text-lg font-bold mb-3">Deskripsi Produk</h2>
              <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap">
                {product.description}
              </p>
            </div>

            {/* Card 3: Info Penjual (Placeholder Visual) */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold mb-2">Penjual</h2>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-orange-200 overflow-hidden">
                    <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="avatar" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">Budi Santoso</p>
                    <div className="flex items-center text-xs text-yellow-500">
                      <span>★ 4.8</span>
                      <span className="text-gray-400 ml-1">(12 Ulasan)</span>
                    </div>
                  </div>
                </div>
              </div>
              <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                 <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
              </button>
            </div>

            {/* Card 4: Lokasi & Action Buttons */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h2 className="text-lg font-bold mb-4">Lokasi Penjual</h2>
              
              {/* Map Container */}
              <div className="w-full h-48 rounded-xl overflow-hidden relative z-0 mb-4 border border-gray-200">
                {lat && lon ? (
                  <MapContainer
                    center={[lat, lon]}
                    zoom={13}
                    scrollWheelZoom={false}
                    style={{ height: "100%", width: "100%" }}
                    zoomControl={false}
                  >
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    <Marker position={[lat, lon]} />
                  </MapContainer>
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400 text-sm">
                    Lokasi tidak valid
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold text-sm transition flex items-center justify-center gap-2">
                   <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
                   Hubungi Penjual
                </button>
                <button 
                  onClick={() => router.push(`/route/${product.id}`)}
                  className="flex-1 bg-amber-400 hover:bg-amber-500 text-gray-900 py-3 rounded-lg font-bold text-sm transition flex items-center justify-center gap-2"
                >
                   <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 9l3 3m0 0l-3 3m3-3H8m13 0a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                   Lihat Rute
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}