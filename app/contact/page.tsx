"use client"

import { AuthGuard } from "@/components/auth/auth-guard"
import { Header } from "@/components/layout/header"
import CreateContact from "@/components/contact/CreateContact"   // ✅ Fix here
import { Toaster } from "@/components/ui/toaster"

export default function CategoryPage() {
  return (
    <>
      <AuthGuard>
        <div className="min-h-screen bg-background">
          <Header />
          <main className="container mx-auto px-4 py-8">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-foreground mb-2">
                Category Management
              </h2>
              <p className="text-muted-foreground">
                Organize categories and subcategories hierarchically
              </p>
            </div>
            <CreateContact />   {/* ✅ Use correct component */}
          </main>
        </div>
      </AuthGuard>
      <Toaster />
    </>
  )
}