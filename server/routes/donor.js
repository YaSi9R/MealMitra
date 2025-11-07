import express from "express"
import FoodItem from "../models/FoodItem.js"
import User from "../models/User.js"
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

    // ✅ Notify nearby receivers
    expandingRadiusNotificationAlgorithm(foodItem)

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

export default router
