"use client"

import type React from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, TrendingDown, DollarSign, Target, CreditCard, PiggyBank } from "lucide-react"

interface StatCardProps {
  title: string
  value: string
  description: string
  icon: React.ReactNode
  trend?: "up" | "down"
  trendValue?: string
}

function StatCard({ title, value, description, icon, trend, trendValue }: StatCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <div className="flex items-center space-x-2 text-xs text-muted-foreground">
          <span>{description}</span>
          {trend && trendValue && (
            <div className={`flex items-center ${trend === "up" ? "text-green-600" : "text-red-600"}`}>
              {trend === "up" ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              <span className="ml-1">{trendValue}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export function StatsCards() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Total Balance"
        value="$12,450"
        description="Current account balance"
        icon={<DollarSign className="h-4 w-4 text-muted-foreground" />}
        trend="up"
        trendValue="12%"
      />
      <StatCard
        title="Monthly Expenses"
        value="$3,240"
        description="This month's spending"
        icon={<CreditCard className="h-4 w-4 text-muted-foreground" />}
        trend="down"
        trendValue="8%"
      />
      <StatCard
        title="Savings Goal"
        value="$8,500"
        description="Progress: 68% complete"
        icon={<Target className="h-4 w-4 text-muted-foreground" />}
        trend="up"
        trendValue="15%"
      />
      <StatCard
        title="Total Saved"
        value="$5,780"
        description="Accumulated savings"
        icon={<PiggyBank className="h-4 w-4 text-muted-foreground" />}
        trend="up"
        trendValue="22%"
      />
    </div>
  )
}
