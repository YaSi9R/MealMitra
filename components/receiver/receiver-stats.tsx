"use client"

import { Card } from "@/components/ui/card"
import { Heart, Package, MapPin, Award } from "lucide-react"

export default function ReceiverStats() {
  const stats = [
    {
      icon: Package,
      label: "Available Items",
      value: "42",
      change: "Near you",
    },
    {
      icon: Heart,
      label: "Requests Made",
      value: "12",
      change: "3 fulfilled",
    },
    {
      icon: MapPin,
      label: "Nearest Donor",
      value: "1.2 km",
      change: "Downtown Market",
    },
    {
      icon: Award,
      label: "Community Score",
      value: "720",
      change: "Active member",
    },
  ]

  return (
    <div className="grid md:grid-cols-4 gap-4 mb-8">
      {stats.map((stat, idx) => (
        <Card key={idx} className="p-6 border-blue-100">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">{stat.label}</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
              <p className="text-blue-600 text-xs mt-2">{stat.change}</p>
            </div>
            <stat.icon className="w-8 h-8 text-blue-600" />
          </div>
        </Card>
      ))}
    </div>
  )
}
