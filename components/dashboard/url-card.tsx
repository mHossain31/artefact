"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  EllipsisHorizontalIcon,
  ArrowTopRightOnSquareIcon,
  PencilIcon,
  TrashIcon,
  ShareIcon,
  HeartIcon,
} from "@heroicons/react/24/outline"
import { HeartIcon as HeartSolidIcon } from "@heroicons/react/24/solid"

interface UrlCardProps {
  url: {
    id: string
    title: string
    url: string
    description?: string
    screenshot?: string
    favicon?: string
    category?: {
      id: string
      name: string
      color: string
      icon?: string
    }
    addedBy: {
      name?: string
      email: string
    }
    createdAt: string
  }
  onEdit?: (urlData: any) => void
  onDelete?: (urlData: any) => void
  onShare?: (id: string) => void
}

export default function UrlCard({ url, onEdit, onDelete, onShare }: UrlCardProps) {
  const [isLiked, setIsLiked] = useState(false)
  const [isImageLoaded, setIsImageLoaded] = useState(false)

  const handleVisit = () => {
    window.open(url.url, "_blank", "noopener,noreferrer")
  }

  const handleEdit = () => {
    onEdit?.({
      id: url.id,
      title: url.title,
      url: url.url,
      description: url.description,
      category: url.category,
    })
  }

  const handleDelete = () => {
    onDelete?.({
      id: url.id,
      title: url.title,
      url: url.url,
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.3 }}
      className="h-full" // Ensure consistent height
    >
      <div className="group h-full flex flex-col overflow-hidden border border-gray-200/60 shadow-sm hover:shadow-lg hover:border-gray-300/60 transition-all duration-300 bg-white rounded-xl">
        {/* Screenshot/Preview - Taller image area */}
        <div className="relative h-56 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
          {url.screenshot ? (
            <img
              src={url.screenshot}
              alt={url.title}
              className={`w-full h-full object-cover transition-all duration-300 ${
                isImageLoaded ? "opacity-100 scale-100" : "opacity-0 scale-105"
              }`}
              onLoad={() => setIsImageLoaded(true)}
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
              <ArrowTopRightOnSquareIcon className="w-8 h-8 text-gray-400" />
            </div>
          )}

          {/* Overlay with actions */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
            <Button 
              onClick={handleVisit} 
              size="sm" 
              className="bg-white/95 text-gray-900 hover:bg-white font-medium shadow-sm border border-white/20 backdrop-blur-sm"
            >
              <ArrowTopRightOnSquareIcon className="w-4 h-4 mr-2" />
              Visit
            </Button>
          </div>

          {/* Category Badge */}
          {url.category && (
            <div className="absolute top-3 left-3">
              <Badge 
                style={{ backgroundColor: url.category.color }} 
                className="text-white border-0 font-medium text-xs shadow-sm"
              >
                <span className="mr-1">{url.category.icon}</span>
                {url.category.name}
              </Badge>
            </div>
          )}

          {/* Actions Menu */}
          <div className="absolute top-3 right-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 bg-white/90 hover:bg-white text-gray-700 opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-sm border border-white/20 backdrop-blur-sm"
                >
                  <EllipsisHorizontalIcon className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-36">
                <DropdownMenuItem onClick={handleEdit} className="font-medium text-sm">
                  <PencilIcon className="w-4 h-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onShare?.(url.id)} className="font-medium text-sm">
                  <ShareIcon className="w-4 h-4 mr-2" />
                  Share
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleDelete} className="text-red-600 font-medium text-sm">
                  <TrashIcon className="w-4 h-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Content - Flexible height */}
        <div className="p-5 flex-1 flex flex-col">
          {/* Header with favicon and title */}
          <div className="flex items-start gap-3 mb-3">
            <div className="flex-shrink-0 mt-0.5">
              {url.favicon ? (
                <img
                  src={url.favicon}
                  alt=""
                  className="w-5 h-5 rounded-sm"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none'
                  }}
                />
              ) : (
                <div className="w-5 h-5 rounded-sm bg-gray-200 flex items-center justify-center">
                  <ArrowTopRightOnSquareIcon className="w-3 h-3 text-gray-400" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 text-base leading-tight mb-2 line-clamp-2">
                {url.title}
              </h3>
              {url.description && (
                <p className="text-sm text-gray-600 leading-relaxed line-clamp-2 mb-3">
                  {url.description}
                </p>
              )}
              <p className="text-xs text-gray-400 truncate font-mono bg-gray-50 px-2 py-1 rounded">
                {new URL(url.url).hostname}
              </p>
            </div>
          </div>

          {/* Footer - Always at bottom */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-auto">
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <span className="truncate max-w-[120px]">
                {url.addedBy.name || url.addedBy.email.split('@')[0]}
              </span>
              <span>•</span>
              <span className="whitespace-nowrap">
                {new Date(url.createdAt).toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric' 
                })}
              </span>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsLiked(!isLiked)}
              className="h-8 w-8 p-0 text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
            >
              {isLiked ? (
                <HeartSolidIcon className="w-4 h-4 text-red-500" />
              ) : (
                <HeartIcon className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}









// "use client"

// import { useState } from "react"
// import { motion } from "framer-motion"
// import { Card, CardContent } from "@/components/ui/card"
// import { Button } from "@/components/ui/button"
// import { Badge } from "@/components/ui/badge"
// import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
// import {
//   EllipsisHorizontalIcon,
//   ExternalLinkIcon,
//   PencilIcon,
//   TrashIcon,
//   ShareIcon,
//   HeartIcon,
// } from "@heroicons/react/24/outline"
// import { HeartIcon as HeartSolidIcon } from "@heroicons/react/24/solid"

// interface UrlCardProps {
//   url: {
//     id: string
//     title: string
//     url: string
//     description?: string
//     screenshot?: string
//     favicon?: string
//     category?: {
//       id: string
//       name: string
//       color: string
//       icon?: string
//     }
//     addedBy: {
//       name?: string
//       email: string
//     }
//     createdAt: string
//   }
//   onEdit?: (urlData: any) => void
//   onDelete?: (urlData: any) => void
//   onShare?: (id: string) => void
// }

// export default function UrlCard({ url, onEdit, onDelete, onShare }: UrlCardProps) {
//   const [isLiked, setIsLiked] = useState(false)
//   const [isImageLoaded, setIsImageLoaded] = useState(false)

//   const handleVisit = () => {
//     window.open(url.url, "_blank", "noopener,noreferrer")
//   }

//   const handleEdit = () => {
//     onEdit?.({
//       id: url.id,
//       title: url.title,
//       url: url.url,
//       description: url.description,
//       category: url.category,
//     })
//   }

//   const handleDelete = () => {
//     onDelete?.({
//       id: url.id,
//       title: url.title,
//       url: url.url,
//     })
//   }

//   return (
//     <motion.div
//       initial={{ opacity: 0, y: 20 }}
//       animate={{ opacity: 1, y: 0 }}
//       whileHover={{ y: -4 }}
//       transition={{ duration: 0.3 }}
//       className="cursor-move" // Added cursor-move for drag indication
//     >
//       <Card className="group overflow-hidden border-0 shadow-md hover:shadow-xl transition-all duration-300 bg-white">
//         <div className="relative">
//           {/* Screenshot/Preview */}
//           <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 relative overflow-hidden">
//             {url.screenshot ? (
//               <img
//                 src={url.screenshot || "/placeholder.svg"}
//                 alt={url.title}
//                 className={`w-full h-full object-cover transition-opacity duration-300 ${
//                   isImageLoaded ? "opacity-100" : "opacity-0"
//                 }`}
//                 onLoad={() => setIsImageLoaded(true)}
//               />
//             ) : (
//               <div className="w-full h-full flex items-center justify-center">
//                 <ExternalLinkIcon className="w-12 h-12 text-gray-400" />
//               </div>
//             )}

//             {/* Overlay with actions */}
//             <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
//               <Button onClick={handleVisit} size="sm" className="bg-white/90 text-gray-900 hover:bg-white font-sans">
//                 <ExternalLinkIcon className="w-4 h-4 mr-2" />
//                 Visit
//               </Button>
//             </div>

//             {/* Category Badge */}
//             {url.category && (
//               <div className="absolute top-3 left-3">
//                 <Badge style={{ backgroundColor: url.category.color }} className="text-white border-0 font-sans">
//                   {url.category.icon} {url.category.name}
//                 </Badge>
//               </div>
//             )}

//             {/* Actions Menu */}
//             <div className="absolute top-3 right-3">
//               <DropdownMenu>
//                 <DropdownMenuTrigger asChild>
//                   <Button
//                     variant="ghost"
//                     size="sm"
//                     className="bg-white/90 hover:bg-white text-gray-700 opacity-0 group-hover:opacity-100 transition-opacity"
//                   >
//                     <EllipsisHorizontalIcon className="w-4 h-4" />
//                   </Button>
//                 </DropdownMenuTrigger>
//                 <DropdownMenuContent align="end">
//                   <DropdownMenuItem onClick={handleEdit} className="font-sans">
//                     <PencilIcon className="w-4 h-4 mr-2" />
//                     Edit
//                   </DropdownMenuItem>
//                   <DropdownMenuItem onClick={() => onShare?.(url.id)} className="font-sans">
//                     <ShareIcon className="w-4 h-4 mr-2" />
//                     Share
//                   </DropdownMenuItem>
//                   <DropdownMenuItem onClick={handleDelete} className="text-red-600 font-sans">
//                     <TrashIcon className="w-4 h-4 mr-2" />
//                     Delete
//                   </DropdownMenuItem>
//                 </DropdownMenuContent>
//               </DropdownMenu>
//             </div>
//           </div>

//           <CardContent className="p-4">
//             {/* URL Info */}
//             <div className="flex items-start gap-3 mb-3">
//               {url.favicon && (
//                 <img
//                   src={url.favicon || "/placeholder.svg"}
//                   alt=""
//                   className="w-5 h-5 rounded-sm flex-shrink-0 mt-0.5"
//                 />
//               )}
//               <div className="flex-1 min-w-0">
//                 <h3 className="font-semibold text-gray-900 line-clamp-2 mb-1 font-sans">{url.title}</h3>
//                 <p className="text-sm text-gray-600 line-clamp-2 mb-2 font-sans">{url.description}</p>
//                 <p className="text-xs text-gray-400 truncate font-mono">{url.url}</p>
//               </div>
//             </div>

//             {/* Footer */}
//             <div className="flex items-center justify-between pt-3 border-t border-gray-100">
//               <div className="flex items-center gap-2 text-xs text-gray-500 font-sans">
//                 <span>Added by {url.addedBy.name || url.addedBy.email}</span>
//                 <span>•</span>
//                 <span>{new Date(url.createdAt).toLocaleDateString()}</span>
//               </div>

//               <Button
//                 variant="ghost"
//                 size="sm"
//                 onClick={() => setIsLiked(!isLiked)}
//                 className="p-1 h-auto text-gray-400 hover:text-red-500"
//               >
//                 {isLiked ? <HeartSolidIcon className="w-4 h-4 text-red-500" /> : <HeartIcon className="w-4 h-4" />}
//               </Button>
//             </div>
//           </CardContent>
//         </div>
//       </Card>
//     </motion.div>
//   )
// }
