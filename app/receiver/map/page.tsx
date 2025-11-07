"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MapPin, Navigation } from "lucide-react"
import ReceiverHeader from "@/components/receiver/receiver-header"

export default function MapView() {
  const [selectedDonor, setSelectedDonor] = useState<number | null>(null)
  const [filterCategory, setFilterCategory] = useState("all")

  // Mock donor locations with coordinates
  const donors = [
    {
      id: 1,
      name: "Central Market",
      lat: 40.7128,
      lng: -74.006,
      distance: 2.5,
      items: 5,
      category: "vegetables",
      address: "Downtown Market",
    },
    {
      id: 2,
      name: "Community Kitchen",
      lat: 40.758,
      lng: -73.9855,
      distance: 1.2,
      items: 3,
      category: "cooked-food",
      address: "Central Kitchen",
    },
    {
      id: 3,
      name: "Main Street Bakery",
      lat: 40.7489,
      lng: -73.968,
      distance: 3.1,
      items: 2,
      category: "bakery",
      address: "Main Street",
    },
    {
      id: 4,
      name: "Fruit Vendors",
      lat: 40.7614,
      lng: -73.9776,
      distance: 1.8,
      items: 4,
      category: "fruits",
      address: "Fruit Market",
    },
    {
      id: 5,
      name: "Local Dairy",
      lat: 40.7505,
      lng: -73.9934,
      distance: 4.2,
      items: 2,
      category: "dairy",
      address: "Dairy Farm",
    },
  ]

  const filteredDonors = donors.filter((d) => filterCategory === "all" || d.category === filterCategory)

  // Simple map visualization using SVG
  const minLat = Math.min(...donors.map((d) => d.lat))
  const maxLat = Math.max(...donors.map((d) => d.lat))
  const minLng = Math.min(...donors.map((d) => d.lng))
  const maxLng = Math.max(...donors.map((d) => d.lng))

  const mapWidth = 600
  const mapHeight = 400

  const getMapX = (lng: number) => {
    return ((lng - minLng) / (maxLng - minLng)) * mapWidth
  }

  const getMapY = (lat: number) => {
    return ((maxLat - lat) / (maxLat - minLat)) * mapHeight
  }

  // User location (center)
  const userLat = (minLat + maxLat) / 2
  const userLng = (minLng + maxLng) / 2
  const userX = getMapX(userLng)
  const userY = getMapY(userLat)

  return (
    <div className="min-h-screen bg-gray-50">
      <ReceiverHeader />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Location-Based Matching</h1>
        <p className="text-gray-600 mb-8">Find nearby food donors and see real-time availability</p>

        {/* Filter */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">Filter by Category</label>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {["all", "vegetables", "cooked-food", "bakery", "dairy", "fruits"].map((cat) => (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className={`px-4 py-2 rounded-full whitespace-nowrap transition-all ${
                  filterCategory === cat
                    ? "bg-blue-600 text-white"
                    : "bg-white border border-gray-300 text-gray-700 hover:border-blue-500"
                }`}
              >
                {cat.charAt(0).toUpperCase() + cat.slice(1).replace("-", " ")}
              </button>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Map */}
          <div className="lg:col-span-2">
            <Card className="p-6 border-blue-100">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Nearby Donors</h2>
              <div className="bg-gray-100 rounded-lg overflow-hidden border-2 border-gray-200">
                <svg width="100%" height={mapHeight} viewBox={`0 0 ${mapWidth} ${mapHeight}`} className="bg-white">
                  {/* Grid lines */}
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

                  {/* Connection lines from user to donors */}
                  {filteredDonors.map((donor) => (
                    <line
                      key={`line-${donor.id}`}
                      x1={userX}
                      y1={userY}
                      x2={getMapX(donor.lng)}
                      y2={getMapY(donor.lat)}
                      stroke={selectedDonor === donor.id ? "#3b82f6" : "#d1d5db"}
                      strokeWidth={selectedDonor === donor.id ? "2" : "1"}
                      strokeDasharray="5,5"
                    />
                  ))}

                  {/* User location */}
                  <circle cx={userX} cy={userY} r="8" fill="#3b82f6" stroke="white" strokeWidth="2" />
                  <circle cx={userX} cy={userY} r="12" fill="none" stroke="#3b82f6" strokeWidth="1" opacity="0.3" />

                  {/* Donor locations */}
                  {filteredDonors.map((donor) => (
                    <g key={donor.id}>
                      <circle
                        cx={getMapX(donor.lng)}
                        cy={getMapY(donor.lat)}
                        r="6"
                        fill={selectedDonor === donor.id ? "#10b981" : "#f59e0b"}
                        stroke="white"
                        strokeWidth="2"
                        style={{ cursor: "pointer" }}
                        onClick={() => setSelectedDonor(selectedDonor === donor.id ? null : donor.id)}
                      />
                    </g>
                  ))}
                </svg>
              </div>

              <div className="mt-4 flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-600"></div>
                  <span>Your Location</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                  <span>Donors</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-emerald-600"></div>
                  <span>Selected</span>
                </div>
              </div>
            </Card>
          </div>

          {/* Donor List */}
          <div>
            <Card className="p-6 border-blue-100 max-h-[500px] overflow-y-auto">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Nearby Donors</h2>
              <div className="space-y-3">
                {filteredDonors.length === 0 ? (
                  <p className="text-gray-600 text-sm">No donors found in this category</p>
                ) : (
                  filteredDonors.map((donor) => (
                    <button
                      key={donor.id}
                      onClick={() => setSelectedDonor(selectedDonor === donor.id ? null : donor.id)}
                      className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                        selectedDonor === donor.id
                          ? "border-blue-600 bg-blue-50"
                          : "border-gray-200 bg-white hover:border-blue-300"
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-gray-900">{donor.name}</h3>
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">{donor.distance} km</span>
                      </div>
                      <p className="text-xs text-gray-600 mb-2 flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {donor.address}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">{donor.items} items available</span>
                        <Navigation className="w-4 h-4 text-blue-600" />
                      </div>
                    </button>
                  ))
                )}
              </div>
            </Card>
          </div>
        </div>

        {/* Selected Donor Details */}
        {selectedDonor && (
          <Card className="mt-6 p-6 border-blue-100 bg-blue-50">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-2xl font-bold text-gray-900">
                  {filteredDonors.find((d) => d.id === selectedDonor)?.name}
                </h3>
                <p className="text-gray-600 mt-1">
                  {filteredDonors.find((d) => d.id === selectedDonor)?.distance} km away
                </p>
              </div>
              <Button className="bg-blue-600 hover:bg-blue-700 gap-2">
                <Navigation className="w-4 h-4" />
                Get Directions
              </Button>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-600">Available Items</p>
                <p className="text-2xl font-bold text-gray-900">
                  {filteredDonors.find((d) => d.id === selectedDonor)?.items}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Category</p>
                <p className="text-2xl font-bold text-gray-900 capitalize">
                  {filteredDonors.find((d) => d.id === selectedDonor)?.category.replace("-", " ")}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Rating</p>
                <p className="text-2xl font-bold text-gray-900">4.8/5</p>
              </div>
            </div>
          </Card>
        )}
      </main>
    </div>
  )
}
