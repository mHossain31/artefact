import { prisma } from "./prisma"
import { Role } from "@prisma/client"

export async function createDefaultWorkspace(userId: string, userName: string) {
  const workspace = await prisma.workspace.create({
    data: {
      name: `${userName}'s Workspace`,
      description: "Your personal workspace",
      members: {
        create: {
          userId,
          role: Role.OWNER,
        },
      },
      categories: {
        create: [
          { name: "Development", color: "#6366f1", icon: "💻" },
          { name: "Design", color: "#ec4899", icon: "🎨" },
          { name: "Marketing", color: "#06b6d4", icon: "📈" },
          { name: "Research", color: "#10b981", icon: "🔍" },
          { name: "Tools", color: "#f59e0b", icon: "🛠️" },
        ],
      },
    },
    include: {
      categories: true,
      members: true,
    },
  })

  return workspace
}

export async function getUserWorkspaces(userId: string) {
  return prisma.workspace.findMany({
    where: {
      members: {
        some: {
          userId,
        },
      },
    },
    include: {
      members: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      },
      _count: {
        select: {
          urls: true,
        },
      },
    },
  })
}

export async function getWorkspaceUrls(workspaceId: string, userId: string) {
  // First verify user has access to this workspace
  const member = await prisma.workspaceMember.findFirst({
    where: {
      workspaceId,
      userId,
    },
  })

  if (!member) {
    throw new Error("Access denied to this workspace")
  }

  return prisma.url.findMany({
    where: {
      workspaceId,
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
}
