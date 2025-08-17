"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ClockIcon, LinkIcon, UserPlusIcon, PencilIcon, TrashIcon } from "@heroicons/react/24/outline"

interface Activity {
  id: string
  type: string
  description: string
  user: {
    name?: string
    email: string
  }
  createdAt: string
}

interface ActivityFeedProps {
  activities: Activity[]
}

const activityIcons = {
  url_added: LinkIcon,
  url_edited: PencilIcon,
  url_deleted: TrashIcon,
  member_joined: UserPlusIcon,
  member_left: UserPlusIcon,
  role_changed: PencilIcon,
}

const activityColors = {
  url_added: "text-green-600",
  url_edited: "text-blue-600", 
  url_deleted: "text-red-600",
  member_joined: "text-purple-600",
  member_left: "text-gray-600",
  role_changed: "text-orange-600",
}

export default function ActivityFeed({ activities }: ActivityFeedProps) {
  return (
    <Card className="bg-white shadow-sm border-0">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 font-sans">
          <ClockIcon className="w-5 h-5" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <div className="text-center py-6">
            <ClockIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-500 font-sans">No recent activity</p>
          </div>
        ) : (
          <div className="space-y-4">
            {activities.map((activity) => {
              const IconComponent = activityIcons[activity.type as keyof typeof activityIcons] || ClockIcon
              const iconColor = activityColors[activity.type as keyof typeof activityColors] || "text-gray-600"
              
              return (
                <div key={activity.id} className="flex items-start gap-3">
                  <div className={`p-2 rounded-full bg-gray-50 ${iconColor}`}>
                    <IconComponent className="w-4 h-4" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Avatar className="w-6 h-6">
                        <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-xs font-sans">
                          {activity.user.name?.charAt(0) || activity.user.email.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium text-gray-900 font-sans truncate">
                        {activity.user.name || activity.user.email.split('@')[0]}
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-600 font-sans mb-1">
                      {activity.description}
                    </p>
                    
                    <p className="text-xs text-gray-400 font-sans">
                      {new Date(activity.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}















// "use client"

// import { motion } from "framer-motion"
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
// import { Avatar, AvatarFallback } from "@/components/ui/avatar"
// import { ClockIcon, LinkIcon, UsersIcon, FolderIcon, PencilIcon } from "@heroicons/react/24/outline"

// interface Activity {
//   id: string
//   type: string
//   description: string
//   user: {
//     name?: string
//     email: string
//   }
//   createdAt: string
// }

// interface ActivityFeedProps {
//   activities: Activity[]
// }

// const activityIcons = {
//   url_added: LinkIcon,
//   url_updated: PencilIcon,
//   url_deleted: LinkIcon,
//   member_invited: UsersIcon,
//   member_joined: UsersIcon,
//   category_created: FolderIcon,
//   workspace_updated: FolderIcon,
// }

// const activityColors = {
//   url_added: "text-green-600 bg-green-100",
//   url_updated: "text-blue-600 bg-blue-100",
//   url_deleted: "text-red-600 bg-red-100",
//   member_invited: "text-purple-600 bg-purple-100",
//   member_joined: "text-indigo-600 bg-indigo-100",
//   category_created: "text-yellow-600 bg-yellow-100",
//   workspace_updated: "text-gray-600 bg-gray-100",
// }

// export default function ActivityFeed({ activities }: ActivityFeedProps) {
//   return (
//     <Card className="bg-white shadow-sm border-0 h-fit">
//       <CardHeader className="pb-4">
//         <CardTitle className="flex items-center gap-2 font-sans">
//           <ClockIcon className="w-5 h-5" />
//           Recent Activity
//         </CardTitle>
//       </CardHeader>
//       <CardContent className="space-y-4">
//         {activities.length === 0 ? (
//           <div className="text-center py-8">
//             <ClockIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
//             <p className="text-gray-500 font-sans">No recent activity</p>
//           </div>
//         ) : (
//           activities.slice(0, 10).map((activity, index) => {
//             const Icon = activityIcons[activity.type as keyof typeof activityIcons] || ClockIcon
//             const colorClass =
//               activityColors[activity.type as keyof typeof activityColors] || "text-gray-600 bg-gray-100"

//             return (
//               <motion.div
//                 key={activity.id}
//                 initial={{ opacity: 0, x: 20 }}
//                 animate={{ opacity: 1, x: 0 }}
//                 transition={{ delay: index * 0.1 }}
//                 className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
//               >
//                 <div className={`p-2 rounded-full ${colorClass}`}>
//                   <Icon className="w-4 h-4" />
//                 </div>
//                 <div className="flex-1 min-w-0">
//                   <p className="text-sm text-gray-900 font-sans">{activity.description}</p>
//                   <div className="flex items-center gap-2 mt-1">
//                     <Avatar className="w-5 h-5">
//                       <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-xs font-sans">
//                         {activity.user.name?.charAt(0) || activity.user.email.charAt(0).toUpperCase()}
//                       </AvatarFallback>
//                     </Avatar>
//                     <span className="text-xs text-gray-500 font-sans">{activity.user.name || activity.user.email}</span>
//                     <span className="text-xs text-gray-400 font-sans">•</span>
//                     <span className="text-xs text-gray-400 font-sans">
//                       {new Date(activity.createdAt).toLocaleDateString()}
//                     </span>
//                   </div>
//                 </div>
//               </motion.div>
//             )
//           })
//         )}
//       </CardContent>
//     </Card>
//   )
// }
