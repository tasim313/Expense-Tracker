"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useAuth } from "@/hooks/use-auth"
import { useToast } from "@/hooks/use-toast"
import { expenseCategories, type Voucher } from "@/lib/firestore"
import { downloadVoucherPDF } from "@/lib/pdf-generator"
import { MoreHorizontal, Download, Trash2, FileText } from "lucide-react"
import { format } from "date-fns"
import { useState } from "react"

interface VoucherCardProps {
  voucher: Voucher
  onDelete: (id: string) => void
}

export function VoucherCard({ voucher, onDelete }: VoucherCardProps) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [isDownloading, setIsDownloading] = useState(false)

  const categoryInfo =
    expenseCategories.find((cat) => cat.id === voucher.category) || expenseCategories[expenseCategories.length - 1]

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "income":
        return "bg-green-500"
      case "expense":
        return "bg-red-500"
      case "loan":
        return "bg-blue-500"
      case "settlement":
        return "bg-purple-500"
      case "goal_contribution":
        return "bg-orange-500"
      default:
        return "bg-gray-500"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "default"
      case "void":
        return "destructive"
      default:
        return "secondary"
    }
  }

  const handleDownloadPDF = async () => {
    if (isDownloading) return

    setIsDownloading(true)
    console.log("[v0] Starting PDF download for voucher:", voucher.voucherNumber)

    try {
      // Validate voucher data
      if (!voucher.title || !voucher.amount || !voucher.date) {
        throw new Error("Voucher data is incomplete")
      }

      const userInfo = {
        name: user?.displayName || "Unknown User",
        email: user?.email || "No email provided",
      }

      console.log("[v0] User info for PDF:", userInfo)
      console.log("[v0] Voucher data:", {
        title: voucher.title,
        amount: voucher.amount,
        date: voucher.date,
        voucherNumber: voucher.voucherNumber,
      })

      // Call the download function
      await downloadVoucherPDF(voucher, userInfo)

      console.log("[v0] PDF download completed successfully")
      toast({
        title: "PDF Downloaded",
        description: `Voucher ${voucher.voucherNumber} has been downloaded successfully.`,
      })
    } catch (error: any) {
      console.error("[v0] PDF download error:", error)
      toast({
        title: "Download Failed",
        description: error.message || "Failed to download PDF. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <Card className="relative overflow-hidden">
      <div className={`absolute top-0 left-0 w-1 h-full ${getTypeColor(voucher.type)}`} />
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-muted rounded-lg">
              <FileText className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <CardTitle className="text-lg">{voucher.title}</CardTitle>
              <CardDescription className="text-sm">{voucher.voucherNumber}</CardDescription>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant={getStatusColor(voucher.status)}>{voucher.status}</Badge>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0" disabled={isDownloading}>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleDownloadPDF} disabled={isDownloading}>
                  <Download className="mr-2 h-4 w-4" />
                  {isDownloading ? "Downloading..." : "Download PDF"}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => voucher.id && onDelete(voucher.id)} className="text-red-600">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">Description</p>
          <p className="text-sm">{voucher.description}</p>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Category</p>
            <div className="flex items-center space-x-2">
              <span>{categoryInfo.icon}</span>
              <span>{categoryInfo.name}</span>
            </div>
          </div>
          <div>
            <p className="text-muted-foreground">Type</p>
            <Badge variant="outline" className="text-xs">
              {voucher.type.replace("_", " ").toUpperCase()}
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Date</p>
            <p className="font-semibold">{format(voucher.date, "MMM dd, yyyy")}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Amount</p>
            <p className={`font-semibold text-lg ${voucher.type === "income" ? "text-green-600" : "text-red-600"}`}>
              {formatCurrency(voucher.amount)}
            </p>
          </div>
        </div>

        <div className="pt-2 border-t">
          <Button onClick={handleDownloadPDF} className="w-full" size="sm" disabled={isDownloading}>
            <Download className="mr-2 h-4 w-4" />
            {isDownloading ? "Downloading PDF..." : "Download PDF"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
