"use client"

import { useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  LinkIcon,
  HomeIcon,
  FolderIcon,
  UsersIcon,
  CogIcon,
  ChevronDownIcon,
  PlusIcon,
  ArrowRightOnRectangleIcon,
} from "@heroicons/react/24/outline"

interface SidebarProps {
  currentWorkspace?: {
    id: string
    name: string
    description?: string
  }
  workspaces?: Array<{
    id: string
    name: string
    description?: string
  }>
  user?: {
    name?: string
    email: string
  }
}

export default function Sidebar({ currentWorkspace, workspaces = [], user }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" })
      window.location.href = "/"
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  const handleNavigation = (href: string) => {
    router.push(href)
  }

  const menuItems = [
    { icon: HomeIcon, label: "Dashboard", href: "/dashboard" },
    { icon: LinkIcon, label: "All URLs", href: "/dashboard/urls" },
    { icon: FolderIcon, label: "Categories", href: "/dashboard/categories" },
    { icon: UsersIcon, label: "Team", href: "/dashboard/team" },
    { icon: CogIcon, label: "Settings", href: "/dashboard/settings" },
  ]

  return (
    <motion.div
      initial={{ x: -280 }}
      animate={{ x: 0 }}
      className={`fixed left-0 top-0 h-full bg-white border-r border-gray-200 z-40 transition-all duration-300 ${
        isCollapsed ? "w-16" : "w-64"
      }`}
    >
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600">
              <LinkIcon className="w-6 h-6 text-white" />
            </div>
            {!isCollapsed && (
              <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent font-sans">
                ARTEFACT
              </span>
            )}
          </div>
        </div>

        {/* Workspace Switcher */}
        {!isCollapsed && (
          <div className="p-4 border-b border-gray-200">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="w-full justify-between p-3 h-auto">
                  <div className="text-left">
                    <div className="font-medium text-gray-900 font-sans">
                      {currentWorkspace?.name || "Select Workspace"}
                    </div>
                    <div className="text-sm text-gray-500 font-sans">
                      {currentWorkspace?.description || "No workspace selected"}
                    </div>
                  </div>
                  <ChevronDownIcon className="w-4 h-4 text-gray-400" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56">
                {workspaces.map((workspace) => (
                  <DropdownMenuItem key={workspace.id} className="p-3">
                    <div>
                      <div className="font-medium font-sans">{workspace.name}</div>
                      <div className="text-sm text-gray-500 font-sans">{workspace.description}</div>
                    </div>
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem className="p-3">
                  <PlusIcon className="w-4 h-4 mr-2" />
                  <span className="font-sans">Create Workspace</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {menuItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <li key={item.label}>
                  <Button
                    variant={isActive ? "default" : "ghost"}
                    onClick={() => handleNavigation(item.href)}
                    className={`w-full justify-start gap-3 h-10 font-sans transition-colors cursor-pointer ${
                      isActive
                        ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white"
                        : "text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    {!isCollapsed && <span>{item.label}</span>}
                  </Button>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-gray-200">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="w-full justify-start gap-3 p-3 h-auto">
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-sm font-sans">
                    {user?.name?.charAt(0) || user?.email.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                {!isCollapsed && (
                  <div className="text-left flex-1">
                    <div className="font-medium text-gray-900 text-sm font-sans">{user?.name || "User"}</div>
                    <div className="text-xs text-gray-500 font-sans">{user?.email}</div>
                  </div>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end">
              <DropdownMenuItem className="font-sans">Profile Settings</DropdownMenuItem>
              <DropdownMenuItem className="font-sans">Preferences</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-red-600 font-sans">
                <ArrowRightOnRectangleIcon className="w-4 h-4 mr-2" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </motion.div>
  )
}













// "use client"

// import { useState } from "react"
// import { motion } from "framer-motion"
// import { Button } from "@/components/ui/button"
// import { Avatar, AvatarFallback } from "@/components/ui/avatar"
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuSeparator,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu"
// import {
//   LinkIcon,
//   HomeIcon,
//   FolderIcon,
//   UsersIcon,
//   CogIcon,
//   ChevronDownIcon,
//   PlusIcon,
//   LogOutIcon,
// } from "@heroicons/react/24/outline"

// interface SidebarProps {
//   currentWorkspace?: {
//     id: string
//     name: string
//     description?: string
//   }
//   workspaces?: Array<{
//     id: string
//     name: string
//     description?: string
//   }>
//   user?: {
//     name?: string
//     email: string
//   }
// }

// export default function Sidebar({ currentWorkspace, workspaces = [], user }: SidebarProps) {
//   const [isCollapsed, setIsCollapsed] = useState(false)

//   const handleLogout = async () => {
//     try {
//       await fetch("/api/auth/logout", { method: "POST" })
//       window.location.href = "/"
//     } catch (error) {
//       console.error("Logout error:", error)
//     }
//   }

//   const menuItems = [
//     { icon: HomeIcon, label: "Dashboard", href: "/dashboard", active: true },
//     { icon: LinkIcon, label: "All URLs", href: "/dashboard/urls", active: false },
//     { icon: FolderIcon, label: "Categories", href: "/dashboard/categories", active: false },
//     { icon: UsersIcon, label: "Team", href: "/dashboard/team", active: false },
//     { icon: CogIcon, label: "Settings", href: "/dashboard/settings", active: false },
//   ]

//   return (
//     <motion.div
//       initial={{ x: -280 }}
//       animate={{ x: 0 }}
//       className={`fixed left-0 top-0 h-full bg-white border-r border-gray-200 z-40 transition-all duration-300 ${
//         isCollapsed ? "w-16" : "w-64"
//       }`}
//     >
//       <div className="flex flex-col h-full">
//         {/* Header */}
//         <div className="p-4 border-b border-gray-200">
//           <div className="flex items-center gap-3">
//             <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600">
//               <LinkIcon className="w-6 h-6 text-white" />
//             </div>
//             {!isCollapsed && (
//               <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent font-sans">
//                 ARTEFACT
//               </span>
//             )}
//           </div>
//         </div>

//         {/* Workspace Switcher */}
//         {!isCollapsed && (
//           <div className="p-4 border-b border-gray-200">
//             <DropdownMenu>
//               <DropdownMenuTrigger asChild>
//                 <Button variant="ghost" className="w-full justify-between p-3 h-auto">
//                   <div className="text-left">
//                     <div className="font-medium text-gray-900 font-sans">
//                       {currentWorkspace?.name || "Select Workspace"}
//                     </div>
//                     <div className="text-sm text-gray-500 font-sans">
//                       {currentWorkspace?.description || "No workspace selected"}
//                     </div>
//                   </div>
//                   <ChevronDownIcon className="w-4 h-4 text-gray-400" />
//                 </Button>
//               </DropdownMenuTrigger>
//               <DropdownMenuContent className="w-56">
//                 {workspaces.map((workspace) => (
//                   <DropdownMenuItem key={workspace.id} className="p-3">
//                     <div>
//                       <div className="font-medium font-sans">{workspace.name}</div>
//                       <div className="text-sm text-gray-500 font-sans">{workspace.description}</div>
//                     </div>
//                   </DropdownMenuItem>
//                 ))}
//                 <DropdownMenuSeparator />
//                 <DropdownMenuItem className="p-3">
//                   <PlusIcon className="w-4 h-4 mr-2" />
//                   <span className="font-sans">Create Workspace</span>
//                 </DropdownMenuItem>
//               </DropdownMenuContent>
//             </DropdownMenu>
//           </div>
//         )}

//         {/* Navigation */}
//         <nav className="flex-1 p-4">
//           <ul className="space-y-2">
//             {menuItems.map((item) => (
//               <li key={item.label}>
//                 <Button
//                   variant={item.active ? "default" : "ghost"}
//                   className={`w-full justify-start gap-3 h-10 font-sans ${
//                     item.active
//                       ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white"
//                       : "text-gray-700 hover:text-gray-900 hover:bg-gray-100"
//                   }`}
//                 >
//                   <item.icon className="w-5 h-5" />
//                   {!isCollapsed && <span>{item.label}</span>}
//                 </Button>
//               </li>
//             ))}
//           </ul>
//         </nav>

//         {/* User Profile */}
//         <div className="p-4 border-t border-gray-200">
//           <DropdownMenu>
//             <DropdownMenuTrigger asChild>
//               <Button variant="ghost" className="w-full justify-start gap-3 p-3 h-auto">
//                 <Avatar className="w-8 h-8">
//                   <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-sm font-sans">
//                     {user?.name?.charAt(0) || user?.email.charAt(0).toUpperCase()}
//                   </AvatarFallback>
//                 </Avatar>
//                 {!isCollapsed && (
//                   <div className="text-left flex-1">
//                     <div className="font-medium text-gray-900 text-sm font-sans">{user?.name || "User"}</div>
//                     <div className="text-xs text-gray-500 font-sans">{user?.email}</div>
//                   </div>
//                 )}
//               </Button>
//             </DropdownMenuTrigger>
//             <DropdownMenuContent className="w-56" align="end">
//               <DropdownMenuItem className="font-sans">Profile Settings</DropdownMenuItem>
//               <DropdownMenuItem className="font-sans">Preferences</DropdownMenuItem>
//               <DropdownMenuSeparator />
//               <DropdownMenuItem onClick={handleLogout} className="text-red-600 font-sans">
//                 <LogOutIcon className="w-4 h-4 mr-2" />
//                 Sign Out
//               </DropdownMenuItem>
//             </DropdownMenuContent>
//           </DropdownMenu>
//         </div>
//       </div>
//     </motion.div>
//   )
// }
