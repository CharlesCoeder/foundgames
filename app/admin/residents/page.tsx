"use client";

import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { Building, Download, Filter, Loader2, Search } from "lucide-react";
import Link from "next/link";

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

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function ResidentsPage() {
  const [residents, setResidents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [buildingFilter, setBuildingFilter] = useState("all");
  const [buildings, setBuildings] = useState<{ id: string; name: string }[]>(
    []
  );
  const [activeFilter, setActiveFilter] = useState("active");

  // Fetch buildings and residents on component mount
  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch buildings
        const { data: buildingsData, error: buildingsError } = await supabase
          .from("buildings")
          .select("id, name")
          .order("name");

        if (buildingsError) {
          throw buildingsError;
        }

        setBuildings(buildingsData || []);

        // Fetch residents with building info
        const { data: residentsData, error: residentsError } = await supabase
          .from("residents")
          .select(
            `
            id, 
            full_name, 
            room_number, 
            is_active,
            move_in_date,
            move_out_date,
            buildings(id, name)
          `
          )
          .order("full_name");

        if (residentsError) {
          throw residentsError;
        }

        setResidents(residentsData || []);
      } catch (err: any) {
        setError(err.message || "Failed to fetch data");
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, []);

  // Filter residents based on search term and filters
  const filteredResidents = residents.filter((resident) => {
    // Search filter
    const matchesSearch =
      resident.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resident.room_number.toLowerCase().includes(searchTerm.toLowerCase());

    // Building filter
    const matchesBuilding =
      buildingFilter === "all" || resident.buildings?.id === buildingFilter;

    // Active status filter
    const matchesActive =
      activeFilter === "all" ||
      (activeFilter === "active" && resident.is_active) ||
      (activeFilter === "inactive" && !resident.is_active);

    return matchesSearch && matchesBuilding && matchesActive;
  });

  // Handle export to CSV
  const exportToCSV = () => {
    // Create CSV content
    const headers = [
      "Name",
      "Building",
      "Room",
      "Status",
      "Move In Date",
      "Move Out Date",
    ];

    const csvContent = [
      headers.join(","),
      ...filteredResidents.map((resident) =>
        [
          `"${resident.full_name}"`,
          `"${resident.buildings?.name || "Unknown"}"`,
          `"${resident.room_number}"`,
          resident.is_active ? "Active" : "Inactive",
          resident.move_in_date || "",
          resident.move_out_date || "",
        ].join(",")
      ),
    ].join("\n");

    // Create download link
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `residents-${new Date().toISOString().split("T")[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h1 className="text-2xl font-bold mb-4 md:mb-0">Residents</h1>

        <div className="flex flex-col md:flex-row gap-2">
          <Link href="/admin/import">
            <Button size="sm" className="w-full md:w-auto">
              <Loader2 className="mr-2 h-4 w-4" />
              Import Residents
            </Button>
          </Link>

          <Button variant="outline" size="sm" onClick={exportToCSV}>
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Resident Database</CardTitle>
          <CardDescription>
            View and filter resident information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or room..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <Select value={buildingFilter} onValueChange={setBuildingFilter}>
              <SelectTrigger className="w-full md:w-[200px]">
                <Building className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Filter by building" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Buildings</SelectItem>
                {buildings.map((building) => (
                  <SelectItem key={building.id} value={building.id}>
                    {building.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={activeFilter} onValueChange={setActiveFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Residents</SelectItem>
                <SelectItem value="active">Active Only</SelectItem>
                <SelectItem value="inactive">Inactive Only</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center h-48">
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              <span>Loading residents...</span>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Building</TableHead>
                    <TableHead>Room</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Move In</TableHead>
                    <TableHead>Move Out</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredResidents.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center">
                        No residents found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredResidents.map((resident) => (
                      <TableRow key={resident.id}>
                        <TableCell className="font-medium">
                          {resident.full_name}
                        </TableCell>
                        <TableCell>
                          {resident.buildings?.name || "Unknown"}
                        </TableCell>
                        <TableCell>{resident.room_number}</TableCell>
                        <TableCell>
                          <span
                            className={
                              resident.is_active
                                ? "inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800"
                                : "inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800"
                            }
                          >
                            {resident.is_active ? "Active" : "Inactive"}
                          </span>
                        </TableCell>
                        <TableCell>
                          {resident.move_in_date
                            ? new Date(
                                resident.move_in_date
                              ).toLocaleDateString()
                            : "-"}
                        </TableCell>
                        <TableCell>
                          {resident.move_out_date
                            ? new Date(
                                resident.move_out_date
                              ).toLocaleDateString()
                            : "-"}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Total Residents
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{residents.length}</div>
            <p className="text-xs text-muted-foreground">
              All-time resident count
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Active Residents
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {residents.filter((r) => r.is_active).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Currently living in FOUND buildings
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Inactive Residents
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {residents.filter((r) => !r.is_active).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Former residents who have moved out
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
