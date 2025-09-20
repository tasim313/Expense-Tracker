"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from "@/hooks/use-auth"
import { useToast } from "@/hooks/use-toast"
import { subscribeToUserVouchers, deleteVoucher, type Voucher } from "@/lib/firestore"
import { VoucherForm } from "./voucher-form"
import { VoucherCard } from "./voucher-card"
import { Plus, Search, FileText } from "lucide-react"

export function VouchersList() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [vouchers, setVouchers] = useState<Voucher[]>([])
  const [filteredVouchers, setFilteredVouchers] = useState<Voucher[]>([])
  const [loading, setLoading] = useState(true)
  const [formOpen, setFormOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")

  useEffect(() => {
    if (!user) return

    const unsubscribe = subscribeToUserVouchers(user.uid, (userVouchers) => {
      setVouchers(userVouchers)
      setLoading(false)
    })

    return unsubscribe
  }, [user])

  useEffect(() => {
    let filtered = vouchers

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (voucher) =>
          voucher.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          voucher.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          voucher.voucherNumber.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Type filter
    if (typeFilter !== "all") {
      filtered = filtered.filter((voucher) => voucher.type === typeFilter)
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((voucher) => voucher.status === statusFilter)
    }

    setFilteredVouchers(filtered)
  }, [vouchers, searchTerm, typeFilter, statusFilter])

  const handleDelete = async (id: string) => {
    try {
      await deleteVoucher(id)
      toast({
        title: "Voucher deleted",
        description: "The voucher has been removed.",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading vouchers...</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Vouchers</h2>
            <p className="text-muted-foreground">Generate and manage transaction vouchers</p>
          </div>
          <Button onClick={() => setFormOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create Voucher
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search vouchers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="expense">Expense</SelectItem>
                  <SelectItem value="income">Income</SelectItem>
                  <SelectItem value="loan">Loan</SelectItem>
                  <SelectItem value="settlement">Settlement</SelectItem>
                  <SelectItem value="goal_contribution">Goal Contribution</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="void">Void</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("")
                  setTypeFilter("all")
                  setStatusFilter("all")
                }}
              >
                Clear Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Vouchers Grid */}
        {filteredVouchers.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {vouchers.length === 0 ? "No vouchers yet" : "No vouchers match your filters"}
              </h3>
              <p className="text-muted-foreground mb-4">
                {vouchers.length === 0
                  ? "Create your first voucher to start tracking transactions"
                  : "Try adjusting your search or filter criteria"}
              </p>
              {vouchers.length === 0 && (
                <Button onClick={() => setFormOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Your First Voucher
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredVouchers.map((voucher) => (
              <VoucherCard key={voucher.id} voucher={voucher} onDelete={handleDelete} />
            ))}
          </div>
        )}
      </div>

      <VoucherForm
        open={formOpen}
        onOpenChange={setFormOpen}
        onSuccess={() => {
          // Refresh handled by real-time listener
        }}
      />
    </>
  )
}
