"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

interface GoalProgressChartProps {
  goals: {
    goalId: string
    title: string
    progress: number
    targetAmount: number
    currentAmount: number
  }[]
}

export function GoalProgressChart({ goals }: GoalProgressChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Goal Progress</CardTitle>
        <CardDescription>Track your savings goals</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {goals.map((goal) => (
            <div key={goal.goalId} className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium">{goal.title}</h4>
                <span className="text-sm text-muted-foreground">{goal.progress.toFixed(1)}%</span>
              </div>
              <Progress value={goal.progress} className="h-2" />
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>${goal.currentAmount.toFixed(2)} saved</span>
                <span>Goal: ${goal.targetAmount.toFixed(2)}</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
