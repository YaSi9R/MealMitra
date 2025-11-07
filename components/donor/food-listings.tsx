"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MapPin, Clock, Users, Eye, Edit2, Trash2 } from "lucide-react"
import { donorAPI } from "@/lib/api"

interface FoodItem {
  _id?: string
  id?: number
  title?: string
  name?: string
  quantity: string | number
  category: string
  expiresIn?: string
  location?: string
  distance?: string | number
  requests?: number
  image?: string
  status?: string
  pickupLocation?: {
    address: string
  }
  notificationsSent?: any[]
}

interface FoodListingsProps {
  foodItems: FoodItem[]
}

export default function FoodListings({ foodItems }: FoodListingsProps) {
  const [items, setItems] = useState(foodItems)
  const [loading, setLoading] = useState(false)

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this item?")) return

    try {
      setLoading(true)
      // Delete would be implemented in backend
      setItems((prev) => prev.filter((item) => item._id !== id && item.id !== id))
    } catch (error) {
      console.error("Failed to delete item:", error)
      alert("Failed to delete item")
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await donorAPI.updateItemStatus(id, newStatus)
      setItems((prev) =>
        prev.map((item) => (item._id === id || item.id === id ? { ...item, status: newStatus } : item)),
      )
    } catch (error) {
      console.error("Failed to update status:", error)
    }
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Food Listings</h2>

      {items.length === 0 ? (
        <Card className="p-12 text-center border-dashed">
          <p className="text-gray-600 mb-4">No food items posted yet</p>
          <p className="text-sm text-gray-500">Start by posting your first food item to help communities in need</p>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => {
            const itemId = item._id || item.id?.toString() || ""
            const itemTitle = item.title || item.name || "Food Item"
            const itemLocation = item.pickupLocation?.address || item.location || "Location not specified"
            const notificationWaves = item.notificationsSent?.length || 0

            return (
              <Card key={itemId} className="overflow-hidden hover:shadow-lg transition-shadow border-emerald-100">
                <div className="relative h-48 bg-gray-200">
                  <img
                    src={item.image || "/placeholder.svg?height=200&width=300&query=food"}
                    alt={itemTitle}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 right-3 bg-emerald-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                    {item.category}
                  </div>
                  <div className="absolute bottom-3 left-3 bg-gray-900 text-white px-3 py-1 rounded-full text-xs font-medium">
                    {item.status || "available"}
                  </div>
                </div>

                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{itemTitle}</h3>

                  <div className="space-y-2 mb-4 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-emerald-600" />
                      {itemLocation}
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-emerald-600" />
                      {item.expiresIn || "Fresh"}
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-emerald-600" />
                      {notificationWaves} notification waves sent
                    </div>
                  </div>

                  <div className="bg-gray-50 p-3 rounded-lg mb-4">
                    <p className="text-sm text-gray-600">
                      Quantity: <span className="font-semibold text-gray-900">{item.quantity}</span>
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1 gap-2 bg-transparent">
                      <Eye className="w-4 h-4" />
                      View
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1 gap-2 bg-transparent">
                      <Edit2 className="w-4 h-4" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(itemId)}
                      disabled={loading}
                      className="text-red-600 hover:text-red-700 bg-transparent"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
