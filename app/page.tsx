"use client"

import { AuthGuard } from "@/components/auth/auth-guard"
import { Header } from "@/components/layout/header"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Toaster } from "@/components/ui/toaster"

export default function Home() {
  return (
    <>
      <AuthGuard>
        <div className="min-h-screen bg-background">
          <Header />
          <main className="container mx-auto px-4 py-8">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-foreground mb-2">Dashboard</h2>
              <p className="text-muted-foreground">Track your expenses with advanced visualizations and insights</p>
            </div>
            <DashboardLayout />
          </main>
        </div>
      </AuthGuard>
      <Toaster />
    </>
  )
}
