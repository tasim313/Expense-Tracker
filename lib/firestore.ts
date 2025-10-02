import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  query,
  where,
  onSnapshot,
  Timestamp,
} from "firebase/firestore"
import { db } from "./firebase"
import { format } from "date-fns"

export interface Expense {
  id?: string
  userId: string
  amount: number
  category: string
  description: string
  date: Date
  type: "expense" | "income"
  createdAt: Date
}

export interface ExpenseCategory {
  id: string
  name: string
  icon: string
  color: string
}

export const expenseCategories: ExpenseCategory[] = [
  { id: "food", name: "Food & Dining", icon: "🍽️", color: "#ef4444" },
  { id: "transport", name: "Transportation", icon: "🚗", color: "#3b82f6" },
  { id: "bills", name: "Bills & Utilities", icon: "💡", color: "#f59e0b" },
  { id: "entertainment", name: "Entertainment", icon: "🎬", color: "#8b5cf6" },
  { id: "shopping", name: "Shopping", icon: "🛍️", color: "#ec4899" },
  { id: "health", name: "Healthcare", icon: "🏥", color: "#10b981" },
  { id: "education", name: "Education", icon: "📚", color: "#06b6d4" },
  { id: "other", name: "Other", icon: "📝", color: "#6b7280" },
]

// Add new expense
export const addExpense = async (expense: Omit<Expense, "id" | "createdAt">) => {
  try {
    const docRef = await addDoc(collection(db, "expenses"), {
      ...expense,
      date: Timestamp.fromDate(expense.date),
      createdAt: Timestamp.fromDate(new Date()),
    })
    return docRef.id
  } catch (error) {
    console.error("Error adding expense:", error)
    throw error
  }
}

// Update expense
export const updateExpense = async (id: string, expense: Partial<Expense>) => {
  try {
    const expenseRef = doc(db, "expenses", id)
    const updateData = { ...expense }
    if (expense.date) {
      updateData.date = Timestamp.fromDate(expense.date)
    }
    await updateDoc(expenseRef, updateData)
  } catch (error) {
    console.error("Error updating expense:", error)
    throw error
  }
}

// Delete expense
export const deleteExpense = async (id: string) => {
  try {
    await deleteDoc(doc(db, "expenses", id))
  } catch (error) {
    console.error("Error deleting expense:", error)
    throw error
  }
}

// Get user expenses
export const getUserExpenses = async (userId: string) => {
  try {
    const q = query(collection(db, "expenses"), where("userId", "==", userId))
    const querySnapshot = await getDocs(q)
    const expenses = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      date: doc.data().date.toDate(),
      createdAt: doc.data().createdAt.toDate(),
    })) as Expense[]

    // Sort in memory instead of using orderBy
    return expenses.sort((a, b) => b.date.getTime() - a.date.getTime())
  } catch (error) {
    console.error("Error getting expenses:", error)
    throw error
  }
}

// Real-time expense listener
export const subscribeToUserExpenses = (userId: string, callback: (expenses: Expense[]) => void) => {
  const q = query(collection(db, "expenses"), where("userId", "==", userId))

  return onSnapshot(q, (querySnapshot) => {
    const expenses = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      date: doc.data().date.toDate(),
      createdAt: doc.data().createdAt.toDate(),
    })) as Expense[]

    // Sort in memory instead of using orderBy
    const sortedExpenses = expenses.sort((a, b) => b.date.getTime() - a.date.getTime())
    callback(sortedExpenses)
  })
}

export interface Goal {
  id?: string
  userId: string
  title: string
  description: string
  targetAmount: number
  currentAmount: number
  targetDate: Date
  category: string
  priority: "low" | "medium" | "high"
  status: "active" | "completed" | "paused"
  createdAt: Date
  updatedAt: Date
}

