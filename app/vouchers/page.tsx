"use client"

import { AuthGuard } from "@/components/auth/auth-guard"
import { Header } from "@/components/layout/header"
import { VouchersList } from "@/components/vouchers/vouchers-list"
import { Toaster } from "@/components/ui/toaster"

export default function VouchersPage() {
  return (
    <>
      <AuthGuard>
        <div className="min-h-screen bg-background">
          <Header />
          <main className="container mx-auto px-4 py-8">
            <VouchersList />
          </main>
        </div>
      </AuthGuard>
      <Toaster />
    </>
  )
}
