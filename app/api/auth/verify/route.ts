import { type NextRequest, NextResponse } from "next/server"
import { verifyUserEmail, createSession } from "@/lib/auth"
import { createDefaultWorkspace } from "@/lib/database-utils"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const { email, code } = await request.json()

    // Add debug logging
    console.log('🔍 Verification attempt:', { email, code, codeLength: code?.length, codeType: typeof code })

    // Validate input
    if (!email || !code) {
      console.log('❌ Missing email or code:', { email: !!email, code: !!code })
      return NextResponse.json({ error: "Missing email or verification code" }, { status: 400 })
    }

    // More flexible validation - trim whitespace and convert to uppercase
    const cleanCode = code.toString().trim().toUpperCase()
    console.log('🧹 Cleaned code:', { original: code, cleaned: cleanCode, regex: /^[A-Z0-9]{6}$/.test(cleanCode) })

    if (!/^[A-Z0-9]{6}$/.test(cleanCode)) {
      console.log('❌ Invalid code format:', { code: cleanCode, pattern: 'Expected 6 alphanumeric characters' })
      return NextResponse.json({ 
        error: "Invalid verification code format", 
        details: `Code "${cleanCode}" does not match expected format (6 alphanumeric characters)`
      }, { status: 400 })
    }

    // Verify email with the cleaned code
    console.log('📧 Attempting to verify email with cleaned code')
    const result = await verifyUserEmail(email, cleanCode)

    console.log('✉️ Verification result:', result)

    if (!result.success) {
      console.log('❌ Verification failed:', result.error)
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    // Debug: Check if user exists before and after verification
    console.log('🔍 Checking user before verification query...')
    const userBefore = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, name: true, emailVerified: true, verificationCode: true }
    })
    console.log('👤 User before verification query:', userBefore)

    // Get the verified user
    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      console.log('❌ User not found after verification:', email)
      
      // Debug: List all users to see what's in the database
      const allUsers = await prisma.user.findMany({
        select: { id: true, email: true, name: true, emailVerified: true }
      })
      console.log('📋 All users in database:', allUsers)
      
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    console.log('👤 User found:', { id: user.id, email: user.email, name: user.name })

    // Create default workspace for the user
    console.log('🏢 Creating default workspace...')
    await createDefaultWorkspace(user.id, user.name || "User")
    console.log('✅ Default workspace created')

    // Create a proper session token instead of just using user ID
    console.log('🎫 Creating session token for user:', user.id)
    const sessionToken = await createSession(user.id)
    console.log('✅ Session token created:', sessionToken)

    // Verify the session was created in database
    const createdSession = await prisma.session.findUnique({
      where: { sessionToken },
      include: { user: true }
    })
    console.log('🔍 Session verification in DB:', createdSession ? 'FOUND' : 'NOT FOUND')
    if (createdSession) {
      console.log('📋 Session details:', {
        id: createdSession.id,
        userId: createdSession.userId,
        expiresAt: createdSession.expiresAt,
        userEmail: createdSession.user.email
      })
    }

    const response = NextResponse.json({
      message: "Email verified successfully",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      redirectTo: "/dashboard" // Add redirect path
    })

    // Set session cookie with the proper session token
    response.cookies.set("session", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/", // Make sure cookie is available for all paths
    })

    console.log('🍪 Session cookie set with token:', sessionToken)
    console.log('🚀 Redirecting to dashboard')
    
    return response
  } catch (error) {
    console.error("❌ Verification error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}






// import { type NextRequest, NextResponse } from "next/server"
// import { verifyUserEmail } from "@/lib/auth"
// import { createDefaultWorkspace } from "@/lib/database-utils"
// import { prisma } from "@/lib/prisma"

// export async function POST(request: NextRequest) {
//   try {
//     const { email, code } = await request.json()

//     // Validate input
//     if (!email || !code) {
//       return NextResponse.json({ error: "Missing email or verification code" }, { status: 400 })
//     }

//     if (!/^[A-Z0-9]{6}$/.test(code)) {
//       return NextResponse.json({ error: "Invalid verification code format" }, { status: 400 })
//     }

//     // Verify email
//     const result = await verifyUserEmail(email, code)

//     if (!result.success) {
//       return NextResponse.json({ error: result.error }, { status: 400 })
//     }

//     // Get the verified user
//     const user = await prisma.user.findUnique({
//       where: { email },
//     })

//     if (!user) {
//       return NextResponse.json({ error: "User not found" }, { status: 404 })
//     }

//     // Create default workspace for the user
//     await createDefaultWorkspace(user.id, user.name || "User")

//     const response = NextResponse.json({
//       message: "Email verified successfully",
//       user: {
//         id: user.id,
//         name: user.name,
//         email: user.email,
//       },
//     })

//     // Set session cookie
//     response.cookies.set("session", user.id, {
//       httpOnly: true,
//       secure: process.env.NODE_ENV === "production",
//       sameSite: "lax",
//       maxAge: 60 * 60 * 24 * 7, // 7 days
//     })

//     return response
//   } catch (error) {
//     console.error("Verification error:", error)
//     return NextResponse.json({ error: "Internal server error" }, { status: 500 })
//   }
// }
