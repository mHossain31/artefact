import { type NextRequest, NextResponse } from "next/server"
import { createUser } from "@/lib/auth"
import { sendVerificationEmail } from "@/lib/email"

export async function POST(request: NextRequest) {
  try {
    const { name, email, password } = await request.json()

    // Validate input
    if (!name || !email || !password) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    if (password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters long" }, { status: 400 })
    }

    // Create user
    const user = await createUser(email, password, name)

    // Send verification email
    await sendVerificationEmail(email, user.verificationCode!)

    return NextResponse.json({
      message: "User created successfully. Please check your email for verification.",
      userId: user.id,
    })
  } catch (error: any) {
    if (error.code === "P2002") {
      return NextResponse.json({ error: "Email already exists" }, { status: 409 })
    }

    console.error("Signup error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}



// import { type NextRequest, NextResponse } from "next/server"
// import { createUser } from "@/lib/auth"
// import { sendVerificationEmail } from "@/lib/email"

// export async function POST(request: NextRequest) {
//   try {
//     const { name, email, password } = await request.json()

//     // Validate input
//     if (!name || !email || !password) {
//       return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
//     }

//     if (password.length < 8) {
//       return NextResponse.json({ error: "Password must be at least 8 characters long" }, { status: 400 })
//     }

//     // Create user
//     const user = await createUser(email, password, name)

//     try {
//       // Send verification email
//       await sendVerificationEmail(email, user.verificationCode!)
      
//       return NextResponse.json({
//         message: "User created successfully. Please check your email for verification.",
//         userId: user.id,
//       })
//     } catch (emailError: any) {
//       // Handle email sending errors specifically
//       console.error("Email sending error:", emailError)
      
//       return NextResponse.json({
//         message: "User created successfully, but verification email failed to send",
//         userId: user.id,
//         warning: emailError.message || "You can try signing in to resend the verification email",
//       }, { status: 201 })  // 201 Created but with warning
//     }
    
//   } catch (error: any) {
//     console.error("Signup error:", error)
    
//     if (error.code === "P2002") {
//       return NextResponse.json({ error: "Email already exists" }, { status: 409 })
//     }

//     return NextResponse.json({ 
//       error: "Internal server error",
//       details: error.message || "Unknown error during signup"
//     }, { status: 500 })
//   }
// }