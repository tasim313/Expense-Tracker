"use client"

import { AuthGuard } from "@/components/auth/auth-guard"
import { Header } from "@/components/layout/header"
import { GoalsList } from "@/components/goals/goals-list"
import { Toaster } from "@/components/ui/toaster"

export default function GoalsPage() {
  return (
    <>
      <AuthGuard>
        <div className="min-h-screen bg-background">
          <Header />
          <main className="container mx-auto px-4 py-8">
            <GoalsList />
          </main>
        </div>
      </AuthGuard>
      <Toaster />
    </>
  )
}
