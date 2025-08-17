import { type NextRequest, NextResponse } from "next/server"
import { validateSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { sendTeamInviteEmail } from "@/lib/email"

export async function POST(request: NextRequest) {
  try {
    const sessionCookie = request.cookies.get("session")

    if (!sessionCookie) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Validate session using your existing auth system
    const session = await validateSession(sessionCookie.value)
    
    if (!session) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 })
    }

    const { email, role, message } = await request.json()

    // Validate input
    if (!email || !role) {
      return NextResponse.json({ error: "Email and role are required" }, { status: 400 })
    }

    if (!["ADMIN", "EDITOR", "VIEWER"].includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 })
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 })
    }

    // Get user's current workspace and check permissions
    const userMembership = await prisma.workspaceMember.findFirst({
      where: { userId: session.userId },
      include: { workspace: true },
    })

    if (!userMembership || !["OWNER", "ADMIN"].includes(userMembership.role)) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })
    }

    // Check if user is already a member
    const existingMember = await prisma.workspaceMember.findFirst({
      where: {
        workspaceId: userMembership.workspaceId,
        user: { email },
      },
    })

    if (existingMember) {
      return NextResponse.json({ error: "User is already a member of this workspace" }, { status: 409 })
    }

    // Check if user exists, if not create them
    let invitedUser = await prisma.user.findUnique({
      where: { email },
    })

    if (!invitedUser) {
      // Create a placeholder user (they'll complete registration when they accept the invite)
      invitedUser = await prisma.user.create({
        data: {
          email,
          password: "", // They'll set this when they accept the invite
          emailVerified: null,
        },
      })
    }

    // Create workspace membership
    await prisma.workspaceMember.create({
      data: {
        userId: invitedUser.id,
        workspaceId: userMembership.workspaceId,
        role,
      },
    })

    // Get inviter information
    const inviter = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { name: true, email: true },
    })

    // Send invitation email with new template
    try {
      await sendTeamInviteEmail(
        email,
        userMembership.workspace.name,
        inviter?.name || inviter?.email || "A team member",
        role,
        message
      )

      console.log(`✅ Team invitation sent to ${email} for workspace ${userMembership.workspace.name}`)
    } catch (emailError) {
      console.error("📧 Email sending failed:", emailError)
      
      // Still return success since the user was added to the workspace
      // You might want to implement a retry mechanism or queue system
      console.log("⚠️ User was added to workspace but email failed to send")
    }

    return NextResponse.json({ 
      message: "Invitation sent successfully",
      details: {
        email,
        workspace: userMembership.workspace.name,
        role,
        inviter: inviter?.name || inviter?.email
      }
    })

  } catch (error: any) {
    console.error("❌ Team invite error:", error)
    
    // More specific error handling
    if (error.code === 'P2002') {
      return NextResponse.json({ error: "User is already a member" }, { status: 409 })
    }
    
    return NextResponse.json({ 
      error: "Internal server error",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 })
  }
}

















// import { type NextRequest, NextResponse } from "next/server"
// import { validateSession } from "@/lib/auth"
// import { prisma } from "@/lib/prisma"
// import { sendTeamInviteEmail } from "@/lib/email"

// export async function POST(request: NextRequest) {
//   try {
//     const sessionCookie = request.cookies.get("session")

//     if (!sessionCookie) {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
//     }

//     // Validate session using your existing auth system
//     const session = await validateSession(sessionCookie.value)
    
//     if (!session) {
//       return NextResponse.json({ error: "Invalid session" }, { status: 401 })
//     }

//     const { email, role, message } = await request.json()

//     // Validate input
//     if (!email || !role) {
//       return NextResponse.json({ error: "Email and role are required" }, { status: 400 })
//     }

//     if (!["ADMIN", "EDITOR", "VIEWER"].includes(role)) {
//       return NextResponse.json({ error: "Invalid role" }, { status: 400 })
//     }

//     // Get user's current workspace and check permissions
//     const userMembership = await prisma.workspaceMember.findFirst({
//       where: { userId: session.userId },
//       include: { workspace: true },
//     })

//     if (!userMembership || !["OWNER", "ADMIN"].includes(userMembership.role)) {
//       return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })
//     }

//     // Check if user is already a member
//     const existingMember = await prisma.workspaceMember.findFirst({
//       where: {
//         workspaceId: userMembership.workspaceId,
//         user: { email },
//       },
//     })

//     if (existingMember) {
//       return NextResponse.json({ error: "User is already a member of this workspace" }, { status: 409 })
//     }

//     // Check if user exists, if not create them
//     let invitedUser = await prisma.user.findUnique({
//       where: { email },
//     })

//     if (!invitedUser) {
//       // Create a placeholder user (they'll complete registration when they accept the invite)
//       invitedUser = await prisma.user.create({
//         data: {
//           email,
//           password: "", // They'll set this when they accept the invite
//           emailVerified: null,
//         },
//       })
//     }

//     // Create workspace membership
//     await prisma.workspaceMember.create({
//       data: {
//         userId: invitedUser.id,
//         workspaceId: userMembership.workspaceId,
//         role,
//       },
//     })

//     // Send invitation email
//     const inviter = await prisma.user.findUnique({
//       where: { id: session.userId },
//       select: { name: true, email: true },
//     })

//     await sendTeamInviteEmail(
//       email,
//       userMembership.workspace.name,
//       inviter?.name || inviter?.email || "A team member",
//       role,
//       message,
//     )

//     console.log(`✅ Team invitation sent to ${email} for workspace ${userMembership.workspace.name}`)

//     return NextResponse.json({ message: "Invitation sent successfully" })
//   } catch (error: any) {
//     console.error("❌ Team invite error:", error)
//     return NextResponse.json({ error: "Internal server error" }, { status: 500 })
//   }
// }


