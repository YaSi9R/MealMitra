"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { X } from "lucide-react"
import { receiverAPI } from "@/lib/api"

interface FoodRequestModalProps {
  isOpen: boolean
  onClose: () => void
  foodItem: any
  onSuccess: () => void
}

export default function FoodRequestModal({ isOpen, onClose, foodItem, onSuccess }: FoodRequestModalProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    requestedQuantity: "",
    requestedUnit: foodItem?.unit || "kg",
    pickupTime: "",
    notes: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await receiverAPI.requestFood({
        foodItemId: foodItem._id,
        requestedQuantity: Number.parseInt(formData.requestedQuantity),
        requestedUnit: formData.requestedUnit,
        pickupTime: new Date(formData.pickupTime).toISOString(),
        notes: formData.notes,
      })
      onSuccess()
      onClose()
    } catch (error) {
      console.error("Failed to request food:", error)
      alert("Failed to request food. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full">
        <div className="border-b border-gray-200 p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Request Food</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Food Item</label>
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="font-semibold text-gray-900">{foodItem?.title}</p>
              <p className="text-sm text-gray-600">
                Available: {foodItem?.quantity} {foodItem?.unit}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Quantity Needed</label>
              <Input
                type="number"
                name="requestedQuantity"
                placeholder="10"
                value={formData.requestedQuantity}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Unit</label>
              <select
                name="requestedUnit"
                value={formData.requestedUnit}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500"
              >
                <option value="kg">kg</option>
                <option value="liters">liters</option>
                <option value="pieces">pieces</option>
                <option value="boxes">boxes</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Pickup Time</label>
            <Input
              type="datetime-local"
              name="pickupTime"
              value={formData.pickupTime}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Additional Notes</label>
            <textarea
              name="notes"
              placeholder="Any special requirements or notes..."
              value={formData.notes}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" onClick={onClose} variant="outline" className="flex-1 bg-transparent">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="flex-1 bg-emerald-600 hover:bg-emerald-700">
              {loading ? "Requesting..." : "Request Food"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
