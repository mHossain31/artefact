import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { validateSession } from "@/lib/auth"

interface RouteParams {
  params: {
    id: string
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
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
    const categoryId = params.id
    const { name, color, icon } = await request.json()

    if (!name || !color) {
      return NextResponse.json({ error: "Name and color are required" }, { status: 400 })
    }

    console.log('✏️ Updating category:', { categoryId, name, color, icon, userId })

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

    // Check if category exists and belongs to user's workspace
    const existingCategory = await prisma.category.findFirst({
      where: {
        id: categoryId,
        workspaceId: userWorkspace.workspaceId
      }
    })

    if (!existingCategory) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 })
    }

    // Check if name conflicts with another category (excluding current one)
    const nameConflict = await prisma.category.findFirst({
      where: {
        workspaceId: userWorkspace.workspaceId,
        name: {
          equals: name,
          mode: 'insensitive'
        },
        id: {
          not: categoryId
        }
      }
    })

    if (nameConflict) {
      return NextResponse.json({ error: "Category with this name already exists" }, { status: 400 })
    }

    // Update the category
    const updatedCategory = await prisma.category.update({
      where: { id: categoryId },
      data: {
        name,
        color,
        icon: icon || null
      },
      include: {
        _count: {
          select: {
            urls: true
          }
        }
      }
    })

    console.log('✅ Category updated:', updatedCategory.id)

    // Get user info for response
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, email: true }
    })

    const categoryData = {
      id: updatedCategory.id,
      name: updatedCategory.name,
      color: updatedCategory.color,
      icon: updatedCategory.icon,
      urlCount: updatedCategory._count.urls,
      createdAt: updatedCategory.createdAt.toISOString(),
      updatedAt: updatedCategory.createdAt.toISOString(),
      createdBy: {
        name: user?.name,
        email: user?.email
      }
    }

    return NextResponse.json(categoryData)
  } catch (error) {
    console.error("❌ Category update error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
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
    const categoryId = params.id

    console.log('🗑️ Deleting category:', { categoryId, userId })

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

    // Check if category exists and belongs to user's workspace
    const existingCategory = await prisma.category.findFirst({
      where: {
        id: categoryId,
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

    if (!existingCategory) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 })
    }

    // If category has URLs, set them to uncategorized
    if (existingCategory._count.urls > 0) {
      console.log(`📝 Uncategorizing ${existingCategory._count.urls} URLs`)
      await prisma.url.updateMany({
        where: { categoryId: categoryId },
        data: { categoryId: null }
      })
    }

    // Delete the category
    await prisma.category.delete({
      where: { id: categoryId }
    })

    console.log('✅ Category deleted:', categoryId)

    return NextResponse.json({ 
      message: "Category deleted successfully",
      uncategorizedUrls: existingCategory._count.urls 
    })
  } catch (error) {
    console.error("❌ Category deletion error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}















// import { NextRequest, NextResponse } from "next/server"
// import { prisma } from "@/lib/prisma"
// import { validateSession } from "@/lib/auth"

// interface RouteParams {
//   params: {
//     id: string
//   }
// }

// export async function PUT(request: NextRequest, { params }: RouteParams) {
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
//     const categoryId = params.id
//     const { name, description, color } = await request.json()

//     if (!name || !color) {
//       return NextResponse.json({ error: "Name and color are required" }, { status: 400 })
//     }

//     console.log('✏️ Updating category:', { categoryId, name, color, userId })

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

//     // Check if category exists and belongs to user's workspace
//     const existingCategory = await prisma.category.findFirst({
//       where: {
//         id: categoryId,
//         workspaceId: userWorkspace.workspaceId
//       }
//     })

//     if (!existingCategory) {
//       return NextResponse.json({ error: "Category not found" }, { status: 404 })
//     }

//     // Check if name conflicts with another category (excluding current one)
//     const nameConflict = await prisma.category.findFirst({
//       where: {
//         workspaceId: userWorkspace.workspaceId,
//         name: {
//           equals: name,
//           mode: 'insensitive'
//         },
//         id: {
//           not: categoryId
//         }
//       }
//     })

//     if (nameConflict) {
//       return NextResponse.json({ error: "Category with this name already exists" }, { status: 400 })
//     }

//     // Update the category
//     const updatedCategory = await prisma.category.update({
//       where: { id: categoryId },
//       data: {
//         name,
//         color
//         // Note: description is not in your current schema
//       },
//       include: {
//         _count: {
//           select: {
//             urls: true
//           }
//         }
//       }
//     })

//     console.log('✅ Category updated:', updatedCategory.id)

//     const categoryData = {
//       id: updatedCategory.id,
//       name: updatedCategory.name,
//       description: null,
//       color: updatedCategory.color,
//       urlCount: updatedCategory._count.urls,
//       createdAt: updatedCategory.createdAt.toISOString(),
//       updatedAt: updatedCategory.createdAt.toISOString(),
//       createdBy: {
//         name: session.user?.name,
//         email: session.user?.email
//       }
//     }

//     return NextResponse.json(categoryData)
//   } catch (error) {
//     console.error("❌ Category update error:", error)
//     return NextResponse.json({ error: "Internal server error" }, { status: 500 })
//   }
// }

// export async function DELETE(request: NextRequest, { params }: RouteParams) {
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
//     const categoryId = params.id

//     console.log('🗑️ Deleting category:', { categoryId, userId })

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

//     // Check if category exists and belongs to user's workspace
//     const existingCategory = await prisma.category.findFirst({
//       where: {
//         id: categoryId,
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

//     if (!existingCategory) {
//       return NextResponse.json({ error: "Category not found" }, { status: 404 })
//     }

//     // If category has URLs, set them to uncategorized
//     if (existingCategory._count.urls > 0) {
//       console.log(`📝 Uncategorizing ${existingCategory._count.urls} URLs`)
//       await prisma.url.updateMany({
//         where: { categoryId: categoryId },
//         data: { categoryId: null }
//       })
//     }

//     // Delete the category
//     await prisma.category.delete({
//       where: { id: categoryId }
//     })

//     console.log('✅ Category deleted:', categoryId)

//     return NextResponse.json({ 
//       message: "Category deleted successfully",
//       uncategorizedUrls: existingCategory._count.urls 
//     })
//   } catch (error) {
//     console.error("❌ Category deletion error:", error)
//     return NextResponse.json({ error: "Internal server error" }, { status: 500 })
//   }
// }