export const goalCategories = [
  { id: "vacation", name: "Vacation", icon: "✈️", color: "#3b82f6" },
  { id: "car", name: "Car Purchase", icon: "🚗", color: "#ef4444" },
  { id: "house", name: "House/Property", icon: "🏠", color: "#10b981" },
  { id: "emergency", name: "Emergency Fund", icon: "🛡️", color: "#f59e0b" },
  { id: "education", name: "Education", icon: "🎓", color: "#8b5cf6" },
  { id: "gadget", name: "Electronics", icon: "📱", color: "#ec4899" },
  { id: "investment", name: "Investment", icon: "📈", color: "#06b6d4" },
  { id: "other", name: "Other", icon: "🎯", color: "#6b7280" },
]

// Add new goal
export const addGoal = async (goal: Omit<Goal, "id" | "createdAt" | "updatedAt">) => {
  try {
    const docRef = await addDoc(collection(db, "goals"), {
      ...goal,
      targetDate: Timestamp.fromDate(goal.targetDate),
      createdAt: Timestamp.fromDate(new Date()),
      updatedAt: Timestamp.fromDate(new Date()),
    })
    return docRef.id
  } catch (error) {
    console.error("Error adding goal:", error)
    throw error
  }
}

// Update goal
export const updateGoal = async (id: string, goal: Partial<Goal>) => {
  try {
    const goalRef = doc(db, "goals", id)
    const updateData = { ...goal, updatedAt: Timestamp.fromDate(new Date()) }
    if (goal.targetDate) {
      updateData.targetDate = Timestamp.fromDate(goal.targetDate)
    }
    await updateDoc(goalRef, updateData)
  } catch (error) {
    console.error("Error updating goal:", error)
    throw error
  }
}

// Delete goal
export const deleteGoal = async (id: string) => {
  try {
    await deleteDoc(doc(db, "goals", id))
  } catch (error) {
    console.error("Error deleting goal:", error)
    throw error
  }
}

// Get user goals
export const getUserGoals = async (userId: string) => {
  try {
    const q = query(collection(db, "goals"), where("userId", "==", userId))
    const querySnapshot = await getDocs(q)
    const goals = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      targetDate: doc.data().targetDate.toDate(),
      createdAt: doc.data().createdAt.toDate(),
      updatedAt: doc.data().updatedAt.toDate(),
    })) as Goal[]

    // Sort in memory instead of using orderBy
    return goals.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
  } catch (error) {
    console.error("Error getting goals:", error)
    throw error
  }
}

// Real-time goals listener
export const subscribeToUserGoals = (userId: string, callback: (goals: Goal[]) => void) => {
  const q = query(collection(db, "goals"), where("userId", "==", userId))

  return onSnapshot(q, (querySnapshot) => {
    const goals = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      targetDate: doc.data().targetDate.toDate(),
      createdAt: doc.data().createdAt.toDate(),
      updatedAt: doc.data().updatedAt.toDate(),
    })) as Goal[]

    // Sort in memory instead of using orderBy
    const sortedGoals = goals.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    callback(sortedGoals)
  })
}

// Add contribution to goal
export const addGoalContribution = async (goalId: string, amount: number) => {
  try {
    const goalRef = doc(db, "goals", goalId)
    const goalDoc = await getDocs(query(collection(db, "goals"), where("__name__", "==", goalId)))

    if (!goalDoc.empty) {
      const currentGoal = goalDoc.docs[0].data() as Goal
      const newAmount = currentGoal.currentAmount + amount
      const status = newAmount >= currentGoal.targetAmount ? "completed" : "active"

      await updateDoc(goalRef, {
        currentAmount: newAmount,
        status,
        updatedAt: Timestamp.fromDate(new Date()),
      })
    }
  } catch (error) {
    console.error("Error adding goal contribution:", error)
    throw error
  }
}

export interface Voucher {
  id?: string
  userId: string
  voucherNumber: string
  type: "expense" | "income" | "loan" | "settlement" | "goal_contribution"
  title: string
  description: string
  amount: number
  category: string
  date: Date
  relatedExpenseId?: string
  relatedGoalId?: string
  status: "active" | "void"
  createdAt: Date
}

// Generate voucher number
const generateVoucherNumber = () => {
  const timestamp = Date.now().toString()
  const random = Math.random().toString(36).substring(2, 8).toUpperCase()
  return `VCH-${timestamp.slice(-6)}-${random}`
}

