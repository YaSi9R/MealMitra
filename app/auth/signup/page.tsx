"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Leaf, Mail, Lock, User, MapPin, ArrowLeft } from "lucide-react"
import { useAuth } from "@/hooks/useAuth"

export default function SignupPage() {
  const searchParams = useSearchParams()
  const { register, loading, error } = useAuth()

  // ✅ Start with a default, then update once mounted
  const [role, setRole] = useState<"donor" | "receiver">("donor")
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    const queryRole = searchParams.get("role")
    if (queryRole === "receiver" || queryRole === "donor") {
      setRole(queryRole)
    }
    setHydrated(true)
  }, [searchParams])

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    latitude: "28.6139",
    longitude: "77.2090",
    address: "",
    organizationName: "",
    organizationType: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()

    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match")
      return
    }

    await register({
      name: formData.name,
      email: formData.email,
      password: formData.password,
      role,
      phone: formData.phone,
      latitude: Number.parseFloat(formData.latitude),
      longitude: Number.parseFloat(formData.longitude),
      address: formData.address,
      organizationName: role === "donor" ? formData.organizationName : undefined,
      organizationType: role === "receiver" ? formData.organizationType : undefined,
    })
  }

  // ✅ Avoid rendering until after hydration
  if (!hydrated) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Link href="/" className="flex items-center gap-2 mb-8 text-emerald-600 hover:text-emerald-700">
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        <Card className="border-emerald-100 shadow-lg">
          <div className="p-8">
            <div className="flex items-center justify-center gap-2 mb-8">
              <Leaf className="w-8 h-8 text-emerald-600" />
              <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
                MealMitra
              </h1>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">Create Account</h2>
            <p className="text-gray-600 text-center mb-6">Join our community today</p>

            {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">{error}</div>}

            {/* Role Selection */}
            <div className="flex gap-3 mb-6">
              {[
                { value: "donor", label: "I'm a Donor" },
                { value: "receiver", label: "I'm a Receiver" },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => setRole(option.value as "donor" | "receiver")}
                  className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
                    role === option.value ? "bg-emerald-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>

            <form onSubmit={handleSignup} className="space-y-3 max-h-96 overflow-y-auto">
              {/* Full Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <Input
                    type="text"
                    name="name"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={handleChange}
                    className="pl-10 border-emerald-200 focus:border-emerald-500"
                    required
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <Input
                    type="email"
                    name="email"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    className="pl-10 border-emerald-200 focus:border-emerald-500"
                    required
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                <Input
                  type="tel"
                  name="phone"
                  placeholder="+91 9876543210"
                  value={formData.phone}
                  onChange={handleChange}
                  className="border-emerald-200 focus:border-emerald-500"
                  required
                />
              </div>

              {/* Address */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <Input
                    type="text"
                    name="address"
                    placeholder="City, Country"
                    value={formData.address}
                    onChange={handleChange}
                    className="pl-10 border-emerald-200 focus:border-emerald-500"
                    required
                  />
                </div>
              </div>

              {/* Conditional Fields */}
              {role === "donor" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Organization Name</label>
                  <Input
                    type="text"
                    name="organizationName"
                    placeholder="Restaurant / NGO / Store"
                    value={formData.organizationName}
                    onChange={handleChange}
                    className="border-emerald-200 focus:border-emerald-500"
                    required
                  />
                </div>
              )}

              {role === "receiver" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Organization Type</label>
                  <select
                    name="organizationType"
                    value={formData.organizationType}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-emerald-200 rounded-lg focus:border-emerald-500"
                    required
                  >
                    <option value="">Select type</option>
                    <option value="NGO">NGO</option>
                    <option value="Shelter">Shelter</option>
                    <option value="Food Bank">Food Bank</option>
                    <option value="Community Kitchen">Community Kitchen</option>
                  </select>
                </div>
              )}

              {/* Password Fields */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <Input
                    type="password"
                    name="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    className="pl-10 border-emerald-200 focus:border-emerald-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <Input
                    type="password"
                    name="confirmPassword"
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="pl-10 border-emerald-200 focus:border-emerald-500"
                    required
                  />
                </div>
              </div>

              {/* Checkbox */}
              <label className="flex items-start gap-2 text-sm">
                <input type="checkbox" className="mt-1 rounded border-gray-300" required />
                <span className="text-gray-600">I agree to the Terms of Service and Privacy Policy</span>
              </label>

              {/* Submit Button */}
              <Button type="submit" disabled={loading} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white">
                {loading ? "Creating Account..." : "Create Account"}
              </Button>
            </form>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-center text-gray-600">
                Already have an account?{" "}
                <Link href="/auth/login" className="text-emerald-600 hover:text-emerald-700 font-semibold">
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
