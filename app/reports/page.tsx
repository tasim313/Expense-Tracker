"use client"

import { AuthGuard } from "@/components/auth/auth-guard"
import { Header } from "@/components/layout/header"
import { ReportsOverview } from "@/components/reports/reports-overview"
import { Toaster } from "@/components/ui/toaster"

export default function ReportsPage() {
  return (
    <>
      <AuthGuard>
        <div className="min-h-screen bg-background">
          <Header />
          <main className="container mx-auto px-4 py-8">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-foreground mb-2">Reports & Analytics</h2>
              <p className="text-muted-foreground">Comprehensive insights into your financial data</p>
            </div>
            <ReportsOverview />
          </main>
        </div>
      </AuthGuard>
      <Toaster />
    </>
  )
}
