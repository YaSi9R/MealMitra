import express from "express"
import jwt from "jsonwebtoken"
import User from "../models/User.js"
import OTP from "../models/OTP.js"

const router = express.Router()

// Send OTP
router.post("/send-otp", async (req, res) => {
  try {
    const { email } = req.body
    if (!email) return res.status(400).json({ message: "Email is required" })

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString()

    // Save to DB (overwrites or adds new)
    await OTP.findOneAndUpdate({ email }, { otp, createdAt: new Date() }, { upsert: true, new: true })

    // "Send" OTP (Log to console)
    console.log(`\n------------------------------`)
    console.log(`🔑 OTP for ${email}: ${otp}`)
    console.log(`------------------------------\n`)

    res.status(200).json({ message: "OTP sent successfully" })
  } catch (error) {
    res.status(500).json({ message: "Error sending OTP", error: error.message })
  }
})

// Register route
router.post("/register", async (req, res) => {
  try {
    const { 
      name, email, password, role, phone, 
      latitude, longitude, address, 
      organizationName, organizationType,
      otp
    } = req.body

    // Verify OTP
    const otpRecord = await OTP.findOne({ email, otp })
    if (!otpRecord) {
      return res.status(400).json({ message: "Invalid or expired OTP" })
    }

    const existing = await User.findOne({ email })
    if (existing) return res.status(400).json({ message: "User already exists" })

    const user = new User({
      name,
      email,
      password,
      role,
      phone,
      location: {
        type: "Point",
        coordinates: [longitude || 0, latitude || 0],
        address
      },
      organizationName,
      organizationType
    })

    await user.save()

    // Delete OTP record after successful registration
    await OTP.deleteOne({ _id: otpRecord._id })

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET || "secret_key",
      { expiresIn: "7d" }
    )

    res.status(201).json({
      message: "User registered successfully",
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    })
  } catch (error) {
    console.error("🔥 Error in /api/auth/register:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// Login route
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body
    const user = await User.findOne({ email })

    if (!user) return res.status(404).json({ message: "User not found" })

    const isMatch = await user.comparePassword(password)
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" })

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET || "secret_key",
      { expiresIn: "7d" }
    )

    res.status(200).json({
      message: "Login successful",
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    })
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

export default router
