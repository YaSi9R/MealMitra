import mongoose from "mongoose"

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["donor", "receiver"], required: true },
  phone: String,
  location: {
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
  organizationName: String,
  organizationType: String, // For receivers: NGO, Shelter, Food Bank, etc.
  description: String,
  profileImage: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
})

// Create geospatial index for location-based queries
userSchema.index({ location: "2dsphere" })

export default mongoose.model("User", userSchema)