// Add new voucher
export const addVoucher = async (voucher: Omit<Voucher, "id" | "voucherNumber" | "createdAt">) => {
  try {
    const voucherNumber = generateVoucherNumber()
    const docRef = await addDoc(collection(db, "vouchers"), {
      ...voucher,
      voucherNumber,
      date: Timestamp.fromDate(voucher.date),
      createdAt: Timestamp.fromDate(new Date()),
    })
    return { id: docRef.id, voucherNumber }
  } catch (error) {
    console.error("Error adding voucher:", error)
    throw error
  }
}

// Update voucher
export const updateVoucher = async (id: string, voucher: Partial<Voucher>) => {
  try {
    const voucherRef = doc(db, "vouchers", id)
    const updateData = { ...voucher }
    if (voucher.date) {
      updateData.date = Timestamp.fromDate(voucher.date)
    }
    await updateDoc(voucherRef, updateData)
  } catch (error) {
    console.error("Error updating voucher:", error)
    throw error
  }
}

// Delete voucher
export const deleteVoucher = async (id: string) => {
  try {
    await deleteDoc(doc(db, "vouchers", id))
  } catch (error) {
    console.error("Error deleting voucher:", error)
    throw error
  }
}

// Get user vouchers
export const getUserVouchers = async (userId: string) => {
  try {
    const q = query(collection(db, "vouchers"), where("userId", "==", userId))
    const querySnapshot = await getDocs(q)
    const vouchers = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      date: doc.data().date.toDate(),
      createdAt: doc.data().createdAt.toDate(),
    })) as Voucher[]

    // Sort in memory instead of using orderBy
    return vouchers.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
  } catch (error) {
    console.error("Error getting vouchers:", error)
    throw error
  }
}

// Real-time vouchers listener
export const subscribeToUserVouchers = (userId: string, callback: (vouchers: Voucher[]) => void) => {
  const q = query(collection(db, "vouchers"), where("userId", "==", userId))

  return onSnapshot(q, (querySnapshot) => {
    const vouchers = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      date: doc.data().date.toDate(),
      createdAt: doc.data().createdAt.toDate(),
    })) as Voucher[]

    // Sort in memory instead of using orderBy
    const sortedVouchers = vouchers.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    callback(sortedVouchers)
  })
}

// Create voucher from expense
export const createVoucherFromExpense = async (expense: Expense) => {
  if (!expense.id) throw new Error("Expense must have an ID")

  const voucher = {
    userId: expense.userId,
    type: expense.type,
    title: `${expense.type === "expense" ? "Expense" : "Income"} Voucher`,
    description: expense.description,
    amount: expense.amount,
    category: expense.category,
    date: expense.date,
    relatedExpenseId: expense.id,
    status: "active" as const,
  }

  return await addVoucher(voucher)
}

// Create voucher from goal contribution
export const createVoucherFromGoalContribution = async (goal: Goal, contributionAmount: number) => {
  if (!goal.id) throw new Error("Goal must have an ID")

  const voucher = {
    userId: goal.userId,
    type: "goal_contribution" as const,
    title: "Goal Contribution Voucher",
    description: `Contribution to ${goal.title}`,
    amount: contributionAmount,
    category: goal.category,
    date: new Date(),
    relatedGoalId: goal.id,
    status: "active" as const,
  }

  return await addVoucher(voucher)
}

export interface ReportData {
  totalExpenses: number
  totalIncome: number
  netIncome: number
  expensesByCategory: { category: string; amount: number; count: number }[]
  incomeByCategory: { category: string; amount: number; count: number }[]
  monthlyTrends: { month: string; expenses: number; income: number }[]
  goalProgress: { goalId: string; title: string; progress: number; targetAmount: number; currentAmount: number }[]
}

