"use client"

import { useState, useEffect } from "react"
import { collection, query, where, onSnapshot } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useAuth } from "@/hooks/use-auth"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, TrendingDown, DollarSign, CreditCard, PiggyBank, Target, Receipt } from "lucide-react"

interface Expense {
  id: string
  amount: number
  category: string
  createdAt: any
  date: string
  description: string
  type: "income" | "expense"
  userId: string
}

interface Goal {
  id: string
  category: string
  createdAt: any
  currentAmount: number
  description: string
  priority: string
  status: string
  targetAmount: number
  targetDate: string
  title: string
  updatedAt: any
  userId: string
}

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

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-BD', {
    style: 'currency',
    currency: 'BDT',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function StatsCards() {
  const { user } = useAuth()
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [goals, setGoals] = useState<Goal[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      setLoading(false)
      return
    }

    setLoading(true)

    // Expenses listener
    const qExpenses = query(collection(db, "expenses"), where("userId", "==", user.uid))
    const unsubExpenses = onSnapshot(qExpenses, (snapshot) => {
      const expensesData = snapshot.docs.map((doc) => ({ 
        id: doc.id, 
        ...doc.data() 
      } as Expense))
      setExpenses(expensesData)
      setLoading(false)
    })

    // Goals listener
    const qGoals = query(collection(db, "goals"), where("userId", "==", user.uid))
    const unsubGoals = onSnapshot(qGoals, (snapshot) => {
      const goalsData = snapshot.docs.map((doc) => ({ 
        id: doc.id, 
        ...doc.data() 
      } as Goal))
      setGoals(goalsData)
    })

    return () => {
      unsubExpenses()
      unsubGoals()
    }
  }, [user])

  // Calculations
  const totalIncome = expenses
    .filter((e) => e.type === "income")
    .reduce((sum, e) => sum + e.amount, 0)

  const totalExpenses = expenses
    .filter((e) => e.type === "expense")
    .reduce((sum, e) => sum + e.amount, 0)

  const balance = totalIncome - totalExpenses

  const currentMonth = new Date().getMonth()
  const currentYear = new Date().getFullYear()

  const monthlyIncome = expenses
    .filter((e) => {
      if (e.type !== "income") return false
      const expenseDate = e.createdAt?.toDate?.() || new Date(e.date)
      return expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear
    })
    .reduce((sum, e) => sum + e.amount, 0)

  const monthlyExpenses = expenses
    .filter((e) => {
      if (e.type !== "expense") return false
      const expenseDate = e.createdAt?.toDate?.() || new Date(e.date)
      return expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear
    })
    .reduce((sum, e) => sum + e.amount, 0)

  // Goal calculations
  const totalSaved = goals.reduce((sum, goal) => sum + goal.currentAmount, 0)
  const totalTargetAmount = goals.reduce((sum, goal) => sum + goal.targetAmount, 0)
  const savingsProgress = totalTargetAmount > 0 ? Math.round((totalSaved / totalTargetAmount) * 100) : 0

  // Calculate trends
  const balanceTrend = balance >= 0 ? "up" : "down"
  const incomeTrend = monthlyIncome > 0 ? "up" : "neutral"
  const expensesTrend = monthlyExpenses > 0 ? "down" : "neutral"
  const totalExpensesTrend = totalExpenses > 0 ? "down" : "neutral"
  const savingsTrend = totalSaved > 0 ? "up" : "neutral"
  const goalTrend = savingsProgress > 0 ? "up" : "neutral"

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        {[1, 2, 3, 4, 5].map((i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Loading...</CardTitle>
              <div className="h-4 w-4 bg-gray-200 rounded animate-pulse" />
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded animate-pulse mb-2" />
              <div className="h-4 bg-gray-200 rounded animate-pulse" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
      <StatCard
        title="Total Balance"
        value={formatCurrency(balance)}
        description="Current account balance"
        icon={<DollarSign className="h-4 w-4 text-muted-foreground" />}
        trend={balanceTrend}
        trendValue={balanceTrend === "up" ? "Positive" : "Negative"}
      />
      
      <StatCard
        title="Monthly Income"
        value={formatCurrency(monthlyIncome)}
        description="This month's earnings"
        icon={<DollarSign className="h-4 w-4 text-muted-foreground" />}
        trend={incomeTrend === "up" ? "up" : undefined}
        trendValue={incomeTrend === "up" ? "Active" : undefined}
      />
      
      <StatCard
        title="Monthly Expenses"
        value={formatCurrency(monthlyExpenses)}
        description="This month's spending"
        icon={<CreditCard className="h-4 w-4 text-muted-foreground" />}
        trend={expensesTrend === "down" ? "down" : undefined}
        trendValue={expensesTrend === "down" ? "Spending" : undefined}
      />
      
      <StatCard
        title="Total Expenses"
        value={formatCurrency(totalExpenses)}
        description="All-time spending total"
        icon={<Receipt className="h-4 w-4 text-muted-foreground" />}
        trend={totalExpensesTrend === "down" ? "down" : undefined}
        trendValue={totalExpensesTrend === "down" ? "Overall" : undefined}
      />
      
      <StatCard
        title="Total Saved"
        value={formatCurrency(totalSaved)}
        description="Sum of all savings goals"
        icon={<PiggyBank className="h-4 w-4 text-muted-foreground" />}
        trend={savingsTrend === "up" ? "up" : undefined}
        trendValue={savingsTrend === "up" ? "Growing" : undefined}
      />
      
      <StatCard
        title="Savings Goal"
        value={formatCurrency(totalTargetAmount)}
        description={`Progress: ${savingsProgress}% complete`}
        icon={<Target className="h-4 w-4 text-muted-foreground" />}
        trend={goalTrend === "up" ? "up" : undefined}
        trendValue={`${savingsProgress}%`}
      />
    </div>
  )
}