"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/hooks/use-auth"
import { useToast } from "@/hooks/use-toast"
import { subscribeToUserExpenses, deleteExpense, type Expense } from "@/lib/firestore"
import { ExpenseForm } from "./expense-form"
import { MoreHorizontal, Edit, Trash2, Plus, FileDown } from "lucide-react"
import { format } from "date-fns"
import { db } from "@/lib/firebase"
import { collection, getDocs } from "firebase/firestore"

// PDF
import jsPDF from "jspdf"

export function ExpenseList() {
  const { user } = useAuth()
  const { toast } = useToast()

  const [expenses, setExpenses] = useState<Expense[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [contacts, setContacts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [formOpen, setFormOpen] = useState(false)
  const [editingExpense, setEditingExpense] = useState<Expense | undefined>()
  const [search, setSearch] = useState("")

  // Fetch expenses
  useEffect(() => {
    if (!user) return
    const unsubscribe = subscribeToUserExpenses(user.uid, (userExpenses) => {
      setExpenses(userExpenses)
      setLoading(false)
    })
    return unsubscribe
  }, [user])

  // Fetch categories + contacts
  useEffect(() => {
    const fetchData = async () => {
      const catSnap = await getDocs(collection(db, "categories"))
      const conSnap = await getDocs(collection(db, "contacts"))
      setCategories(catSnap.docs.map((d) => ({ id: d.id, ...d.data() })))
      setContacts(conSnap.docs.map((d) => ({ id: d.id, ...d.data() })))
    }
    fetchData()
  }, [])

  const handleDelete = async (id: string) => {
    try {
      await deleteExpense(id)
      toast({ title: "Transaction deleted", description: "The transaction has been removed." })
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" })
    }
  }

  const handleEdit = (expense: Expense) => {
    setEditingExpense(expense)
    setFormOpen(true)
  }

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-BD", { style: "currency", currency: "BDT" }).format(amount)

  // PDF Generation
  const handleDownloadPDF = (expense: Expense) => {
    const category = categories.find((c) => c.id === expense.category)
    const contact = contacts.find((c) => c.id === expense.contactId)

    const doc = new jsPDF()

    // Colors
    const primaryColor = [21, 128, 61] // Green
    const secondaryColor = [107, 114, 128] // Gray
    const textColor = [17, 24, 39] // Dark gray

    // Header
    doc.setFillColor(...primaryColor)
    doc.rect(0, 0, 210, 30, "F")
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(24)
    doc.setFont("helvetica", "bold")
    doc.text("EXPENSE TRACKER", 20, 20)
    doc.setFontSize(12)
    doc.setFont("helvetica", "normal")
    doc.text("Transaction Voucher", 150, 20)

    // Voucher Details
    doc.setTextColor(...textColor)
    doc.setFontSize(16)
    doc.setFont("helvetica", "bold")
    doc.text("VOUCHER DETAILS", 20, 50)
    doc.setDrawColor(...primaryColor)
    doc.setLineWidth(0.5)
    doc.line(20, 55, 190, 55)

    const details = [
      ["Transaction ID:", expense.transactionId],
      ["Date:", format(expense.date, "PPP")],
      ["Type:", expense.type.toUpperCase()],
      ["Category:", category?.name || "N/A"],
      ["Contact:", contact ? `${contact.name} (${contact.phone || ""})` : "N/A"],
      ["Description:", expense.description],
    ]

    let yPos = 70
    details.forEach(([label, value]) => {
      doc.setFont("helvetica", "bold")
      doc.text(label, 20, yPos)
      doc.setFont("helvetica", "normal")
      doc.text(value, 70, yPos)
      yPos += 8
    })

    // Amount box
    yPos += 10
    doc.setFillColor(248, 250, 252)
    doc.rect(20, yPos, 170, 25, "F")
    doc.setDrawColor(...primaryColor)
    doc.rect(20, yPos, 170, 25)
    doc.setFontSize(14)
    doc.setFont("helvetica", "bold")
    doc.text("AMOUNT:", 25, yPos + 10)
    const amountText = formatCurrency(expense.amount)
    doc.setFontSize(18)
    doc.setTextColor(...primaryColor)
    doc.text(amountText, 25, yPos + 20)

    // Footer
    yPos += 50
    doc.setTextColor(...secondaryColor)
    doc.setFontSize(8)
    doc.setFont("helvetica", "normal")
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 20, yPos)
    doc.text("This is a computer-generated voucher and does not require a signature.", 20, yPos + 5)

    doc.save(`${expense.transactionId}.pdf`)
  }

  // Filter logic
  const filteredExpenses = expenses.filter((exp) => {
    const category = categories.find((c) => c.id === exp.category)?.name || ""
    const contact = contacts.find((c) => c.id === exp.contactId)?.name || ""
    const searchLower = search.toLowerCase()
    return (
      format(exp.date, "yyyy-MM-dd").toLowerCase().includes(searchLower) ||
      exp.transactionId?.toLowerCase().includes(searchLower) ||
      category.toLowerCase().includes(searchLower) ||
      contact.toLowerCase().includes(searchLower) ||
      exp.description?.toLowerCase().includes(searchLower) ||
      exp.type?.toLowerCase().includes(searchLower) ||
      exp.amount.toString().includes(searchLower)
    )
  })

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading transactions...</div>
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
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>Track and manage your income and expenses</CardDescription>
            </div>
            <Button onClick={() => setFormOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Transaction
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Input
            placeholder="Filter by Date, Transaction ID, Category, Contact, Type, Description, Amount"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="mb-4"
          />

          {filteredExpenses.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">No matching transactions</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Transaction ID</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>PDF</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredExpenses.map((expense) => {
                  const category = categories.find((c) => c.id === expense.category)
                  const contact = contacts.find((c) => c.id === expense.contactId)
                  return (
                    <TableRow key={expense.id}>
                      <TableCell>{format(expense.date, "MMM dd, yyyy")}</TableCell>
                      <TableCell>{expense.transactionId}</TableCell>
                      <TableCell>{category?.name || "N/A"}</TableCell>
                      <TableCell>{contact?.name || "N/A"}</TableCell>
                      <TableCell>
                        <Badge variant={expense.type === "income" ? "default" : "secondary"}>
                          {expense.type}
                        </Badge>
                      </TableCell>
                      <TableCell>{expense.description}</TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm" onClick={() => handleDownloadPDF(expense)}>
                          <FileDown className="h-4 w-4 mr-1" />
                          PDF
                        </Button>
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
        onSuccess={() => setEditingExpense(undefined)}
      />
    </>
  )
}
