"use client";

import { useState, useEffect } from "react";
import {
  Check,
  Download,
  Filter,
  Loader2,
  Search,
  X,
  Upload,
} from "lucide-react";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

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
];

export function AdminDashboard() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [buildingFilter, setBuildingFilter] = useState("all");
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  const [recentImports, setRecentImports] = useState<any[]>([]);
  const [importLoading, setImportLoading] = useState(true);
  const [residentCount, setResidentCount] = useState<number | null>(null);

  // Fetch recent imports and resident counts
  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch recent imports
        const { data: imports, error: importsError } = await supabase
          .from("import_logs")
          .select(
            `
            id, 
            file_name, 
            record_count, 
            success_count, 
            error_count, 
            created_at,
            buildings(name)
          `
          )
          .order("created_at", { ascending: false })
          .limit(5);

        if (importsError) {
          console.error("Error fetching import logs:", importsError);
        } else {
          setRecentImports(imports || []);
        }

        // Fetch total resident count
        const { count, error: countError } = await supabase
          .from("residents")
          .select("*", { count: "exact", head: true })
          .eq("is_active", true);

        if (countError) {
          console.error("Error fetching resident count:", countError);
        } else {
          setResidentCount(count);
        }
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
      } finally {
        setImportLoading(false);
      }
    }

    fetchData();
  }, []);

  // Filter verifications based on search term and filters
  const filteredVerifications = mockVerifications.filter((verification) => {
    const matchesSearch =
      verification.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      verification.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      verification.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      verification.minecraftUsername
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || verification.status === statusFilter;
    const matchesBuilding =
      buildingFilter === "all" ||
      verification.building
        .toLowerCase()
        .includes(buildingFilter.toLowerCase());

    return matchesSearch && matchesStatus && matchesBuilding;
  });

  const handleApprove = async (id: string) => {
    setIsProcessing(id);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsProcessing(null);
    // In a real implementation, you would update the verification status
  };

  const handleReject = async (id: string) => {
    setIsProcessing(id);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsProcessing(null);
    // In a real implementation, you would update the verification status
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Residents
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {residentCount ?? "Loading..."}
            </div>
            <p className="text-xs text-muted-foreground">
              Active residents across all buildings
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Verifications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mockVerifications.filter((v) => v.status === "pending").length}
            </div>
            <p className="text-xs text-muted-foreground">Awaiting review</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Approved Players
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mockVerifications.filter((v) => v.status === "approved").length}
            </div>
            <p className="text-xs text-muted-foreground">
              Active Minecraft players
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Resident Import
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mt-1">
              <Link href="/admin/import">
                <Button size="sm" className="w-full">
                  <Upload className="mr-2 h-4 w-4" />
                  Import Residents
                </Button>
              </Link>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Upload resident data
            </p>
          </CardContent>
        </Card>
      </div>

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
            verifications={filteredVerifications.filter(
              (v) => v.status === "pending"
            )}
            isProcessing={isProcessing}
            onApprove={handleApprove}
            onReject={handleReject}
          />
        </TabsContent>

        <TabsContent value="approved" className="mt-4">
          <VerificationTable
            verifications={filteredVerifications.filter(
              (v) => v.status === "approved"
            )}
            isProcessing={isProcessing}
            onApprove={handleApprove}
            onReject={handleReject}
          />
        </TabsContent>

        <TabsContent value="rejected" className="mt-4">
          <VerificationTable
            verifications={filteredVerifications.filter(
              (v) => v.status === "rejected"
            )}
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
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle>Recent Resident Imports</CardTitle>
          <CardDescription>Latest resident data imports</CardDescription>
        </CardHeader>
        <CardContent>
          {importLoading ? (
            <div className="flex items-center justify-center p-4">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              <span>Loading import history...</span>
            </div>
          ) : recentImports.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Building</TableHead>
                    <TableHead>Records</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentImports.map((importLog) => (
                    <TableRow key={importLog.id}>
                      <TableCell>
                        {new Date(importLog.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {importLog.buildings?.name || "Unknown"}
                      </TableCell>
                      <TableCell>
                        {importLog.success_count} / {importLog.record_count}
                      </TableCell>
                      <TableCell>
                        {importLog.error_count > 0 ? (
                          <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800">
                            {importLog.error_count} errors
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                            Success
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="p-2 text-center border-t">
                <Link
                  href="/admin/import"
                  className="text-sm text-blue-600 hover:underline"
                >
                  View all imports
                </Link>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-4 text-gray-500">
              <p>No import history available</p>
              <Link href="/admin/import" className="mt-2">
                <Button size="sm" variant="outline">
                  <Upload className="mr-2 h-4 w-4" />
                  Import Residents
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

interface VerificationTableProps {
  verifications: typeof mockVerifications;
  isProcessing: string | null;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}

function VerificationTable({
  verifications,
  isProcessing,
  onApprove,
  onReject,
}: VerificationTableProps) {
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
                    {verification.status.charAt(0).toUpperCase() +
                      verification.status.slice(1)}
                  </span>
                </TableCell>
                <TableCell>
                  {new Date(verification.submittedAt).toLocaleDateString()}
                </TableCell>
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
  );
}
