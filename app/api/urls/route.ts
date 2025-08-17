import { type NextRequest, NextResponse } from "next/server"
import { validateSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { extractUrlMetadata, getImageForUrl, normalizeUrl, isValidUrl } from "@/lib/url-utils"

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

    const { url, title, description, categoryId } = await request.json()

    // Validate input
    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 })
    }

    // Normalize and validate URL
    const normalizedUrl = normalizeUrl(url)
    if (!isValidUrl(normalizedUrl)) {
      return NextResponse.json({ error: "Invalid URL format" }, { status: 400 })
    }

    // Get user's current workspace
    const userWorkspace = await prisma.workspaceMember.findFirst({
      where: { userId: session.userId },
      include: { workspace: true },
    })

    if (!userWorkspace) {
      return NextResponse.json({ error: "No workspace found" }, { status: 404 })
    }

    console.log('🌐 Processing URL:', normalizedUrl)

    // Extract metadata first
    const metadata = await extractUrlMetadata(normalizedUrl)
    
    // Then try to get an image (screenshot or fallback to OG image)
    const imageUrl = await getImageForUrl(normalizedUrl, metadata)

    // Create URL record
    const newUrl = await prisma.url.create({
      data: {
        url: normalizedUrl,
        title: title || metadata.title || "Untitled",
        description: description || metadata.description || "",
        favicon: metadata.favicon,
        screenshot: imageUrl,
        categoryId: categoryId || null,
        workspaceId: userWorkspace.workspaceId,
        userId: session.userId,
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

    console.log('✅ URL created successfully:', newUrl.id)
    return NextResponse.json(newUrl)
    
  } catch (error: any) {
    console.error("❌ Create URL error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// Add this endpoint for frontend to extract metadata before creating URL
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const url = searchParams.get("url")
    const action = searchParams.get("action")

    // If action is extract-metadata, return metadata for the frontend
    if (action === "extract-metadata" && url) {
      const normalizedUrl = normalizeUrl(url)
      if (!isValidUrl(normalizedUrl)) {
        return NextResponse.json({ error: "Invalid URL format" }, { status: 400 })
      }

      const metadata = await extractUrlMetadata(normalizedUrl)
      return NextResponse.json(metadata)
    }

    // Otherwise, return user's URLs (existing functionality)
    const sessionCookie = request.cookies.get("session")

    if (!sessionCookie) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Validate session using your existing auth system
    const session = await validateSession(sessionCookie.value)
    
    if (!session) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 })
    }

    const workspaceId = searchParams.get("workspaceId")

    // Get user's workspace
    const userWorkspace = await prisma.workspaceMember.findFirst({
      where: {
        userId: session.userId,
        ...(workspaceId ? { workspaceId } : {}),
      },
    })

    if (!userWorkspace) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }

    const urls = await prisma.url.findMany({
      where: {
        workspaceId: userWorkspace.workspaceId,
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
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json(urls)
  } catch (error: any) {
    console.error("Get URLs error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}












// import { type NextRequest, NextResponse } from "next/server"
// import { verify } from "jsonwebtoken"
// import { prisma } from "@/lib/prisma"
// import { extractUrlMetadata, captureScreenshot } from "@/lib/url-utils"

// export async function POST(request: NextRequest) {
//   try {
//     const token = request.cookies.get("auth-token")?.value

//     if (!token) {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
//     }

//     const decoded = verify(token, process.env.JWT_SECRET || "fallback-secret") as { userId: string }
//     const { url, title, description, categoryId } = await request.json()

//     // Validate input
//     if (!url || !title) {
//       return NextResponse.json({ error: "URL and title are required" }, { status: 400 })
//     }

//     // Get user's current workspace
//     const userWorkspace = await prisma.workspaceMember.findFirst({
//       where: { userId: decoded.userId },
//       include: { workspace: true },
//     })

//     if (!userWorkspace) {
//       return NextResponse.json({ error: "No workspace found" }, { status: 404 })
//     }

//     // Extract metadata and capture screenshot
//     const metadata = await extractUrlMetadata(url)
//     const screenshot = await captureScreenshot(url)

//     // Create URL record
//     const newUrl = await prisma.url.create({
//       data: {
//         url,
//         title: title || metadata.title || "Untitled",
//         description: description || metadata.description || "",
//         favicon: metadata.favicon,
//         screenshot,
//         categoryId: categoryId || null,
//         workspaceId: userWorkspace.workspaceId,
//         userId: decoded.userId,
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

//     return NextResponse.json(newUrl)
//   } catch (error) {
//     console.error("Create URL error:", error)
//     return NextResponse.json({ error: "Internal server error" }, { status: 500 })
//   }
// }

// export async function GET(request: NextRequest) {
//   try {
//     const token = request.cookies.get("auth-token")?.value

//     if (!token) {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
//     }

//     const decoded = verify(token, process.env.JWT_SECRET || "fallback-secret") as { userId: string }
//     const { searchParams } = new URL(request.url)
//     const workspaceId = searchParams.get("workspaceId")

//     // Get user's workspace
//     const userWorkspace = await prisma.workspaceMember.findFirst({
//       where: {
//         userId: decoded.userId,
//         ...(workspaceId ? { workspaceId } : {}),
//       },
//     })

//     if (!userWorkspace) {
//       return NextResponse.json({ error: "Access denied" }, { status: 403 })
//     }

//     const urls = await prisma.url.findMany({
//       where: {
//         workspaceId: userWorkspace.workspaceId,
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
//       orderBy: {
//         createdAt: "desc",
//       },
//     })

//     return NextResponse.json(urls)
//   } catch (error) {
//     console.error("Get URLs error:", error)
//     return NextResponse.json({ error: "Internal server error" }, { status: 500 })
//   }
// }
