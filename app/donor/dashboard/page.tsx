"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import DonorHeader from "@/components/donor/donor-header"
import PostFoodModal from "@/components/donor/post-food-modal"
import FoodListings from "@/components/donor/food-listings"
import DonorStats from "@/components/donor/donor-stats"
import { donorAPI } from "@/lib/api"
import { useSocket } from "@/hooks/useSocket"

export default function DonorDashboard() {
  const [showPostModal, setShowPostModal] = useState(false)
  const [foodItems, setFoodItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const user = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("user") || "{}") : {}
  const { socket, notifications } = useSocket(user?.id)

  useEffect(() => {
    const fetchFoodItems = async () => {
      try {
        const items = await donorAPI.getMyItems()
        setFoodItems(items)
      } catch (error) {
        console.error("Failed to fetch food items:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchFoodItems()
  }, [])

  const handlePostFood = async (newFood: any) => {
    try {
      const response = await donorAPI.postFood(newFood)
      setFoodItems([response.foodItem, ...foodItems])
      setShowPostModal(false)
    } catch (error) {
      console.error("Failed to post food:", error)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DonorHeader notificationCount={notifications.length} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back, {user?.name}!</h1>
          <p className="text-gray-600">Manage your food donations and help communities in need</p>
        </div>

        <DonorStats />

        <div className="mb-8">
          <Button
            onClick={() => setShowPostModal(true)}
            className="bg-emerald-600 hover:bg-emerald-700 gap-2"
            size="lg"
          >
            <Plus className="w-5 h-5" />
            Post New Food Item
          </Button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Loading food items...</p>
          </div>
        ) : (
          <FoodListings foodItems={foodItems} />
        )}
      </main>

      {showPostModal && <PostFoodModal onClose={() => setShowPostModal(false)} onSubmit={handlePostFood} />}
    </div>
  )
}
