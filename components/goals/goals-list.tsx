"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/hooks/use-auth"
import { useToast } from "@/hooks/use-toast"
import { subscribeToUserGoals, deleteGoal, type Goal } from "@/lib/firestore"
import { GoalForm } from "./goal-form"
import {GoalCard}  from "./goal-card"
import { Plus, Target } from "lucide-react"

export function GoalsList() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [goals, setGoals] = useState<Goal[]>([])
  const [loading, setLoading] = useState(true)
  const [formOpen, setFormOpen] = useState(false)
  const [editingGoal, setEditingGoal] = useState<Goal | undefined>()

  useEffect(() => {
    if (!user) return

    const unsubscribe = subscribeToUserGoals(user.uid, (userGoals) => {
      setGoals(userGoals)
      setLoading(false)
    })

    return unsubscribe
  }, [user])

  const handleDelete = async (id: string) => {
    try {
      await deleteGoal(id)
      toast({
        title: "Goal deleted",
        description: "The goal has been removed.",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const handleEdit = (goal: Goal) => {
    setEditingGoal(goal)
    setFormOpen(true)
  }

  const activeGoals = goals.filter((goal) => goal.status === "active")
  const completedGoals = goals.filter((goal) => goal.status === "completed")
  const pausedGoals = goals.filter((goal) => goal.status === "paused")

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading goals...</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Savings Goals</h2>
            <p className="text-muted-foreground">Track your progress towards your financial goals</p>
          </div>
          <Button onClick={() => setFormOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Goal
          </Button>
        </div>

        {goals.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Target className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No goals yet</h3>
              <p className="text-muted-foreground mb-4">
                Create your first savings goal to start tracking your progress
              </p>
              <Button onClick={() => setFormOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Goal
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Tabs defaultValue="active" className="space-y-4">
            <TabsList>
              <TabsTrigger value="active">Active ({activeGoals.length})</TabsTrigger>
              <TabsTrigger value="completed">Completed ({completedGoals.length})</TabsTrigger>
              <TabsTrigger value="paused">Paused ({pausedGoals.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="active" className="space-y-4">
              {activeGoals.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <p className="text-muted-foreground">No active goals</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {activeGoals.map((goal) => (
                    <GoalCard key={goal.id} goal={goal} onEdit={handleEdit} onDelete={handleDelete} />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="completed" className="space-y-4">
              {completedGoals.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <p className="text-muted-foreground">No completed goals yet</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {completedGoals.map((goal) => (
                    <GoalCard key={goal.id} goal={goal} onEdit={handleEdit} onDelete={handleDelete} />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="paused" className="space-y-4">
              {pausedGoals.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <p className="text-muted-foreground">No paused goals</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {pausedGoals.map((goal) => (
                    <GoalCard key={goal.id} goal={goal} onEdit={handleEdit} onDelete={handleDelete} />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>

      <GoalForm
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open)
          if (!open) setEditingGoal(undefined)
        }}
        goal={editingGoal}
        onSuccess={() => {
          setEditingGoal(undefined)
        }}
      />
    </>
  )
}
