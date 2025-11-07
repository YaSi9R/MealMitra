"use client"

import Link from "next/link"
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Leaf, Bell, LogOut, Heart } from 'lucide-react'

interface ReceiverHeaderProps {
  notificationCount?: number
}

export default function ReceiverHeader({ notificationCount = 0 }: ReceiverHeaderProps) {
  const router = useRouter()

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    router.push("/")
  }

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        <Link href="/receiver/dashboard" className="flex items-center gap-2">
          <Leaf className="w-8 h-8 text-emerald-600" />
          <span className="text-xl font-bold text-gray-900">MealMitra</span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          <Link href="/receiver/dashboard" className="text-gray-700 hover:text-emerald-600 font-medium">
            Browse Food
          </Link>
          <Link href="/receiver/map" className="text-gray-700 hover:text-emerald-600 font-medium">
            Map View
          </Link>
          <Link href="/receiver/requests" className="text-gray-700 hover:text-emerald-600 font-medium">
            My Requests
          </Link>
          <Link href="/receiver/history" className="text-gray-700 hover:text-emerald-600 font-medium">
            History
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          {/* <CHANGE> Added notification count badge */}
          <button className="relative p-2 text-gray-600 hover:text-emerald-600">
            <Bell className="w-6 h-6" />
            {notificationCount > 0 && (
              <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 rounded-full text-white text-xs flex items-center justify-center">
                {notificationCount > 9 ? "9+" : notificationCount}
              </span>
            )}
          </button>
          <button className="p-2 text-gray-600 hover:text-emerald-600">
            <Heart className="w-6 h-6" />
          </button>
          <Button onClick={handleLogout} variant="ghost" className="gap-2">
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>
      </div>
    </header>
  )
}
