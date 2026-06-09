"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Award, Package, Clock, ShieldCheck, Heart, Trash2 } from "lucide-react"
import ReceiverHeader from "@/components/receiver/receiver-header"
import { receiverAPI } from "@/lib/api"

export default function ReceiverHistoryPage() {
  const [requests, setRequests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true)
        const data = await receiverAPI.getMyRequests()
        // Filter for completed or accepted requests that represent history
        const completedOnly = data.filter((req: any) => req.status === "completed")
        setRequests(completedOnly)
      } catch (error) {
        console.error("Failed to fetch history:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchHistory()
  }, [])

  // Calculate Impact Metrics
  const totalWeight = requests.reduce((sum, req) => {
    if (req.requestedUnit === "kg") {
      return sum + (req.requestedQuantity || 0)
    }
    // Simple mock conversions for non-kg units to keep weight consistent
    if (req.requestedUnit === "pieces") return sum + (req.requestedQuantity || 0) * 0.2
    if (req.requestedUnit === "boxes") return sum + (req.requestedQuantity || 0) * 5
    if (req.requestedUnit === "liters") return sum + (req.requestedQuantity || 0)
    return sum
  }, 0)

  // 1kg of food saved prevents roughly 2.5kg of CO2 emissions (source: FAO/EPA research benchmarks)
  const co2Saved = totalWeight * 2.5
  const mealsDistributed = totalWeight / 0.4 // 0.4kg is standard meal size

  const stats = [
    {
      icon: Package,
      label: "Total Food Saved",
      value: `${totalWeight.toFixed(1)} kg`,
      change: "Direct physical impact",
      color: "text-blue-600",
    },
    {
      icon: Heart,
      label: "Estimated Meals Served",
      value: Math.round(mealsDistributed).toLocaleString(),
      change: "Assumes 400g per meal",
      color: "text-rose-600",
    },
    {
      icon: Award,
      label: "CO2 Emissions Saved",
      value: `${co2Saved.toFixed(1)} kg`,
      change: "Greenhouse gases prevented",
      color: "text-emerald-600",
    },
    {
      icon: ShieldCheck,
      label: "Completed Deliveries",
      value: requests.length.toString(),
      change: "100% verified pickup",
      color: "text-purple-600",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <ReceiverHeader />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900 bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent">
            Claim History & Impact
          </h1>
          <p className="text-gray-600 mt-1">
            See your total contributions to food waste reduction and local community support
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-4 gap-6 mb-10">
          {stats.map((stat, idx) => (
            <Card key={idx} className="p-6 border-blue-100 shadow-sm bg-white hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">{stat.label}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                  <p className="text-gray-500 text-xs mt-2">{stat.change}</p>
                </div>
                <stat.icon className={`w-8 h-8 ${stat.color}`} />
              </div>
            </Card>
          ))}
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mb-6">Completed Claims</h2>

        {loading ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-600 font-medium">Fetching history...</p>
          </div>
        ) : requests.length === 0 ? (
          <Card className="p-16 text-center border-dashed border-2 border-blue-200 bg-white/50 backdrop-blur-sm max-w-2xl mx-auto shadow-inner rounded-2xl">
            <Award className="w-16 h-16 text-blue-600/30 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">No History Recorded</h3>
            <p className="text-gray-500 mb-4">
              Your claim requests will appear here once they are confirmed as picked up by the donor.
            </p>
          </Card>
        ) : (
          <div className="bg-white border border-blue-100 rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-blue-50 border-b border-blue-100 text-blue-900 text-sm font-semibold">
                    <th className="p-4">Food Item</th>
                    <th className="p-4">Donor Name</th>
                    <th className="p-4">Quantity Claimed</th>
                    <th className="p-4">Pickup Date</th>
                    <th className="p-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
                  {requests.map((req) => (
                    <tr key={req._id} className="hover:bg-blue-50/20 transition-colors">
                      <td className="p-4 font-semibold text-gray-900">
                        {req.foodItemId?.title || "Deleted Food Item"}
                      </td>
                      <td className="p-4">
                        {req.donorId?.organizationName || req.donorId?.name || "Anonymous Donor"}
                      </td>
                      <td className="p-4 font-medium">
                        {req.requestedQuantity} {req.requestedUnit}
                      </td>
                      <td className="p-4">
                        {new Date(req.updatedAt).toLocaleDateString()} at {new Date(req.updatedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </td>
                      <td className="p-4 text-center">
                        <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 border border-emerald-200 px-3 py-1 rounded-full text-xs font-semibold">
                          Fulfilled
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
