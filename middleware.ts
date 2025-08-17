import { type NextRequest, NextResponse } from "next/server"

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  console.log('🔍 MIDDLEWARE - Path:', pathname)
  
  // For dashboard routes, just check if session cookie exists (basic check)
  if (pathname.startsWith("/dashboard")) {
    const sessionCookie = request.cookies.get("session")
    
    console.log('🍪 MIDDLEWARE - Session cookie exists:', !!sessionCookie)
    
    if (!sessionCookie) {
      console.log('❌ MIDDLEWARE - No session cookie, redirecting to home')
      return NextResponse.redirect(new URL("/", request.url))
    }
    
    // If session cookie exists, let the request through
    // The actual validation will happen in the API routes
    console.log('✅ MIDDLEWARE - Session cookie found, allowing access')
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: ["/dashboard/:path*"],
}






// import { type NextRequest, NextResponse } from "next/server"
// import { validateSession } from "@/lib/auth"

// export async function middleware(request: NextRequest) {
//   // Check if the request is for a protected route
//   if (request.nextUrl.pathname.startsWith("/dashboard")) {
//     const sessionToken = request.cookies.get("session")?.value

//     if (!sessionToken) {
//       return NextResponse.redirect(new URL("/", request.url))
//     }

//     try {
//       const session = await validateSession(sessionToken)
//       if (!session) {
//         return NextResponse.redirect(new URL("/", request.url))
//       }
//       return NextResponse.next()
//     } catch (error) {
//       return NextResponse.redirect(new URL("/", request.url))
//     }
//   }

//   return NextResponse.next()
// }

// export const config = {
//   matcher: ["/dashboard/:path*"],
// }
