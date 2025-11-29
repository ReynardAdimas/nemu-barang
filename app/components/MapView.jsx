
'use client'

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet"
import "leaflet/dist/leaflet.css"
import L from "leaflet"

// Custom Icon (produk warna merah)
const productIcon = new L.Icon({
  iconUrl: "markers/marker-icon-red.png",
  iconSize: [35, 45],
})

// Icon pembeli (biru)
const userIcon = new L.Icon({
  iconUrl: "markers/marker-icon.png",
  iconSize: [20, 30],
})

export default function MapView({ center, markers = [], userPosition, onDetail, onRoute }) {

  return (
    <MapContainer
      center={center}
      zoom={14}
      style={{ height: "400px", width: "100%" }}
      scrollWheelZoom={true}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

      {/* Marker Pembeli */}
      {userPosition && (
        <Marker position={userPosition} icon={userIcon}>
          <Popup>Posisi Anda</Popup>
        </Marker>
      )}

      {/* Marker Produk */}
      {markers.map((m) => (
        <Marker key={m.id} position={m.position} icon={productIcon}>
          <Popup>
            <div className="space-y-2">
              <p className="font-semibold">{m.text}</p>

              <button
                className="px-2 py-1 bg-blue-600 text-white rounded w-full"
                onClick={() => onDetail(m.id)}
              >
                Detail Produk
              </button>

              <button
                className="px-2 py-1 bg-green-600 text-white rounded w-full"
                onClick={() => onRoute(m.position)}
              >
                Lihat Rute
              </button>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}
