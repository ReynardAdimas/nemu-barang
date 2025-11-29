'use client'

import { useEffect, useState } from "react"
import { supabase } from "../../../lib/supabaseClient"
import { useRouter } from "next/navigation"

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

  if (!profile)
    return <div className="p-6 text-lg">Memuat dashboard penjual...</div>

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Dashboard Penjual</h1>

      {/* Tombol Tambah Produk */}
      <button
        onClick={() => router.push("/dashboard/seller/add")}
        className="bg-green-600 text-white px-4 py-2 rounded"
      >
        + Tambah Produk
      </button>

      <h2 className="text-xl font-semibold mt-4">Daftar Produk Anda</h2>

      <div className="space-y-4">
        {products.length === 0 ? (
          <p className="text-gray-400">Anda belum menambahkan produk.</p>
        ) : (
          products.map((p) => (
            <div
              key={p.id}
              className="p-4 border rounded bg-black/20 backdrop-blur-sm"
            >
              <h3 className="text-lg font-bold">{p.name}</h3>
              <p>Harga: Rp {p.price}</p>

              <div className="flex gap-3 mt-3">
                {/* Edit */}
                <button
                  className="bg-blue-600 text-white px-3 py-1 rounded"
                  onClick={() => router.push(`/dashboard/seller/edit/${p.id}`)}
                >
                  Edit
                </button>

                {/* Hapus */}
                <button
                  className="bg-red-600 text-white px-3 py-1 rounded"
                  onClick={() => deleteProduct(p.id)}
                >
                  Hapus
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Tombol Logout */}
      <button
        onClick={async () => {
          await supabase.auth.signOut()
          router.push("/login")
        }}
        className="mt-8 p-2 bg-red-600 text-white rounded"
      >
        Logout
      </button>
    </div>
  )
}