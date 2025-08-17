import { type NextRequest, NextResponse } from "next/server"
import { extractUrlMetadata } from "@/lib/url-utils"

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json()

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 })
    }

    const metadata = await extractUrlMetadata(url)
    return NextResponse.json(metadata)
  } catch (error) {
    console.error("Metadata extraction error:", error)
    return NextResponse.json({ error: "Failed to extract metadata" }, { status: 500 })
  }
}
