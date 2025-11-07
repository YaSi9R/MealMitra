"use client"

import { Card } from "@/components/ui/card"
import { TrendingUp, Users, Package, Award } from "lucide-react"

export default function DonorStats() {
  const stats = [
    {
      icon: Package,
      label: "Items Posted",
      value: "24",
      change: "+3 this week",
    },
    {
      icon: Users,
      label: "Requests Received",
      value: "18",
      change: "+5 pending",
    },
    {
      icon: TrendingUp,
      label: "Total Distributed",
      value: "450 kg",
      change: "+120 kg this month",
    },
    {
      icon: Award,
      label: "Impact Score",
      value: "850",
      change: "Excellent",
    },
  ]

  return (
    <div className="grid md:grid-cols-4 gap-4 mb-8">
      {stats.map((stat, idx) => (
        <Card key={idx} className="p-6 border-emerald-100">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">{stat.label}</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
              <p className="text-emerald-600 text-xs mt-2">{stat.change}</p>
            </div>
            <stat.icon className="w-8 h-8 text-emerald-600" />
          </div>
        </Card>
      ))}
    </div>
  )
}
