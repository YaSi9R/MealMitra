"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MapPin, Phone, Calendar, User, Package, MessageSquare, Check, X, Clock } from "lucide-react"
import DonorHeader from "@/components/donor/donor-header"
import { donorAPI } from "@/lib/api"
import { useSocket } from "@/hooks/useSocket"

export default function DonorRequestsPage() {
  const [requests, setRequests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<"all" | "pending" | "accepted" | "rejected" | "completed">("all")

  const user = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("user") || "{}") : {}
  const { notifications } = useSocket(user?.id)

  const fetchRequests = async () => {
    try {
      setLoading(true)
      const data = await donorAPI.getRequests()
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

  // Refresh requests if a notification is received
  useEffect(() => {
    if (notifications.length > 0) {
      fetchRequests()
    }
  }, [notifications])

  const handleAction = async (requestId: string, status: "accepted" | "rejected" | "completed") => {
    try {
      await donorAPI.updateRequestStatus(requestId, status)
      setRequests((prev) =>
        prev.map((req) => (req._id === requestId ? { ...req, status } : req))
      )
    } catch (error) {
      console.error(`Failed to update request to ${status}:`, error)
      alert(`Failed to update request status`)
    }
  }

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
      <DonorHeader notificationCount={notifications.length} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 bg-gradient-to-r from-emerald-600 to-teal-700 bg-clip-text text-transparent">
              Received Requests
            </h1>
            <p className="text-gray-600 mt-1">
              Respond to shelters and NGOs requesting your surplus food donations
            </p>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
            {(["all", "pending", "accepted", "rejected", "completed"] as const).map((opt) => (
              <button
                key={opt}
                onClick={() => setFilter(opt)}
                className={`px-4 py-2 rounded-full font-medium text-sm transition-all shadow-sm border ${
                  filter === opt
                    ? "bg-emerald-600 text-white border-emerald-600 scale-105"
                    : "bg-white text-gray-700 border-gray-200 hover:border-emerald-500 hover:text-emerald-600"
                }`}
              >
                {opt.charAt(0).toUpperCase() + opt.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-600 font-medium">Fetching requests...</p>
          </div>
        ) : filteredRequests.length === 0 ? (
          <Card className="p-16 text-center border-dashed border-2 border-emerald-200 bg-white/50 backdrop-blur-sm shadow-inner rounded-2xl max-w-2xl mx-auto">
            <MessageSquare className="w-16 h-16 text-emerald-600/30 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">No Requests Found</h3>
            <p className="text-gray-500">
              There are no {filter !== "all" ? `${filter} ` : ""}requests matching your filter.
            </p>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {filteredRequests.map((req) => (
              <Card
                key={req._id}
                className="overflow-hidden hover:shadow-xl transition-all duration-300 border-emerald-100 bg-white flex flex-col justify-between"
              >
                {/* Card Header */}
                <div className="p-6 border-b border-gray-100">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <span className="text-xs text-gray-500 font-semibold uppercase tracking-wider">
                        Requested Food Item
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
                      <span className="text-xs text-gray-400 block">Total Quantity</span>
                      <span className="font-semibold text-gray-900 flex items-center gap-1.5 mt-0.5">
                        <Package className="w-4 h-4 text-emerald-600" />
                        {req.requestedQuantity} {req.requestedUnit}
                      </span>
                    </div>
                    <div>
                      <span className="text-xs text-gray-400 block">Preferred Pickup</span>
                      <span className="font-semibold text-gray-900 flex items-center gap-1.5 mt-0.5">
                        <Calendar className="w-4 h-4 text-emerald-600" />
                        {new Date(req.pickupTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Recipient Details */}
                <div className="p-6 space-y-3 flex-1 bg-gradient-to-b from-white to-gray-50/50">
                  <span className="text-xs text-gray-500 font-semibold uppercase tracking-wider block">
                    Recipient Information
                  </span>
                  
                  <div className="space-y-2 text-sm text-gray-700">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      <span className="font-semibold text-gray-900">
                        {req.receiverId?.organizationName || req.receiverId?.name || "Anonymous Receiver"}
                      </span>
                      {req.receiverId?.organizationType && (
                        <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-medium">
                          {req.receiverId.organizationType}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      <a href={`tel:${req.receiverId?.phone}`} className="hover:underline text-emerald-700">
                        {req.receiverId?.phone || "No phone listed"}
                      </a>
                    </div>

                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                      <span className="line-clamp-2">{req.receiverId?.location?.address || "Address not provided"}</span>
                    </div>
                  </div>

                  {req.notes && (
                    <div className="mt-4 p-3 bg-emerald-50/50 border border-emerald-100 rounded-lg text-sm text-gray-600 italic">
                      <span className="font-semibold text-xs uppercase tracking-wider block text-emerald-800 not-italic mb-1">
                        Receiver's Notes:
                      </span>
                      "{req.notes}"
                    </div>
                  )}
                </div>

                {/* Action Footer */}
                {req.status === "pending" && (
                  <div className="p-4 bg-gray-50 border-t border-gray-100 flex gap-3">
                    <Button
                      onClick={() => handleAction(req._id, "rejected")}
                      variant="outline"
                      className="flex-1 border-rose-200 text-rose-600 hover:bg-rose-50 hover:text-rose-700 bg-transparent"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Decline
                    </Button>
                    <Button
                      onClick={() => handleAction(req._id, "accepted")}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                    >
                      <Check className="w-4 h-4 mr-2" />
                      Accept Request
                    </Button>
                  </div>
                )}

                {req.status === "accepted" && (
                  <div className="p-4 bg-gray-50 border-t border-gray-100 flex gap-3">
                    <Button
                      onClick={() => handleAction(req._id, "completed")}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <Clock className="w-4 h-4 mr-2" />
                      Mark Picked Up (Complete)
                    </Button>
                  </div>
                )}

                {req.status === "completed" && (
                  <div className="p-4 bg-emerald-50/50 border-t border-emerald-100 text-center text-emerald-800 text-sm font-semibold flex items-center justify-center gap-1.5">
                    <Check className="w-5 h-5" /> Donation Delivered & Completed
                  </div>
                )}

                {req.status === "rejected" && (
                  <div className="p-4 bg-gray-100 border-t border-gray-200 text-center text-gray-500 text-sm font-semibold">
                    Request Declined
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
