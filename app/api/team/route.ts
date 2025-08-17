import { type NextRequest, NextResponse } from "next/server"
import { validateSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
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

    // Get user data
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: {
        id: true,
        name: true,
        email: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Get user's workspaces
    const workspaces = await prisma.workspace.findMany({
      where: {
        members: {
          some: {
            userId: session.userId,
          },
        },
      },
      select: {
        id: true,
        name: true,
        description: true,
      },
    })

    // Get current workspace (first one for now)
    const currentWorkspace = workspaces[0]

    if (!currentWorkspace) {
      return NextResponse.json({ error: "No workspace found" }, { status: 404 })
    }

    // Get current user's role in the workspace
    const currentUserMembership = await prisma.workspaceMember.findFirst({
      where: {
        userId: session.userId,
        workspaceId: currentWorkspace.id,
      },
    })

    // Get all workspace members
    const members = await prisma.workspaceMember.findMany({
      where: {
        workspaceId: currentWorkspace.id,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        joinedAt: "asc",
      },
    })

    // Get recent activities - you can expand this based on your needs
    const activities = [
      {
        id: "1",
        type: "member_joined",
        description: "Joined the workspace",
        user: { name: user.name, email: user.email },
        createdAt: new Date().toISOString(),
      },
    ]

    console.log(`✅ Team data fetched for workspace: ${currentWorkspace.name}`)

    return NextResponse.json({
      user,
      currentWorkspace,
      workspaces,
      members,
      currentUserRole: currentUserMembership?.role || "VIEWER",
      activities,
    })
  } catch (error: any) {
    console.error("❌ Team API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}



















// import { type NextRequest, NextResponse } from "next/server"
// import { verify } from "jsonwebtoken"
// import { prisma } from "@/lib/prisma"

// export async function GET(request: NextRequest) {
//   try {
//     const token = request.cookies.get("auth-token")?.value

//     if (!token) {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
//     }

//     const decoded = verify(token, process.env.JWT_SECRET || "fallback-secret") as { userId: string }

//     // Get user data
//     const user = await prisma.user.findUnique({
//       where: { id: decoded.userId },
//       select: {
//         id: true,
//         name: true,
//         email: true,
//       },
//     })

//     if (!user) {
//       return NextResponse.json({ error: "User not found" }, { status: 404 })
//     }

//     // Get user's workspaces
//     const workspaces = await prisma.workspace.findMany({
//       where: {
//         members: {
//           some: {
//             userId: decoded.userId,
//           },
//         },
//       },
//     })

//     // Get current workspace (first one for now)
//     const currentWorkspace = workspaces[0]

//     if (!currentWorkspace) {
//       return NextResponse.json({ error: "No workspace found" }, { status: 404 })
//     }

//     // Get current user's role in the workspace
//     const currentUserMembership = await prisma.workspaceMember.findFirst({
//       where: {
//         userId: decoded.userId,
//         workspaceId: currentWorkspace.id,
//       },
//     })

//     // Get all workspace members
//     const members = await prisma.workspaceMember.findMany({
//       where: {
//         workspaceId: currentWorkspace.id,
//       },
//       include: {
//         user: {
//           select: {
//             id: true,
//             name: true,
//             email: true,
//           },
//         },
//       },
//       orderBy: {
//         joinedAt: "asc",
//       },
//     })

//     // Get recent activities (mock data for now - you'd implement this based on your needs)
//     const activities = [
//       {
//         id: "1",
//         type: "url_added",
//         description: "Added a new URL to Development category",
//         user: { name: "John Doe", email: "john@example.com" },
//         createdAt: new Date().toISOString(),
//       },
//       {
//         id: "2",
//         type: "member_joined",
//         description: "Joined the workspace",
//         user: { name: "Jane Smith", email: "jane@example.com" },
//         createdAt: new Date(Date.now() - 86400000).toISOString(),
//       },
//     ]

//     return NextResponse.json({
//       user,
//       currentWorkspace,
//       workspaces,
//       members,
//       currentUserRole: currentUserMembership?.role || "VIEWER",
//       activities,
//     })
//   } catch (error) {
//     console.error("Team API error:", error)
//     return NextResponse.json({ error: "Internal server error" }, { status: 500 })
//   }
// }
