import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { generateVerificationCode } from "@/lib/auth"
import { sendVerificationEmail } from "@/lib/email"

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    console.log('🔄 Resending verification code for:', email)

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, name: true, emailVerified: true }
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    if (user.emailVerified) {
      return NextResponse.json({ error: "Email already verified" }, { status: 400 })
    }

    // Generate new verification code
    const verificationCode = generateVerificationCode()
    const codeExpires = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

    console.log('🆕 New verification code generated:', verificationCode)

    // Update user with new code
    await prisma.user.update({
      where: { email },
      data: {
        verificationCode,
        codeExpires,
      },
    })

    // Send email
    await sendVerificationEmail(email, verificationCode)

    console.log('✅ Verification code resent successfully')

    return NextResponse.json({
      message: "Verification code sent successfully",
    })

  } catch (error) {
    console.error("❌ Resend verification error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}











// import { type NextRequest, NextResponse } from "next/server"
// import { generateVerificationCode } from "@/lib/auth"
// import { sendVerificationEmail } from "@/lib/email"
// import { prisma } from "@/lib/prisma"

// export async function POST(request: NextRequest) {
//   try {
//     const { email } = await request.json()

//     if (!email) {
//       return NextResponse.json({ error: "Email is required" }, { status: 400 })
//     }

//     // Find user
//     const user = await prisma.user.findUnique({
//       where: { email },
//     })

//     if (!user) {
//       return NextResponse.json({ error: "User not found" }, { status: 404 })
//     }

//     if (user.emailVerified) {
//       return NextResponse.json({ error: "Email is already verified" }, { status: 400 })
//     }

//     // Generate new verification code
//     const newCode = generateVerificationCode()
//     const codeExpires = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

//     // Update user with new code
//     await prisma.user.update({
//       where: { email },
//       data: {
//         verificationCode: newCode,
//         codeExpires,
//       },
//     })

//     // Send verification email
//     await sendVerificationEmail(email, newCode)

//     return NextResponse.json({ message: "Verification code sent successfully" })
//   } catch (error) {
//     console.error("Resend verification error:", error)
//     return NextResponse.json({ error: "Internal server error" }, { status: 500 })
//   }
// }
