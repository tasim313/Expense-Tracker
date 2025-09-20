"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Download, FileText, FileSpreadsheet } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import type { ReportData } from "@/lib/firestore"
import type { DateRange } from "react-day-picker"
import { format } from "date-fns"

interface ExportReportsProps {
  reportData: ReportData
  dateRange?: DateRange
}

export function ExportReports({ reportData, dateRange }: ExportReportsProps) {
  const [exporting, setExporting] = useState(false)
  const { toast } = useToast()

  const exportToPDF = async () => {
    setExporting(true)
    try {
      // Import jsPDF dynamically
      const { jsPDF } = await import("jspdf")
      const doc = new jsPDF()

      // Title
      doc.setFontSize(20)
      doc.text("Financial Report", 20, 30)

      // Date range
      if (dateRange?.from) {
        doc.setFontSize(12)
        const dateText = dateRange.to
          ? `${format(dateRange.from, "MMM dd, yyyy")} - ${format(dateRange.to, "MMM dd, yyyy")}`
          : `From ${format(dateRange.from, "MMM dd, yyyy")}`
        doc.text(dateText, 20, 45)
      }

      // Summary
      doc.setFontSize(16)
      doc.text("Summary", 20, 65)
      doc.setFontSize(12)
      doc.text(`Total Income: $${reportData.totalIncome.toFixed(2)}`, 20, 80)
      doc.text(`Total Expenses: $${reportData.totalExpenses.toFixed(2)}`, 20, 95)
      doc.text(`Net Income: $${reportData.netIncome.toFixed(2)}`, 20, 110)

      // Expense breakdown
      if (reportData.expensesByCategory.length > 0) {
        doc.setFontSize(16)
        doc.text("Expense Breakdown", 20, 135)
        doc.setFontSize(12)
        let yPos = 150
        reportData.expensesByCategory.forEach((category) => {
          doc.text(`${category.category}: $${category.amount.toFixed(2)} (${category.count} transactions)`, 20, yPos)
          yPos += 15
        })
      }

      doc.save(`financial-report-${Date.now()}.pdf`)

      toast({
        title: "Export Successful",
        description: "Report has been exported to PDF",
      })
    } catch (error) {
      console.error("Error exporting PDF:", error)
      toast({
        title: "Export Failed",
        description: "Failed to export report to PDF",
        variant: "destructive",
      })
    } finally {
      setExporting(false)
    }
  }

  const exportToCSV = () => {
    setExporting(true)
    try {
      // Create CSV content
      let csvContent = "Financial Report\n\n"

      if (dateRange?.from) {
        const dateText = dateRange.to
          ? `${format(dateRange.from, "MMM dd, yyyy")} - ${format(dateRange.to, "MMM dd, yyyy")}`
          : `From ${format(dateRange.from, "MMM dd, yyyy")}`
        csvContent += `Period: ${dateText}\n\n`
      }

      csvContent += "Summary\n"
      csvContent += `Total Income,$${reportData.totalIncome.toFixed(2)}\n`
      csvContent += `Total Expenses,$${reportData.totalExpenses.toFixed(2)}\n`
      csvContent += `Net Income,$${reportData.netIncome.toFixed(2)}\n\n`

      if (reportData.expensesByCategory.length > 0) {
        csvContent += "Expense Breakdown\n"
        csvContent += "Category,Amount,Transactions\n"
        reportData.expensesByCategory.forEach((category) => {
          csvContent += `${category.category},$${category.amount.toFixed(2)},${category.count}\n`
        })
      }

      // Download CSV
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
      const link = document.createElement("a")
      const url = URL.createObjectURL(blob)
      link.setAttribute("href", url)
      link.setAttribute("download", `financial-report-${Date.now()}.csv`)
      link.style.visibility = "hidden"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      toast({
        title: "Export Successful",
        description: "Report has been exported to CSV",
      })
    } catch (error) {
      console.error("Error exporting CSV:", error)
      toast({
        title: "Export Failed",
        description: "Failed to export report to CSV",
        variant: "destructive",
      })
    } finally {
      setExporting(false)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" disabled={exporting}>
          <Download className="h-4 w-4 mr-2" />
          {exporting ? "Exporting..." : "Export"}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={exportToPDF}>
          <FileText className="h-4 w-4 mr-2" />
          Export as PDF
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportToCSV}>
          <FileSpreadsheet className="h-4 w-4 mr-2" />
          Export as CSV
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
