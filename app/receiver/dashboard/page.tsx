"use client"

import { useState, useEffect } from "react"
import { Search } from "lucide-react"
import ReceiverHeader from "@/components/receiver/receiver-header"
import FoodBrowser from "@/components/receiver/food-browser"
import ReceiverStats from "@/components/receiver/receiver-stats"
import { receiverAPI } from "@/lib/api"
import { useSocket } from "@/hooks/useSocket"

export default function ReceiverDashboard() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [availableFoods, setAvailableFoods] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const user = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("user") || "{}") : {}
  const { socket, notifications } = useSocket(user?.id)

  const categories = ["all", "Cooked", "Raw", "Packaged", "Bakery", "Dairy", "Fruits", "Vegetables"]

  useEffect(() => {
    const fetchNearbyFood = async () => {
      try {
        const foods = await receiverAPI.getNearbyFood(10)
        setAvailableFoods(foods)
      } catch (error) {
        console.error("Failed to fetch food items:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchNearbyFood()
  }, [])

  useEffect(() => {
    if (notifications.length > 0) {
      const newFood = notifications[0]
      setAvailableFoods((prev) => [
        {
          id: newFood.foodItem.id,
          title: newFood.foodItem.title,
          category: newFood.foodItem.category,
          quantity: newFood.foodItem.quantity,
          unit: newFood.foodItem.unit,
          distance: newFood.distance,
          donor: newFood.donor.name,
          location: newFood.donor.address,
          expiresIn: "Fresh",
        },
        ...prev,
      ])
    }
  }, [notifications])

  const filteredFoods = availableFoods.filter((food) => {
    const matchesSearch = food.title?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === "all" || food.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <ReceiverHeader notificationCount={notifications.length} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Find Available Food</h1>
          <p className="text-gray-600">Browse nearby food donations and make requests</p>
        </div>

        <ReceiverStats />

        <div className="mb-8 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search food items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? "bg-emerald-600 text-white"
                    : "bg-white border border-gray-300 text-gray-700 hover:border-emerald-500"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Loading available food items...</p>
          </div>
        ) : (
          <FoodBrowser foods={filteredFoods} />
        )}
      </main>
    </div>
  )
}
