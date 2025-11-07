"use client"

import { useState, useEffect } from "react"
import { X, Bell, MapPin, Clock } from "lucide-react"
import { notificationAPI } from "@/lib/api"

interface NotificationPanelProps {
  isOpen: boolean
  onClose: () => void
  notifications: any[]
}

export default function NotificationPanel({ isOpen, onClose, notifications }: NotificationPanelProps) {
  const [localNotifications, setLocalNotifications] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isOpen) {
      fetchNotifications()
    }
  }, [isOpen])

  const fetchNotifications = async () => {
    try {
      setLoading(true)
      const data = await notificationAPI.getMyNotifications()
      setLocalNotifications(data)
    } catch (error) {
      console.error("Failed to fetch notifications:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleMarkAsRead = async (id: string) => {
    try {
      await notificationAPI.markAsRead(id)
      setLocalNotifications((prev) => prev.map((n) => (n._id === id ? { ...n, isRead: true } : n)))
    } catch (error) {
      console.error("Failed to mark notification as read:", error)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="absolute right-0 top-0 h-full w-96 bg-white shadow-lg overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-emerald-600" />
            <h2 className="text-lg font-bold">Notifications</h2>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-3">
          {loading ? (
            <div className="text-center py-8 text-gray-600">Loading notifications...</div>
          ) : localNotifications.length === 0 ? (
            <div className="text-center py-8 text-gray-600">No notifications yet</div>
          ) : (
            localNotifications.map((notification) => (
              <div
                key={notification._id}
                onClick={() => handleMarkAsRead(notification._id)}
                className={`p-4 rounded-lg border cursor-pointer transition-all ${
                  notification.isRead
                    ? "bg-gray-50 border-gray-200"
                    : "bg-emerald-50 border-emerald-200 hover:border-emerald-300"
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-gray-900">{notification.title}</h3>
                  {!notification.isRead && <div className="w-2 h-2 bg-emerald-600 rounded-full mt-1" />}
                </div>
                <p className="text-sm text-gray-600 mb-3">{notification.message}</p>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {notification.distance} km away
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Wave {notification.radiusWave}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
