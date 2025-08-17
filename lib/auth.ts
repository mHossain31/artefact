import bcrypt from "bcryptjs"
import { prisma } from "./prisma"

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export function generateVerificationCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase()
}

export function generateSessionToken(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}

export async function createSession(userId: string): Promise<string> {
  const sessionToken = generateSessionToken()
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days

  await prisma.session.create({
    data: {
      sessionToken,
      userId,
      expiresAt,
    },
  })

  return sessionToken
}

export async function validateSession(sessionToken: string) {
  const session = await prisma.session.findUnique({ 
    where: { sessionToken },
    include: { user: true }
  })

  if (!session || session.expiresAt < new Date()) {
    if (session) {
      await prisma.session.delete({ where: { sessionToken } })
    }
    return null
  }

  return session
}

export async function deleteSession(sessionToken: string) {
  await prisma.session.delete({ where: { sessionToken } })
}

export async function createUser(email: string, password: string, name?: string) {
  const hashedPassword = await hashPassword(password)
  const verificationCode = generateVerificationCode()
  const codeExpires = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

  console.log('🔐 Creating user with verification code:', verificationCode)

  return prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name,
      verificationCode,
      codeExpires,
    },
  })
}

export async function verifyUserEmail(email: string, code: string) {
  console.log('🔍 Looking for user with email:', email)
  
  const user = await prisma.user.findUnique({ 
    where: { email },
    select: {
      id: true,
      email: true,
      verificationCode: true,
      codeExpires: true,
      emailVerified: true
    }
  })

  console.log('👤 Found user for verification:', user)

  if (!user || !user.verificationCode || !user.codeExpires) {
    console.log('❌ Invalid verification request - missing user, code, or expiry')
    return { success: false, error: "Invalid verification request" }
  }

  if (user.codeExpires < new Date()) {
    console.log('❌ Verification code has expired')
    return { success: false, error: "Verification code has expired" }
  }

  if (user.verificationCode !== code) {
    console.log('❌ Code mismatch:', { expected: user.verificationCode, received: code })
    return { success: false, error: "Invalid verification code" }
  }

  console.log('✅ Code matches, updating user...')
  await prisma.user.update({
    where: { email },
    data: {
      emailVerified: new Date(),
      verificationCode: null,
      codeExpires: null,
    },
  })

  console.log('✅ User updated successfully')
  return { success: true }
}















// import bcrypt from "bcryptjs"
// import { db } from "./database"

// export async function hashPassword(password: string): Promise<string> {
//   return bcrypt.hash(password, 12)
// }

// export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
//   return bcrypt.compare(password, hashedPassword)
// }

// export function generateVerificationCode(): string {
//   return Math.random().toString(36).substring(2, 8).toUpperCase()
// }

// export function generateSessionToken(): string {
//   return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
// }

// export async function createSession(userId: string): Promise<string> {
//   const sessionToken = generateSessionToken()
//   const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days

//   await db.session.create({
//     sessionToken,
//     userId,
//     expiresAt,
//   })

//   return sessionToken
// }

// export async function validateSession(sessionToken: string) {
//   const session = await db.session.findUnique({ sessionToken })

//   if (!session || session.expiresAt < new Date()) {
//     if (session) {
//       await db.session.delete({ sessionToken })
//     }
//     return null
//   }

//   return session
// }

// export async function deleteSession(sessionToken: string) {
//   await db.session.delete({ sessionToken })
// }

// export async function createUser(email: string, password: string, name?: string) {
//   const hashedPassword = await hashPassword(password)
//   const verificationCode = generateVerificationCode()
//   const codeExpires = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

//   return db.user.create({
//     email,
//     password: hashedPassword,
//     name,
//     verificationCode,
//     codeExpires,
//   })
// }

// export async function verifyUserEmail(email: string, code: string) {
//   const user = await db.user.findUnique({ email })

//   if (!user || !user.verificationCode || !user.codeExpires) {
//     return { success: false, error: "Invalid verification request" }
//   }

//   if (user.codeExpires < new Date()) {
//     return { success: false, error: "Verification code has expired" }
//   }

//   if (user.verificationCode !== code) {
//     return { success: false, error: "Invalid verification code" }
//   }

//   await db.user.update(
//     { email },
//     {
//       emailVerified: new Date(),
//       verificationCode: undefined,
//       codeExpires: undefined,
//     },
//   )

//   return { success: true }
// }
