import { Metadata } from "next";
import { AdminDashboard } from "@/components/admin-dashboard";

export const metadata: Metadata = {
  title: "FOUND Games Admin Dashboard",
  description:
    "Manage verifications and resident data for FOUND Games Minecraft server",
};

export default function AdminPage() {
  return (
    <div className="container mx-auto py-6 px-4">
      <h1 className="text-3xl font-bold mb-6">FOUND Games Admin Dashboard</h1>
      <AdminDashboard />
    </div>
  );
}
