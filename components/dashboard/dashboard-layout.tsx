"use client"

import { StatsCards } from "./stats-cards"
import { ExpenseChart } from "./expense-chart"
import { ThreeVisualization } from "./three-visualization"

export function DashboardLayout() {
  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <StatsCards />

      {/* Charts Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        <ExpenseChart type="line" title="Expense Trends" description="Monthly income vs expenses over time" />
        <ExpenseChart type="doughnut" title="Spending Categories" description="Breakdown of expenses by category" />
      </div>

      {/* 3D Visualization and Bar Chart */}
      <div className="grid gap-6 lg:grid-cols-2">
        <ThreeVisualization />
        <ExpenseChart type="bar" title="Weekly Overview" description="Weekly expense comparison" />
      </div>
    </div>
  )
}
