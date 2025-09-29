import jsPDF from "jspdf"
import type { Voucher } from "./firestore"


export const generateVoucherPDF = (voucher: Voucher, userInfo: { name?: string; email?: string }) => {
  console.log("[v0] Generating PDF for voucher:", voucher.voucherNumber)

  const doc = new jsPDF()

  // Set up colors
  const primaryColor = [21, 128, 61] // Green
  const secondaryColor = [107, 114, 128] // Gray
  const textColor = [17, 24, 39] // Dark gray

  // Header
  doc.setFillColor(...primaryColor)
  doc.rect(0, 0, 210, 30, "F")

  doc.setTextColor(255, 255, 255)
  doc.setFontSize(24)
  doc.setFont("helvetica", "bold")
  doc.text("EXPENSE TRACKER", 20, 20)

  doc.setFontSize(12)
  doc.setFont("helvetica", "normal")
  doc.text("Transaction Voucher", 150, 20)

  // Voucher details
  doc.setTextColor(...textColor)
  doc.setFontSize(16)
  doc.setFont("helvetica", "bold")
  doc.text("VOUCHER DETAILS", 20, 50)

  // Draw line
  doc.setDrawColor(...primaryColor)
  doc.setLineWidth(0.5)
  doc.line(20, 55, 190, 55)

  // Voucher info
  doc.setFontSize(10)
  doc.setFont("helvetica", "normal")

  const details = [
    ["Voucher Number:", voucher.voucherNumber],
    ["Date:", voucher.date.toLocaleDateString()],
    ["Type:", voucher.type.toUpperCase()],
    ["Status:", voucher.status.toUpperCase()],
  ]

  let yPos = 70
  details.forEach(([label, value]) => {
    doc.setFont("helvetica", "bold")
    doc.text(label, 20, yPos)
    doc.setFont("helvetica", "normal")
    doc.text(value, 70, yPos)
    yPos += 8
  })

  // Transaction details
  doc.setFontSize(16)
  doc.setFont("helvetica", "bold")
  doc.text("TRANSACTION DETAILS", 20, yPos + 15)

  doc.setDrawColor(...primaryColor)
  doc.line(20, yPos + 20, 190, yPos + 20)

  yPos += 35

  // Transaction info
  doc.setFontSize(12)
  doc.setFont("helvetica", "bold")
  doc.text("Title:", 20, yPos)
  doc.setFont("helvetica", "normal")
  doc.text(voucher.title, 20, yPos + 8)

  yPos += 20

  doc.setFont("helvetica", "bold")
  doc.text("Description:", 20, yPos)
  doc.setFont("helvetica", "normal")

  // Handle long descriptions
  const splitDescription = doc.splitTextToSize(voucher.description, 150)
  doc.text(splitDescription, 20, yPos + 8)

  yPos += 8 + splitDescription.length * 6

  doc.setFont("helvetica", "bold")
  doc.text("Category:", 20, yPos)
  doc.setFont("helvetica", "normal")
  doc.text(voucher.category.toUpperCase(), 70, yPos)

  yPos += 15

  // Amount box
  doc.setFillColor(248, 250, 252)
  doc.rect(20, yPos, 170, 25, "F")
  doc.setDrawColor(...primaryColor)
  doc.rect(20, yPos, 170, 25)

  doc.setFontSize(14)
  doc.setFont("helvetica", "bold")
  doc.text("AMOUNT:", 25, yPos + 10)

  const amountText = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(voucher.amount)

  doc.setFontSize(18)
  doc.setTextColor(...primaryColor)
  doc.text(amountText, 25, yPos + 20)

  // Footer
  yPos += 50
  doc.setTextColor(...secondaryColor)
  doc.setFontSize(8)
  doc.setFont("helvetica", "normal")

  if (userInfo.name || userInfo.email) {
    doc.text("Generated for:", 20, yPos)
    if (userInfo.name) {
      doc.text(userInfo.name, 20, yPos + 5)
    }
    if (userInfo.email) {
      doc.text(userInfo.email, 20, yPos + 10)
    }
  }

  doc.text(`Generated on: ${new Date().toLocaleString()}`, 20, yPos + 20)
  doc.text("This is a computer-generated voucher and does not require a signature.", 20, yPos + 25)

  // Watermark
  // doc.setTextColor(240, 240, 240)
  // doc.setFontSize(60)
  // doc.setFont("helvetica", "bold")
  // doc.text("EXPENSE TRACKER", 105, 150, { angle: 45, align: "center" })

  console.log("[v0] PDF generation completed")
  return doc
}

export const downloadVoucherPDF = async (voucher: Voucher, userInfo: { name?: string; email?: string }) => {
  try {
    console.log("[v0] Starting PDF download process")
    const doc = generateVoucherPDF(voucher, userInfo)
    const fileName = `voucher-${voucher.voucherNumber}.pdf`

    console.log("[v0] Saving PDF with filename:", fileName)
    doc.save(fileName)
    console.log("[v0] PDF save completed")
  } catch (error) {
    console.error("[v0] Error in downloadVoucherPDF:", error)
    throw error
  }
}

export const getVoucherPDFBlob = (voucher: Voucher, userInfo: { name?: string; email?: string }) => {
  const doc = generateVoucherPDF(voucher, userInfo)
  return doc.output("blob")
}
