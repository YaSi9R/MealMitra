// mealmitra/lib/api.ts

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

/**
 * Generic API call helper
 */
export const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  // Fetch JWT token from localStorage
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  }

  // Attach token if exists
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  })

  if (!response.ok) {
    let errorMessage = "API request failed"
    try {
      const errorData = await response.json()
      errorMessage = errorData.message || errorMessage
    } catch (_) {}
    throw new Error(errorMessage)
  }

  return response.json()
}

// ===================== AUTH =====================
export const authAPI = {
  register: (data: any) => apiCall("/auth/register", { method: "POST", body: JSON.stringify(data) }),
  login: (data: any) => apiCall("/auth/login", { method: "POST", body: JSON.stringify(data) }),
}

// ===================== DONOR =====================
export const donorAPI = {
  postFood: (data: any) => apiCall("/donor/post-food", { method: "POST", body: JSON.stringify(data) }),
  getMyItems: () => apiCall("/donor/my-items"),
  updateItemStatus: (id: string, status: string) =>
    apiCall(`/donor/item/${id}/status`, { method: "PUT", body: JSON.stringify({ status }) }),
}

// ===================== RECEIVER =====================
export const receiverAPI = {
  getNearbyFood: (radiusKm = 10) => apiCall(`/receiver/nearby-food?radiusKm=${radiusKm}`),
  requestFood: (data: any) => apiCall("/receiver/request-food", { method: "POST", body: JSON.stringify(data) }),
  getMyRequests: () => apiCall("/receiver/my-requests"),
}

// ===================== NOTIFICATIONS =====================
export const notificationAPI = {
  getMyNotifications: () => apiCall("/notifications/my-notifications"),
  markAsRead: (id: string) => apiCall(`/notifications/mark-read/${id}`, { method: "PUT" }),
  getUnreadCount: () => apiCall("/notifications/unread-count"),
}
