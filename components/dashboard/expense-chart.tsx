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

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement, BarElement)

interface ExpenseChartProps {
  type: "line" | "doughnut" | "bar"
  title: string
  description?: string
}

export function ExpenseChart({ type, title, description }: ExpenseChartProps) {
  // Sample data - will be replaced with real Firebase data
  const lineData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    datasets: [
      {
        label: "Expenses",
        data: [1200, 1900, 800, 1500, 2000, 1700],
        borderColor: "hsl(var(--chart-1))",
        backgroundColor: "hsl(var(--chart-1) / 0.1)",
        tension: 0.4,
      },
      {
        label: "Income",
        data: [2000, 2500, 2200, 2800, 3000, 2600],
        borderColor: "hsl(var(--chart-2))",
        backgroundColor: "hsl(var(--chart-2) / 0.1)",
        tension: 0.4,
      },
    ],
  }

  const doughnutData = {
    labels: ["Food", "Transport", "Bills", "Entertainment", "Shopping"],
    datasets: [
      {
        data: [300, 150, 400, 200, 250],
        backgroundColor: [
          "hsl(var(--chart-1))",
          "hsl(var(--chart-2))",
          "hsl(var(--chart-3))",
          "hsl(var(--chart-4))",
          "hsl(var(--chart-5))",
        ],
        borderWidth: 0,
      },
    ],
  }

  const barData = {
    labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
    datasets: [
      {
        label: "Weekly Expenses",
        data: [400, 600, 350, 750],
        backgroundColor: "hsl(var(--primary))",
        borderRadius: 4,
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
      },
    },
    scales:
      type !== "doughnut"
        ? {
            y: {
              beginAtZero: true,
            },
          }
        : undefined,
  }

  const renderChart = () => {
    switch (type) {
      case "line":
        return <Line data={lineData} options={options} />
      case "doughnut":
        return <Doughnut data={doughnutData} options={options} />
      case "bar":
        return <Bar data={barData} options={options} />
      default:
        return null
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">{renderChart()}</div>
      </CardContent>
    </Card>
  )
}
