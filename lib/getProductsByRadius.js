import { supabase } from "./supabaseClient"

export async function getProductsByRadius(lat, lon, radius) {
  const { data, error } = await supabase.rpc("get_products_by_radius", {
    lat_input: lat,
    lon_input: lon,
    radius_input: radius
  })

  if (error) {
    console.error(error)
    return []
  }

  return data
}
