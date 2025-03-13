"use client"

import { useState } from "react"
import { Check, Download, Filter, Loader2, Search, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Mock data for demonstration
const mockVerifications = [
  {
    id: "1",
    firstName: "John",
    lastName: "Doe",
    building: "FOUND Central",
    roomNumber: "101A",
    discordUsername: "johndoe",
    minecraftUsername: "MinecraftJohn",
    email: "john.doe@example.com",
    status: "pending",
    submittedAt: "2025-03-10T15:30:00Z",
  },
  {
    id: "2",
    firstName: "Jane",
    lastName: "Smith",
    building: "FOUND Downtown",
    roomNumber: "203B",
    discordUsername: "janesmith",
    minecraftUsername: "MCJaneSmith",
    email: "jane.smith@example.com",
    status: "approved",
    submittedAt: "2025-03-09T12:15:00Z",
  },
  {
    id: "3",
    firstName: "Alex",
    lastName: "Johnson",
    building: "FOUND Riverside",
    roomNumber: "305C",
    discordUsername: "alexj",
    minecraftUsername: "AlexCraft",
    email: "alex.johnson@example.com",
    status: "rejected",
    submittedAt: "2025-03-08T09:45:00Z",
  },
  {
    id: "4",
    firstName: "Sarah",
    lastName: "Williams",
    building: "FOUND Uptown",
    roomNumber: "407D",
    discordUsername: "sarahw",
    minecraftUsername: "SarahMC",
    email: "sarah.williams@example.com",
    status: "pending",
    submittedAt: "2025-03-11T10:20:00Z",
  },
  {
    id: "5",
    firstName: "Michael",
    lastName: "Brown",
    building: "FOUND Central",
    roomNumber: "102A",
    discordUsername: "michaelb",
    minecraftUsername: "MikeCraft",
    email: "michael.brown@example.com",
    status: "approved",
    submittedAt: "2025-03-07T14:50:00Z",
  },
]

export function AdminDashboard() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [buildingFilter, setBuildingFilter] = useState("all")
  const [isProcessing, setIsProcessing] = useState<string | null>(null)

  // Filter verifications based on search term and filters
  const filteredVerifications = mockVerifications.filter((verification) => {
    const matchesSearch =
      verification.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      verification.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      verification.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      verification.minecraftUsername.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || verification.status === statusFilter
    const matchesBuilding =
      buildingFilter === "all" || verification.building.toLowerCase().includes(buildingFilter.toLowerCase())

    return matchesSearch && matchesStatus && matchesBuilding
  })

  const handleApprove = async (id: string) => {
    setIsProcessing(id)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))
    setIsProcessing(null)
    // In a real implementation, you would update the verification status
  }

  const handleReject = async (id: string) => {
    setIsProcessing(id)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))
    setIsProcessing(null)
    // In a real implementation, you would update the verification status
  }

  return (
    <Tabs defaultValue="pending">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <TabsList>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
          <TabsTrigger value="all">All Requests</TabsTrigger>
        </TabsList>

        <div className="flex flex-wrap gap-2">
          <div className="relative w-full md:w-auto">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search..."
              className="w-full pl-8 md:w-[200px]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <Select value={buildingFilter} onValueChange={setBuildingFilter}>
            <SelectTrigger className="w-full md:w-[180px]">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Filter by building" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Buildings</SelectItem>
              <SelectItem value="central">FOUND Central</SelectItem>
              <SelectItem value="downtown">FOUND Downtown</SelectItem>
              <SelectItem value="riverside">FOUND Riverside</SelectItem>
              <SelectItem value="uptown">FOUND Uptown</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" size="icon">
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <TabsContent value="pending" className="mt-4">
        <VerificationTable
          verifications={filteredVerifications.filter((v) => v.status === "pending")}
          isProcessing={isProcessing}
          onApprove={handleApprove}
          onReject={handleReject}
        />
      </TabsContent>

      <TabsContent value="approved" className="mt-4">
        <VerificationTable
          verifications={filteredVerifications.filter((v) => v.status === "approved")}
          isProcessing={isProcessing}
          onApprove={handleApprove}
          onReject={handleReject}
        />
      </TabsContent>

      <TabsContent value="rejected" className="mt-4">
        <VerificationTable
          verifications={filteredVerifications.filter((v) => v.status === "rejected")}
          isProcessing={isProcessing}
          onApprove={handleApprove}
          onReject={handleReject}
        />
      </TabsContent>

      <TabsContent value="all" className="mt-4">
        <VerificationTable
          verifications={filteredVerifications}
          isProcessing={isProcessing}
          onApprove={handleApprove}
          onReject={handleReject}
        />
      </TabsContent>

      <div className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Verification Statistics</CardTitle>
            <CardDescription>Overview of verification requests</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-lg border p-3">
                <div className="text-sm font-medium text-muted-foreground">Total Requests</div>
                <div className="text-2xl font-bold">{mockVerifications.length}</div>
              </div>
              <div className="rounded-lg border p-3">
                <div className="text-sm font-medium text-muted-foreground">Pending</div>
                <div className="text-2xl font-bold">
                  {mockVerifications.filter((v) => v.status === "pending").length}
                </div>
              </div>
              <div className="rounded-lg border p-3">
                <div className="text-sm font-medium text-muted-foreground">Approved</div>
                <div className="text-2xl font-bold">
                  {mockVerifications.filter((v) => v.status === "approved").length}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Tabs>
  )
}

interface VerificationTableProps {
  verifications: typeof mockVerifications
  isProcessing: string | null
  onApprove: (id: string) => void
  onReject: (id: string) => void
}

function VerificationTable({ verifications, isProcessing, onApprove, onReject }: VerificationTableProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Building</TableHead>
            <TableHead>Room</TableHead>
            <TableHead>Minecraft Username</TableHead>
            <TableHead>Discord</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Date</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {verifications.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="h-24 text-center">
                No verification requests found.
              </TableCell>
            </TableRow>
          ) : (
            verifications.map((verification) => (
              <TableRow key={verification.id}>
                <TableCell className="font-medium">
                  {verification.firstName} {verification.lastName}
                </TableCell>
                <TableCell>{verification.building}</TableCell>
                <TableCell>{verification.roomNumber}</TableCell>
                <TableCell>{verification.minecraftUsername}</TableCell>
                <TableCell>{verification.discordUsername}</TableCell>
                <TableCell>
                  <span
                    className={
                      verification.status === "approved"
                        ? "inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800"
                        : verification.status === "rejected"
                          ? "inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800"
                          : "inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800"
                    }
                  >
                    {verification.status.charAt(0).toUpperCase() + verification.status.slice(1)}
                  </span>
                </TableCell>
                <TableCell>{new Date(verification.submittedAt).toLocaleDateString()}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    {verification.status === "pending" && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onApprove(verification.id)}
                          disabled={isProcessing === verification.id}
                        >
                          {isProcessing === verification.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Check className="h-4 w-4 text-green-600" />
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onReject(verification.id)}
                          disabled={isProcessing === verification.id}
                        >
                          {isProcessing === verification.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <X className="h-4 w-4 text-red-600" />
                          )}
                        </Button>
                      </>
                    )}
                    {verification.status === "rejected" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onApprove(verification.id)}
                        disabled={isProcessing === verification.id}
                      >
                        {isProcessing === verification.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Check className="h-4 w-4 text-green-600" />
                        )}
                      </Button>
                    )}
                    {verification.status === "approved" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onReject(verification.id)}
                        disabled={isProcessing === verification.id}
                      >
                        {isProcessing === verification.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <X className="h-4 w-4 text-red-600" />
                        )}
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}

