"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, ArrowLeft, ArrowRight } from "lucide-react"
import { getClaimsFromStorage } from "@/lib/utils"
import type { ClaimData } from "@/lib/types"

// Import the ClaimSummary component at the top of the file
import { ClaimSummary } from "@/components/claim-summary"

export default function HistoryPage() {
  const [claims, setClaims] = useState<ClaimData[]>([])
  const [filteredClaims, setFilteredClaims] = useState<ClaimData[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [activeTab, setActiveTab] = useState("all")
  const itemsPerPage = 10

  useEffect(() => {
    const storedClaims = getClaimsFromStorage()
    setClaims(storedClaims)
    setFilteredClaims(storedClaims)
  }, [])

  useEffect(() => {
    let filtered = claims

    // Filter by status if not "all"
    if (activeTab !== "all") {
      filtered = filtered.filter((claim) => claim.status.toLowerCase() === activeTab.toLowerCase())
    }

    // Filter by search query
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (claim) =>
          claim.id.toLowerCase().includes(query) ||
          claim.customerName.toLowerCase().includes(query) ||
          claim.policyNumber.toLowerCase().includes(query),
      )
    }

    setFilteredClaims(filtered)
    setCurrentPage(1)
  }, [searchQuery, claims, activeTab])

  const totalPages = Math.ceil(filteredClaims.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedClaims = filteredClaims.slice(startIndex, startIndex + itemsPerPage)

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "new":
        return "bg-blue-500"
      case "in progress":
        return "bg-yellow-500"
      case "approved":
        return "bg-green-500"
      case "rejected":
        return "bg-red-500"
      case "pending":
        return "bg-orange-500"
      default:
        return "bg-gray-500"
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex flex-col">
        <h1 className="text-3xl font-bold tracking-tight">Claims History</h1>
        <p className="text-muted-foreground">View and manage all registered insurance claims</p>
      </div>

      <div className="mt-8">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <CardTitle>Claims</CardTitle>
              <div className="relative w-full md:w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by ID or name..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </CardHeader>

          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
            <div className="px-6">
              <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent">
                <TabsTrigger
                  value="all"
                  className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none px-4 py-2 bg-transparent"
                >
                  All Claims
                </TabsTrigger>
                <TabsTrigger
                  value="new"
                  className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none px-4 py-2 bg-transparent"
                >
                  New
                </TabsTrigger>
                <TabsTrigger
                  value="in progress"
                  className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none px-4 py-2 bg-transparent"
                >
                  In Progress
                </TabsTrigger>
                <TabsTrigger
                  value="approved"
                  className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none px-4 py-2 bg-transparent"
                >
                  Approved
                </TabsTrigger>
                <TabsTrigger
                  value="rejected"
                  className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none px-4 py-2 bg-transparent"
                >
                  Rejected
                </TabsTrigger>
              </TabsList>
            </div>

            <CardContent className="p-6">
              <TabsContent value="all" className="mt-0">
                <ClaimsTable claims={paginatedClaims} getStatusColor={getStatusColor} formatDate={formatDate} />
              </TabsContent>

              <TabsContent value="new" className="mt-0">
                <ClaimsTable claims={paginatedClaims} getStatusColor={getStatusColor} formatDate={formatDate} />
              </TabsContent>

              <TabsContent value="in progress" className="mt-0">
                <ClaimsTable claims={paginatedClaims} getStatusColor={getStatusColor} formatDate={formatDate} />
              </TabsContent>

              <TabsContent value="approved" className="mt-0">
                <ClaimsTable claims={paginatedClaims} getStatusColor={getStatusColor} formatDate={formatDate} />
              </TabsContent>

              <TabsContent value="rejected" className="mt-0">
                <ClaimsTable claims={paginatedClaims} getStatusColor={getStatusColor} formatDate={formatDate} />
              </TabsContent>

              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6">
                  <p className="text-sm text-muted-foreground">
                    Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredClaims.length)} of{" "}
                    {filteredClaims.length} claims
                  </p>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                    >
                      <ArrowLeft className="h-4 w-4 mr-1" /> Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                    >
                      Next <ArrowRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Tabs>
        </Card>
      </div>
    </div>
  )
}

function ClaimsTable({
  claims,
  getStatusColor,
  formatDate,
}: {
  claims: ClaimData[]
  getStatusColor: (status: string) => string
  formatDate: (date: string) => string
}) {
  if (claims.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No claims found</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b">
            <th className="text-left py-3 px-4 font-medium">Claim ID</th>
            <th className="text-left py-3 px-4 font-medium">Customer</th>
            <th className="text-left py-3 px-4 font-medium">Date</th>
            <th className="text-left py-3 px-4 font-medium">Type</th>
            <th className="text-left py-3 px-4 font-medium">Status</th>
            <th className="text-left py-3 px-4 font-medium">Est. Cost</th>
            <th className="text-right py-3 px-4 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {claims.map((claim) => (
            <tr key={claim.id} className="border-b hover:bg-muted/50">
              <td className="py-3 px-4 font-mono text-sm">{claim.id}</td>
              <td className="py-3 px-4">{claim.customerName}</td>
              <td className="py-3 px-4">{formatDate(claim.createdAt)}</td>
              <td className="py-3 px-4 capitalize">{claim.incidentType}</td>
              <td className="py-3 px-4">
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium text-white ${getStatusColor(claim.status)}`}
                >
                  {claim.status}
                </span>
              </td>
              <td className="py-3 px-4">${claim.damageAssessment?.estimatedCost.toLocaleString() || "N/A"}</td>
              <td className="py-3 px-4 text-right">
                <div className="flex justify-end space-x-2">
                  <ClaimSummary claim={claim} buttonVariant="ghost" buttonSize="sm" />
                  <Link href={`/claims/${claim.id}`}>
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </Link>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
