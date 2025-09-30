

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { addGoalContribution, goalCategories, type Goal } from "@/lib/firestore"
import { MoreHorizontal, Edit, Trash2, Plus, Target } from "lucide-react"
import { format, differenceInDays } from "date-fns"

interface GoalCardProps {
  goal: Goal
  onEdit: (goal: Goal) => void
  onDelete: (id: string) => void
}

export function GoalCard({ goal, onEdit, onDelete }: GoalCardProps) {
  const { toast } = useToast()
  const [contributionOpen, setContributionOpen] = useState(false)
  const [contributionAmount, setContributionAmount] = useState("")
  const [loading, setLoading] = useState(false)

  const categoryInfo =
    goalCategories.find((cat) => cat.id === goal.category) || goalCategories[goalCategories.length - 1]
  const progress = (goal.currentAmount / goal.targetAmount) * 100
  const remainingAmount = goal.targetAmount - goal.currentAmount
  const daysRemaining = differenceInDays(goal.targetDate, new Date())

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "destructive"
      case "medium":
        return "default"
      case "low":
        return "secondary"
      default:
        return "default"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500"
      case "active":
        return "bg-blue-500"
      case "paused":
        return "bg-yellow-500"
      default:
        return "bg-gray-500"
    }
  }

  const handleContribution = async () => {
    if (!goal.id || !contributionAmount) return

    setLoading(true)
    try {
      await addGoalContribution(goal.id, Number.parseFloat(contributionAmount))
      toast({
        title: "Contribution added!",
        description: `Added ${formatCurrency(Number.parseFloat(contributionAmount))} to your goal.`,
      })
      setContributionOpen(false)
      setContributionAmount("")
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Card className="relative overflow-hidden">
        <div className={`absolute top-0 left-0 w-1 h-full ${getStatusColor(goal.status)}`} />
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">{categoryInfo.icon}</span>
              <div>
                <CardTitle className="text-lg">{goal.title}</CardTitle>
                <CardDescription className="text-sm">{goal.description}</CardDescription>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant={getPriorityColor(goal.priority)}>{goal.priority}</Badge>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onEdit(goal)}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setContributionOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Contribution
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => goal.id && onDelete(goal.id)} className="text-red-600">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>{formatCurrency(goal.currentAmount)}</span>
              <span>{formatCurrency(goal.targetAmount)}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Remaining</p>
              <p className="font-semibold">{formatCurrency(remainingAmount)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Days Left</p>
              <p className="font-semibold">{daysRemaining > 0 ? `${daysRemaining} days` : "Overdue"}</p>
            </div>
          </div>

          <div className="text-sm">
            <p className="text-muted-foreground">Target Date</p>
            <p className="font-semibold">{format(goal.targetDate, "MMM dd, yyyy")}</p>
          </div>

          {goal.status === "active" && (
            <Button onClick={() => setContributionOpen(true)} className="w-full" size="sm">
              <Target className="mr-2 h-4 w-4" />
              Add Contribution
            </Button>
          )}
        </CardContent>
      </Card>

      <Dialog open={contributionOpen} onOpenChange={setContributionOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Add Contribution</DialogTitle>
            <DialogDescription>Add money to your "{goal.title}" goal</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Contribution Amount</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={contributionAmount}
                onChange={(e) => setContributionAmount(e.target.value)}
              />
            </div>
            <div className="text-sm text-muted-foreground">
              Current: {formatCurrency(goal.currentAmount)} / {formatCurrency(goal.targetAmount)}
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setContributionOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleContribution} disabled={loading || !contributionAmount}>
              {loading ? "Adding..." : "Add Contribution"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}