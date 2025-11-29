import { supabase } from "../../../lib/supabaseClient"

export default async function ProductDetail({ params }) {
  const { id } = params

  const { data: product } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .single()

  return (
    <div className="p-6">
      <img src={product.image_url} className="w-full max-w-md" />
      <h1 className="text-2xl font-bold">{product.name}</h1>
      <p>Rp {product.price}</p>
      <p className="mt-4">{product.description}</p>
    </div>
  )
}
