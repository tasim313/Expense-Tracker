"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Home, CreditCard, Target, FileText, BarChart3 } from "lucide-react"

const navItems = [
  { href: "/", label: "Dashboard", icon: Home },
  { href: "/expenses", label: "Expenses", icon: CreditCard },
  { href: "/goals", label: "Goals", icon: Target },
  { href: "/vouchers", label: "Vouchers", icon: FileText },
  { href: "/reports", label: "Reports", icon: BarChart3 },
]

export function Navigation() {
  const pathname = usePathname()

  return (
    <nav className="flex space-x-1 bg-muted p-1 rounded-lg">
      {navItems.map((item) => {
        const Icon = item.icon
        const isActive = pathname === item.href

        return (
          <Link key={item.href} href={item.href}>
            <Button variant={isActive ? "default" : "ghost"} size="sm" className="flex items-center space-x-2">
              <Icon className="h-4 w-4" />
              <span className="hidden sm:inline">{item.label}</span>
            </Button>
          </Link>
        )
      })}
    </nav>
  )
}
