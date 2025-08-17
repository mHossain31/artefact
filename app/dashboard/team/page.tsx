"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import Sidebar from "@/components/dashboard/sidebar"
import InviteTeamModal from "@/components/dashboard/invite-team-modal"
import ActivityFeed from "@/components/dashboard/activity-feed"
import {
  UsersIcon,
  PlusIcon,
  EllipsisHorizontalIcon,
  ShieldCheckIcon,
  UserIcon,
  StarIcon,
  PencilIcon,
  TrashIcon,
} from "@heroicons/react/24/outline"
import { useToast } from "@/hooks/use-toast"

interface TeamMember {
  id: string
  user: {
    id: string
    name?: string
    email: string
  }
  role: "OWNER" | "ADMIN" | "EDITOR" | "VIEWER"
  joinedAt: string
}

interface TeamData {
  user: {
    name?: string
    email: string
  }
  currentWorkspace: {
    id: string
    name: string
    description?: string
  }
  workspaces: Array<{
    id: string
    name: string
    description?: string
  }>
  members: TeamMember[]
  currentUserRole: "OWNER" | "ADMIN" | "EDITOR" | "VIEWER"
  activities: Array<{
    id: string
    type: string
    description: string
    user: {
      name?: string
      email: string
    }
    createdAt: string
  }>
}

const roleColors = {
  OWNER: "bg-gradient-to-r from-yellow-500 to-orange-500",
  ADMIN: "bg-gradient-to-r from-purple-500 to-pink-500",
  EDITOR: "bg-gradient-to-r from-blue-500 to-cyan-500",
  VIEWER: "bg-gradient-to-r from-gray-500 to-gray-600",
}

const roleIcons = {
  OWNER: StarIcon,
  ADMIN: ShieldCheckIcon,
  EDITOR: PencilIcon,
  VIEWER: UserIcon,
}

