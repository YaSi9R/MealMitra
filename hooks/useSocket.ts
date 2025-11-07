"use client"

import { useEffect, useState } from "react"
import io, { type Socket } from "socket.io-client"

export const useSocket = (userId: string | null) => {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [notifications, setNotifications] = useState<any[]>([])

  useEffect(() => {
    if (!userId) return

    const socketInstance = io(process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000", {
      auth: {
        token: localStorage.getItem("token"),
      },
    })

    socketInstance.on("connect", () => {
      console.log("[Socket] Connected:", socketInstance.id)
      socketInstance.emit("join-user", userId)
    })

    socketInstance.on("new-notification", (notification) => {
      console.log("[Socket] New notification received:", notification)
      setNotifications((prev) => [notification, ...prev])
    })

    socketInstance.on("disconnect", () => {
      console.log("[Socket] Disconnected")
    })

    setSocket(socketInstance)

    return () => {
      socketInstance.disconnect()
    }
  }, [userId])

  return { socket, notifications }
}
