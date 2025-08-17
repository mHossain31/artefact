import { NextRequest, NextResponse } from "next/server"
import { validateSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const sessionCookie = request.cookies.get("session")
    
    console.log('🔍 DEBUG SESSION - Cookie exists:', !!sessionCookie)
    console.log('🔍 DEBUG SESSION - Cookie value:', sessionCookie?.value)
    
    if (!sessionCookie) {
      return NextResponse.json({ 
        error: "No session cookie found",
        hasSession: false
      })
    }

    // Check if session exists in database
    console.log('🔍 DEBUG SESSION - Looking for session in database...')
    const sessionInDb = await prisma.session.findUnique({
      where: { sessionToken: sessionCookie.value },
      include: { user: true }
    })
    
    console.log('📋 DEBUG SESSION - Session in DB:', sessionInDb ? 'FOUND' : 'NOT FOUND')
    if (sessionInDb) {
      console.log('📋 DEBUG SESSION - Session details:', {
        id: sessionInDb.id,
        userId: sessionInDb.userId,
        expiresAt: sessionInDb.expiresAt,
        isExpired: sessionInDb.expiresAt < new Date(),
        userEmail: sessionInDb.user.email
      })
    }

    // Test validateSession function
    console.log('🔍 DEBUG SESSION - Testing validateSession function...')
    const sessionValidation = await validateSession(sessionCookie.value)
    
    console.log('📋 DEBUG SESSION - Validation result:', sessionValidation ? 'VALID' : 'INVALID')
    if (sessionValidation) {
      console.log('📋 DEBUG SESSION - Validation details:', {
        userId: sessionValidation.userId,
        expiresAt: sessionValidation.expiresAt
      })
    }

    return NextResponse.json({
      hasSessionCookie: true,
      sessionValue: sessionCookie.value,
      sessionInDatabase: !!sessionInDb,
      sessionValid: !!sessionValidation,
      sessionDetails: sessionInDb ? {
        userId: sessionInDb.userId,
        expiresAt: sessionInDb.expiresAt,
        isExpired: sessionInDb.expiresAt < new Date(),
        userEmail: sessionInDb.user.email
      } : null,
      validationResult: sessionValidation ? {
        userId: sessionValidation.userId,
        expiresAt: sessionValidation.expiresAt
      } : null
    })

  } catch (error: any) {
    console.error('❌ DEBUG SESSION - Error:', error)
    return NextResponse.json({ 
      error: error?.message || 'Unknown error',
      stack: error?.stack
    }, { status: 500 })
  }
}