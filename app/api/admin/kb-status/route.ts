import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { getKBStatus } from "@/lib/kb-service"

export async function GET() {
  try {
    const session = await getServerSession(authOptions) as { user?: { role?: string } } | null

    if (!session || session.user?.role !== "ADMIN") {
      return Response.json({ error: "Unauthorized" }, { status: 401 })
    }

    const status = await getKBStatus()

    return Response.json(status)
  } catch (error) {
    console.error("KB status error:", error)
    return Response.json({ error: "Failed to get KB status" }, { status: 500 })
  }
}
