import jwt from "jsonwebtoken"
import User from "../models/User.js"

export const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body

    const existing = await User.findOne({ email })
    if (existing) return res.status(400).json({ message: "User already exists" })

    const user = await User.create({ name, email, password, role })
    const token = jwt.sign(
      { userId: user._id, role: user.role }, // ✅ include role
      process.env.JWT_SECRET || "secret_key",
      { expiresIn: "7d" }
    )

    res.status(201).json({
      message: "User registered successfully",
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    })
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

export const login = async (req, res) => {
  try {
    const { email, password } = req.body
    const user = await User.findOne({ email })

    if (!user) return res.status(404).json({ message: "User not found" })

    const isMatch = await user.comparePassword(password)
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" })

    const token = jwt.sign(
      { userId: user._id, role: user.role }, // ✅ include role here too
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
}
