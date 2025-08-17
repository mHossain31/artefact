import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { CategoryBadge } from "@/lib/icons"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  EllipsisHorizontalIcon,
  ArrowTopRightOnSquareIcon,
  PencilIcon,
  TrashIcon,
  ShareIcon,
  HeartIcon,
  SparklesIcon,
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
  const [imageError, setImageError] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

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

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsLiked(!isLiked)
  }

  const handleShare = () => {
    onShare?.(url.id)
  }

  // Enhanced dropdown menu items with icons and animations
  const dropdownVariants = {
    hidden: { 
      opacity: 0, 
      scale: 0.95, 
      y: -10,
      filter: "blur(4px)"
    },
    visible: { 
      opacity: 1, 
      scale: 1, 
      y: 0,
      filter: "blur(0px)",
      transition: {
        type: "spring" as const,
        stiffness: 400,
        damping: 25,
        mass: 0.5,
        staggerChildren: 0.05
      }
    },
    exit: { 
      opacity: 0, 
      scale: 0.95, 
      y: -10,
      filter: "blur(4px)",
      transition: { duration: 0.15 }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, x: -20, filter: "blur(2px)" },
    visible: { 
      opacity: 1, 
      x: 0, 
      filter: "blur(0px)",
      transition: { type: "spring" as const, stiffness: 500, damping: 30 }
    }
  }

  const menuItems = [
    {
      label: "Edit",
      icon: PencilIcon,
      action: handleEdit,
      className: "text-gray-700 hover:text-blue-600 hover:bg-blue-50/80",
      gradient: "from-blue-50 to-indigo-50",
      iconColor: "text-blue-500 group-hover/item:text-blue-600"
    },
    {
      label: "Share",
      icon: ShareIcon,
      action: handleShare,
      className: "text-gray-700 hover:text-emerald-600 hover:bg-emerald-50/80",
      gradient: "from-emerald-50 to-green-50",
      iconColor: "text-emerald-500 group-hover/item:text-emerald-600"
    },
    {
      label: "Delete",
      icon: TrashIcon,
      action: handleDelete,
      className: "text-gray-700 hover:text-red-600 hover:bg-red-50/80",
      gradient: "from-red-50 to-rose-50",
      iconColor: "text-red-500 group-hover/item:text-red-600"
    }
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -8, scale: 1.02 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="h-full group cursor-pointer"
      onClick={handleVisit}
    >
      <div className="h-full flex flex-col overflow-hidden bg-white rounded-2xl shadow-lg hover:shadow-2xl border border-gray-100/50 hover:border-gray-200/80 transition-all duration-500 backdrop-blur-sm">
        
        {/* Main Image Section - Much Larger */}
        <div className="relative h-72 bg-gradient-to-br from-gray-50 via-gray-100 to-gray-150 overflow-hidden">
          {url.screenshot && !imageError ? (
            <>
              <img
                src={url.screenshot}
                alt={url.title}
                className={`w-full h-full object-cover transition-all duration-700 group-hover:scale-110 ${
                  isImageLoaded ? "opacity-100" : "opacity-0"
                }`}
                onLoad={() => setIsImageLoaded(true)}
                onError={() => setImageError(true)}
                loading="lazy"
              />
              {/* Subtle gradient overlay for better contrast */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-black/5 group-hover:from-black/20 transition-all duration-500" />
            </>
          ) : (
            /* Enhanced fallback with domain branding */
            <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 group-hover:from-indigo-100 group-hover:via-purple-100 group-hover:to-pink-100 transition-all duration-500">
              <div className="relative">
                {url.favicon && !imageError ? (
                  <div className="relative">
                    <img 
                      src={url.favicon} 
                      alt=""
                      className="w-20 h-20 rounded-2xl shadow-lg"
                      onError={() => setImageError(true)}
                    />
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/20 to-transparent" />
                  </div>
                ) : (
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
                    <SparklesIcon className="w-10 h-10 text-white" />
                  </div>
                )}
              </div>
              <div className="mt-4 text-center">
                <div className="text-sm font-medium text-gray-600 mb-1">
                  {new URL(url.url).hostname}
                </div>
                <div className="text-xs text-gray-400">
                  No preview available
                </div>
              </div>
            </div>
          )}

          {/* Floating Category Badge - Top Left */}
          {url.category && (
            <div className="absolute top-4 left-4 z-10">
              <CategoryBadge
                name={url.category.name}
                color={url.category.color}
                iconName={url.category.icon}
                size="sm"
                className="shadow-xl backdrop-blur-md border border-white/30 hover:scale-105 transition-transform duration-200"
              />
            </div>
          )}

          {/* Enhanced Animated Actions Menu - Top Right */}
          <div 
            className="absolute top-4 right-4 z-50" 
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <DropdownMenu onOpenChange={setIsDropdownOpen}>
              <DropdownMenuTrigger asChild>
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-10 w-10 p-0 bg-white/10 hover:bg-white/20 text-white backdrop-blur-xl border border-white/20 opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-xl relative z-50 rounded-xl"
                  >
                    <motion.div
                      animate={isDropdownOpen ? { rotate: 90 } : { rotate: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <EllipsisHorizontalIcon className="w-5 h-5" />
                    </motion.div>
                    
                    {/* Animated background ring */}
                    <motion.div
                      className="absolute inset-0 rounded-xl bg-gradient-to-r from-indigo-500/20 to-purple-500/20"
                      animate={isDropdownOpen ? { 
                        scale: [1, 1.2, 1],
                        opacity: [0.3, 0.6, 0.3]
                      } : {}}
                      transition={{ 
                        duration: 1.5, 
                        repeat: isDropdownOpen ? Infinity : 0 
                      }}
                    />
                  </Button>
                </motion.div>
              </DropdownMenuTrigger>
              
              <AnimatePresence>
                {isDropdownOpen && (
                  <DropdownMenuContent 
                    align="end" 
                    className="w-48 p-2 backdrop-blur-xl bg-white/95 border border-gray-200/50 z-50 rounded-2xl shadow-2xl overflow-hidden"
                    asChild
                  >
                    <motion.div
                      variants={dropdownVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                    >
                      {/* Subtle animated background pattern */}
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 via-purple-50/30 to-pink-50/50"
                        animate={{ 
                          background: [
                            "linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(168, 85, 247, 0.03) 50%, rgba(236, 72, 153, 0.05) 100%)",
                            "linear-gradient(135deg, rgba(168, 85, 247, 0.05) 0%, rgba(236, 72, 153, 0.03) 50%, rgba(99, 102, 241, 0.05) 100%)",
                            "linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(168, 85, 247, 0.03) 50%, rgba(236, 72, 153, 0.05) 100%)"
                          ]
                        }}
                        transition={{ duration: 3, repeat: Infinity }}
                      />
                      
                      <div className="relative z-10 space-y-1">
                        {menuItems.map((item, index) => (
                          <motion.div
                            key={item.label}
                            variants={itemVariants}
                            custom={index}
                          >
                            <DropdownMenuItem 
                              onClick={(e) => {
                                e.stopPropagation()
                                item.action()
                              }} 
                              className={`relative group/item cursor-pointer rounded-xl p-3 font-medium text-sm transition-all duration-150 border border-transparent hover:border-white/30 overflow-hidden ${item.className}`}
                            >
                              {/* Simple background on hover */}
                              <div className={`absolute inset-0 bg-gradient-to-r ${item.gradient} opacity-0 group-hover/item:opacity-100 transition-opacity duration-150`} />
                              
                              <div className="relative z-10 flex items-center">
                                <div className={`mr-3 transition-colors duration-150 ${item.iconColor}`}>
                                  <item.icon className="w-4 h-4" />
                                </div>
                                <span className="font-semibold transition-colors duration-150">{item.label}</span>
                              </div>
                            </DropdownMenuItem>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  </DropdownMenuContent>
                )}
              </AnimatePresence>
            </DropdownMenu>
          </div>

          {/* Cool Animated Visit Button - Appears on Hover */}
          <div className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ 
                opacity: 0, 
                scale: 0.8, 
                y: 20,
                filter: "blur(10px)"
              }}
              whileHover={{ 
                opacity: 1, 
                scale: 1, 
                y: 0,
                filter: "blur(0px)",
                transition: { 
                  duration: 0.5, 
                  ease: "easeOut",
                  type: "spring",
                  stiffness: 200,
                  damping: 20
                }
              }}
              className="opacity-0 group-hover:opacity-100 transition-all duration-500 pointer-events-none group-hover:pointer-events-auto"
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="relative"
              >
                <Button 
                  onClick={(e) => {
                    e.stopPropagation()
                    handleVisit()
                  }}
                  size="lg" 
                  className="bg-white/95 hover:bg-white text-gray-900 font-semibold shadow-2xl border border-white/50 backdrop-blur-md transition-all duration-200 px-8 py-4 rounded-xl relative overflow-hidden group/button"
                >
                  {/* Animated background */}
                  <motion.div
                    initial={{ x: "-100%" }}
                    whileHover={{ x: "100%" }}
                    transition={{ duration: 0.6, ease: "easeInOut" }}
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                  />
                  <motion.div
                    initial={{ rotate: 0 }}
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                    className="mr-3"
                  >
                    <ArrowTopRightOnSquareIcon className="w-5 h-5" />
                  </motion.div>
                  <span className="relative z-10">Visit Site</span>
                </Button>
              </motion.div>
            </motion.div>
          </div>
        </div>

        {/* Refined Content Section */}
        <div className="p-6 flex-1 flex flex-col">
          {/* Header with Enhanced Favicon and Title */}
          <div className="flex items-start gap-4 mb-4">
            <div className="flex-shrink-0 mt-1">
              {url.favicon && !imageError ? (
                <div className="relative">
                  <img
                    src={url.favicon}
                    alt=""
                    className="w-6 h-6 rounded-lg shadow-sm"
                    onError={() => setImageError(true)}
                  />
                  <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-white/20 to-transparent" />
                </div>
              ) : (
                <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center shadow-sm">
                  <ArrowTopRightOnSquareIcon className="w-4 h-4 text-gray-500" />
                </div>
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-gray-900 text-lg leading-tight mb-2 line-clamp-2 group-hover:text-indigo-600 transition-colors duration-200">
                {url.title}
              </h3>
              {url.description && (
                <p className="text-sm text-gray-600 leading-relaxed line-clamp-2 mb-3">
                  {url.description}
                </p>
              )}
              
              {/* Enhanced URL Display - Clickable */}
              <motion.div 
                className="inline-flex items-center px-3 py-1.5 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-full border border-indigo-100/50 cursor-pointer hover:from-indigo-100 hover:to-purple-100 transition-all duration-200"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={(e) => {
                  e.stopPropagation()
                  handleVisit()
                }}
              >
                <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse" />
                <span className="text-xs font-medium text-indigo-700 truncate max-w-[200px]">
                  {new URL(url.url).hostname}
                </span>
              </motion.div>
            </div>
          </div>

          {/* Enhanced Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-auto">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <div className="w-6 h-6 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center">
                <span className="text-xs font-semibold text-indigo-600">
                  {(url.addedBy.name || url.addedBy.email).charAt(0).toUpperCase()}
                </span>
              </div>
              <span className="font-medium truncate max-w-[100px]">
                {url.addedBy.name || url.addedBy.email.split('@')[0]}
              </span>
              <span className="text-gray-300">•</span>
              <span className="whitespace-nowrap font-medium">
                {new Date(url.createdAt).toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric',
                  year: new Date(url.createdAt).getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
                })}
              </span>
            </div>

            {/* Enhanced Like Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLike}
              className="h-9 w-9 p-0 text-gray-400 hover:text-red-500 hover:bg-red-50 hover:scale-110 transition-all duration-200 rounded-full"
            >
              <motion.div
                whileTap={{ scale: 0.8 }}
                animate={isLiked ? { scale: [1, 1.3, 1] } : {}}
                transition={{ duration: 0.3 }}
              >
                {isLiked ? (
                  <HeartSolidIcon className="w-5 h-5 text-red-500" />
                ) : (
                  <HeartIcon className="w-5 h-5" />
                )}
              </motion.div>
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
