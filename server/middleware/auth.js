import jwt from "jsonwebtoken"

export const verifyToken = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1]
    if (!token) return res.status(401).json({ message: "No token provided" })

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret_key")
    req.userId = decoded.userId
    req.userRole = decoded.role  // ✅ this is crucial
    next()
  } catch (error) {
    res.status(401).json({ message: "Invalid token", error: error.message })
  }
}
