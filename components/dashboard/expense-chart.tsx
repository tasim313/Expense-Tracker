"use client"

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  BarElement,
} from "chart.js"
import { Line, Doughnut, Bar } from "react-chartjs-2"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useEffect, useState } from "react"
import { db } from "@/lib/firebase"
import { collection, getDocs, query, where } from "firebase/firestore"
import { useAuth } from "@/hooks/use-auth"
import { Timestamp } from "firebase/firestore"

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement, BarElement)

interface ExpenseChartProps {
  type: "line" | "doughnut" | "bar"
  title: string
  description?: string
}

interface CategoryData { id: string; name: string; color: string }
interface TransactionData { id: string; categoryId: string; amount: number; type: string; date: string }

export function ExpenseChart({ type, title, description }: ExpenseChartProps) {
  const { user } = useAuth()
  const [dataLoaded, setDataLoaded] = useState(false)
  const [categories, setCategories] = useState<CategoryData[]>([])
  const [transactions, setTransactions] = useState<TransactionData[]>([])

  useEffect(() => {
    if (!user) return

    const fetchData = async () => {
      // 1. Fetch categories
      const catSnap = await getDocs(
        query(collection(db, "categories"), where("userId", "==", user.uid))
      )
      const cats: CategoryData[] = catSnap.docs.map((doc, i) => ({
        id: doc.id,
        name: doc.data().name,
        color: doc.data().color || `hsl(${(i * 60) % 360}, 70%, 50%)`,
      }))
      setCategories(cats)

      // 2. Fetch transactions (expenses/income)
      const txSnap = await getDocs(
        query(collection(db, "expenses"), where("userId", "==", user.uid))
      )
      const txs: TransactionData[] = txSnap.docs.map(doc => {
        const data = doc.data()
        let dateStr = ""
        if (data.date instanceof Timestamp) {
          dateStr = data.date.toDate().toISOString()
        } else if (data.date) {
          dateStr = new Date(data.date).toISOString()
        }
        return {
          id: doc.id,
          categoryId: data.categoryId,
          amount: data.amount,
          type: data.type,
          date: dateStr,
        }
      })
      setTransactions(txs)

      setDataLoaded(true)
    }

    fetchData()
  }, [user])

  // ---------------- Chart Data ----------------
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]

  const lineData = {
    labels: months,
    datasets: [
      {
        label: "Expenses",
        data: months.map((_, i) =>
          transactions
            .filter(t => t.type === "expense" && new Date(t.date).getMonth() === i)
            .reduce((sum, t) => sum + t.amount, 0)
        ),
        borderColor: "hsl(var(--chart-1))",
        backgroundColor: "hsl(var(--chart-1) / 0.1)",
      },
      {
        label: "Income",
        data: months.map((_, i) =>
          transactions
            .filter(t => t.type === "income" && new Date(t.date).getMonth() === i)
            .reduce((sum, t) => sum + t.amount, 0)
        ),
        borderColor: "hsl(var(--chart-2))",
        backgroundColor: "hsl(var(--chart-2) / 0.1)",
      },
    ],
  }

  const doughnutData = {
    labels: categories.map(c => c.name),
    datasets: [
      {
        label: "Spending by Category",
        data: categories.map(cat =>
          transactions
            .filter(t => t.categoryId === cat.id && t.type === "expense")
            .reduce((sum, t) => sum + t.amount, 0)
        ),
        backgroundColor: categories.map(c => c.color),
        hoverOffset: 10,
      },
    ],
  }

  const barData = {
    labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
    datasets: [
      {
        label: "Weekly Expenses",
        data: [0, 1, 2, 3].map(i =>
          transactions
            .filter(t => t.type === "expense" && Math.ceil(new Date(t.date).getDate() / 7) === i + 1)
            .reduce((sum, t) => sum + t.amount, 0)
        ),
        backgroundColor: "hsl(var(--primary))",
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: "top" as const } },
    scales: type !== "doughnut" ? { y: { beginAtZero: true } } : undefined,
  }

  const renderChart = () => {
    if (!dataLoaded) return <p className="text-center text-sm">Loading data...</p>
    switch (type) {
      case "line": return <Line data={lineData} options={options} />
      case "doughnut": return <Doughnut data={doughnutData} options={options} />
      case "bar": return <Bar data={barData} options={options} />
      default: return null
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <div className="h-[300px] mb-4">{renderChart()}</div>
      </CardContent>
    </Card>
  )
}
