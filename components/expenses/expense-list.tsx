"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useAuth } from "@/hooks/use-auth"
import { useToast } from "@/hooks/use-toast"
import { subscribeToUserExpenses, deleteExpense, expenseCategories, type Expense } from "@/lib/firestore"
import { ExpenseForm } from "./expense-form"
import { MoreHorizontal, Edit, Trash2, Plus } from "lucide-react"
import { format } from "date-fns"

export function ExpenseList() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)
  const [formOpen, setFormOpen] = useState(false)
  const [editingExpense, setEditingExpense] = useState<Expense | undefined>()

  useEffect(() => {
    if (!user) return

    const unsubscribe = subscribeToUserExpenses(user.uid, (userExpenses) => {
      setExpenses(userExpenses)
      setLoading(false)
    })

    return unsubscribe
  }, [user])

  const handleDelete = async (id: string) => {
    try {
      await deleteExpense(id)
      toast({
        title: "Expense deleted",
        description: "The expense has been removed.",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const handleEdit = (expense: Expense) => {
    setEditingExpense(expense)
    setFormOpen(true)
  }

  const getCategoryInfo = (categoryId: string) => {
    return expenseCategories.find((cat) => cat.id === categoryId) || expenseCategories[expenseCategories.length - 1]
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading expenses...</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Recent Expenses</CardTitle>
              <CardDescription>Track and manage your income and expenses</CardDescription>
            </div>
            <Button onClick={() => setFormOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Expense
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {expenses.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">No expenses recorded yet</p>
              <Button onClick={() => setFormOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Your First Expense
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {expenses.map((expense) => {
                  const categoryInfo = getCategoryInfo(expense.category)
                  return (
                    <TableRow key={expense.id}>
                      <TableCell>{format(expense.date, "MMM dd, yyyy")}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <span>{categoryInfo.icon}</span>
                          <span>{categoryInfo.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>{expense.description}</TableCell>
                      <TableCell>
                        <Badge variant={expense.type === "income" ? "default" : "secondary"}>{expense.type}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className={expense.type === "income" ? "text-green-600" : "text-red-600"}>
                          {expense.type === "income" ? "+" : "-"}
                          {formatCurrency(expense.amount)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEdit(expense)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => expense.id && handleDelete(expense.id)}
                              className="text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <ExpenseForm
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open)
          if (!open) setEditingExpense(undefined)
        }}
        expense={editingExpense}
        onSuccess={() => {
          setEditingExpense(undefined)
        }}
      />
    </>
  )
}
