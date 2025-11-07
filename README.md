# MealMitra - Food Donation & Distribution Platform

A full-stack MERN application that connects food donors with receivers using an intelligent location-based notification algorithm inspired by Uber/Ola driver finding mechanisms.

## Project Highlights

### Core Innovation: Expanding Radius Notification Algorithm
When a donor posts food, the system intelligently sends notifications in expanding waves:
- **Wave 1 (2km)**: Notifies receivers within 2km radius
- **Wave 2 (3km)**: Expands to 3km (excluding already notified)
- **Wave 3 (4km)**: Continues expanding to 4km
- **Wave 4 (5km)**: Further expansion to 5km
- **Wave 5 (6km)**: Final wave at 6km radius

This approach prioritizes nearest receivers, ensuring fresher food and faster pickup while reducing notification spam.

## Features

### For Donors
- Post food items with details (quantity, category, expiry time)
- Track posted items and their status
- View notification waves sent to receivers
- Manage food requests from receivers
- Analytics dashboard showing impact

### For Receivers
- Browse nearby available food items
- Real-time notifications when food is posted nearby
- Request food with specific quantities and pickup times
- Track request status
- View food history and impact

### Technical Features
- **Geospatial Queries**: MongoDB 2dsphere indexing for efficient location-based searches
- **Real-Time Updates**: Socket.io for instant notifications
- **JWT Authentication**: Secure user authentication
- **Responsive Design**: Mobile-first UI with Tailwind CSS
- **Research-Ready**: Comprehensive logging for algorithm analysis

## Tech Stack

### Frontend
- **Framework**: Next.js 15 with App Router
- **UI Library**: React 19 with Shadcn/ui
- **Styling**: Tailwind CSS v4
- **Real-Time**: Socket.io Client
- **State Management**: React Hooks + SWR

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Geospatial Indexing
- **Authentication**: JWT + bcryptjs
- **Real-Time**: Socket.io Server
- **API**: RESTful with async/await

## Project Structure

\`\`\`
mealmitra/
├── app/                              # Next.js App Router
│   ├── auth/                         # Authentication pages
│   │   ├── login/page.tsx
│   │   └── signup/page.tsx
│   ├── donor/                        # Donor pages
│   │   ├── dashboard/page.tsx
│   │   ├── map/page.tsx
│   │   ├── analytics/page.tsx
│   │   └── requests/page.tsx
│   ├── receiver/                     # Receiver pages
│   │   ├── dashboard/page.tsx
│   │   ├── map/page.tsx
│   │   ├── requests/page.tsx
│   │   └── history/page.tsx
│   ├── layout.tsx
│   └── page.tsx                      # Landing page
├── components/                       # React components
│   ├── donor/
│   │   ├── donor-header.tsx
│   │   ├── post-food-modal.tsx
│   │   ├── food-listings.tsx
│   │   └── donor-stats.tsx
│   ├── receiver/
│   │   ├── receiver-header.tsx
│   │   ├── food-browser.tsx
│   │   ├── food-request-modal.tsx
│   │   └── receiver-stats.tsx
│   ├── notifications/
│   │   └── notification-panel.tsx
│   └── ui/                           # Shadcn UI components
├── hooks/                            # Custom React hooks
│   ├── useAuth.ts                   # Authentication hook
│   └── useSocket.ts                 # Socket.io hook
├── lib/                              # Utilities
│   └── api.ts                       # API service layer
├── server/                           # Backend
│   ├── models/                      # MongoDB schemas
│   │   ├── User.js
│   │   ├── FoodItem.js
│   │   ├── Notification.js
│   │   └── FoodRequest.js
│   ├── routes/                      # API routes
│   │   ├── auth.js
│   │   ├── donor.js
│   │   ├── receiver.js
│   │   └── notification.js
│   ├── middleware/
│   │   └── auth.js                  # JWT verification
│   ├── utils/
│   │   └── geospatialAlgorithm.js   # Core algorithm
│   ├── server.js                    # Express server
│   └── package.json
├── public/                           # Static assets
├── .env.local                        # Frontend env vars
├── package.json
└── SETUP_INSTRUCTIONS.md
\`\`\`

## Quick Start

### Prerequisites
- Node.js v18+
- MongoDB (local or Atlas)
- npm or yarn

### Installation

1. **Clone and Install Frontend**
\`\`\`bash
npm install
\`\`\`

2. **Setup Backend**
\`\`\`bash
cd server
npm install
\`\`\`

3. **Configure Environment**
\`\`\`bash
# Create .env.local in root
NEXT_PUBLIC_API_URL=http://localhost:5000/api

# Create .env in server/
MONGODB_URI=mongodb://localhost:27017/mealmitra
JWT_SECRET=your_secret_key
PORT=5000
FRONTEND_URL=http://localhost:3000
\`\`\`

4. **Start MongoDB**
\`\`\`bash
mongod
\`\`\`

5. **Run Backend**
\`\`\`bash
cd server
npm run dev
\`\`\`

6. **Run Frontend** (in new terminal)
\`\`\`bash
npm run dev
\`\`\`

Access the app at `http://localhost:3000`

