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

    // Send invitation email
    const inviter = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { name: true, email: true },
    })

    await sendTeamInviteEmail(
      email,
      userMembership.workspace.name,
      inviter?.name || inviter?.email || "A team member",
      role,
      message,
    )

    console.log(`✅ Team invitation sent to ${email} for workspace ${userMembership.workspace.name}`)

    return NextResponse.json({ message: "Invitation sent successfully" })
  } catch (error: any) {
    console.error("❌ Team invite error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}










// import { type NextRequest, NextResponse } from "next/server"
// import { verify } from "jsonwebtoken"
// import { prisma } from "@/lib/prisma"
// import { sendTeamInviteEmail } from "@/lib/email"

// export async function POST(request: NextRequest) {
//   try {
//     const token = request.cookies.get("auth-token")?.value

//     if (!token) {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
//     }

//     const decoded = verify(token, process.env.JWT_SECRET || "fallback-secret") as { userId: string }
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
//       where: { userId: decoded.userId },
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
//       where: { id: decoded.userId },
//       select: { name: true, email: true },
//     })

//     await sendTeamInviteEmail(
//       email,
//       userMembership.workspace.name,
//       inviter?.name || inviter?.email || "A team member",
//       role,
//       message,
//     )

//     return NextResponse.json({ message: "Invitation sent successfully" })
//   } catch (error) {
//     console.error("Team invite error:", error)
//     return NextResponse.json({ error: "Internal server error" }, { status: 500 })
//   }
// }