export default function TeamPage() {
  const [data, setData] = useState<TeamData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchTeamData()
  }, [])

  const fetchTeamData = async () => {
    try {
      console.log('🔍 Fetching team data...')
      const response = await fetch("/api/team")
      if (response.ok) {
        const teamData = await response.json()
        console.log('✅ Team data fetched:', teamData)
        setData(teamData)
      } else {
        console.error('❌ Failed to fetch team data:', response.status)
        toast({
          title: "Failed to load team data",
          description: "Please refresh the page and try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("❌ Failed to fetch team data:", error)
      toast({
        title: "Error loading team",
        description: "Please check your connection and try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleRoleChange = async (memberId: string, newRole: string) => {
    try {
      console.log(`🔄 Updating role for member ${memberId} to ${newRole}`)
      const response = await fetch(`/api/team/members/${memberId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      })

      if (response.ok) {
        toast({
          title: "Role updated",
          description: "Team member role has been successfully updated.",
        })
        fetchTeamData()
      } else {
        const data = await response.json()
        toast({
          title: "Failed to update role",
          description: data.error || "Please try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('❌ Role update error:', error)
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleRemoveMember = async (memberId: string) => {
    try {
      console.log(`🗑️ Removing member ${memberId}`)
      const response = await fetch(`/api/team/members/${memberId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast({
          title: "Member removed",
          description: "Team member has been removed from the workspace.",
        })
        fetchTeamData()
      } else {
        const data = await response.json()
        toast({
          title: "Failed to remove member",
          description: data.error || "Please try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('❌ Remove member error:', error)
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      })
    }
  }

  const canManageMembers = data?.currentUserRole === "OWNER" || data?.currentUserRole === "ADMIN"

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-sans">Loading team data...</p>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 font-sans">Failed to load team data. Please refresh the page.</p>
          <Button 
            onClick={() => window.location.reload()} 
            className="mt-4 bg-gradient-to-r from-indigo-500 to-purple-600"
          >
            Refresh Page
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar currentWorkspace={data.currentWorkspace} workspaces={data.workspaces} user={data.user} />

      <div className="ml-64 p-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2 font-sans">Team Management</h1>
            <p className="text-gray-600 font-sans">
              Manage team members and permissions for <span className="font-medium">{data.currentWorkspace.name}</span>
            </p>
          </div>
          {canManageMembers && (
            <Button
              onClick={() => {
                console.log('🎯 Opening invite modal')
                setIsInviteModalOpen(true)
              }}
              className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 font-sans"
            >
              <PlusIcon className="w-5 h-5 mr-2" />
              Invite Member
            </Button>
          )}
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Team Members */}
          <div className="lg:col-span-2">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <Card className="bg-white shadow-sm border-0">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 font-sans">
                    <UsersIcon className="w-5 h-5" />
                    Team Members ({data.members.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {data.members.length === 0 ? (
                    <div className="text-center py-8">
                      <UsersIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">No team members yet</h3>
                      <p className="text-gray-600 mb-4">Start building your team by inviting members</p>
                      {canManageMembers && (
                        <Button
                          onClick={() => setIsInviteModalOpen(true)}
                          className="bg-gradient-to-r from-indigo-500 to-purple-600"
                        >
                          <PlusIcon className="w-4 h-4 mr-2" />
                          Invite Your First Member
                        </Button>
                      )}
                    </div>
                  ) : (
                    data.members.map((member, index) => {
                      const RoleIcon = roleIcons[member.role]
                      return (
                        <motion.div
                          key={member.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
                        >
                          <div className="flex items-center gap-4">
                            <Avatar className="w-10 h-10">
                              <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-sans">
                                {member.user.name?.charAt(0) || member.user.email.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <h3 className="font-medium text-gray-900 font-sans">
                                {member.user.name || member.user.email}
                              </h3>
                              <p className="text-sm text-gray-500 font-sans">{member.user.email}</p>
                              <p className="text-xs text-gray-400 font-sans">
                                Joined {new Date(member.joinedAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <Badge className={`${roleColors[member.role]} text-white border-0 font-sans`}>
                              <RoleIcon className="w-3 h-3 mr-1" />
                              {member.role}
                            </Badge>

                            {canManageMembers && member.role !== "OWNER" && (
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <EllipsisHorizontalIcon className="w-4 h-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <Select
                                    value={member.role}
                                    onValueChange={(value) => handleRoleChange(member.id, value)}
                                  >
                                    <SelectTrigger className="w-full border-0 font-sans">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="ADMIN" className="font-sans">
                                        Admin
                                      </SelectItem>
                                      <SelectItem value="EDITOR" className="font-sans">
                                        Editor
                                      </SelectItem>
                                      <SelectItem value="VIEWER" className="font-sans">
                                        Viewer
                                      </SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <DropdownMenuItem
                                    onClick={() => handleRemoveMember(member.id)}
                                    className="text-red-600 font-sans"
                                  >
                                    <TrashIcon className="w-4 h-4 mr-2" />
                                    Remove
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            )}
                          </div>
                        </motion.div>
                      )
                    })
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Role Permissions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-8"
            >
              <Card className="bg-white shadow-sm border-0">
                <CardHeader>
                  <CardTitle className="font-sans">Role Permissions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 rounded-lg bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200">
                        <div className="flex items-center gap-2 mb-2">
                          <StarIcon className="w-5 h-5 text-yellow-600" />
                          <h4 className="font-semibold text-yellow-900 font-sans">Owner</h4>
                        </div>
                        <p className="text-sm text-yellow-800 font-sans">
                          Full access to all features, can manage workspace settings and billing
                        </p>
                      </div>

                      <div className="p-4 rounded-lg bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200">
                        <div className="flex items-center gap-2 mb-2">
                          <ShieldCheckIcon className="w-5 h-5 text-purple-600" />
                          <h4 className="font-semibold text-purple-900 font-sans">Admin</h4>
                        </div>
                        <p className="text-sm text-purple-800 font-sans">
                          Can manage team members, URLs, and workspace settings
                        </p>
                      </div>

                      <div className="p-4 rounded-lg bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200">
                        <div className="flex items-center gap-2 mb-2">
                          <PencilIcon className="w-5 h-5 text-blue-600" />
                          <h4 className="font-semibold text-blue-900 font-sans">Editor</h4>
                        </div>
                        <p className="text-sm text-blue-800 font-sans">Can add, edit, and delete URLs and categories</p>
                      </div>

                      <div className="p-4 rounded-lg bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200">
                        <div className="flex items-center gap-2 mb-2">
                          <UserIcon className="w-5 h-5 text-gray-600" />
                          <h4 className="font-semibold text-gray-900 font-sans">Viewer</h4>
                        </div>
                        <p className="text-sm text-gray-800 font-sans">Can view URLs and workspace content only</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Activity Feed */}
          <div className="lg:col-span-1">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <ActivityFeed activities={data.activities} />
            </motion.div>
          </div>
        </div>
      </div>

      {/* Invite Modal */}
      <InviteTeamModal
        isOpen={isInviteModalOpen}
        onClose={() => {
          console.log('🔒 Closing invite modal')
          setIsInviteModalOpen(false)
        }}
        onMemberInvited={() => {
          console.log('🔄 Member invited, refreshing team data')
          fetchTeamData()
        }}
      />
    </div>
  )
}
















// "use client"

// import { useState, useEffect } from "react"
// import { motion } from "framer-motion"
// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
// import { Badge } from "@/components/ui/badge"
// import { useAuth } from "@/hooks/useAuth"
// import Sidebar from "@/components/dashboard/sidebar"
// import {
//   PlusIcon,
//   MagnifyingGlassIcon,
//   UsersIcon,
//   UserPlusIcon,
//   EllipsisHorizontalIcon
// } from "@heroicons/react/24/outline"

// interface TeamMember {
//   id: string
//   name: string
//   email: string
//   role: string
//   joinedAt: string
//   avatar?: string
// }

// export default function TeamPage() {
//   const { user, loading: authLoading } = useAuth()
//   const [members, setMembers] = useState<TeamMember[]>([])
//   const [searchQuery, setSearchQuery] = useState("")
//   const [isLoading, setIsLoading] = useState(true)

//   // Mock data for now - you can replace this with real API calls
//   useEffect(() => {
//     // Simulate loading team members
//     setTimeout(() => {
//       setMembers([
//         {
//           id: "1",
//           name: "MH",
//           email: "anonymousreaper01@gmail.com",
//           role: "Owner",
//           joinedAt: "2025-08-16T00:00:00Z"
//         }
//       ])
//       setIsLoading(false)
//     }, 1000)
//   }, [])

//   const filteredMembers = members.filter(member =>
//     member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
//     member.email.toLowerCase().includes(searchQuery.toLowerCase())
//   )

//   if (authLoading || isLoading) {
//     return (
//       <div className="min-h-screen bg-gray-50 flex items-center justify-center">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
//           <p className="text-gray-600 font-sans">Loading team...</p>
//         </div>
//       </div>
//     )
//   }

//   if (!user) {
//     return null
//   }

//   return (
//     <div className="min-h-screen bg-gray-50">
//       <Sidebar 
//         currentWorkspace={{ id: "1", name: "MH's Workspace", description: "Your personal workspace" }}
//         workspaces={[{ id: "1", name: "MH's Workspace", description: "Your personal workspace" }]}
//         user={user} 
//       />

//       {/* Main Content */}
//       <div className="ml-64 p-8">
//         {/* Header */}
//         <div className="mb-8">
//           <motion.div
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             className="flex items-center justify-between mb-6"
//           >
//             <div>
//               <h1 className="text-3xl font-bold text-gray-900 mb-2 font-sans">
//                 Team Management
//               </h1>
//               <p className="text-gray-600 font-sans">
//                 Manage your workspace members and permissions
//               </p>
//             </div>
//             <Button className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 font-sans">
//               <UserPlusIcon className="w-5 h-5 mr-2" />
//               Invite Members
//             </Button>
//           </motion.div>

//           {/* Search and Stats */}
//           <motion.div
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ delay: 0.1 }}
//             className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-gray-200"
//           >
//             <div className="relative flex-1 max-w-md">
//               <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
//               <Input
//                 placeholder="Search team members..."
//                 value={searchQuery}
//                 onChange={(e) => setSearchQuery(e.target.value)}
//                 className="pl-10 font-sans"
//               />
//             </div>
//             <div className="flex items-center gap-4 text-sm text-gray-600">
//               <div className="flex items-center gap-2">
//                 <UsersIcon className="w-4 h-4" />
//                 <span>{members.length} member{members.length !== 1 ? 's' : ''}</span>
//               </div>
//             </div>
//           </motion.div>
//         </div>

//         {/* Team Members */}
//         <motion.div 
//           initial={{ opacity: 0 }} 
//           animate={{ opacity: 1 }} 
//           transition={{ delay: 0.2 }}
//         >
//           {filteredMembers.length === 0 ? (
//             <div className="text-center py-12">
//               <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
//                 <UsersIcon className="w-12 h-12 text-gray-400" />
//               </div>
//               <h3 className="text-lg font-semibold text-gray-900 mb-2 font-sans">
//                 {searchQuery ? "No members found" : "No team members yet"}
//               </h3>
//               <p className="text-gray-600 mb-6 font-sans">
//                 {searchQuery 
//                   ? "Try adjusting your search terms" 
//                   : "Invite your first team member to get started"}
//               </p>
//               {!searchQuery && (
//                 <Button className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 font-sans">
//                   <UserPlusIcon className="w-5 h-5 mr-2" />
//                   Invite Your First Member
//                 </Button>
//               )}
//             </div>
//           ) : (
//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//               {filteredMembers.map((member, index) => (
//                 <motion.div
//                   key={member.id}
//                   initial={{ opacity: 0, y: 20 }}
//                   animate={{ opacity: 1, y: 0 }}
//                   transition={{ delay: index * 0.1 }}
//                 >
//                   <Card className="hover:shadow-lg transition-shadow duration-200">
//                     <CardContent className="p-6">
//                       <div className="flex items-start justify-between mb-4">
//                         <div className="flex items-center gap-3">
//                           <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
//                             <span className="text-white font-semibold text-sm">
//                               {member.name.charAt(0).toUpperCase()}
//                             </span>
//                           </div>
//                           <div>
//                             <h3 className="font-semibold text-gray-900 font-sans">{member.name}</h3>
//                             <p className="text-sm text-gray-600 font-sans">{member.email}</p>
//                           </div>
//                         </div>
//                         <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
//                           <EllipsisHorizontalIcon className="w-4 h-4" />
//                         </Button>
//                       </div>
                      
//                       <div className="flex items-center justify-between">
//                         <Badge 
//                           variant={member.role === 'Owner' ? 'default' : 'secondary'}
//                           className="font-sans"
//                         >
//                           {member.role}
//                         </Badge>
//                         <span className="text-xs text-gray-500">
//                           Joined {new Date(member.joinedAt).toLocaleDateString()}
//                         </span>
//                       </div>
//                     </CardContent>
//                   </Card>
//                 </motion.div>
//               ))}
//             </div>
//           )}
//         </motion.div>
//       </div>
//     </div>
//   )
// }