"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertCircle, CheckCircle2, Clock, LogOut, XCircle } from "lucide-react"
import { getClaimById, updateClaimStatus } from "@/lib/utils"
import type { ClaimData } from "@/lib/types"

export default function AdminPage() {
  const router = useRouter()
  const [claims, setClaims] = useState<ClaimData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchClaims = async () => {
      try {
        const response = await fetch('/api/claims')
        const data = await response.json()
        setClaims(data.claims)
      } catch (error) {
        console.error('Error fetching claims:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchClaims()
  }, [])

  const handleStatusChange = async (claimId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/claims/${claimId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: newStatus,
          actionBy: 'admin',
          notes: `Status changed to ${newStatus}`
        })
      })

      if (!response.ok) {
        throw new Error('Failed to update status')
      }

      const { claim: updatedClaim } = await response.json()
      if (updatedClaim) {
        setClaims(prevClaims => 
          prevClaims.map(claim => 
            claim.id === claimId ? updatedClaim : claim
          )
        )
      }
    } catch (error) {
      console.error('Error updating claim status:', error)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "new":
        return <AlertCircle className="h-5 w-5 text-blue-500" />
      case "in progress":
        return <Clock className="h-5 w-5 text-yellow-500" />
      case "approved":
        return <CheckCircle2 className="h-5 w-5 text-green-500" />
      case "rejected":
        return <XCircle className="h-5 w-5 text-red-500" />
      default:
        return <Clock className="h-5 w-5 text-gray-500" />
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 bg-gray-200 rounded"></div>
          <div className="h-4 w-64 bg-gray-200 rounded"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage all insurance claims and their statuses</p>
        </div>
        <Button
          variant="outline"
          onClick={async () => {
            try {
              await fetch('/api/auth/logout', { method: 'POST' })
              router.push('/login')
              router.refresh()
            } catch (error) {
              console.error('Logout error:', error)
            }
          }}
          className="flex items-center gap-2"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all">All Claims</TabsTrigger>
          <TabsTrigger value="new">New</TabsTrigger>
          <TabsTrigger value="in-progress">In Progress</TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {claims.map((claim) => (
            <Card key={claim.id} className="overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-xl font-semibold">
                  {claim.customerName} - #{claim.id}
                </CardTitle>
                <div className="flex items-center space-x-2">
                  {getStatusIcon(claim.status)}
                  <Badge variant="outline">{claim.status}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Policy Number</p>
                    <p className="text-base font-semibold">{claim.policyNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Incident Type</p>
                    <p className="text-base font-semibold capitalize">{claim.incidentType}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Vehicle</p>
                    <p className="text-base font-semibold">{claim.vehicleBrand}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Estimated Cost</p>
                    <p className="text-base font-semibold text-green-600">
                      ${claim.estimatedCost?.toLocaleString() || 'N/A'}
                    </p>
                  </div>
                </div>
                <div className="mt-4 flex space-x-2">
                  <Button
                    size="sm"
                    variant={claim.status === 'in_progress' ? 'default' : 'outline'}
                    onClick={() => handleStatusChange(claim.id, 'in progress')}
                  >
                    Mark In Progress
                  </Button>
                  <Button
                    size="sm"
                    variant={claim.status === 'approved' ? 'default' : 'outline'}
                    onClick={() => handleStatusChange(claim.id, 'approved')}
                  >
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant={claim.status === 'rejected' ? 'destructive' : 'outline'}
                    onClick={() => handleStatusChange(claim.id, 'rejected')}
                  >
                    Reject
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {['new', 'in-progress', 'approved', 'rejected'].map((status) => (
          <TabsContent key={status} value={status} className="space-y-4">
            {claims
              .filter((claim) => 
                claim.status.toLowerCase() === status.replace('-', ' ')
              )
              .map((claim) => (
                <Card key={claim.id} className="overflow-hidden">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0">
                    <CardTitle className="text-xl font-semibold">
                      {claim.customerName} - #{claim.id}
                    </CardTitle>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(claim.status)}
                      <Badge variant="outline">{claim.status}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Policy Number</p>
                        <p className="text-base font-semibold">{claim.policyNumber}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Incident Type</p>
                        <p className="text-base font-semibold capitalize">{claim.incidentType}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Vehicle</p>
                        <p className="text-base font-semibold">{claim.vehicleBrand}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Estimated Cost</p>
                        <p className="text-base font-semibold text-green-600">
                          ${claim.estimatedCost?.toLocaleString() || 'N/A'}
                        </p>
                      </div>
                    </div>
                    <div className="mt-4 flex space-x-2">
                      <Button
                        size="sm"
                        variant={claim.status === 'in_progress' ? 'default' : 'outline'}
                        onClick={() => handleStatusChange(claim.id, 'in progress')}
                      >
                        Mark In Progress
                      </Button>
                      <Button
                        size="sm"
                        variant={claim.status === 'approved' ? 'default' : 'outline'}
                        onClick={() => handleStatusChange(claim.id, 'approved')}
                      >
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant={claim.status === 'rejected' ? 'destructive' : 'outline'}
                        onClick={() => handleStatusChange(claim.id, 'rejected')}
                      >
                        Reject
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}