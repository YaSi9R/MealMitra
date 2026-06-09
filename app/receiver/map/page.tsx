"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MapPin, Navigation, Phone, Calendar, Package } from "lucide-react"
import ReceiverHeader from "@/components/receiver/receiver-header"
import FoodRequestModal from "@/components/receiver/food-request-modal"
import { receiverAPI } from "@/lib/api"
import { useSocket } from "@/hooks/useSocket"

export default function ReceiverMapView() {
  const [foodItems, setFoodItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedFoodId, setSelectedFoodId] = useState<string | null>(null)
  const [selectedFood, setSelectedFood] = useState<any | null>(null)
  const [showRequestModal, setShowRequestModal] = useState(false)
  const [filterCategory, setFilterCategory] = useState("all")

  const user = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("user") || "{}") : {}
  const { notifications } = useSocket(user?.id)

  const fetchNearbyFood = async () => {
    try {
      setLoading(true)
      const data = await receiverAPI.getNearbyFood(10) // fetch 10km radius
      setFoodItems(data)
    } catch (error) {
      console.error("Failed to fetch nearby food for map:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNearbyFood()
  }, [])

  // Refresh if a notification comes in
  useEffect(() => {
    if (notifications.length > 0) {
      fetchNearbyFood()
    }
  }, [notifications])

  // Current receiver user coordinate fallback center (Delhi center)
  const receiverLat = 28.6139
  const receiverLng = 77.2090

  // Filter category options
  const filteredFoods = foodItems.filter((f) => {
    if (filterCategory === "all") return true
    return f.category?.toLowerCase() === filterCategory.toLowerCase()
  })

  // Format valid coordinate details
  const validFoods = filteredFoods.map((f) => {
    const lng = f.pickupLocation?.coordinates?.[0] ?? receiverLng
    const lat = f.pickupLocation?.coordinates?.[1] ?? receiverLat
    return {
      ...f,
      lat,
      lng,
    }
  })

  // Calculate coordinates bounds for plotting
  const foodLats = validFoods.map((f) => f.lat).concat(receiverLat)
  const foodLngs = validFoods.map((f) => f.lng).concat(receiverLng)

  const minLat = Math.min(...foodLats)
  const maxLat = Math.max(...foodLats)
  const minLng = Math.min(...foodLngs)
  const maxLng = Math.max(...foodLngs)

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

  const userX = getMapX(receiverLng)
  const userY = getMapY(receiverLat)

  const activeFood = validFoods.find((f) => f._id === selectedFoodId)

  const handleRequest = (food: any) => {
    setSelectedFood(food)
    setShowRequestModal(true)
  }

  const handleRequestSuccess = () => {
    alert("Food request sent successfully!")
    setShowRequestModal(false)
    fetchNearbyFood() // Refresh list
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ReceiverHeader notificationCount={notifications.length} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Location-Based Food Matcher</h1>
        <p className="text-gray-600 mb-6">See real-time available food items near you using 2dsphere proximity querying</p>

        {/* Categories Bar */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2.5">Filter Nearby Food by Category</label>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {["all", "cooked", "raw", "packaged", "bakery", "dairy", "fruits", "vegetables"].map((cat) => (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-all shadow-sm border ${
                  filterCategory === cat
                    ? "bg-blue-600 text-white border-blue-600 scale-105"
                    : "bg-white border-gray-200 text-gray-750 hover:border-blue-500 hover:text-blue-600"
                }`}
              >
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20 bg-white border border-gray-200 rounded-xl">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-500">Searching coordinates index...</p>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Map Plot */}
            <div className="lg:col-span-2">
              <Card className="p-6 border-blue-100 bg-white">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Nearby Food Listings Map</h2>
                <div className="bg-gray-50 rounded-lg overflow-hidden border-2 border-gray-100 shadow-inner relative">
                  <svg width="100%" height={mapHeight} viewBox={`0 0 ${mapWidth} ${mapHeight}`} className="bg-white">
                    {/* SVG grid lines */}
                    {[0, 1, 2, 3, 4].map((i) => (
                      <line
                        key={`h-${i}`}
                        x1="0"
                        y1={(mapHeight / 4) * i}
                        x2={mapWidth}
                        y2={(mapHeight / 4) * i}
                        stroke="#f8fafc"
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
                        stroke="#f8fafc"
                        strokeWidth="1.5"
                      />
                    ))}

                    {/* Connection lines from receiver center to donor locations */}
                    {validFoods.map((food) => (
                      <line
                        key={`line-${food._id}`}
                        x1={userX}
                        y1={userY}
                        x2={getMapX(food.lng)}
                        y2={getMapY(food.lat)}
                        stroke={selectedFoodId === food._id ? "#3b82f6" : "#cbd5e1"}
                        strokeWidth={selectedFoodId === food._id ? "2.5" : "1"}
                        strokeDasharray={selectedFoodId === food._id ? "0" : "4,4"}
                        className="transition-all"
                      />
                    ))}

                    {/* User location (Blue) */}
                    <circle cx={userX} cy={userY} r="8" fill="#3b82f6" stroke="white" strokeWidth="2.5" />
                    <circle cx={userX} cy={userY} r="16" fill="none" stroke="#3b82f6" strokeWidth="1.5" className="animate-ping" style={{ transformOrigin: `${userX}px ${userY}px` }} opacity="0.4" />

                    {/* Food listings pins (Orange) */}
                    {validFoods.map((food) => {
                      const fx = getMapX(food.lng)
                      const fy = getMapY(food.lat)
                      const isSelected = selectedFoodId === food._id
                      return (
                        <g key={food._id} className="cursor-pointer" onClick={() => setSelectedFoodId(isSelected ? null : food._id)}>
                          <circle
                            cx={fx}
                            cy={fy}
                            r={isSelected ? "9" : "6.5"}
                            fill={isSelected ? "#10b981" : "#f59e0b"}
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
                    <div className="w-3.5 h-3.5 rounded-full bg-blue-500 border-2 border-white shadow-sm animate-pulse"></div>
                    <span>My Position</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3.5 h-3.5 rounded-full bg-amber-500 border-2 border-white shadow-sm"></div>
                    <span>Surplus Food Source</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white shadow-sm"></div>
                    <span>Selected Item</span>
                  </div>
                </div>
              </Card>
            </div>

            {/* Nearby Donors and Food Items list */}
            <div>
              <Card className="p-6 border-blue-100 bg-white max-h-[480px] overflow-y-auto shadow-sm">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Nearby Food Listings</h2>
                <div className="space-y-3">
                  {validFoods.length === 0 ? (
                    <p className="text-gray-500 text-sm italic">No food items found matching filters.</p>
                  ) : (
                    validFoods.map((food) => (
                      <button
                        key={food._id}
                        onClick={() => setSelectedFoodId(selectedFoodId === food._id ? null : food._id)}
                        className={`w-full text-left p-4 rounded-xl border-2 transition-all shadow-sm ${
                          selectedFoodId === food._id
                            ? "border-blue-600 bg-blue-50/50 scale-102"
                            : "border-gray-100 bg-white hover:border-blue-200"
                        }`}
                      >
                        <div className="flex items-start justify-between mb-1">
                          <h3 className="font-bold text-gray-900 line-clamp-1">
                            {food.title}
                          </h3>
                          <span className="text-xs font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full whitespace-nowrap">
                            {food.distance.toFixed(1)} km
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 font-medium mb-2 uppercase">
                          {food.category}
                        </p>
                        <p className="text-xs text-gray-600 flex items-center gap-1 mb-1">
                          <MapPin className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                          <span className="line-clamp-1">{food.pickupLocation?.address || "Address not provided"}</span>
                        </p>
                        <p className="text-xs text-gray-700 font-semibold">
                          Qty: {food.quantity} {food.unit}
                        </p>
                      </button>
                    ))
                  )}
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* Selected Food Item Details */}
        {activeFood && (
          <Card className="mt-6 p-6 border-blue-250 bg-blue-50/40 backdrop-blur-sm shadow-md rounded-2xl animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div>
                <span className="text-xs font-bold text-blue-700 bg-blue-100 px-2.5 py-1 rounded-full uppercase tracking-wider">
                  Available Donation Details
                </span>
                <h3 className="text-2xl font-black text-gray-900 mt-2">
                  {activeFood.title}
                </h3>
                <p className="text-gray-600 mt-1 flex items-center gap-1.5 text-sm">
                  <MapPin className="w-4 h-4 text-blue-600" />
                  {activeFood.pickupLocation?.address} ({activeFood.distance.toFixed(2)} km away)
                </p>
              </div>
              <div className="flex gap-2">
                <Button onClick={() => handleRequest(activeFood)} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold">
                  <Navigation className="w-4 h-4 mr-2" />
                  Request Surplus Food
                </Button>
              </div>
            </div>

            <div className="grid md:grid-cols-4 gap-6 mt-6 border-t border-blue-100 pt-6">
              <div>
                <p className="text-sm text-gray-500 font-semibold">Donor Organization</p>
                <p className="text-lg font-bold text-gray-900 mt-0.5">
                  {activeFood.donorId?.organizationName || activeFood.donorId?.name || "Anonymous Donor"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 font-semibold">Donor Phone</p>
                <p className="text-lg font-bold text-gray-900 mt-0.5">
                  {activeFood.donorId?.phone || "No phone listed"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 font-semibold">Quantity Available</p>
                <p className="text-lg font-bold text-gray-900 mt-0.5">
                  {activeFood.quantity} {activeFood.unit}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 font-semibold">Food Expiry Time</p>
                <p className="text-lg font-bold text-rose-600 mt-0.5">
                  {new Date(activeFood.expiryTime).toLocaleString()}
                </p>
              </div>
            </div>

            {activeFood.description && (
              <div className="mt-4 p-3 bg-white/70 border border-blue-100 rounded-lg text-sm text-gray-600">
                <span className="font-bold text-gray-900 block mb-1">Donor Description:</span>
                {activeFood.description}
              </div>
            )}
          </Card>
        )}
      </main>

      {selectedFood && (
        <FoodRequestModal
          isOpen={showRequestModal}
          onClose={() => setShowRequestModal(false)}
          foodItem={selectedFood}
          onSuccess={handleRequestSuccess}
        />
      )}
    </div>
  )
}
