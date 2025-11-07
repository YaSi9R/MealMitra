import express from "express"
import Notification from "../models/Notification.js"
import { verifyToken } from "../middleware/auth.js"

const router = express.Router()

// Get user notifications
router.get("/my-notifications", verifyToken, async (req, res) => {
  try {
    const userId = req.userId
    const notifications = await Notification.find({ recipientId: userId })
      .populate("foodItemId")
      .populate("donorId", "name organizationName")
      .sort({ createdAt: -1 })

    res.json(notifications)
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch notifications", error: error.message })
  }
})

// Mark notification as read
router.put("/mark-read/:id", verifyToken, async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(req.params.id, { isRead: true }, { new: true })

    res.json(notification)
  } catch (error) {
    res.status(500).json({ message: "Failed to update notification", error: error.message })
  }
})

// Get unread notification count
router.get("/unread-count", verifyToken, async (req, res) => {
  try {
    const userId = req.userId
    const count = await Notification.countDocuments({ recipientId: userId, isRead: false })

    res.json({ unreadCount: count })
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch count", error: error.message })
  }
})

export default router
