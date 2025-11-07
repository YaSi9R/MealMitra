"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MapPin, Clock, Heart, MessageSquare } from "lucide-react"
import FoodRequestModal from "./food-request-modal"

interface FoodItem {
  _id?: string
  id?: number
  title?: string
  name?: string
  quantity: string | number
  category: string
  expiresIn?: string
  location?: string
  distance: string | number
  donor: string
  image?: string
  unit?: string
}

interface FoodBrowserProps {
  foods: FoodItem[]
}

export default function FoodBrowser({ foods }: FoodBrowserProps) {
  const [favorites, setFavorites] = useState<string[]>([])
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null)
  const [showRequestModal, setShowRequestModal] = useState(false)

  const toggleFavorite = (id: string) => {
    setFavorites((prev) => (prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]))
  }

  const handleRequest = (food: FoodItem) => {
    setSelectedFood(food)
    setShowRequestModal(true)
  }

  const handleRequestSuccess = () => {
    alert("Food request sent successfully!")
    setShowRequestModal(false)
  }

  return (
    <>
      {foods.length === 0 ? (
        <Card className="p-12 text-center border-dashed">
          <p className="text-gray-600 mb-4">No food items found</p>
          <p className="text-sm text-gray-500">Try adjusting your search or filters</p>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {foods.map((food) => {
            const foodId = food._id || food.id?.toString() || ""
            const foodTitle = food.title || food.name || "Food Item"

            return (
              <Card key={foodId} className="overflow-hidden hover:shadow-lg transition-shadow border-blue-100">
                <div className="relative h-48 bg-gray-200">
                  <img
                    src={food.image || "/placeholder.svg?height=200&width=300&query=food"}
                    alt={foodTitle}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 right-3 flex gap-2">
                    <button
                      onClick={() => toggleFavorite(foodId)}
                      className={`p-2 rounded-full transition-all ${
                        favorites.includes(foodId)
                          ? "bg-red-500 text-white"
                          : "bg-white text-gray-600 hover:text-red-500"
                      }`}
                    >
                      <Heart className="w-5 h-5" fill={favorites.includes(foodId) ? "currentColor" : "none"} />
                    </button>
                  </div>
                  <div className="absolute top-3 left-3 bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                    {food.category}
                  </div>
                </div>

                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">{foodTitle}</h3>
                  <p className="text-sm text-gray-600 mb-3">{food.donor}</p>

                  <div className="space-y-2 mb-4 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-blue-600" />
                      <span>{food.location || "Location not specified"}</span>
                      <span className="ml-auto font-semibold text-blue-600">{food.distance} km</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-blue-600" />
                      {food.expiresIn || "Fresh"}
                    </div>
                  </div>

                  <div className="bg-blue-50 p-3 rounded-lg mb-4">
                    <p className="text-sm text-gray-600">
                      Quantity:{" "}
                      <span className="font-semibold text-gray-900">
                        {food.quantity} {food.unit || ""}
                      </span>
                    </p>
                  </div>

                  <Button onClick={() => handleRequest(food)} className="w-full bg-blue-600 hover:bg-blue-700 gap-2">
                    <MessageSquare className="w-4 h-4" />
                    Request Food
                  </Button>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {selectedFood && (
        <FoodRequestModal
          isOpen={showRequestModal}
          onClose={() => setShowRequestModal(false)}
          foodItem={selectedFood}
          onSuccess={handleRequestSuccess}
        />
      )}
    </>
  )
}
