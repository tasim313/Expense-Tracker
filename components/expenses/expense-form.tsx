"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useAuth } from "@/hooks/use-auth"
import { useToast } from "@/hooks/use-toast"
import { addExpense, updateExpense, type Expense } from "@/lib/firestore"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

// Firestore imports
import { db } from "@/lib/firebase"
import { collection, getDocs, query, where } from "firebase/firestore"

interface ExpenseFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  expense?: Expense
  onSuccess?: () => void
}

export function ExpenseForm({ open, onOpenChange, expense, onSuccess }: ExpenseFormProps) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)

  const [categories, setCategories] = useState<any[]>([])
  const [contacts, setContacts] = useState<any[]>([])

  const [formData, setFormData] = useState({
    amount: expense?.amount?.toString() || "",
    category: expense?.category || "",
    contactId: expense?.contactId || "",
    description: expense?.description || "",
    type: expense?.type || ("expense" as "expense" | "income"),
    date: expense?.date || new Date(),
  })

  useEffect(() => {
    if (!user) return
    fetchCategories()
    fetchContacts()
  }, [user])

  const fetchCategories = async () => {
    const q = query(collection(db, "categories"), where("userId", "==", user.uid))
    const snap = await getDocs(q)
    setCategories(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })))
  }

  const fetchContacts = async () => {
    if (!user) return
    const q = query(collection(db, "contacts"), where("createdBy", "==", user.uid))
    const snap = await getDocs(q)
    setContacts(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })))
  }
  

  const generateTransactionId = async (userId: string) => {
    const today = format(new Date(), "yyyyMMdd")
    const q = query(collection(db, "expenses"), where("userId", "==", userId))
    const snap = await getDocs(q)

    const todayCount = snap.docs.filter(doc => {
      const data = doc.data()
      const date = data.date?.toDate ? data.date.toDate() : new Date(data.date)
      return format(date, "yyyyMMdd") === today
    }).length

    const serial = String(todayCount + 1).padStart(4, "0")
    return `${today}-${userId}-${serial}`
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    setLoading(true)

    try {
      let transactionId = expense?.transactionId
      if (!transactionId) {
        transactionId = await generateTransactionId(user.uid)
      }

      const expenseData = {
        transactionId,
        userId: user.uid,
        amount: Number.parseFloat(formData.amount),
        category: formData.category,
        contactId: formData.contactId,
        description: formData.description,
        type: formData.type,
        date: formData.date,
      }

      if (expense?.id) {
        await updateExpense(expense.id, expenseData)
        toast({ title: "Updated!", description: "Transaction updated successfully." })
      } else {
        await addExpense(expenseData)
        toast({ title: "Added!", description: "Transaction added successfully." })
      }

      onOpenChange(false)
      onSuccess?.()

      setFormData({
        amount: "",
        category: "",
        contactId: "",
        description: "",
        type: "expense",
        date: new Date(),
      })
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{expense ? "Edit Transaction" : "Add Transaction"}</DialogTitle>
          <DialogDescription>
            {expense ? "Update your transaction details." : "Add a new expense or income entry."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Amount + Type */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Select
                value={formData.type}
                onValueChange={(value: "expense" | "income") =>
                  setFormData({ ...formData, type: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="expense">Expense</SelectItem>
                  <SelectItem value="income">Income</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select
              value={formData.category}
              onValueChange={(value) => setFormData({ ...formData, category: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Contact */}
          <div className="space-y-2">
            <Label htmlFor="contact">Contact</Label>
            <Select
              value={formData.contactId}
              onValueChange={(value) => setFormData({ ...formData, contactId: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select contact" />
              </SelectTrigger>
              <SelectContent>
                {contacts.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name} {c.phone ? `(${c.phone})` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Date */}
          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal bg-transparent"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.date ? format(formData.date, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={formData.date}
                  onSelect={(date) => date && setFormData({ ...formData, date })}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Enter description..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : expense ? "Update" : "Add"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
