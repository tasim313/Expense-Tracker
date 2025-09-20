"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"
import { expenseCategories } from "@/lib/firestore"

interface CategoryBreakdownProps {
  expenseData: { category: string; amount: number; count: number }[]
  incomeData: { category: string; amount: number; count: number }[]
  type: "expense" | "income"
}

const COLORS = ["#ef4444", "#3b82f6", "#f59e0b", "#8b5cf6", "#ec4899", "#10b981", "#06b6d4", "#6b7280"]

export function CategoryBreakdown({ expenseData, incomeData, type }: CategoryBreakdownProps) {
  const data = type === "expense" ? expenseData : incomeData

  const chartData = data.map((item, index) => ({
    ...item,
    color: COLORS[index % COLORS.length],
  }))

  const getCategoryName = (categoryId: string) => {
    const category = expenseCategories.find((cat) => cat.id === categoryId)
    return category ? category.name : categoryId
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{type === "expense" ? "Expense" : "Income"} Breakdown</CardTitle>
        <CardDescription>Distribution by category</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ category, percent }) => `${getCategoryName(category)} ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="amount"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number) => [`$${value.toFixed(2)}`, "Amount"]}
              labelFormatter={(label) => getCategoryName(label)}
            />
          </PieChart>
        </ResponsiveContainer>

        <div className="mt-4 space-y-2">
          {chartData.map((item, index) => (
            <div key={item.category} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                <span>{getCategoryName(item.category)}</span>
              </div>
              <div className="text-right">
                <div className="font-medium">${item.amount.toFixed(2)}</div>
                <div className="text-muted-foreground">{item.count} transactions</div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
