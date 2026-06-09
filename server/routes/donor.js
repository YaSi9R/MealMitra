import express from "express"
import FoodItem from "../models/FoodItem.js"
import User from "../models/User.js"
import FoodRequest from "../models/FoodRequest.js"
import Notification from "../models/Notification.js"
import { expandingRadiusNotificationAlgorithm } from "../utils/geospatialAlgorithm.js"
import { verifyToken } from "../middleware/auth.js"

const router = express.Router()

// Post food item
router.post("/post-food", verifyToken, async (req, res) => {
  try {
    const { title, description, category, quantity, unit, expiryTime, latitude, longitude, address, images } = req.body

    // ✅ Role check using token (no DB lookup needed)
    if (req.userRole !== "donor") {
      return res.status(403).json({ message: "Only donors can post food" })
    }

    const foodItem = new FoodItem({
      donorId: req.userId,
      title,
      description,
      category,
      quantity,
      unit,
      expiryTime: new Date(expiryTime),
      pickupLocation: {
        type: "Point",
        coordinates: [longitude, latitude],
        address,
      },
      images: images || [],
    })

    await foodItem.save()
    const donor = await User.findById(req.userId)

    // ✅ Notify nearby receivers
    const io = req.app.get("io")
    expandingRadiusNotificationAlgorithm(foodItem, donor, io)

    res.status(201).json({ message: "Food item posted successfully", foodItem })
  } catch (error) {
    console.error("Error in posting food:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// Get donor's food items
router.get("/my-items", verifyToken, async (req, res) => {
  try {
    const donorId = req.userId
    const foodItems = await FoodItem.find({ donorId }).sort({ createdAt: -1 })

    res.json(foodItems)
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch items", error: error.message })
  }
})

// Update food item status
router.put("/item/:id/status", verifyToken, async (req, res) => {
  try {
    const { status } = req.body
    const foodItem = await FoodItem.findByIdAndUpdate(req.params.id, { status, updatedAt: new Date() }, { new: true })

    res.json(foodItem)
  } catch (error) {
    res.status(500).json({ message: "Failed to update status", error: error.message })
  }
})

// Get requests received by donor
router.get("/requests", verifyToken, async (req, res) => {
  try {
    if (req.userRole !== "donor") {
      return res.status(403).json({ message: "Only donors can view requests" })
    }

    const requests = await FoodRequest.find({ donorId: req.userId })
      .populate("foodItemId")
      .populate("receiverId", "name organizationName phone location organizationType")
      .sort({ createdAt: -1 })

    res.json(requests)
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch requests", error: error.message })
  }
})

// Update request status (accept/reject/complete)
router.put("/request/:requestId/status", verifyToken, async (req, res) => {
  try {
    const { status } = req.body
    if (req.userRole !== "donor") {
      return res.status(403).json({ message: "Only donors can update requests" })
    }

    const request = await FoodRequest.findById(req.params.requestId)
    if (!request) {
      return res.status(404).json({ message: "Request not found" })
    }

    request.status = status
    request.updatedAt = new Date()
    await request.save()

    const foodItem = await FoodItem.findById(request.foodItemId)
    if (foodItem) {
      if (status === "accepted") {
        foodItem.status = "claimed"
      } else if (status === "rejected") {
        foodItem.status = "available"
      }
      await foodItem.save()
    }

    // Save notification
    let notificationType = "request-accepted"
    let title = "Request Accepted"
    let message = `Your request for ${foodItem?.title || "food"} was accepted.`
    if (status === "rejected") {
      notificationType = "request-rejected"
      title = "Request Rejected"
      message = `Your request for ${foodItem?.title || "food"} was rejected.`
    } else if (status === "completed") {
      notificationType = "food-claimed" // completed claims
      title = "Donation Completed"
      message = `Thank you! The donation of ${foodItem?.title || "food"} has been marked as completed.`
    }

    const notification = new Notification({
      recipientId: request.receiverId,
      foodItemId: request.foodItemId,
      donorId: req.userId,
      type: notificationType,
      title,
      message,
      distance: 0,
      radiusWave: 0
    })
    await notification.save()

    // Send real-time notification via Socket.io
    const io = req.app.get("io")
    if (io) {
      io.to(`user-${request.receiverId}`).emit("new-notification", {
        id: notification._id,
        title: notification.title,
        message: notification.message,
        distance: 0,
        foodItem: {
          id: foodItem?._id,
          title: foodItem?.title,
          category: foodItem?.category,
          quantity: foodItem?.quantity,
          unit: foodItem?.unit,
        },
        donor: {
          id: req.userId,
          name: "Donor",
        }
      })
    }

    res.json({ message: `Request status updated to ${status}`, request })
  } catch (error) {
    console.error("Error updating request status:", error)
    res.status(500).json({ message: "Failed to update request", error: error.message })
  }
})

// Get all receivers (for mapping)
router.get("/receivers", verifyToken, async (req, res) => {
  try {
    if (req.userRole !== "donor") {
      return res.status(403).json({ message: "Only donors can fetch receivers list" })
    }

    const receivers = await User.find({ role: "receiver" }).select(
      "name organizationName phone location organizationType description"
    )

    res.json(receivers)
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch receivers", error: error.message })
  }
})

export default router

