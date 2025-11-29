'use client'

import { useState } from 'react'

export default function CheckLocation() {
  const [loc, setLoc] = useState(null)
  const [error, setError] = useState(null)

  const ask = () => {
    if (!navigator.geolocation) {
      setError('Geolocation tidak tersedia di browser ini')
      return
    }
    navigator.geolocation.getCurrentPosition(
      pos => {
        setLoc({ lat: pos.coords.latitude, lon: pos.coords.longitude })
      },
      err => {
        setError(err.message)
      }
    )
  }

  return (
    <div className="border p-4 rounded max-w-md">
      <button onClick={ask} className="p-2 bg-sky-600 text-white rounded">Minta Lokasi</button>
      {loc && <div className="mt-2">Lat: {loc.lat}, Lon: {loc.lon}</div>}
      {error && <div className="mt-2 text-red-600">Error: {error}</div>}
    </div>
  )
}