## API Documentation

### Authentication Endpoints
\`\`\`
POST /api/auth/register
POST /api/auth/login
\`\`\`

### Donor Endpoints
\`\`\`
POST /api/donor/post-food              # Triggers expanding radius algorithm
GET /api/donor/my-items
PUT /api/donor/item/:id/status
\`\`\`

### Receiver Endpoints
\`\`\`
GET /api/receiver/nearby-food?radiusKm=10
POST /api/receiver/request-food
GET /api/receiver/my-requests
\`\`\`

### Notification Endpoints
\`\`\`
GET /api/notifications/my-notifications
PUT /api/notifications/mark-read/:id
GET /api/notifications/unread-count
\`\`\`

## Algorithm Deep Dive

### Geospatial Algorithm Implementation

The expanding radius algorithm uses MongoDB's 2dsphere geospatial queries:

\`\`\`javascript
// Find receivers within radius
const receivers = await User.find({
  role: "receiver",
  location: {
    $near: {
      $geometry: { type: "Point", coordinates: [lon, lat] },
      $maxDistance: radiusKm * 1000  // Convert to meters
    }
  }
})
\`\`\`

### Distance Calculation
Uses Haversine formula for accurate distance between coordinates:
\`\`\`javascript
const distance = 2 * R * asin(sqrt(sin²(Δlat/2) + cos(lat1) * cos(lat2) * sin²(Δlon/2)))
\`\`\`

### Wave Expansion Logic
- Each wave waits 5 seconds before expanding
- Tracks already-notified receivers to avoid duplicates
- Stops expanding if sufficient receivers found (≥5)
- Logs all waves for research analysis

## Research Paper Metrics

Track these metrics for your research paper:

1. **Notification Efficiency**
   - Average notifications per wave
   - Duplicate notification rate
   - Notification delivery time

2. **Algorithm Performance**
   - Query execution time per wave
   - Database index efficiency
   - Memory usage during expansion

3. **User Engagement**
   - Response rate by distance
   - Food claim rate by wave
   - Average pickup time

4. **System Scalability**
   - Concurrent users supported
   - Notifications per second
   - Database query optimization

## Testing

### Test Donor Flow
1. Sign up as Donor
2. Post food item with location
3. Check backend logs for notification waves
4. Verify receivers get notifications

### Test Receiver Flow
1. Sign up as Receiver
2. Wait for food notifications
3. Request food item
4. Track request status

### Test Algorithm
1. Create multiple receivers at different distances
2. Post food from donor
3. Monitor notification waves in logs
4. Verify distance-based prioritization

## Deployment

### Frontend (Vercel)
\`\`\`bash
npm run build
# Push to GitHub and connect to Vercel
\`\`\`

### Backend (Heroku/Railway)
\`\`\`bash
cd server
git push heroku main
\`\`\`

## Troubleshooting

### MongoDB Connection Error
\`\`\`
Error: connect ECONNREFUSED
\`\`\`
**Solution**: Ensure MongoDB is running (`mongod`)

### Socket.io Connection Failed
\`\`\`
Error: WebSocket connection failed
\`\`\`
**Solution**: Check backend URL in `.env.local`

### Geospatial Query Error
\`\`\`
Error: 2dsphere index not found
\`\`\`
**Solution**: Indexes auto-create on first insert

## Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT License - See LICENSE file for details

## Support

For issues or questions:
1. Check SETUP_INSTRUCTIONS.md
2. Review backend logs
3. Check browser console
4. Verify environment variables

## Future Enhancements

- [ ] Real-time map visualization
- [ ] Advanced filtering and search
- [ ] User ratings and reviews
- [ ] Payment integration
- [ ] Mobile app (React Native)
- [ ] AI-powered recommendations
- [ ] Multi-language support
- [ ] Accessibility improvements

---

**Built with ❤️ for food security and community impact**
