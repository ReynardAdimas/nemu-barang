'use client'

import { useEffect, useState } from "react"
import { supabase } from "../../../lib/supabaseClient"
import { useRouter } from "next/navigation"

// Icon Components (SVG Inline)
const PlusIcon = () => (
  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
)

const ChevronLeft = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
  </svg>
)

const ChevronRight = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
)

export default function SellerDashboard() {
  const [profile, setProfile] = useState(null)
  const [products, setProducts] = useState([])
  const router = useRouter()

  // Ambil profile user
  useEffect(() => {
    async function loadProfile() {
      const { data } = await supabase.auth.getUser()
      const user = data.user

      if (!user) {
        router.push("/login")
        return
      }

      const { data: profileData, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single()

      if (error) {
        console.error(error)
        return
      }

      if (profileData.role !== "penjual") {
        router.push("/dashboard")
        return
      }

      setProfile(profileData)
    }

    loadProfile()
  }, [])

  // Ambil produk milik penjual
  useEffect(() => {
    if (!profile) return

    async function loadProducts() {
      const { data } = await supabase
        .from("products")
        .select("*")
        .eq("seller_id", profile.id)

      setProducts(data || [])
    }

    loadProducts()
  }, [profile])

  // 🔥 Hapus Produk
  async function deleteProduct(id) {
    const confirmDelete = confirm("Yakin ingin menghapus produk ini?")
    if (!confirmDelete) return

    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", id)

    if (error) {
      alert("Gagal menghapus produk.")
      console.error(error)
      return
    }

    // Update list tanpa reload
    setProducts((prev) => prev.filter((p) => p.id !== id))
  }

  // Format currency
  const formatRupiah = (number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0
    }).format(number);
  }

  if (!profile)
    return <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-500">Memuat dashboard...</div>

  return (
    <div className="min-h-screen bg-[#F8F9FA] font-sans text-gray-900">
      
      {/* === NAVBAR === */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          
          {/* Left: Logo Only */}
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-1.5 rounded-sm transform rotate-45">
              <div className="w-3 h-3 bg-white"></div>
            </div>
            <span className="text-xl font-bold text-gray-900 tracking-tight">NemuBarang</span>
          </div>

          {/* Right: Buttons */}
          <div className="flex items-center gap-3">
            {/* Jual Barang Button */}
            <button
              onClick={() => router.push("/dashboard/seller/add")}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-full font-semibold text-sm transition-colors shadow-sm"
            >
              <PlusIcon />
              Jual Barang
            </button>

            {/* Logout Button (Ditambahkan sebagai pengganti Profile Dropdown) */}
            <button
               onClick={async () => {
                 await supabase.auth.signOut()
                 router.push("/login")
               }}
               className="px-5 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 rounded-full transition-colors border border-red-200"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* === MAIN CONTENT === */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-8 tracking-tight">Daftar Barang Anda</h1>

        {/* Product Table Container */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="py-5 px-6 font-medium text-gray-900 text-sm">Produk</th>
                  <th className="py-5 px-6 font-medium text-gray-900 text-sm">Harga</th>
                  <th className="py-5 px-6 font-medium text-gray-900 text-sm w-48">Tindakan</th>
                </tr>
              </thead>
              <tbody>
                {products.length === 0 ? (
                  <tr>
                    <td colSpan="3" className="py-12 text-center text-gray-400">
                      Belum ada barang yang dijual.
                    </td>
                  </tr>
                ) : (
                  products.map((p) => (
                    <tr key={p.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors last:border-b-0">
                      <td className="py-5 px-6 text-gray-700 font-medium">
                        {p.name}
                      </td>
                      <td className="py-5 px-6 text-gray-500">
                        {formatRupiah(p.price)}
                      </td>
                      <td className="py-5 px-6">
                        <div className="flex items-center gap-4">
                            <button
                            onClick={() => router.push(`/dashboard/seller/edit/${p.id}`)}
                            className="text-blue-600 font-bold text-sm hover:underline"
                            >
                            Edit
                            </button>
                            <button
                            onClick={() => deleteProduct(p.id)}
                            className="text-red-500 text-sm hover:text-red-700 font-medium"
                            >
                            Hapus
                            </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination (Static Visual Only) */}
        <div className="flex justify-center items-center mt-12 gap-2 text-sm font-medium text-gray-500">
            <button className="p-2 hover:bg-gray-100 rounded-full"><ChevronLeft /></button>
            <button className="w-8 h-8 flex items-center justify-center bg-blue-600 text-white rounded-full shadow-md">1</button>
            <button className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-full">2</button>
            <button className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-full">3</button>
            <span className="px-2">...</span>
            <button className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-full">8</button>
            <button className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-full">9</button>
            <button className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-full">10</button>
            <button className="p-2 hover:bg-gray-100 rounded-full"><ChevronRight /></button>
        </div>

      </main>
    </div>
  )
}