"use client"

import { AuthGuard } from "@/components/auth/auth-guard"
import { Header } from "@/components/layout/header"
import { ExpenseList } from "@/components/expenses/expense-list"
import { Toaster } from "@/components/ui/toaster"

export default function ExpensesPage() {
  return (
    <>
      <AuthGuard>
        <div className="min-h-screen bg-background">
          <Header />
          <main className="container mx-auto px-4 py-8">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-foreground mb-2">Expenses</h2>
              <p className="text-muted-foreground">Manage your income and expenses with detailed tracking</p>
            </div>
            <ExpenseList />
          </main>
        </div>
      </AuthGuard>
      <Toaster />
    </>
  )
}
