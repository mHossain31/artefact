import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { validateSession } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    // Get session from cookie
    const sessionCookie = request.cookies.get("session")
    
    console.log('🔍 Categories API - Session cookie:', !!sessionCookie)
    
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

    // Get user with their workspaces
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
                categories: {
                  include: {
                    _count: {
                      select: {
                        urls: true
                      }
                    }
                  },
                  orderBy: { createdAt: 'desc' }
                }
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

    // Get current workspace (first one for now)
    const currentWorkspace = user.workspaces[0]?.workspace
    const currentUserRole = user.workspaces[0]?.role

    if (!currentWorkspace) {
      console.log('❌ No workspace found for user')
      return NextResponse.json({ error: "No workspace found" }, { status: 404 })
    }

    console.log('🏢 Current workspace:', { 
      id: currentWorkspace.id, 
      name: currentWorkspace.name, 
      categoriesCount: currentWorkspace.categories.length 
    })

    // Get recent activities (you can add this to your schema later)
    // For now, we'll create mock activities based on categories
    const mockActivities = currentWorkspace.categories.slice(0, 5).map((category, index) => ({
      id: `activity-${category.id}`,
      type: 'category_created',
      description: `Created category "${category.name}"`,
      user: {
        name: user.name,
        email: user.email
      },
      createdAt: new Date(Date.now() - index * 2 * 60 * 60 * 1000).toISOString() // Staggered times
    }))

    // Format the response data
    const categoriesData = {
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
      categories: currentWorkspace.categories.map(category => ({
        id: category.id,
        name: category.name,
        color: category.color,
        icon: category.icon,
        urlCount: category._count.urls,
        createdAt: category.createdAt.toISOString(),
        updatedAt: category.createdAt.toISOString(), // Using createdAt since no updatedAt in schema
        createdBy: {
          name: user.name,
          email: user.email
        }
      })),
      currentUserRole: currentUserRole,
      activities: mockActivities
    }

    console.log('✅ Categories data prepared successfully')
    return NextResponse.json(categoriesData)

  } catch (error) {
    console.error("❌ Categories API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get session from cookie
    const sessionCookie = request.cookies.get("session")
    
    if (!sessionCookie) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const sessionToken = sessionCookie.value
    const session = await validateSession(sessionToken)
    
    if (!session) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 })
    }

    const userId = session.userId
    const { name, color, icon } = await request.json()

    if (!name || !color) {
      return NextResponse.json({ error: "Name and color are required" }, { status: 400 })
    }

    console.log('➕ Creating category:', { name, color, icon, userId })

    // Get user's workspace and role
    const userWorkspace = await prisma.workspaceMember.findFirst({
      where: { userId: userId },
      include: {
        workspace: true
      }
    })

    if (!userWorkspace) {
      return NextResponse.json({ error: "No workspace found" }, { status: 404 })
    }

    // Check permissions
    if (!['OWNER', 'ADMIN', 'EDITOR'].includes(userWorkspace.role)) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })
    }

    // Check if category name already exists in workspace
    const existingCategory = await prisma.category.findFirst({
      where: {
        workspaceId: userWorkspace.workspaceId,
        name: {
          equals: name,
          mode: 'insensitive'
        }
      }
    })

    if (existingCategory) {
      return NextResponse.json({ error: "Category with this name already exists" }, { status: 400 })
    }

    // Create category
    const category = await prisma.category.create({
      data: {
        name,
        color,
        icon: icon || null,
        workspaceId: userWorkspace.workspaceId
      },
      include: {
        _count: {
          select: {
            urls: true
          }
        }
      }
    })

    console.log('✅ Category created:', category.id)

    // Get user info for response
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, email: true }
    })

    const categoryData = {
      id: category.id,
      name: category.name,
      color: category.color,
      icon: category.icon,
      urlCount: category._count.urls,
      createdAt: category.createdAt.toISOString(),
      updatedAt: category.createdAt.toISOString(),
      createdBy: {
        name: user?.name,
        email: user?.email
      }
    }

    return NextResponse.json(categoryData)
  } catch (error) {
    console.error("❌ Category creation error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}


















// import { NextRequest, NextResponse } from "next/server"
// import { prisma } from "@/lib/prisma"
// import { validateSession } from "@/lib/auth"

// export async function GET(request: NextRequest) {
//   try {
//     // Get session from cookie
//     const sessionCookie = request.cookies.get("session")
    
//     console.log('🔍 Categories API - Session cookie:', !!sessionCookie)
    
//     if (!sessionCookie) {
//       console.log('❌ No session cookie found')
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
//     }

//     const sessionToken = sessionCookie.value
//     console.log('🎫 Validating session token...')

//     // Validate session using your existing function
//     const session = await validateSession(sessionToken)
    
//     if (!session) {
//       console.log('❌ Invalid session')
//       return NextResponse.json({ error: "Invalid session" }, { status: 401 })
//     }

//     const userId = session.userId
//     console.log('👤 User ID from session:', userId)

//     // Get user with their workspaces
//     const user = await prisma.user.findUnique({
//       where: { id: userId },
//       select: {
//         id: true,
//         email: true,
//         name: true,
//         emailVerified: true,
//         workspaces: {
//           include: {
//             workspace: {
//               include: {
//                 categories: {
//                   include: {
//                     _count: {
//                       select: {
//                         urls: true
//                       }
//                     }
//                   },
//                   orderBy: { createdAt: 'desc' }
//                 }
//               }
//             }
//           }
//         }
//       }
//     })

//     console.log('📋 Found user:', user ? { id: user.id, email: user.email, workspacesCount: user.workspaces.length } : null)

//     if (!user) {
//       console.log('❌ User not found for session')
//       return NextResponse.json({ error: "User not found" }, { status: 404 })
//     }

//     if (!user.emailVerified) {
//       console.log('❌ User email not verified')
//       return NextResponse.json({ error: "Email not verified" }, { status: 401 })
//     }

//     // Get the user's workspaces
//     const workspaces = user.workspaces.map(ws => ({
//       id: ws.workspace.id,
//       name: ws.workspace.name,
//       description: ws.workspace.description,
//       role: ws.role
//     }))

//     // Get current workspace (first one for now)
//     const currentWorkspace = user.workspaces[0]?.workspace
//     const currentUserRole = user.workspaces[0]?.role

//     if (!currentWorkspace) {
//       console.log('❌ No workspace found for user')
//       return NextResponse.json({ error: "No workspace found" }, { status: 404 })
//     }

//     console.log('🏢 Current workspace:', { 
//       id: currentWorkspace.id, 
//       name: currentWorkspace.name, 
//       categoriesCount: currentWorkspace.categories.length 
//     })

//     // Get recent activities (you can add this to your schema later)
//     // For now, we'll create mock activities based on categories
//     const mockActivities = currentWorkspace.categories.slice(0, 5).map((category, index) => ({
//       id: `activity-${category.id}`,
//       type: 'category_created',
//       description: `Created category "${category.name}"`,
//       user: {
//         name: user.name,
//         email: user.email
//       },
//       createdAt: new Date(Date.now() - index * 2 * 60 * 60 * 1000).toISOString() // Staggered times
//     }))

//     // Format the response data
//     const categoriesData = {
//       user: {
//         name: user.name,
//         email: user.email
//       },
//       currentWorkspace: {
//         id: currentWorkspace.id,
//         name: currentWorkspace.name,
//         description: currentWorkspace.description
//       },
//       workspaces: workspaces,
//       categories: currentWorkspace.categories.map(category => ({
//         id: category.id,
//         name: category.name,
//         description: null, // Your schema doesn't have description yet
//         color: category.color,
//         urlCount: category._count.urls,
//         createdAt: category.createdAt.toISOString(),
//         updatedAt: category.createdAt.toISOString(), // Using createdAt since no updatedAt in schema
//         createdBy: {
//           name: user.name,
//           email: user.email
//         }
//       })),
//       currentUserRole: currentUserRole,
//       activities: mockActivities
//     }

//     console.log('✅ Categories data prepared successfully')
//     return NextResponse.json(categoriesData)

//   } catch (error) {
//     console.error("❌ Categories API error:", error)
//     return NextResponse.json({ error: "Internal server error" }, { status: 500 })
//   }
// }

// export async function POST(request: NextRequest) {
//   try {
//     // Get session from cookie
//     const sessionCookie = request.cookies.get("session")
    
//     if (!sessionCookie) {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
//     }

//     const sessionToken = sessionCookie.value
//     const session = await validateSession(sessionToken)
    
//     if (!session) {
//       return NextResponse.json({ error: "Invalid session" }, { status: 401 })
//     }

//     const userId = session.userId
//     const { name, description, color } = await request.json()

//     if (!name || !color) {
//       return NextResponse.json({ error: "Name and color are required" }, { status: 400 })
//     }

//     console.log('➕ Creating category:', { name, color, userId })

//     // Get user's workspace and role
//     const userWorkspace = await prisma.workspaceMember.findFirst({
//       where: { userId: userId },
//       include: {
//         workspace: true
//       }
//     })

//     if (!userWorkspace) {
//       return NextResponse.json({ error: "No workspace found" }, { status: 404 })
//     }

//     // Check permissions
//     if (!['OWNER', 'ADMIN', 'EDITOR'].includes(userWorkspace.role)) {
//       return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })
//     }

//     // Check if category name already exists in workspace
//     const existingCategory = await prisma.category.findFirst({
//       where: {
//         workspaceId: userWorkspace.workspaceId,
//         name: {
//           equals: name,
//           mode: 'insensitive'
//         }
//       }
//     })

//     if (existingCategory) {
//       return NextResponse.json({ error: "Category with this name already exists" }, { status: 400 })
//     }

//     // Create category
//     const category = await prisma.category.create({
//       data: {
//         name,
//         color,
//         icon: null, // You can add icon support later
//         workspaceId: userWorkspace.workspaceId
//       },
//       include: {
//         _count: {
//           select: {
//             urls: true
//           }
//         }
//       }
//     })

//     console.log('✅ Category created:', category.id)

//     const categoryData = {
//       id: category.id,
//       name: category.name,
//       description: null,
//       color: category.color,
//       urlCount: category._count.urls,
//       createdAt: category.createdAt.toISOString(),
//       updatedAt: category.createdAt.toISOString(),
//       createdBy: {
//         name: session.user?.name,
//         email: session.user?.email
//       }
//     }

//     return NextResponse.json(categoryData)
//   } catch (error) {
//     console.error("❌ Category creation error:", error)
//     return NextResponse.json({ error: "Internal server error" }, { status: 500 })
//   }
// }