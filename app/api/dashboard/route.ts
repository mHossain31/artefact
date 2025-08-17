import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { validateSession } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    // Get session from cookie
    const sessionCookie = request.cookies.get("session")
    
    console.log('🔍 Dashboard API - Session cookie:', !!sessionCookie)
    
    if (!sessionCookie) {
      console.log('❌ No session cookie found')
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const sessionToken = sessionCookie.value
    console.log('🎫 Validating session token...')

    // Validate session using your existing function
    const session = await validateSession(sessionToken)
    
    if (!session) {
      console.log('❌ Invalid session')
      return NextResponse.json({ error: "Invalid session" }, { status: 401 })
    }

    const userId = session.userId
    console.log('👤 User ID from session:', userId)

    // Get user with their workspaces using your database structure
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        emailVerified: true,
        workspaces: {
          include: {
            workspace: {
              include: {
                urls: {
                  include: {
                    category: true,
                    addedBy: {
                      select: { name: true, email: true }
                    }
                  },
                  orderBy: { createdAt: 'desc' }
                },
                categories: true
              }
            }
          }
        }
      }
    })

    console.log('📋 Found user:', user ? { id: user.id, email: user.email, workspacesCount: user.workspaces.length } : null)

    if (!user) {
      console.log('❌ User not found for session')
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    if (!user.emailVerified) {
      console.log('❌ User email not verified')
      return NextResponse.json({ error: "Email not verified" }, { status: 401 })
    }

    // Get the user's workspaces
    const workspaces = user.workspaces.map(ws => ({
      id: ws.workspace.id,
      name: ws.workspace.name,
      description: ws.workspace.description,
      role: ws.role
    }))

    // Get current workspace (first one for now, you can make this configurable later)
    const currentWorkspace = user.workspaces[0]?.workspace

    if (!currentWorkspace) {
      console.log('❌ No workspace found for user')
      return NextResponse.json({ error: "No workspace found" }, { status: 404 })
    }

    console.log('🏢 Current workspace:', { id: currentWorkspace.id, name: currentWorkspace.name, urlsCount: currentWorkspace.urls.length })

    // Format the response data
    const dashboardData = {
      user: {
        name: user.name,
        email: user.email
      },
      currentWorkspace: {
        id: currentWorkspace.id,
        name: currentWorkspace.name,
        description: currentWorkspace.description
      },
      workspaces: workspaces,
      urls: currentWorkspace.urls.map(url => ({
        id: url.id,
        title: url.title,
        url: url.url,
        description: url.description,
        screenshot: url.screenshot,
        favicon: url.favicon,
        category: url.category ? {
          id: url.category.id,
          name: url.category.name,
          color: url.category.color,
          icon: url.category.icon
        } : undefined,
        addedBy: {
          name: url.addedBy.name,
          email: url.addedBy.email
        },
        createdAt: url.createdAt.toISOString()
      })),
      categories: currentWorkspace.categories.map(category => ({
        id: category.id,
        name: category.name,
        color: category.color,
        icon: category.icon
      }))
    }

    console.log('✅ Dashboard data prepared successfully')
    return NextResponse.json(dashboardData)

  } catch (error) {
    console.error("❌ Dashboard API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}







// import { type NextRequest, NextResponse } from "next/server"
// import { validateSession } from "@/lib/auth"
// import { db } from "@/lib/database"

// export async function GET(request: NextRequest) {
//   try {
//     const sessionToken = request.cookies.get("session")?.value

//     if (!sessionToken) {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
//     }

//     const session = await validateSession(sessionToken)

//     if (!session) {
//       return NextResponse.json({ error: "Invalid session" }, { status: 401 })
//     }

//     const user = session.user

//     // Get user's workspaces
//     const workspaces = await db.workspace.findMany({
//       where: {
//         members: { some: { userId: user.id } },
//       },
//     })

//     // Get current workspace (first one for now)
//     const currentWorkspace = workspaces[0]

//     if (!currentWorkspace) {
//       return NextResponse.json({ error: "No workspace found" }, { status: 404 })
//     }

//     // Get URLs for current workspace
//     const urls = await db.url.findMany({
//       where: { workspaceId: currentWorkspace.id },
//     })

//     // Get categories for current workspace
//     const categories = await db.category.findMany({
//       where: { workspaceId: currentWorkspace.id },
//     })

//     return NextResponse.json({
//       user,
//       currentWorkspace,
//       workspaces,
//       urls,
//       categories,
//     })
//   } catch (error) {
//     console.error("Dashboard API error:", error)
//     return NextResponse.json({ error: "Internal server error" }, { status: 500 })
//   }
// }
