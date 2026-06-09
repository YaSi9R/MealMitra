"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, Phone, Calendar, User, Package, MessageSquare, ExternalLink, Navigation } from "lucide-react"
import ReceiverHeader from "@/components/receiver/receiver-header"
import { receiverAPI } from "@/lib/api"
import { useSocket } from "@/hooks/useSocket"

export default function ReceiverRequestsPage() {
  const [requests, setRequests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<"all" | "pending" | "accepted" | "rejected" | "completed">("all")

  const user = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("user") || "{}") : {}
  const { notifications } = useSocket(user?.id)

  const fetchRequests = async () => {
    try {
      setLoading(true)
      const data = await receiverAPI.getMyRequests()
      setRequests(data)
    } catch (error) {
      console.error("Failed to fetch requests:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRequests()
  }, [])

  // Auto-refresh when notifications arrive
  useEffect(() => {
    if (notifications.length > 0) {
      fetchRequests()
    }
  }, [notifications])

  const filteredRequests = requests.filter(
    (req) => filter === "all" || req.status === filter
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-amber-100 text-amber-800 border-amber-200"
      case "accepted":
        return "bg-emerald-100 text-emerald-800 border-emerald-200"
      case "rejected":
        return "bg-rose-100 text-rose-800 border-rose-200"
      case "completed":
        return "bg-blue-100 text-blue-800 border-blue-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <ReceiverHeader notificationCount={notifications.length} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent">
              My Food Requests
            </h1>
            <p className="text-gray-600 mt-1">
              Track requests submitted for nearby surplus food items
            </p>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
            {(["all", "pending", "accepted", "rejected", "completed"] as const).map((opt) => (
              <button
                key={opt}
                onClick={() => setFilter(opt)}
                className={`px-4 py-2 rounded-full font-medium text-sm transition-all shadow-sm border ${
                  filter === opt
                    ? "bg-blue-600 text-white border-blue-600 scale-105"
                    : "bg-white text-gray-700 border-gray-200 hover:border-blue-500 hover:text-blue-600"
                }`}
              >
                {opt.charAt(0).toUpperCase() + opt.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-600 font-medium">Fetching your requests...</p>
          </div>
        ) : filteredRequests.length === 0 ? (
          <Card className="p-16 text-center border-dashed border-2 border-blue-200 bg-white/50 backdrop-blur-sm shadow-inner rounded-2xl max-w-2xl mx-auto">
            <MessageSquare className="w-16 h-16 text-blue-600/30 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">No Requests Found</h3>
            <p className="text-gray-500">
              You haven't submitted any {filter !== "all" ? `${filter} ` : ""}requests matching this filter.
            </p>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {filteredRequests.map((req) => (
              <Card
                key={req._id}
                className="overflow-hidden hover:shadow-xl transition-all duration-300 border-blue-100 bg-white flex flex-col justify-between"
              >
                {/* Header */}
                <div className="p-6 border-b border-gray-100">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <span className="text-xs text-gray-500 font-semibold uppercase tracking-wider">
                        Requested Donation
                      </span>
                      <h2 className="text-xl font-bold text-gray-900 mt-1">
                        {req.foodItemId?.title || "Deleted Food Item"}
                      </h2>
                    </div>
                    <Badge variant="outline" className={`font-semibold capitalize px-3 py-1 ${getStatusColor(req.status)}`}>
                      {req.status}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-100">
                    <div>
                      <span className="text-xs text-gray-400 block">Requested Amount</span>
                      <span className="font-semibold text-gray-900 flex items-center gap-1.5 mt-0.5">
                        <Package className="w-4 h-4 text-blue-600" />
                        {req.requestedQuantity} {req.requestedUnit}
                      </span>
                    </div>
                    <div>
                      <span className="text-xs text-gray-400 block">Preferred Pickup</span>
                      <span className="font-semibold text-gray-900 flex items-center gap-1.5 mt-0.5">
                        <Calendar className="w-4 h-4 text-blue-600" />
                        {new Date(req.pickupTime).toLocaleDateString()} at {new Date(req.pickupTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Donor Details */}
                <div className="p-6 space-y-3 flex-1 bg-gradient-to-b from-white to-gray-50/50">
                  <span className="text-xs text-gray-500 font-semibold uppercase tracking-wider block">
                    Donor Information
                  </span>

                  <div className="space-y-2 text-sm text-gray-700">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-blue-600 flex-shrink-0" />
                      <span className="font-semibold text-gray-900">
                        {req.donorId?.organizationName || req.donorId?.name || "Anonymous Donor"}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-blue-600 flex-shrink-0" />
                      <a href={`tel:${req.donorId?.phone}`} className="hover:underline text-blue-700 font-medium">
                        {req.donorId?.phone || "No phone listed"}
                      </a>
                    </div>

                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <span>{req.foodItemId?.pickupLocation?.address || "Location not listed"}</span>
                    </div>
                  </div>

                  {req.notes && (
                    <div className="mt-4 p-3 bg-gray-50 border border-gray-100 rounded-lg text-sm text-gray-600 italic">
                      <span className="font-semibold text-xs uppercase tracking-wider block text-gray-500 not-italic mb-1">
                        My Notes:
                      </span>
                      "{req.notes}"
                    </div>
                  )}
                </div>

                {/* Footer Message depending on status */}
                <div className="p-4 bg-gray-50 border-t border-gray-100 text-center text-sm font-medium">
                  {req.status === "pending" && (
                    <span className="text-amber-800 flex items-center justify-center gap-1.5">
                      Waiting for Donor Confirmation
                    </span>
                  )}
                  {req.status === "accepted" && (
                    <div className="text-emerald-800 flex flex-col items-center justify-center gap-2">
                      <span className="font-bold flex items-center gap-1.5">
                        Approved! Please Pick Up Food
                      </span>
                      <p className="text-xs text-gray-500">
                        Coordinates: {req.foodItemId?.pickupLocation?.coordinates?.reverse().join(", ") || "N/A"}
                      </p>
                    </div>
                  )}
                  {req.status === "rejected" && (
                    <span className="text-rose-800">
                      Donor Declined this request. Please search other available items.
                    </span>
                  )}
                  {req.status === "completed" && (
                    <span className="text-blue-800 flex items-center justify-center gap-1.5">
                      ✓ Donation Received & Picked Up
                    </span>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
