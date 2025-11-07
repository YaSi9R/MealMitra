import mongoose from "mongoose"

const foodItemSchema = new mongoose.Schema({
  donorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  title: { type: String, required: true },
  description: String,
  category: {
    type: String,
    enum: ["Cooked", "Raw", "Packaged", "Bakery", "Dairy", "Fruits", "Vegetables"],
    required: true,
  },
  quantity: { type: Number, required: true },
  unit: { type: String, enum: ["kg", "liters", "pieces", "boxes"], required: true },
  expiryTime: { type: Date, required: true },
  pickupLocation: {
    type: {
      type: String,
      enum: ["Point"],
      default: "Point",
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true,
    },
    address: String,
  },
  images: [String],
  status: { type: String, enum: ["available", "requested", "claimed", "expired"], default: "available" },
  notificationsSent: [
    {
      radiusKm: Number,
      sentAt: Date,
      recipientsCount: Number,
    },
  ],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
})

// Create geospatial index for location-based queries
foodItemSchema.index({ pickupLocation: "2dsphere" })

export default mongoose.model("FoodItem", foodItemSchema)
