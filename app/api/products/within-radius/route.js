import { createClient } from '@supabase/supabase-js'

export async function POST(req) {
  const body = await req.json()
  const { lat, lon, radius } = body

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )

  // Query radius menggunakan PostGIS
  const { data, error } = await supabase.rpc('products_within_radius', {
    user_lat: lat,
    user_lon: lon,
    user_radius: radius
  })

  if (error) {
    console.log(error)
    return Response.json({ error })
  }

  return Response.json({ products: data })
}
