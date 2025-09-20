"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DatePickerWithRange } from "@/components/ui/date-range-picker"
import { CategoryBreakdown } from "@/components/reports/category-breakdown"
import { GoalProgressChart } from "@/components/reports/goal-progress-chart"
import { MonthlyTrendsChart } from "@/components/reports/monthly-trends-chart"
import { ExportReports } from "@/components/reports/export-reports"
import { useAuth } from "@/hooks/use-auth"
import { getReportData, type ReportData } from "@/lib/firestore"
import type { DateRange } from "react-day-picker"
import { TrendingUp, TrendingDown, DollarSign, Target } from "lucide-react"
import { format } from "date-fns"

export function ReportsOverview() {
  const { user } = useAuth()
  const [reportData, setReportData] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState<DateRange | undefined>()
  const [reportType, setReportType] = useState<string>("overview")

  useEffect(() => {
    if (!user) return

    const fetchReportData = async () => {
      setLoading(true)
      try {
        const data = await getReportData(user.uid, dateRange?.from, dateRange?.to)
        setReportData(data)
      } catch (error) {
        console.error("Error fetching report data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchReportData()
  }, [user, dateRange])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-4 w-20 bg-muted animate-pulse rounded" />
                <div className="h-4 w-4 bg-muted animate-pulse rounded" />
              </CardHeader>
              <CardContent>
                <div className="h-8 w-24 bg-muted animate-pulse rounded mb-2" />
                <div className="h-3 w-32 bg-muted animate-pulse rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (!reportData) return null

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-4">
          <Select value={reportType} onValueChange={setReportType}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Report Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="overview">Overview</SelectItem>
              <SelectItem value="expenses">Expenses</SelectItem>
              <SelectItem value="income">Income</SelectItem>
              <SelectItem value="goals">Goals</SelectItem>
            </SelectContent>
          </Select>

          <DatePickerWithRange date={dateRange} setDate={setDateRange} />
        </div>

        <ExportReports reportData={reportData} dateRange={dateRange} />
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Income</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">${reportData.totalIncome.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              {dateRange?.from ? `From ${format(dateRange.from, "MMM dd")}` : "All time"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">${reportData.totalExpenses.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              {dateRange?.from ? `From ${format(dateRange.from, "MMM dd")}` : "All time"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Income</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${reportData.netIncome >= 0 ? "text-green-600" : "text-red-600"}`}>
              ${reportData.netIncome.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">Income - Expenses</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Goals</CardTitle>
            <Target className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{reportData.goalProgress.length}</div>
            <p className="text-xs text-muted-foreground">Goals in progress</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        <MonthlyTrendsChart data={reportData.monthlyTrends} />
        <CategoryBreakdown
          expenseData={reportData.expensesByCategory}
          incomeData={reportData.incomeByCategory}
          type={reportType === "income" ? "income" : "expense"}
        />
      </div>

      {/* Goal Progress */}
      {reportData.goalProgress.length > 0 && <GoalProgressChart goals={reportData.goalProgress} />}
    </div>
  )
}
