"use client"

import { use, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"

export default function EditProductPage(props) {

  // Unwrap dynamic params (Next.js 16)
  const { id } = use(props.params)

  const productId = Number(id)
  const router = useRouter()

  const [form, setForm] = useState({
    name: "",
    price: "",
    description: "",
    image_url: "",
    image_file: null, // <-- FILE STORAGE
  })

  const [loading, setLoading] = useState(true)

  // =============== UPLOAD IMAGE ===============
  async function uploadImage(file) {
    if (!file) return null

    const fileExt = file.name.split(".").pop()
    const fileName = `${Date.now()}.${fileExt}`
    const filePath = `products/${fileName}`

    // Upload ke Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from("product-images")
      .upload(filePath, file)

    if (uploadError) {
      alert("Gagal upload gambar: " + uploadError.message)
      return null
    }

    // Ambil URL publik
    const { data } = supabase.storage
      .from("product-images")
      .getPublicUrl(filePath)

    return data.publicUrl
  }

  // =============== LOAD PRODUK =================
  useEffect(() => {
    async function loadProduct() {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", productId)
        .single()

      if (error || !data) {
        alert("Produk tidak ditemukan")
        router.push("/dashboard/seller")
        return
      }

      setForm((prev) => ({
        ...prev,
        name: data.name,
        price: data.price,
        description: data.description,
        image_url: data.image_url
      }))

      setLoading(false)
    }

    loadProduct()
  }, [productId])

  // Handler perubahan field
  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  // =============== SAVE CHANGES =================
  async function updateProduct(e) {
    e.preventDefault()

    let finalImageUrl = form.image_url

    // kalau user pilih gambar baru → upload
    if (form.image_file) {
      const uploadedUrl = await uploadImage(form.image_file)
      if (uploadedUrl) finalImageUrl = uploadedUrl
    }

    const { error } = await supabase
      .from("products")
      .update({
        name: form.name,
        price: form.price,
        description: form.description,
        image_url: finalImageUrl
      })
      .eq("id", productId)

    if (error) {
      alert("Gagal update: " + error.message)
      return
    }

    alert("Produk berhasil diperbarui!")
    router.push("/dashboard/seller")
  }

  // =============== DELETE PRODUCT ===============
  async function deleteProduct() {
    if (!confirm("Yakin ingin menghapus produk ini?")) return

    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", productId)

    if (error) {
      alert("Gagal hapus: " + error.message)
      return
    }

    alert("Produk berhasil dihapus")
    router.push("/dashboard/seller")
  }

  if (loading) return <div className="p-6">Memuat data...</div>

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Edit Produk</h1>

      <form onSubmit={updateProduct} className="space-y-4 max-w-lg">

        <div>
          <label>Nama Produk</label>
          <input
            className="w-full border p-2 rounded"
            value={form.name}
            onChange={(e) => updateField("name", e.target.value)}
          />
        </div>

        <div>
          <label>Harga (Rp)</label>
          <input
            className="w-full border p-2 rounded"
            type="number"
            value={form.price}
            onChange={(e) => updateField("price", e.target.value)}
          />
        </div>

        {/* ==== FILE UPLOAD ==== */}
        <div>
          <label>Gambar Produk</label>
          <input
            type="file"
            accept="image/*"
            className="w-full border p-2 rounded"
            onChange={(e) => updateField("image_file", e.target.files[0])}
          />

          {form.image_url && (
            <img
              src={form.image_url}
              alt="Preview"
              className="w-40 mt-3 rounded border"
            />
          )}
        </div>

        <div>
          <label>Deskripsi</label>
          <textarea
            className="w-full border p-2 rounded"
            rows={4}
            value={form.description}
            onChange={(e) => updateField("description", e.target.value)}
          />
        </div>

        <button type="submit" className="bg-blue-600 text-white p-2 rounded">
          Simpan Perubahan
        </button>

        <button
          type="button"
          onClick={deleteProduct}
          className="bg-red-600 text-white p-2 rounded ml-4"
        >
          Hapus Produk
        </button>

      </form>

      <button className="mt-4 p-2 border rounded" onClick={() => router.back()}>
        Kembali
      </button>
    </div>
  )
}
