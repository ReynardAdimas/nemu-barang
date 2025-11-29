'use client'

import { useState, useEffect } from "react"
import { supabase } from "../../../../lib/supabaseClient"
import { useRouter } from "next/navigation"

export default function AddProductPage() {
  const router = useRouter()

  const [name, setName] = useState("")
  const [price, setPrice] = useState("")
  const [description, setDescription] = useState("")
  const [imageFile, setImageFile] = useState(null)

  const [location, setLocation] = useState(null)
  const [loading, setLoading] = useState(false)

  // Ambil lokasi otomatis
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation([pos.coords.latitude, pos.coords.longitude])
      },
      (err) => {
        console.error(err)
        alert("Tidak bisa mendapatkan lokasi, mohon aktifkan GPS")
      }
    )
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)

    // Validasi form
    if (!name || !price || !description || !imageFile) {
      alert("Semua field wajib diisi!")
      setLoading(false)
      return
    }

    if (!location) {
      alert("Lokasi tidak terdeteksi")
      setLoading(false)
      return
    }

    // 1️⃣ Upload gambar ke Supabase Storage
    const fileExt = imageFile.name.split('.').pop()
    const fileName = `${Date.now()}.${fileExt}`
    const filePath = `products/${fileName}`

    const { error: uploadError } = await supabase.storage
      .from("product-images")
      .upload(filePath, imageFile)

    if (uploadError) {
      console.error(uploadError)
      alert("Gagal upload gambar")
      setLoading(false)
      return
    }

    // Ambil URL publik dari storage
    const { data: imgUrl } = supabase.storage
      .from("product-images")
      .getPublicUrl(filePath)

    // 2️⃣ Ambil user ID
    const { data: userData } = await supabase.auth.getUser()
    const userId = userData.user.id

    // 3️⃣ Simpan ke tabel products
    const { error: insertError } = await supabase
      .from("products")
      .insert({
        name,
        price: Number(price),
        description,
        image_url: imgUrl.publicUrl,
        seller_id: userId,
        location: `POINT(${location[1]} ${location[0]})` // lon lat
      })

    if (insertError) {
      console.error(insertError)
      alert("Gagal menyimpan produk")
      setLoading(false)
      return
    }

    alert("Produk berhasil ditambahkan!")
    router.push("/dashboard/seller")
  }

  return (
    <div className="p-6 max-w-xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Tambah Produk</h1>

      <form onSubmit={handleSubmit} className="space-y-4">

        <div>
          <label className="font-semibold">Nama Produk</label>
          <input
            className="w-full p-2 border rounded bg-black/20"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div>
          <label className="font-semibold">Harga</label>
          <input
            type="number"
            className="w-full p-2 border rounded bg-black/20"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />
        </div>

        <div>
          <label className="font-semibold">Deskripsi</label>
          <textarea
            className="w-full p-2 border rounded bg-black/20"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div>
          <label className="font-semibold">Foto Produk</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImageFile(e.target.files[0])}
            className="w-full p-2"
          />
        </div>

        <div>
          <label className="font-semibold">Lokasi</label>
          <p>
            {location
              ? `Lat: ${location[0]} | Lon: ${location[1]}`
              : "Mengambil lokasi..."}
          </p>
        </div>

        <button
          disabled={loading}
          className="w-full p-3 rounded bg-blue-600 text-white"
        >
          {loading ? "Menyimpan..." : "Simpan Produk"}
        </button>
      </form>

      <button
        onClick={() => router.back()}
        className="mt-4 p-2 bg-gray-500 text-white rounded"
      >
        Kembali
      </button>
    </div>
  )
}
