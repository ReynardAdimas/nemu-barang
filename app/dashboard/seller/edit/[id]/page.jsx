"use client"

import { use, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"

export default function EditProductPage(props) {
  const { id } = use(props.params)
  const productId = Number(id)
  const router = useRouter()

  const [form, setForm] = useState({
    name: "",
    price: "",
    description: "",
    image_url: "",
    image_file: null,
    latitude: "",
    longitude: "",
  })

  const [loading, setLoading] = useState(true)
  const [imagePreview, setImagePreview] = useState(null)

  // =============== UPLOAD IMAGE ===============
  async function uploadImage(file) {
    if (!file) return null

    const fileExt = file.name.split(".").pop()
    const fileName = `${Date.now()}.${fileExt}`
    const filePath = `products/${fileName}`

    const { error: uploadError } = await supabase.storage
      .from("product-images")
      .upload(filePath, file)

    if (uploadError) {
      alert("Gagal upload gambar: " + uploadError.message)
      return null
    }

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

      // Parse lokasi dari format PostGIS: POINT(longitude latitude)
      let lat = ""
      let lon = ""
      if (data.location) {
        // Mencari angka di dalam string POINT
        const match = data.location.match(/POINT\(([^ ]+) ([^ ]+)\)/)
        if (match) {
          lon = match[1] // Longitude dulu
          lat = match[2] // Latitude kedua
        }
      }

      setForm({
        name: data.name,
        price: data.price,
        description: data.description,
        image_url: data.image_url,
        image_file: null,
        latitude: lat,
        longitude: lon
      })
      
      // Set initial preview
      setImagePreview(data.image_url)
      setLoading(false)
    }

    loadProduct()
  }, [productId])

  // Handler perubahan field umum
  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  // Handler khusus gambar untuk preview
  function handleImageChange(e) {
    const file = e.target.files[0]
    if (file) {
      setForm((prev) => ({ ...prev, image_file: file }))
      setImagePreview(URL.createObjectURL(file))
    }
  }

  // =============== SAVE CHANGES =================
  async function updateProduct(e) {
    e.preventDefault()

    let finalImageUrl = form.image_url

    if (form.image_file) {
      const uploadedUrl = await uploadImage(form.image_file)
      if (uploadedUrl) finalImageUrl = uploadedUrl
    }

    // Format lokasi kembali ke string PostGIS
    let locationString = null
    if (form.latitude && form.longitude) {
      locationString = `POINT(${form.longitude} ${form.latitude})`
    }

    const { error } = await supabase
      .from("products")
      .update({
        name: form.name,
        price: form.price,
        description: form.description,
        image_url: finalImageUrl,
        location: locationString
      })
      .eq("id", productId)

    if (error) {
      alert("Gagal update: " + error.message)
      return
    }

    alert("Produk berhasil diperbarui!")
    router.push("/dashboard/seller")
  }

  if (loading) return <div className="p-10 text-center text-gray-500">Memuat data produk...</div>

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 font-sans text-slate-800">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Breadcrumb & Header */}
        <div>
          <p className="text-xs text-gray-500 mb-1">
            Beranda / Barang Saya / <span className="font-semibold text-gray-700">Edit: {form.name}</span>
          </p>
          <h1 className="text-3xl font-bold text-gray-900">Ubah Detail Barang</h1>
        </div>

        <form onSubmit={updateProduct} className="space-y-6">
          
          {/* CARD 1: FOTO PRODUK */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h2 className="text-lg font-bold mb-4">Foto Produk</h2>
            <div className="flex flex-wrap gap-4">
              
              {/* Preview Gambar Saat Ini */}
              {imagePreview && (
                <div className="w-40 h-32 rounded-lg overflow-hidden border border-gray-200 bg-gray-100 relative group">
                  <img 
                    src={imagePreview} 
                    alt="Preview" 
                    className="w-full h-full object-cover" 
                  />
                  {/* Overlay edit hint */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition" />
                </div>
              )}

              {/* Tombol Tambah/Ubah Foto */}
              <label className="w-40 h-32 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition text-gray-500 hover:text-blue-600">
                <input 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={handleImageChange}
                />
                <svg className="w-8 h-8 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                <span className="text-xs font-medium">Ubah Foto</span>
              </label>
            </div>
          </div>

          {/* CARD 2: INFORMASI PRODUK & LOKASI */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-6">
            
            {/* Nama Produk */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Nama Produk</label>
              <input
                type="text"
                className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                value={form.name}
                onChange={(e) => updateField("name", e.target.value)}
              />
            </div>

            {/* Harga */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Harga (Rp)</label>
              <div className="relative">
                <span className="absolute left-3 top-3 text-gray-500 text-sm">Rp</span>
                <input
                  type="number"
                  className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  value={form.price}
                  onChange={(e) => updateField("price", e.target.value)}
                />
              </div>
            </div>

            {/* Deskripsi */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Deskripsi</label>
              <textarea
                rows={4}
                className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
                value={form.description}
                onChange={(e) => updateField("description", e.target.value)}
              />
            </div>

            {/* Lokasi: Latitude & Longitude */}
            <div>
              <h3 className="text-sm font-semibold text-gray-800 mb-3">Lokasi</h3>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Longitude</label>
                  <input
                    type="text"
                    className="w-full p-3 border border-gray-300 rounded-lg text-sm bg-gray-50 focus:bg-white transition outline-none focus:ring-2 focus:ring-blue-500"
                    value={form.longitude}
                    onChange={(e) => updateField("longitude", e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Latitude</label>
                  <input
                    type="text"
                    className="w-full p-3 border border-gray-300 rounded-lg text-sm bg-gray-50 focus:bg-white transition outline-none focus:ring-2 focus:ring-blue-500"
                    value={form.latitude}
                    onChange={(e) => updateField("latitude", e.target.value)}
                  />
                </div>
              </div>

              {/* Map Preview */}
              <div className="w-full h-48 bg-gray-200 rounded-lg overflow-hidden border border-gray-300">
                {form.latitude && form.longitude ? (
                  <iframe 
                    width="100%" 
                    height="100%" 
                    frameBorder="0" 
                    scrolling="no" 
                    marginHeight="0" 
                    marginWidth="0" 
                    src={`https://maps.google.com/maps?q=${form.latitude},${form.longitude}&hl=id&z=15&output=embed`}
                  ></iframe>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                    Peta tidak tersedia (Lokasi belum diatur)
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* Footer Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-2.5 text-sm font-semibold text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition"
            >
              Simpan Perubahan
            </button>
          </div>

        </form>
      </div>
    </div>
  )
}