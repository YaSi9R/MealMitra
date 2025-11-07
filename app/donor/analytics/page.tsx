"use client"

import { Card } from "@/components/ui/card"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import DonorHeader from "@/components/donor/donor-header"

export default function DonorAnalytics() {
  const distributionData = [
    { month: "Jan", items: 12, kg: 240 },
    { month: "Feb", items: 19, kg: 380 },
    { month: "Mar", items: 15, kg: 300 },
    { month: "Apr", items: 25, kg: 500 },
    { month: "May", items: 22, kg: 440 },
    { month: "Jun", items: 30, kg: 600 },
  ]

  const categoryData = [
    { name: "Vegetables", value: 35 },
    { name: "Cooked Food", value: 25 },
    { name: "Bakery", value: 20 },
    { name: "Dairy", value: 15 },
    { name: "Fruits", value: 5 },
  ]

  const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6"]

  return (
    <div className="min-h-screen bg-gray-50">
      <DonorHeader />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Analytics & Impact</h1>

        {/* Key Metrics */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Items", value: "156", change: "+12%" },
            { label: "Total Weight", value: "3.2T", change: "+8%" },
            { label: "Avg Rating", value: "4.8/5", change: "+0.2" },
            { label: "Communities", value: "24", change: "+3" },
          ].map((metric, idx) => (
            <Card key={idx} className="p-6 border-emerald-100">
              <p className="text-gray-600 text-sm font-medium">{metric.label}</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{metric.value}</p>
              <p className="text-emerald-600 text-xs mt-2">{metric.change}</p>
            </Card>
          ))}
        </div>

        {/* Charts */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          <Card className="p-6 border-emerald-100">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Distribution Trend</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={distributionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="items" stroke="#10b981" name="Items" />
                <Line type="monotone" dataKey="kg" stroke="#3b82f6" name="Weight (kg)" />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          <Card className="p-6 border-emerald-100">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Category Distribution</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Impact Summary */}
        <Card className="p-6 border-emerald-100">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Your Impact</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <p className="text-gray-600 text-sm mb-2">Food Waste Prevented</p>
              <p className="text-3xl font-bold text-emerald-600">3.2 Tons</p>
              <p className="text-xs text-gray-500 mt-2">Equivalent to 12,800 meals</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm mb-2">CO2 Emissions Saved</p>
              <p className="text-3xl font-bold text-emerald-600">8.5 Tons</p>
              <p className="text-xs text-gray-500 mt-2">Like planting 140 trees</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm mb-2">People Helped</p>
              <p className="text-3xl font-bold text-emerald-600">1,240</p>
              <p className="text-xs text-gray-500 mt-2">Across 24 communities</p>
            </div>
          </div>
        </Card>
      </main>
    </div>
  )
}
