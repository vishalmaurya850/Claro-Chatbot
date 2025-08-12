"use client"

import { useSession } from "next-auth/react"
import { Card, CardContent } from "@/components/ui/card"

// Fix the import - use default import if the component is exported as default
import { AdminDashboard } from "@/components/admin-dashboard"
// If that doesn't work, verify the export in the component file:
// import { AdminDashboard } from "@/components/admin-dashboard"

export default function AdminPage() {
  const { data: session } = useSession()

  if (session?.user?.role !== 'ADMIN') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <CardContent className="p-6">
            <p>Access denied. Admin privileges required.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return <AdminDashboard />
}