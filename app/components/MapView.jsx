'use client'

import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet"
import "leaflet/dist/leaflet.css"
import L from "leaflet"
import { useEffect, useRef } from "react"
import "leaflet-routing-machine"
import "leaflet-routing-machine/dist/leaflet-routing-machine.css"
import { useRouter } from "next/router"

const productIcon = new L.Icon({
  iconUrl: "/markers/marker-red.png",
  iconSize: [20, 30],
  iconAnchor: [20, 40],
})

const userIcon = new L.Icon({
  iconUrl: "/markers/marker-blue.png",
  iconSize: [20, 30],
  iconAnchor: [20, 40],
})

function RoutingControl({ userPosition, routeTarget, clearRoute }) {
  const map = useMap()
  const routingControlRef = useRef(null)

  useEffect(() => {
    if (!routeTarget || !userPosition) return

    // Hapus rute lama
    if (routingControlRef.current) {
      map.removeControl(routingControlRef.current)
      routingControlRef.current = null
    }

    // Buat rute baru
    const control = L.Routing.control({
      waypoints: [
        L.latLng(userPosition[0], userPosition[1]),
        L.latLng(routeTarget[0], routeTarget[1])
      ],
      lineOptions: {
        styles: [{ color: "blue", weight: 4 }]
      },
      show: true,
      collapsible: true
    }).addTo(map)

    routingControlRef.current = control

    return () => {
      if (routingControlRef.current) {
        map.removeControl(routingControlRef.current)
        routingControlRef.current = null
      }
    }
  }, [routeTarget])

  // Tombol hapus rute
  if (!routeTarget) return null

  return (
    <button
      onClick={() => {
        if (routingControlRef.current) {
          map.removeControl(routingControlRef.current)
          routingControlRef.current = null
        }
        clearRoute()
      }}
      style={{
        position: "absolute",
        bottom: "20px",
        right: "20px",
        zIndex: 9999,
        background: "red",
        color: "white",
        padding: "10px 16px",
        borderRadius: "12px",
        fontWeight: "bold",
        boxShadow: "0 3px 8px rgba(0,0,0,0.3)"
      }}
    >
      Hapus Rute
    </button>
  )
}

export default function MapView({ center, userPosition, markers, onDetail, onRoute, routeTarget, clearRoute, onContactSeller }) { 
  // const router = useRouter()

  // function handleChatWA(m) {
  //   if (!m.waNumber) {
  //     router.push("/no-whatsapp")
  //     return
  //   }

  //   const message = `Halo ${m.sellerName}, saya tertarik dengan barang: ${m.text}.`
  //   const waURL = `https://wa.me/${m.waNumber}?text=${encodeURIComponent(message)}`

  //   window.open(waURL, "_blank")
  // }
  return (
    <MapContainer center={center} zoom={15} style={{ height: "100%", width: "100%" }}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

      {/* Marker user */}
      {userPosition && (
        <Marker position={userPosition} icon={userIcon}>
          <Popup>Posisi Anda</Popup>
        </Marker>
      )}

      {/* Marker produk */}
      {markers.map((m) => (
        <Marker key={m.id} position={m.position} icon={productIcon}>
          <Popup>
            <p className="font-semibold">{m.text}</p>
            <p className="text-sm text-gray-700 mb-2">
              Penjual: <span className="font-medium">{m.sellerName}</span>
            </p> 
              <button
              className="px-2 py-1 bg-blue-600 text-white rounded w-full mb-2"
              onClick={() => onContactSeller(m.id)}
            >
              Hubungi Penjual
            </button>
            <button
              className="px-2 py-1 bg-green-600 text-white rounded w-full"
              onClick={() => onRoute(m.position)}
            >
              Lihat Rute
            </button>
          </Popup>
        </Marker>
      ))}

      {/* Routing machine + tombol hapus rute */}
      <RoutingControl
        userPosition={userPosition}
        routeTarget={routeTarget}
        clearRoute={clearRoute}
      />
    </MapContainer>
  )
}
