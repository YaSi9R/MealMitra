/**
 * Geospatial Location-Based Notification Algorithm
 * Similar to Uber/Ola driver finding algorithm
 * Expands search radius in waves: 2km → 3km → 4km → 5km, etc.
 */

import User from "../models/User.js"
import Notification from "../models/Notification.js"

const EARTH_RADIUS_KM = 6371

/**
 * Calculate distance between two coordinates using Haversine formula
 * @param {Array} coord1 - [longitude, latitude]
 * @param {Array} coord2 - [longitude, latitude]
 * @returns {Number} Distance in kilometers
 */
export const calculateDistance = (coord1, coord2) => {
  const [lon1, lat1] = coord1
  const [lon2, lat2] = coord2

  const dLat = (lat2 - lat1) * (Math.PI / 180)
  const dLon = (lon2 - lon1) * (Math.PI / 180)

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2)

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return EARTH_RADIUS_KM * c
}

/**
 * Find receivers within a specific radius
 * @param {Array} foodLocation - [longitude, latitude]
 * @param {Number} radiusKm - Search radius in kilometers
 * @returns {Promise<Array>} Array of receivers within radius
 */
export const findReceiversInRadius = async (foodLocation, radiusKm) => {
  try {
    const receivers = await User.find({
      role: "receiver",
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: foodLocation,
          },
          $maxDistance: radiusKm * 1000, // Convert km to meters
        },
      },
    })

    return receivers
  } catch (error) {
    console.error("Error finding receivers in radius:", error)
    return []
  }
}

/**
 * Expanding Radius Algorithm - Main function
 * Sends notifications in waves with increasing radius
 * @param {Object} foodItem - Food item document
 * @param {Object} donor - Donor user document
 * @param {Object} io - Socket.io instance
 * @returns {Promise<Object>} Notification statistics
 */
export const expandingRadiusNotificationAlgorithm = async (foodItem, donor, io) => {
  const radiusWaves = [2, 3, 4, 5, 6] // Radius in km for each wave
  const delayBetweenWaves = 5000 // 5 seconds between waves (can be adjusted)
  const notificationStats = {
    totalNotificationsSent: 0,
    waveDetails: [],
  }

  console.log(`[ALGORITHM] Starting expanding radius algorithm for food item: ${foodItem._id}`)
  console.log(`[ALGORITHM] Food location: ${foodItem.pickupLocation.coordinates}`)

  for (let waveIndex = 0; waveIndex < radiusWaves.length; waveIndex++) {
    const radiusKm = radiusWaves[waveIndex]

    // Wait before sending next wave (except for first wave)
    if (waveIndex > 0) {
      await new Promise((resolve) => setTimeout(resolve, delayBetweenWaves))
    }

    console.log(`[ALGORITHM] Wave ${waveIndex + 1}: Searching within ${radiusKm}km radius`)

    try {
      // Find all receivers within this radius
      const receiversInRadius = await findReceiversInRadius(foodItem.pickupLocation.coordinates, radiusKm)

      // Filter out receivers who already received notification in previous waves
      const alreadyNotified = foodItem.notificationsSent
        .flatMap((wave) => wave.recipientIds || [])
        .map((id) => id.toString())

      const newReceivers = receiversInRadius.filter((receiver) => !alreadyNotified.includes(receiver._id.toString()))

      console.log(`[ALGORITHM] Found ${newReceivers.length} new receivers in ${radiusKm}km radius`)

      // Send notifications to new receivers
      const notificationPromises = newReceivers.map(async (receiver) => {
        const distance = calculateDistance(foodItem.pickupLocation.coordinates, receiver.location.coordinates)

        const notification = new Notification({
          recipientId: receiver._id,
          foodItemId: foodItem._id,
          donorId: donor._id,
          type: "food-available",
          title: `New Food Available: ${foodItem.title}`,
          message: `${donor.organizationName || donor.name} has posted ${foodItem.quantity}${foodItem.unit} of ${foodItem.title}. It's ${distance.toFixed(2)}km away from you.`,
          distance: Number.parseFloat(distance.toFixed(2)),
          radiusWave: waveIndex + 1,
        })

        await notification.save()

        // Send real-time notification via Socket.io
        io.to(`user-${receiver._id}`).emit("new-notification", {
          id: notification._id,
          title: notification.title,
          message: notification.message,
          distance: notification.distance,
          foodItem: {
            id: foodItem._id,
            title: foodItem.title,
            category: foodItem.category,
            quantity: foodItem.quantity,
            unit: foodItem.unit,
          },
          donor: {
            id: donor._id,
            name: donor.organizationName || donor.name,
            address: foodItem.pickupLocation.address,
          },
        })

        return notification
      })

      const sentNotifications = await Promise.all(notificationPromises)

      notificationStats.totalNotificationsSent += sentNotifications.length
      notificationStats.waveDetails.push({
        wave: waveIndex + 1,
        radiusKm,
        recipientCount: sentNotifications.length,
        sentAt: new Date(),
      })

      console.log(`[ALGORITHM] Wave ${waveIndex + 1} complete: ${sentNotifications.length} notifications sent`)

      // Update food item with notification tracking
      foodItem.notificationsSent.push({
        radiusKm,
        sentAt: new Date(),
        recipientsCount: sentNotifications.length,
      })
      await foodItem.save()

      // If we found enough receivers, we can stop expanding
      if (sentNotifications.length >= 5) {
        console.log(`[ALGORITHM] Found sufficient receivers, stopping expansion`)
        break
      }
    } catch (error) {
      console.error(`[ALGORITHM] Error in wave ${waveIndex + 1}:`, error)
    }
  }

  console.log(`[ALGORITHM] Algorithm complete. Total notifications sent: ${notificationStats.totalNotificationsSent}`)
  return notificationStats
}

export default {
  calculateDistance,
  findReceiversInRadius,
  expandingRadiusNotificationAlgorithm,
}
