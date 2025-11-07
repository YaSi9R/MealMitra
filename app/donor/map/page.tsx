"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MapPin, Users } from "lucide-react"
import DonorHeader from "@/components/donor/donor-header"

export default function DonorMapView() {
  const [selectedReceiver, setSelectedReceiver] = useState<number | null>(null)

  // Mock receiver locations
  const receivers = [
    {
      id: 1,
      name: "Community Shelter",
      lat: 40.7128,
      lng: -74.006,
      distance: 2.5,
      people: 150,
      address: "Downtown Shelter",
    },
    {
      id: 2,
      name: "Food Bank",
      lat: 40.758,
      lng: -73.9855,
      distance: 1.2,
      people: 300,
      address: "Central Food Bank",
    },
    {
      id: 3,
      name: "NGO Kitchen",
      lat: 40.7489,
      lng: -73.968,
      distance: 3.1,
      people: 200,
      address: "Main Street NGO",
    },
    {
      id: 4,
      name: "School Canteen",
      lat: 40.7614,
      lng: -73.9776,
      distance: 1.8,
      people: 500,
      address: "Central School",
    },
    {
      id: 5,
      name: "Orphanage",
      lat: 40.7505,
      lng: -73.9934,
      distance: 4.2,
      people: 80,
      address: "Residential Area",
    },
  ]

  const minLat = Math.min(...receivers.map((r) => r.lat))
  const maxLat = Math.max(...receivers.map((r) => r.lat))
  const minLng = Math.min(...receivers.map((r) => r.lng))
  const maxLng = Math.max(...receivers.map((r) => r.lng))

  const mapWidth = 600
  const mapHeight = 400

  const getMapX = (lng: number) => {
    return ((lng - minLng) / (maxLng - minLng)) * mapWidth
  }

  const getMapY = (lat: number) => {
    return ((maxLat - lat) / (maxLat - minLat)) * mapHeight
  }

  const userLat = (minLat + maxLat) / 2
  const userLng = (minLng + maxLng) / 2
  const userX = getMapX(userLng)
  const userY = getMapY(userLat)

  return (
    <div className="min-h-screen bg-gray-50">
      <DonorHeader />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Receiver Locations</h1>
        <p className="text-gray-600 mb-8">See where your donations can make the most impact</p>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Map */}
          <div className="lg:col-span-2">
            <Card className="p-6 border-emerald-100">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Nearby Recipients</h2>
              <div className="bg-gray-100 rounded-lg overflow-hidden border-2 border-gray-200">
                <svg width="100%" height={mapHeight} viewBox={`0 0 ${mapWidth} ${mapHeight}`} className="bg-white">
                  {/* Grid */}
                  {[0, 1, 2, 3, 4].map((i) => (
                    <line
                      key={`h-${i}`}
                      x1="0"
                      y1={(mapHeight / 4) * i}
                      x2={mapWidth}
                      y2={(mapHeight / 4) * i}
                      stroke="#e5e7eb"
                      strokeWidth="1"
                    />
                  ))}
                  {[0, 1, 2, 3, 4].map((i) => (
                    <line
                      key={`v-${i}`}
                      x1={(mapWidth / 4) * i}
                      y1="0"
                      x2={(mapWidth / 4) * i}
                      y2={mapHeight}
                      stroke="#e5e7eb"
                      strokeWidth="1"
                    />
                  ))}

                  {/* Connection lines */}
                  {receivers.map((receiver) => (
                    <line
                      key={`line-${receiver.id}`}
                      x1={userX}
                      y1={userY}
                      x2={getMapX(receiver.lng)}
                      y2={getMapY(receiver.lat)}
                      stroke={selectedReceiver === receiver.id ? "#10b981" : "#d1d5db"}
                      strokeWidth={selectedReceiver === receiver.id ? "2" : "1"}
                      strokeDasharray="5,5"
                    />
                  ))}

                  {/* Your location */}
                  <circle cx={userX} cy={userY} r="8" fill="#10b981" stroke="white" strokeWidth="2" />
                  <circle cx={userX} cy={userY} r="12" fill="none" stroke="#10b981" strokeWidth="1" opacity="0.3" />

                  {/* Receivers */}
                  {receivers.map((receiver) => (
                    <g key={receiver.id}>
                      <circle
                        cx={getMapX(receiver.lng)}
                        cy={getMapY(receiver.lat)}
                        r="6"
                        fill={selectedReceiver === receiver.id ? "#3b82f6" : "#ef4444"}
                        stroke="white"
                        strokeWidth="2"
                        style={{ cursor: "pointer" }}
                        onClick={() => setSelectedReceiver(selectedReceiver === receiver.id ? null : receiver.id)}
                      />
                    </g>
                  ))}
                </svg>
              </div>

              <div className="mt-4 flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-emerald-600"></div>
                  <span>Your Location</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <span>Recipients</span>
                </div>
              </div>
            </Card>
          </div>

          {/* Receiver List */}
          <div>
            <Card className="p-6 border-emerald-100 max-h-[500px] overflow-y-auto">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Recipients</h2>
              <div className="space-y-3">
                {receivers.map((receiver) => (
                  <button
                    key={receiver.id}
                    onClick={() => setSelectedReceiver(selectedReceiver === receiver.id ? null : receiver.id)}
                    className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                      selectedReceiver === receiver.id
                        ? "border-emerald-600 bg-emerald-50"
                        : "border-gray-200 bg-white hover:border-emerald-300"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-gray-900">{receiver.name}</h3>
                      <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded">
                        {receiver.distance} km
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 mb-2 flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {receiver.address}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">{receiver.people} people</span>
                      <Users className="w-4 h-4 text-emerald-600" />
                    </div>
                  </button>
                ))}
              </div>
            </Card>
          </div>
        </div>

        {/* Selected Receiver Details */}
        {selectedReceiver && (
          <Card className="mt-6 p-6 border-emerald-100 bg-emerald-50">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-2xl font-bold text-gray-900">
                  {receivers.find((r) => r.id === selectedReceiver)?.name}
                </h3>
                <p className="text-gray-600 mt-1">
                  {receivers.find((r) => r.id === selectedReceiver)?.distance} km away
                </p>
              </div>
              <Button className="bg-emerald-600 hover:bg-emerald-700">Send Donation</Button>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-600">People Served</p>
                <p className="text-2xl font-bold text-gray-900">
                  {receivers.find((r) => r.id === selectedReceiver)?.people}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Impact Potential</p>
                <p className="text-2xl font-bold text-emerald-600">High</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Rating</p>
                <p className="text-2xl font-bold text-gray-900">4.9/5</p>
              </div>
            </div>
          </Card>
        )}
      </main>
    </div>
  )
}
