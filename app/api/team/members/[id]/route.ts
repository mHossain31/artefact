import { type NextRequest, NextResponse } from "next/server"
import { validateSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const sessionCookie = request.cookies.get("session")

    if (!sessionCookie) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Validate session using your existing auth system
    const session = await validateSession(sessionCookie.value)
    
    if (!session) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 })
    }

    const { role } = await request.json()

    // Validate role
    if (!["ADMIN", "EDITOR", "VIEWER"].includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 })
    }

    // Check if current user has permission to update roles
    const currentUserMembership = await prisma.workspaceMember.findFirst({
      where: { userId: session.userId },
    })

    if (!currentUserMembership || !["OWNER", "ADMIN"].includes(currentUserMembership.role)) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })
    }

    // Get the member to update
    const memberToUpdate = await prisma.workspaceMember.findUnique({
      where: { id: id },
    })

    if (!memberToUpdate) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 })
    }

    // Don't allow changing owner role
    if (memberToUpdate.role === "OWNER") {
      return NextResponse.json({ error: "Cannot change owner role" }, { status: 403 })
    }

    // Update the member's role
    const updatedMember = await prisma.workspaceMember.update({
      where: { id: id },
      data: { role },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    console.log(`✅ Updated member role: ${updatedMember.user.email} → ${role}`)

    return NextResponse.json(updatedMember)
  } catch (error: any) {
    console.error("❌ Update member role error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const sessionCookie = request.cookies.get("session")

    if (!sessionCookie) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Validate session using your existing auth system
    const session = await validateSession(sessionCookie.value)
    
    if (!session) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 })
    }

    // Check if current user has permission to remove members
    const currentUserMembership = await prisma.workspaceMember.findFirst({
      where: { userId: session.userId },
    })

    if (!currentUserMembership || !["OWNER", "ADMIN"].includes(currentUserMembership.role)) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })
    }

    // Get the member to remove
    const memberToRemove = await prisma.workspaceMember.findUnique({
      where: { id: id },
      include: {
        user: {
          select: { email: true }
        }
      }
    })

    if (!memberToRemove) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 })
    }

    // Don't allow removing owner
    if (memberToRemove.role === "OWNER") {
      return NextResponse.json({ error: "Cannot remove workspace owner" }, { status: 403 })
    }

    // Remove the member
    await prisma.workspaceMember.delete({
      where: { id: id },
    })

    console.log(`✅ Removed member: ${memberToRemove.user.email}`)

    return NextResponse.json({ message: "Member removed successfully" })
  } catch (error: any) {
    console.error("❌ Remove member error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}












// import { type NextRequest, NextResponse } from "next/server"
// import { verify } from "jsonwebtoken"
// import { prisma } from "@/lib/prisma"

// export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
//   try {
//     const token = request.cookies.get("auth-token")?.value

//     if (!token) {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
//     }

//     const decoded = verify(token, process.env.JWT_SECRET || "fallback-secret") as { userId: string }
//     const { role } = await request.json()

//     // Validate role
//     if (!["ADMIN", "EDITOR", "VIEWER"].includes(role)) {
//       return NextResponse.json({ error: "Invalid role" }, { status: 400 })
//     }

//     // Check if current user has permission to update roles
//     const currentUserMembership = await prisma.workspaceMember.findFirst({
//       where: { userId: decoded.userId },
//     })

//     if (!currentUserMembership || !["OWNER", "ADMIN"].includes(currentUserMembership.role)) {
//       return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })
//     }

//     // Get the member to update
//     const memberToUpdate = await prisma.workspaceMember.findUnique({
//       where: { id: params.id },
//     })

//     if (!memberToUpdate) {
//       return NextResponse.json({ error: "Member not found" }, { status: 404 })
//     }

//     // Don't allow changing owner role
//     if (memberToUpdate.role === "OWNER") {
//       return NextResponse.json({ error: "Cannot change owner role" }, { status: 403 })
//     }

//     // Update the member's role
//     const updatedMember = await prisma.workspaceMember.update({
//       where: { id: params.id },
//       data: { role },
//       include: {
//         user: {
//           select: {
//             id: true,
//             name: true,
//             email: true,
//           },
//         },
//       },
//     })

//     return NextResponse.json(updatedMember)
//   } catch (error) {
//     console.error("Update member role error:", error)
//     return NextResponse.json({ error: "Internal server error" }, { status: 500 })
//   }
// }

// export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
//   try {
//     const token = request.cookies.get("auth-token")?.value

//     if (!token) {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
//     }

//     const decoded = verify(token, process.env.JWT_SECRET || "fallback-secret") as { userId: string }

//     // Check if current user has permission to remove members
//     const currentUserMembership = await prisma.workspaceMember.findFirst({
//       where: { userId: decoded.userId },
//     })

//     if (!currentUserMembership || !["OWNER", "ADMIN"].includes(currentUserMembership.role)) {
//       return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })
//     }

//     // Get the member to remove
//     const memberToRemove = await prisma.workspaceMember.findUnique({
//       where: { id: params.id },
//     })

//     if (!memberToRemove) {
//       return NextResponse.json({ error: "Member not found" }, { status: 404 })
//     }

//     // Don't allow removing owner
//     if (memberToRemove.role === "OWNER") {
//       return NextResponse.json({ error: "Cannot remove workspace owner" }, { status: 403 })
//     }

//     // Remove the member
//     await prisma.workspaceMember.delete({
//       where: { id: params.id },
//     })

//     return NextResponse.json({ message: "Member removed successfully" })
//   } catch (error) {
//     console.error("Remove member error:", error)
//     return NextResponse.json({ error: "Internal server error" }, { status: 500 })
//   }
// }
