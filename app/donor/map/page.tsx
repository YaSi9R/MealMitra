"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MapPin, Users, Phone, Navigation } from "lucide-react"
import DonorHeader from "@/components/donor/donor-header"
import { donorAPI } from "@/lib/api"
import { useSocket } from "@/hooks/useSocket"

export default function DonorMapView() {
  const [receivers, setReceivers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedReceiverId, setSelectedReceiverId] = useState<string | null>(null)

  const user = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("user") || "{}") : {}
  const { notifications } = useSocket(user?.id)

  useEffect(() => {
    const fetchReceivers = async () => {
      try {
        setLoading(true)
        const data = await donorAPI.getReceivers()
        setReceivers(data)
      } catch (error) {
        console.error("Failed to fetch receivers for map:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchReceivers()
  }, [])

  // Standard Delhi center coordinates as donor default coordinate fallback
  const donorLat = 28.6139
  const donorLng = 77.2090

  // Filter out receivers with invalid coordinates
  const validReceivers = receivers.map((r) => {
    const lng = r.location?.coordinates?.[0] ?? donorLng
    const lat = r.location?.coordinates?.[1] ?? donorLat
    return {
      ...r,
      lat,
      lng,
      distance: calculateDistance([donorLng, donorLat], [lng, lat]),
    }
  })

  // Distance calculator helper
  function calculateDistance(coord1: [number, number], coord2: [number, number]) {
    const [lon1, lat1] = coord1
    const [lon2, lat2] = coord2
    const R = 6371 // km
    const dLat = (lat2 - lat1) * (Math.PI / 180)
    const dLon = (lon2 - lon1) * (Math.PI / 180)
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }

  // Calculate boundary box for SVG map coordinates
  const receiverLats = validReceivers.map((r) => r.lat).concat(donorLat)
  const receiverLngs = validReceivers.map((r) => r.lng).concat(donorLng)

  const minLat = Math.min(...receiverLats)
  const maxLat = Math.max(...receiverLats)
  const minLng = Math.min(...receiverLngs)
  const maxLng = Math.max(...receiverLngs)

  // Map limits
  const mapWidth = 600
  const mapHeight = 400
  const latDelta = maxLat - minLat || 0.1
  const lngDelta = maxLng - minLng || 0.1

  const getMapX = (lng: number) => {
    return ((lng - minLng) / lngDelta) * (mapWidth - 80) + 40
  }

  const getMapY = (lat: number) => {
    return ((maxLat - lat) / latDelta) * (mapHeight - 80) + 40
  }

  const userX = getMapX(donorLng)
  const userY = getMapY(donorLat)

  const selectedReceiver = validReceivers.find((r) => r._id === selectedReceiverId)

  return (
    <div className="min-h-screen bg-gray-50">
      <DonorHeader notificationCount={notifications.length} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Receiver Proximity Map</h1>
        <p className="text-gray-600 mb-8">View verified shelter houses, NGOs, and food banks near Delhi center (28.6139, 77.2090)</p>

        {loading ? (
          <div className="text-center py-20 bg-white border border-gray-200 rounded-xl">
            <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-500">Loading geospatial mapping data...</p>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Map Plotter */}
            <div className="lg:col-span-2">
              <Card className="p-6 border-emerald-100 bg-white">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Proximity Visualizer (2dsphere Plot)</h2>
                <div className="bg-gray-50 rounded-lg overflow-hidden border-2 border-gray-100 shadow-inner relative">
                  <svg width="100%" height={mapHeight} viewBox={`0 0 ${mapWidth} ${mapHeight}`} className="bg-white">
                    {/* SVG Map grid lines */}
                    {[0, 1, 2, 3, 4].map((i) => (
                      <line
                        key={`h-${i}`}
                        x1="0"
                        y1={(mapHeight / 4) * i}
                        x2={mapWidth}
                        y2={(mapHeight / 4) * i}
                        stroke="#f1f5f9"
                        strokeWidth="1.5"
                      />
                    ))}
                    {[0, 1, 2, 3, 4].map((i) => (
                      <line
                        key={`v-${i}`}
                        x1={(mapWidth / 4) * i}
                        y1="0"
                        x2={(mapWidth / 4) * i}
                        y2={mapHeight}
                        stroke="#f1f5f9"
                        strokeWidth="1.5"
                      />
                    ))}

                    {/* Connection lines from donor to receivers */}
                    {validReceivers.map((receiver) => (
                      <line
                        key={`line-${receiver._id}`}
                        x1={userX}
                        y1={userY}
                        x2={getMapX(receiver.lng)}
                        y2={getMapY(receiver.lat)}
                        stroke={selectedReceiverId === receiver._id ? "#10b981" : "#e2e8f0"}
                        strokeWidth={selectedReceiverId === receiver._id ? "2.5" : "1"}
                        strokeDasharray={selectedReceiverId === receiver._id ? "0" : "4,4"}
                        className="transition-all"
                      />
                    ))}

                    {/* Donor location (Green) */}
                    <circle cx={userX} cy={userY} r="8" fill="#10b981" stroke="white" strokeWidth="2.5" />
                    <circle cx={userX} cy={userY} r="16" fill="none" stroke="#10b981" strokeWidth="1.5" className="animate-ping" style={{ transformOrigin: `${userX}px ${userY}px` }} opacity="0.4" />

                    {/* Receiver nodes */}
                    {validReceivers.map((receiver) => {
                      const rx = getMapX(receiver.lng)
                      const ry = getMapY(receiver.lat)
                      const isSelected = selectedReceiverId === receiver._id
                      return (
                        <g key={receiver._id} className="cursor-pointer" onClick={() => setSelectedReceiverId(isSelected ? null : receiver._id)}>
                          <circle
                            cx={rx}
                            cy={ry}
                            r={isSelected ? "9" : "6.5"}
                            fill={isSelected ? "#3b82f6" : "#ef4444"}
                            stroke="white"
                            strokeWidth="2"
                            className="transition-all duration-300 hover:scale-125"
                          />
                        </g>
                      )
                    })}
                  </svg>
                </div>

                <div className="mt-4 flex items-center gap-6 text-sm font-semibold text-gray-700">
                  <div className="flex items-center gap-2">
                    <div className="w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white shadow-sm"></div>
                    <span>My Donor Location</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3.5 h-3.5 rounded-full bg-rose-500 border-2 border-white shadow-sm"></div>
                    <span>NGO / Receiver Coordinates</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3.5 h-3.5 rounded-full bg-blue-500 border-2 border-white shadow-sm"></div>
                    <span>Selected Receiver</span>
                  </div>
                </div>
              </Card>
            </div>

            {/* Receiver Listings list */}
            <div>
              <Card className="p-6 border-emerald-100 bg-white max-h-[480px] overflow-y-auto shadow-sm">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Registered NGO Receivers</h2>
                <div className="space-y-3">
                  {validReceivers.length === 0 ? (
                    <p className="text-gray-500 text-sm italic">No receivers registered yet.</p>
                  ) : (
                    validReceivers.map((receiver) => (
                      <button
                        key={receiver._id}
                        onClick={() => setSelectedReceiverId(selectedReceiverId === receiver._id ? null : receiver._id)}
                        className={`w-full text-left p-4 rounded-xl border-2 transition-all shadow-sm ${
                          selectedReceiverId === receiver._id
                            ? "border-emerald-600 bg-emerald-50/50 scale-102"
                            : "border-gray-100 bg-white hover:border-emerald-200"
                        }`}
                      >
                        <div className="flex items-start justify-between mb-1">
                          <h3 className="font-bold text-gray-900 line-clamp-1">
                            {receiver.organizationName || receiver.name}
                          </h3>
                          <span className="text-xs font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full whitespace-nowrap">
                            {receiver.distance.toFixed(1)} km
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 font-medium mb-2 uppercase">
                          {receiver.organizationType || "NGO"}
                        </p>
                        <p className="text-xs text-gray-600 flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                          <span className="line-clamp-1">{receiver.location?.address || "No address"}</span>
                        </p>
                      </button>
                    ))
                  )}
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* Selected Receiver Profile Details */}
        {selectedReceiver && (
          <Card className="mt-6 p-6 border-emerald-200 bg-emerald-50/40 backdrop-blur-sm shadow-md rounded-2xl animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full uppercase tracking-wider">
                  Selected Recipient Details
                </span>
                <h3 className="text-2xl font-black text-gray-900 mt-2">
                  {selectedReceiver.organizationName || selectedReceiver.name}
                </h3>
                <p className="text-gray-600 mt-1 flex items-center gap-1.5 text-sm">
                  <MapPin className="w-4 h-4 text-emerald-600" />
                  {selectedReceiver.location?.address} ({selectedReceiver.distance.toFixed(2)} km away)
                </p>
              </div>
              <div className="flex gap-2">
                <Button asChild className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold">
                  <a href={`tel:${selectedReceiver.phone}`}>
                    <Phone className="w-4 h-4 mr-2" />
                    Call Organization
                  </a>
                </Button>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mt-6 border-t border-emerald-100 pt-6">
              <div>
                <p className="text-sm text-gray-500 font-semibold">Organization Type</p>
                <p className="text-lg font-bold text-gray-900 mt-0.5">
                  {selectedReceiver.organizationType || "General Shelter"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 font-semibold">Geospatial Latitude</p>
                <p className="text-lg font-bold text-gray-900 mt-0.5">
                  {selectedReceiver.lat.toFixed(6)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 font-semibold">Geospatial Longitude</p>
                <p className="text-lg font-bold text-gray-900 mt-0.5">
                  {selectedReceiver.lng.toFixed(6)}
                </p>
              </div>
            </div>

            {selectedReceiver.description && (
              <div className="mt-4 p-3 bg-white/70 border border-emerald-100 rounded-lg text-sm text-gray-600">
                <span className="font-bold text-gray-900 block mb-1">About Organization:</span>
                {selectedReceiver.description}
              </div>
            )}
          </Card>
        )}
      </main>
    </div>
  )
}
