import { NextRequest, NextResponse } from "next/server"
import { validateSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const sessionCookie = request.cookies.get("session")
    
    console.log('🔍 AUTH ME - Session cookie exists:', !!sessionCookie)
    
    if (!sessionCookie) {
      return NextResponse.json({ error: "No session" }, { status: 401 })
    }

    console.log('🔍 AUTH ME - Validating session...')
    const session = await validateSession(sessionCookie.value)
    
    if (!session) {
      console.log('❌ AUTH ME - Invalid session')
      return NextResponse.json({ error: "Invalid session" }, { status: 401 })
    }

    console.log('✅ AUTH ME - Session valid, getting user data...')
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: {
        id: true,
        name: true,
        email: true,
        emailVerified: true
      }
    })

    if (!user || !user.emailVerified) {
      console.log('❌ AUTH ME - User not found or not verified')
      return NextResponse.json({ error: "User not found or not verified" }, { status: 401 })
    }

    console.log('✅ AUTH ME - User authenticated:', { id: user.id, email: user.email })
    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    })

  } catch (error) {
    console.error('❌ AUTH ME - Error:', error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}