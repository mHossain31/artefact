import { type NextRequest, NextResponse } from "next/server"
import { validateSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
// import { extractUrlMetadata, captureScreenshot } from "@/lib/url-utils"

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

    const { url, title, description, categoryId } = await request.json()

    // Check if user has access to this URL
    const existingUrl = await prisma.url.findFirst({
      where: {
        id: id,
        workspace: {
          members: {
            some: {
              userId: session.userId,
            },
          },
        },
      },
    })

    if (!existingUrl) {
      return NextResponse.json({ error: "URL not found or access denied" }, { status: 404 })
    }

    // For now, update without metadata extraction
    // If URL changed, extract new metadata and screenshot
    // let metadata = {}
    // let screenshot = existingUrl.screenshot

    // if (url && url !== existingUrl.url) {
    //   metadata = await extractUrlMetadata(url)
    //   screenshot = await captureScreenshot(url)
    // }

    // Update URL
    const updatedUrl = await prisma.url.update({
      where: { id: id },
      data: {
        url: url || existingUrl.url,
        title: title || existingUrl.title,
        description: description || existingUrl.description,
        categoryId: categoryId || existingUrl.categoryId,
        // ...(url &&
        //   url !== existingUrl.url && {
        //     favicon: (metadata as any).favicon,
        //     screenshot,
        //   }),
      },
      include: {
        category: true,
        addedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    return NextResponse.json(updatedUrl)
  } catch (error: any) {
    console.error("Update URL error:", error)
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

    // Check if user has access to this URL
    const existingUrl = await prisma.url.findFirst({
      where: {
        id: id,
        workspace: {
          members: {
            some: {
              userId: session.userId,
            },
          },
        },
      },
    })

    if (!existingUrl) {
      return NextResponse.json({ error: "URL not found or access denied" }, { status: 404 })
    }

    await prisma.url.delete({
      where: { id: id },
    })

    return NextResponse.json({ message: "URL deleted successfully" })
  } catch (error: any) {
    console.error("Delete URL error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
















// import { type NextRequest, NextResponse } from "next/server"
// import { verify } from "jsonwebtoken"
// import { prisma } from "@/lib/prisma"
// import { extractUrlMetadata, captureScreenshot } from "@/lib/url-utils"

// export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
//   try {
//     const token = request.cookies.get("auth-token")?.value

//     if (!token) {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
//     }

//     const decoded = verify(token, process.env.JWT_SECRET || "fallback-secret") as { userId: string }
//     const { url, title, description, categoryId } = await request.json()

//     // Check if user has access to this URL
//     const existingUrl = await prisma.url.findFirst({
//       where: {
//         id: params.id,
//         workspace: {
//           members: {
//             some: {
//               userId: decoded.userId,
//             },
//           },
//         },
//       },
//     })

//     if (!existingUrl) {
//       return NextResponse.json({ error: "URL not found or access denied" }, { status: 404 })
//     }

//     // If URL changed, extract new metadata and screenshot
//     let metadata = {}
//     let screenshot = existingUrl.screenshot

//     if (url && url !== existingUrl.url) {
//       metadata = await extractUrlMetadata(url)
//       screenshot = await captureScreenshot(url)
//     }

//     // Update URL
//     const updatedUrl = await prisma.url.update({
//       where: { id: params.id },
//       data: {
//         url: url || existingUrl.url,
//         title: title || existingUrl.title,
//         description: description || existingUrl.description,
//         categoryId: categoryId || existingUrl.categoryId,
//         ...(url &&
//           url !== existingUrl.url && {
//             favicon: (metadata as any).favicon,
//             screenshot,
//           }),
//       },
//       include: {
//         category: true,
//         addedBy: {
//           select: {
//             id: true,
//             name: true,
//             email: true,
//           },
//         },
//       },
//     })

//     return NextResponse.json(updatedUrl)
//   } catch (error) {
//     console.error("Update URL error:", error)
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

//     // Check if user has access to this URL
//     const existingUrl = await prisma.url.findFirst({
//       where: {
//         id: params.id,
//         workspace: {
//           members: {
//             some: {
//               userId: decoded.userId,
//             },
//           },
//         },
//       },
//     })

//     if (!existingUrl) {
//       return NextResponse.json({ error: "URL not found or access denied" }, { status: 404 })
//     }

//     await prisma.url.delete({
//       where: { id: params.id },
//     })

//     return NextResponse.json({ message: "URL deleted successfully" })
//   } catch (error) {
//     console.error("Delete URL error:", error)
//     return NextResponse.json({ error: "Internal server error" }, { status: 500 })
//   }
// }
