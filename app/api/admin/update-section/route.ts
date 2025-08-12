import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { updateDocumentSection } from "@/lib/document-processor"

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { filename, sectionTitle, content } = await req.json()

    if (!filename || !sectionTitle || !content) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Update specific section
    const result = await updateDocumentSection(filename, sectionTitle, content)

    return NextResponse.json({
      success: true,
      ...(typeof result === "object" && result !== null ? result : {}),
    })
  } catch (error) {
    console.error("Section update error:", error)
    return NextResponse.json({ error: "Failed to update section" }, { status: 500 })
  }
}