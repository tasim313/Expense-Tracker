"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Bar, BarChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

interface ExpenseChartProps {
  data: { category: string; amount: number; count: number }[]
  title?: string
  description?: string
}

export function ExpenseChart({
  data,
  title = "Expense Analysis",
  description = "Breakdown of expenses by category",
}: ExpenseChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="category" tick={{ fontSize: 12 }} angle={-45} textAnchor="end" height={80} />
            <YAxis />
            <Tooltip
              formatter={(value: number) => [`$${value.toFixed(2)}`, "Amount"]}
              labelFormatter={(label) => `Category: ${label}`}
            />
            <Bar dataKey="amount" fill="#ef4444" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>

        <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
          {data.map((item) => (
            <div key={item.category} className="flex justify-between">
              <span className="text-muted-foreground">{item.category}</span>
              <span className="font-medium">${item.amount.toFixed(2)}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
