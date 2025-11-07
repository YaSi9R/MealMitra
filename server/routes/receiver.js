import express from "express"
import FoodItem from "../models/FoodItem.js"
import FoodRequest from "../models/FoodRequest.js"
import User from "../models/User.js"
import { calculateDistance } from "../utils/geospatialAlgorithm.js"
import { verifyToken } from "../middleware/auth.js"

const router = express.Router()

// Get available food items near receiver
router.get("/nearby-food", verifyToken, async (req, res) => {
  try {
    const receiverId = req.userId
    const { radiusKm = 10 } = req.query

    const receiver = await User.findById(receiverId)
    if (!receiver || receiver.role !== "receiver") {
      return res.status(403).json({ message: "Only receivers can view food" })
    }

    const foodItems = await FoodItem.find({
      status: "available",
      pickupLocation: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: receiver.location.coordinates,
          },
          $maxDistance: radiusKm * 1000,
        },
      },
    })
      .populate("donorId", "name organizationName phone location")
      .sort({ createdAt: -1 })

    // Calculate distance for each item
    const itemsWithDistance = foodItems.map((item) => ({
      ...item.toObject(),
      distance: calculateDistance(receiver.location.coordinates, item.pickupLocation.coordinates),
    }))

    res.json(itemsWithDistance)
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch food items", error: error.message })
  }
})

// Request food item
router.post("/request-food", verifyToken, async (req, res) => {
  try {
    const { foodItemId, requestedQuantity, requestedUnit, pickupTime, notes } = req.body
    const receiverId = req.userId

    const foodItem = await FoodItem.findById(foodItemId)
    if (!foodItem) {
      return res.status(404).json({ message: "Food item not found" })
    }

    const foodRequest = new FoodRequest({
      foodItemId,
      receiverId,
      donorId: foodItem.donorId,
      requestedQuantity,
      requestedUnit,
      pickupTime: new Date(pickupTime),
      notes,
    })

    await foodRequest.save()

    // Update food item status
    foodItem.status = "requested"
    await foodItem.save()

    res.status(201).json({
      message: "Food request created successfully",
      foodRequest,
    })
  } catch (error) {
    res.status(500).json({ message: "Failed to request food", error: error.message })
  }
})

// Get receiver's requests
router.get("/my-requests", verifyToken, async (req, res) => {
  try {
    const receiverId = req.userId
    const requests = await FoodRequest.find({ receiverId })
      .populate("foodItemId")
      .populate("donorId", "name organizationName phone")
      .sort({ createdAt: -1 })

    res.json(requests)
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch requests", error: error.message })
  }
})

export default router
