"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Heart, MapPin, Users, TrendingUp, ArrowRight, Leaf } from "lucide-react"

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false)

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-emerald-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Leaf className="w-8 h-8 text-emerald-600" />
            <span className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
              MealMitra
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/auth/login">
              <Button variant="ghost">Login</Button>
            </Link>
            <Link href="/auth/signup">
              <Button className="bg-emerald-600 hover:bg-emerald-700">Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <div className="space-y-6">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight">
            Connect Food Donors with{" "}
            <span className="bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
              Those in Need
            </span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            MealMitra bridges the gap between surplus food and hungry communities. Real-time, location-based food
            distribution for a zero-waste future.
          </p>
          <div className="flex gap-4 justify-center pt-4">
            <Link href="/auth/signup?role=donor">
              <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 gap-2">
                I'm a Donor <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="/auth/signup?role=receiver">
              <Button size="lg" variant="outline" className="gap-2 bg-transparent">
                I'm a Receiver <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h2 className="text-4xl font-bold text-center mb-16 text-gray-900">Why Choose MealMitra?</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              icon: MapPin,
              title: "Smart Location Matching",
              description: "AI-powered proximity matching connects nearest donors with receivers for faster delivery.",
            },
            {
              icon: Heart,
              title: "Real-Time Coordination",
              description: "Instant notifications keep everyone updated on food availability and requests.",
            },
            {
              icon: Users,
              title: "Community Impact",
              description: "Track your contribution to reducing food waste and feeding communities.",
            },
            {
              icon: TrendingUp,
              title: "Analytics Dashboard",
              description: "Monitor impact metrics and see the difference you're making.",
            },
            {
              icon: Leaf,
              title: "Sustainability Focus",
              description: "Reduce food waste and environmental impact through smart distribution.",
            },
            {
              icon: Heart,
              title: "Verified Network",
              description: "Trusted donors and receivers verified for safe food distribution.",
            },
          ].map((feature, idx) => (
            <div
              key={idx}
              className="bg-white rounded-xl p-8 border border-emerald-100 hover:border-emerald-300 transition-colors"
            >
              <feature.icon className="w-12 h-12 text-emerald-600 mb-4" />
              <h3 className="text-xl font-semibold mb-2 text-gray-900">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-gradient-to-r from-emerald-600 to-blue-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            {[
              { number: "50K+", label: "Meals Distributed" },
              { number: "5K+", label: "Active Donors" },
              { number: "2K+", label: "Communities Served" },
              { number: "100T", label: "Waste Prevented" },
            ].map((stat, idx) => (
              <div key={idx}>
                <div className="text-4xl font-bold mb-2">{stat.number}</div>
                <div className="text-emerald-100">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <div className="bg-white rounded-2xl p-12 border border-emerald-100">
          <h2 className="text-3xl font-bold mb-4 text-gray-900">Ready to Make a Difference?</h2>
          <p className="text-gray-600 mb-8 max-w-xl mx-auto">
            Join thousands of donors and receivers working together to eliminate food waste and feed communities.
          </p>
          <Link href="/auth/signup">
            <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700">
              Start Your Journey Today
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Leaf className="w-6 h-6 text-emerald-500" />
                <span className="font-bold text-white">MealMitra</span>
              </div>
              <p className="text-sm">Connecting food donors with communities in need.</p>
            </div>
            {[
              { title: "Product", links: ["Features", "Pricing", "Security"] },
              { title: "Company", links: ["About", "Blog", "Careers"] },
              { title: "Legal", links: ["Privacy", "Terms", "Contact"] },
            ].map((col, idx) => (
              <div key={idx}>
                <h4 className="font-semibold text-white mb-4">{col.title}</h4>
                <ul className="space-y-2 text-sm">
                  {col.links.map((link, i) => (
                    <li key={i}>
                      <a href="#" className="hover:text-white transition">
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm">
            <p>&copy; 2025 MealMitra. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
