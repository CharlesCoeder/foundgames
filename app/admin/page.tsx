import { AdminDashboard } from "@/components/admin-dashboard"

export default function AdminPage() {
  return (
    <div className="container py-12">
      <div className="mb-8 space-y-2">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">Manage verification requests and whitelist status</p>
      </div>
      <AdminDashboard />
    </div>
  )
}

