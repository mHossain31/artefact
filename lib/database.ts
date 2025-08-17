// For v0 demo: In-memory database
// For local development: Switch to Prisma implementation

// In-memory database interfaces
interface User {
  id: string
  email: string
  password: string
  name?: string
  emailVerified?: Date
  verificationCode?: string
  codeExpires?: Date
  createdAt: Date
}

interface Session {
  id: string
  sessionToken: string
  userId: string
  expiresAt: Date
  createdAt: Date
  user?: User
}

interface Workspace {
  id: string
  name: string
  description?: string
  createdAt: Date
}

interface Url {
  id: string
  title: string
  url: string
  description?: string
  screenshot?: string
  favicon?: string
  categoryId?: string
  workspaceId: string
  userId: string
  createdAt: Date
  category?: Category | null
  addedBy?: User | null
}

interface Category {
  id: string
  name: string
  color: string
  icon?: string
  workspaceId: string
  createdAt: Date
}

interface WorkspaceMember {
  id: string
  userId: string
  workspaceId: string
  role: "OWNER" | "ADMIN" | "EDITOR" | "VIEWER"
  joinedAt: Date
}

// In-memory storage
const users: User[] = []
const sessions: Session[] = []
const workspaces: Workspace[] = []
const urls: Url[] = []
const categories: Category[] = []
const workspaceMembers: WorkspaceMember[] = []

export const db = {
  user: {
    create: async (data: Omit<User, "id" | "createdAt">) => {
      const user: User = {
        id: Math.random().toString(36).substring(2, 15),
        createdAt: new Date(),
        ...data,
      }
      users.push(user)
      return user
    },
    findUnique: async (where: { email?: string; id?: string }) => {
      return users.find((u) => (where.email && u.email === where.email) || (where.id && u.id === where.id)) || null
    },
    update: async (where: { email?: string; id?: string }, data: Partial<User>) => {
      const userIndex = users.findIndex(
        (u) => (where.email && u.email === where.email) || (where.id && u.id === where.id),
      )
      if (userIndex !== -1) {
        users[userIndex] = { ...users[userIndex], ...data }
        return users[userIndex]
      }
      return null
    },
  },
  session: {
    create: async (data: Omit<Session, "id" | "createdAt">) => {
      const session: Session = {
        id: Math.random().toString(36).substring(2, 15),
        createdAt: new Date(),
        ...data,
      }
      sessions.push(session)
      return session
    },
    findUnique: async (where: { sessionToken: string }) => {
      const session = sessions.find((s) => s.sessionToken === where.sessionToken)
      if (session) {
        const user = users.find((u) => u.id === session.userId)
        return { ...session, user }
      }
      return null
    },
    delete: async (where: { sessionToken: string }) => {
      const sessionIndex = sessions.findIndex((s) => s.sessionToken === where.sessionToken)
      if (sessionIndex !== -1) {
        sessions.splice(sessionIndex, 1)
      }
    },
  },
  workspace: {
    create: async (data: Omit<Workspace, "id" | "createdAt">) => {
      const workspace: Workspace = {
        id: Math.random().toString(36).substring(2, 15),
        createdAt: new Date(),
        ...data,
      }
      workspaces.push(workspace)
      return workspace
    },
    findMany: async (where?: { members?: { some: { userId: string } } }) => {
      if (where?.members?.some?.userId) {
        const userWorkspaceIds = workspaceMembers
          .filter((wm) => wm.userId === where.members.some.userId)
          .map((wm) => wm.workspaceId)
        return workspaces.filter((w) => userWorkspaceIds.includes(w.id))
      }
      return workspaces
    },
  },
  workspaceMember: {
    create: async (data: Omit<WorkspaceMember, "id" | "joinedAt">) => {
      const member: WorkspaceMember = {
        id: Math.random().toString(36).substring(2, 15),
        joinedAt: new Date(),
        ...data,
      }
      workspaceMembers.push(member)
      return member
    },
    findFirst: async (where: { userId: string; workspaceId?: string }) => {
      return (
        workspaceMembers.find(
          (wm) => wm.userId === where.userId && (!where.workspaceId || wm.workspaceId === where.workspaceId),
        ) || null
      )
    },
  },
  url: {
    create: async (data: Omit<Url, "id" | "createdAt">) => {
      const url: Url = {
        id: Math.random().toString(36).substring(2, 15),
        createdAt: new Date(),
        ...data,
      }
      urls.push(url)
      return url
    },
    findMany: async (where?: { workspaceId?: string }) => {
      let filteredUrls = urls
      if (where?.workspaceId) {
        filteredUrls = urls.filter((u) => u.workspaceId === where.workspaceId)
      }
      return filteredUrls.map((url) => ({
        ...url,
        category: categories.find((c) => c.id === url.categoryId) || null,
        addedBy: users.find((u) => u.id === url.userId) || null,
      }))
    },
  },
  category: {
    findMany: async (where?: { workspaceId?: string }) => {
      if (where?.workspaceId) {
        return categories.filter((c) => c.workspaceId === where.workspaceId)
      }
      return categories
    },
  },
}

export async function createDefaultWorkspace(userId: string, userName: string) {
  const workspace = await db.workspace.create({
    name: `${userName}'s Workspace`,
    description: "Your personal workspace",
  })

  await db.workspaceMember.create({
    userId,
    workspaceId: workspace.id,
    role: "OWNER",
  })

  return workspace
}
