import mongoose from "mongoose"

const notificationSchema = new mongoose.Schema({
  recipientId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  foodItemId: { type: mongoose.Schema.Types.ObjectId, ref: "FoodItem", required: true },
  donorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  type: {
    type: String,
    enum: ["food-available", "request-accepted", "request-rejected", "food-claimed"],
    required: true,
  },
  title: String,
  message: String,
  distance: Number, // Distance in km
  radiusWave: Number, // Which radius wave this notification was sent in (2, 3, 4, etc.)
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
})

export default mongoose.model("Notification", notificationSchema)
