import { NextRequest, NextResponse } from "next/server"
import { deleteSession } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const sessionCookie = request.cookies.get("session")
    
    if (sessionCookie) {
      // Delete the session from the database
      await deleteSession(sessionCookie.value)
    }

    // Create response and clear the session cookie
    const response = NextResponse.json({ message: "Logged out successfully" })
    
    response.cookies.set("session", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 0, // Expire immediately
      path: "/",
    })

    return response
  } catch (error) {
    console.error("Logout error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}