// Get comprehensive report data for a user
export const getReportData = async (userId: string, startDate?: Date, endDate?: Date): Promise<ReportData> => {
  try {
    // Get expenses and goals
    const expenses = await getUserExpenses(userId)
    const goals = await getUserGoals(userId)

    // Filter by date range if provided
    const filteredExpenses = expenses.filter((expense) => {
      if (!startDate && !endDate) return true
      const expenseDate = expense.date
      if (startDate && expenseDate < startDate) return false
      if (endDate && expenseDate > endDate) return false
      return true
    })

    // Calculate totals
    const totalExpenses = filteredExpenses.filter((e) => e.type === "expense").reduce((sum, e) => sum + e.amount, 0)

    const totalIncome = filteredExpenses.filter((e) => e.type === "income").reduce((sum, e) => sum + e.amount, 0)

    // Group by category
    const expensesByCategory = filteredExpenses
      .filter((e) => e.type === "expense")
      .reduce(
        (acc, expense) => {
          const existing = acc.find((item) => item.category === expense.category)
          if (existing) {
            existing.amount += expense.amount
            existing.count += 1
          } else {
            acc.push({ category: expense.category, amount: expense.amount, count: 1 })
          }
          return acc
        },
        [] as { category: string; amount: number; count: number }[],
      )

    const incomeByCategory = filteredExpenses
      .filter((e) => e.type === "income")
      .reduce(
        (acc, income) => {
          const existing = acc.find((item) => item.category === income.category)
          if (existing) {
            existing.amount += income.amount
            existing.count += 1
          } else {
            acc.push({ category: income.category, amount: income.amount, count: 1 })
          }
          return acc
        },
        [] as { category: string; amount: number; count: number }[],
      )

    // Monthly trends (last 12 months)
    const monthlyTrends = []
    for (let i = 11; i >= 0; i--) {
      const date = new Date()
      date.setMonth(date.getMonth() - i)
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1)
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0)

      const monthExpenses = filteredExpenses
        .filter((e) => e.type === "expense" && e.date >= monthStart && e.date <= monthEnd)
        .reduce((sum, e) => sum + e.amount, 0)

      const monthIncome = filteredExpenses
        .filter((e) => e.type === "income" && e.date >= monthStart && e.date <= monthEnd)
        .reduce((sum, e) => sum + e.amount, 0)

      monthlyTrends.push({
        month: date.toLocaleDateString("en-US", { month: "short", year: "numeric" }),
        expenses: monthExpenses,
        income: monthIncome,
      })
    }

    // Goal progress
    const goalProgress = goals.map((goal) => ({
      goalId: goal.id!,
      title: goal.title,
      progress: Math.min((goal.currentAmount / goal.targetAmount) * 100, 100),
      targetAmount: goal.targetAmount,
      currentAmount: goal.currentAmount,
    }))

    return {
      totalExpenses,
      totalIncome,
      netIncome: totalIncome - totalExpenses,
      expensesByCategory,
      incomeByCategory,
      monthlyTrends,
      goalProgress,
    }
  } catch (error) {
    console.error("Error getting report data:", error)
    throw error
  }
}

// Get spending trends by time period
export const getSpendingTrends = async (userId: string, period: "week" | "month" | "year") => {
  try {
    const expenses = await getUserExpenses(userId)
    const now = new Date()
    let startDate: Date

    switch (period) {
      case "week":
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case "month":
        startDate = new Date(now.getFullYear(), now.getMonth(), 1)
        break
      case "year":
        startDate = new Date(now.getFullYear(), 0, 1)
        break
    }

    return expenses.filter((expense) => expense.type === "expense" && expense.date >= startDate)
  } catch (error) {
    console.error("Error getting spending trends:", error)
    throw error
  }
}


export async function generateTransactionId(userId: string) {
  const today = format(new Date(), "yyyyMMdd") // e.g., 20251002

  // Count today’s transactions for user
  const q = query(
    collection(db, "expenses"),
    where("userId", "==", userId)
  )
  const snap = await getDocs(q)

  const todayCount = snap.docs.filter(doc => {
    const data = doc.data()
    const date = data.date?.toDate ? data.date.toDate() : new Date(data.date)
    return format(date, "yyyyMMdd") === today
  }).length

  const serial = String(todayCount + 1).padStart(4, "0") // e.g. 0001
  return `${today}-${userId}-${serial}`
}