"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CategoryBadge, CategoryIcon } from "@/lib/icons"
import { useToast } from "@/hooks/use-toast"
import {
  XMarkIcon,
  LinkIcon,
  PencilIcon,
  ArrowPathIcon,
  SparklesIcon,
  CheckIcon,
  ExclamationTriangleIcon,
  GlobeAltIcon,
} from "@heroicons/react/24/outline"

interface EditUrlModalProps {
  isOpen: boolean
  onClose: () => void
  urlData?: {
    id: string
    title: string
    url: string
    description?: string
    category?: {
      id: string
      name: string
      color: string
    }
  }
  categories?: Array<{
    id: string
    name: string
    color: string
    icon?: string
  }>
  onUrlUpdated?: () => void
}

export default function EditUrlModal({ isOpen, onClose, urlData, categories = [], onUrlUpdated }: EditUrlModalProps) {
  const [url, setUrl] = useState("")
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [categoryId, setCategoryId] = useState("none")
  const [isLoading, setIsLoading] = useState(false)
  const [isExtracting, setIsExtracting] = useState(false)
  const [urlValid, setUrlValid] = useState(true)
  const [previewData, setPreviewData] = useState<any>(null)
  const { toast } = useToast()

  useEffect(() => {
    if (urlData) {
      setUrl(urlData.url)
      setTitle(urlData.title)
      setDescription(urlData.description || "")
      setCategoryId(urlData.category?.id || "none")
      validateUrl(urlData.url)
    }
  }, [urlData])

  const validateUrl = (urlString: string) => {
    try {
      new URL(urlString)
      setUrlValid(true)
    } catch {
      setUrlValid(false)
    }
  }

  const extractMetadata = async () => {
    if (!url || !urlValid) return

    setIsExtracting(true)
    try {
      const response = await fetch("/api/urls/extract-metadata", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      })

      const data = await response.json()

      if (response.ok) {
        setTitle(data.title || title)
        setDescription(data.description || description)
        setPreviewData(data)
        toast({
          title: "✨ Metadata refreshed!",
          description: "URL information has been updated.",
        })
      }
    } catch (error) {
      console.error("Metadata extraction error:", error)
      toast({
        title: "Failed to refresh",
        description: "Could not fetch URL metadata.",
        variant: "destructive",
      })
    } finally {
      setIsExtracting(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!urlData || !urlValid) return

    setIsLoading(true)

    try {
      const response = await fetch(`/api/urls/${urlData.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url,
          title,
          description,
          categoryId: categoryId === "none" ? null : categoryId,
        }),
      })

      if (response.ok) {
        toast({
          title: "🎉 URL updated!",
          description: "Your changes have been saved successfully.",
        })
        onUrlUpdated?.()
        handleClose()
      } else {
        const data = await response.json()
        toast({
          title: "Failed to update URL",
          description: data.error || "Please try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    onClose()
    // Reset form state
    setTimeout(() => {
      setPreviewData(null)
      setUrlValid(true)
    }, 300)
  }

  const handleUrlChange = (value: string) => {
    setUrl(value)
    validateUrl(value)
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <Dialog open={isOpen} onOpenChange={() => {}}>
          <DialogContent 
            className="max-w-2xl bg-white border-0 shadow-2xl" 
            onInteractOutside={(e) => e.preventDefault()}
            onEscapeKeyDown={(e) => e.preventDefault()}
            showCloseButton={false}
          >
            {/* Enhanced Header */}
            <DialogHeader className="relative pb-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600">
                    <PencilIcon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <DialogTitle className="text-2xl font-bold text-gray-900 font-sans">
                      Edit URL
                    </DialogTitle>
                    <p className="text-sm text-gray-500 font-sans mt-1">
                      Update your bookmark information
                    </p>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleClose}
                  className="h-8 w-8 p-0 hover:bg-gray-100 rounded-full"
                >
                  <XMarkIcon className="w-4 h-4" />
                </Button>
              </div>
            </DialogHeader>

            <motion.form
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              onSubmit={handleSubmit}
              className="space-y-6 pt-6"
            >
              {/* URL Input with Validation */}
              <div className="space-y-3">
                <Label htmlFor="edit-url" className="text-sm font-semibold text-gray-700 font-sans flex items-center gap-2">
                  <LinkIcon className="w-4 h-4" />
                  Website URL
                </Label>
                <div className="relative">
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Input
                        id="edit-url"
                        type="url"
                        value={url}
                        onChange={(e) => handleUrlChange(e.target.value)}
                        placeholder="https://example.com"
                        required
                        className={`font-mono text-sm pr-10 transition-all duration-200 ${
                          !urlValid && url ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : 
                          urlValid && url ? 'border-green-300 focus:border-green-500 focus:ring-green-200' : ''
                        }`}
                      />
                      {/* URL Validation Indicator */}
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        {url && (
                          urlValid ? (
                            <CheckIcon className="w-4 h-4 text-green-500" />
                          ) : (
                            <ExclamationTriangleIcon className="w-4 h-4 text-red-500" />
                          )
                        )}
                      </div>
                    </div>
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={extractMetadata}
                        disabled={!url || !urlValid || isExtracting}
                        className="px-4 font-sans bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200 hover:from-indigo-100 hover:to-purple-100 disabled:opacity-50"
                      >
                        {isExtracting ? (
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          >
                            <ArrowPathIcon className="w-4 h-4" />
                          </motion.div>
                        ) : (
                          <>
                            <SparklesIcon className="w-4 h-4 mr-2" />
                            Refresh
                          </>
                        )}
                      </Button>
                    </motion.div>
                  </div>
                  {!urlValid && url && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-xs text-red-600 mt-1 font-sans"
                    >
                      Please enter a valid URL
                    </motion.p>
                  )}
                </div>
              </div>

              {/* Preview Card */}
              {urlValid && url && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                      <GlobeAltIcon className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {new URL(url).hostname}
                      </p>
                      <p className="text-xs text-gray-500">
                        {isExtracting ? "Fetching preview..." : "URL Preview"}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Title Input */}
              <div className="space-y-3">
                <Label htmlFor="edit-title" className="text-sm font-semibold text-gray-700 font-sans">
                  Title
                </Label>
                <Input
                  id="edit-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter a descriptive title"
                  required
                  className="font-sans transition-all duration-200 focus:ring-2 focus:ring-indigo-200"
                />
              </div>

              {/* Description Input */}
              <div className="space-y-3">
                <Label htmlFor="edit-description" className="text-sm font-semibold text-gray-700 font-sans">
                  Description
                  <span className="text-gray-400 font-normal ml-1">(Optional)</span>
                </Label>
                <Textarea
                  id="edit-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Add a description to help you remember this bookmark..."
                  rows={3}
                  className="font-sans resize-none transition-all duration-200 focus:ring-2 focus:ring-indigo-200"
                />
              </div>

              {/* Enhanced Category Selection */}
              <div className="space-y-3">
                <Label htmlFor="edit-category" className="text-sm font-semibold text-gray-700 font-sans">
                  Category
                  <span className="text-gray-400 font-normal ml-1">(Optional)</span>
                </Label>
                <Select value={categoryId} onValueChange={setCategoryId}>
                  <SelectTrigger className="font-sans h-12 transition-all duration-200 focus:ring-2 focus:ring-indigo-200">
                    <SelectValue placeholder="Choose a category">
                      {categoryId !== "none" && categories.find(cat => cat.id === categoryId) && (
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full flex items-center justify-center"
                            style={{ backgroundColor: categories.find(cat => cat.id === categoryId)?.color }}
                          >
                            <CategoryIcon 
                              iconName={categories.find(cat => cat.id === categoryId)?.icon}
                              size="sm"
                            />
                          </div>
                          {categories.find(cat => cat.id === categoryId)?.name}
                        </div>
                      )}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    <SelectItem value="none" className="font-sans">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-gray-300" />
                        No category
                      </div>
                    </SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id} className="font-sans">
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full flex items-center justify-center"
                            style={{ backgroundColor: category.color }}
                          >
                            <CategoryIcon 
                              iconName={category.icon}
                              size="sm"
                            />
                          </div>
                          {category.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Enhanced Action Buttons */}
              <div className="flex gap-3 pt-6">
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-1">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={handleClose} 
                    className="w-full font-sans h-12 border-gray-300 hover:bg-gray-50 transition-all duration-200"
                  >
                    Cancel
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-1">
                  <Button
                    type="submit"
                    disabled={isLoading || !url || !title || !urlValid}
                    className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 font-sans h-12 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        >
                          <ArrowPathIcon className="w-4 h-4" />
                        </motion.div>
                        Saving...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <CheckIcon className="w-4 h-4" />
                        Save Changes
                      </div>
                    )}
                  </Button>
                </motion.div>
              </div>
            </motion.form>
          </DialogContent>
        </Dialog>
      )}
    </AnimatePresence>
  )
}













// "use client"

// import type React from "react"

// import { useState, useEffect } from "react"
// import { motion } from "framer-motion"
// import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import { Label } from "@/components/ui/label"
// import { Textarea } from "@/components/ui/textarea"
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
// import { useToast } from "@/hooks/use-toast"
// import { XMarkIcon } from "@heroicons/react/24/outline"

// interface EditUrlModalProps {
//   isOpen: boolean
//   onClose: () => void
//   urlData?: {
//     id: string
//     title: string
//     url: string
//     description?: string
//     category?: {
//       id: string
//       name: string
//       color: string
//     }
//   }
//   categories?: Array<{
//     id: string
//     name: string
//     color: string
//     icon?: string
//   }>
//   onUrlUpdated?: () => void
// }

// export default function EditUrlModal({ isOpen, onClose, urlData, categories = [], onUrlUpdated }: EditUrlModalProps) {
//   const [url, setUrl] = useState("")
//   const [title, setTitle] = useState("")
//   const [description, setDescription] = useState("")
//   const [categoryId, setCategoryId] = useState("")
//   const [isLoading, setIsLoading] = useState(false)
//   const [isExtracting, setIsExtracting] = useState(false)
//   const { toast } = useToast()

//   useEffect(() => {
//     if (urlData) {
//       setUrl(urlData.url)
//       setTitle(urlData.title)
//       setDescription(urlData.description || "")
//       setCategoryId(urlData.category?.id || "")
//     }
//   }, [urlData])

//   const extractMetadata = async () => {
//     if (!url) return

//     setIsExtracting(true)
//     try {
//       const response = await fetch("/api/urls/extract-metadata", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ url }),
//       })

//       const data = await response.json()

//       if (response.ok) {
//         setTitle(data.title || title)
//         setDescription(data.description || description)
//         toast({
//           title: "Metadata updated!",
//           description: "URL information has been refreshed.",
//         })
//       }
//     } catch (error) {
//       console.error("Metadata extraction error:", error)
//     } finally {
//       setIsExtracting(false)
//     }
//   }

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault()
//     if (!urlData) return

//     setIsLoading(true)

//     try {
//       const response = await fetch(`/api/urls/${urlData.id}`, {
//         method: "PUT",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           url,
//           title,
//           description,
//           categoryId: categoryId || null,
//         }),
//       })

//       if (response.ok) {
//         toast({
//           title: "URL updated!",
//           description: "Your changes have been saved successfully.",
//         })
//         onUrlUpdated?.()
//         handleClose()
//       } else {
//         const data = await response.json()
//         toast({
//           title: "Failed to update URL",
//           description: data.error || "Please try again.",
//           variant: "destructive",
//         })
//       }
//     } catch (error) {
//       toast({
//         title: "Error",
//         description: "Something went wrong. Please try again.",
//         variant: "destructive",
//       })
//     } finally {
//       setIsLoading(false)
//     }
//   }

//   const handleClose = () => {
//     onClose()
//   }

//   return (
//     <Dialog open={isOpen} onOpenChange={handleClose}>
//       <DialogContent className="max-w-md bg-white">
//         <DialogHeader className="flex flex-row items-center justify-between">
//           <DialogTitle className="text-xl font-bold text-gray-900 font-sans">Edit URL</DialogTitle>
//           <Button variant="ghost" size="sm" onClick={handleClose}>
//             <XMarkIcon className="w-5 h-5" />
//           </Button>
//         </DialogHeader>

//         <motion.form
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           onSubmit={handleSubmit}
//           className="space-y-6"
//         >
//           <div className="space-y-2">
//             <Label htmlFor="edit-url" className="text-sm font-medium text-gray-700 font-sans">
//               URL *
//             </Label>
//             <div className="flex gap-2">
//               <Input
//                 id="edit-url"
//                 type="url"
//                 value={url}
//                 onChange={(e) => setUrl(e.target.value)}
//                 placeholder="https://example.com"
//                 required
//                 className="flex-1 font-mono text-sm"
//               />
//               <Button
//                 type="button"
//                 variant="outline"
//                 onClick={extractMetadata}
//                 disabled={!url || isExtracting}
//                 className="font-sans bg-transparent"
//               >
//                 {isExtracting ? "..." : "Refresh"}
//               </Button>
//             </div>
//           </div>

//           <div className="space-y-2">
//             <Label htmlFor="edit-title" className="text-sm font-medium text-gray-700 font-sans">
//               Title *
//             </Label>
//             <Input
//               id="edit-title"
//               value={title}
//               onChange={(e) => setTitle(e.target.value)}
//               placeholder="Enter a descriptive title"
//               required
//               className="font-sans"
//             />
//           </div>

//           <div className="space-y-2">
//             <Label htmlFor="edit-description" className="text-sm font-medium text-gray-700 font-sans">
//               Description
//             </Label>
//             <Textarea
//               id="edit-description"
//               value={description}
//               onChange={(e) => setDescription(e.target.value)}
//               placeholder="Optional description..."
//               rows={3}
//               className="font-sans"
//             />
//           </div>

//           <div className="space-y-2">
//             <Label htmlFor="edit-category" className="text-sm font-medium text-gray-700 font-sans">
//               Category
//             </Label>
//             <Select value={categoryId} onValueChange={setCategoryId}>
//               <SelectTrigger className="font-sans">
//                 <SelectValue placeholder="Select a category" />
//               </SelectTrigger>
//               <SelectContent>
//                 <SelectItem value="" className="font-sans">
//                   No category
//                 </SelectItem>
//                 {categories.map((category) => (
//                   <SelectItem key={category.id} value={category.id} className="font-sans">
//                     <div className="flex items-center gap-2">
//                       <div className="w-3 h-3 rounded-full" style={{ backgroundColor: category.color }} />
//                       {category.icon} {category.name}
//                     </div>
//                   </SelectItem>
//                 ))}
//               </SelectContent>
//             </Select>
//           </div>

//           <div className="flex gap-3 pt-4">
//             <Button type="button" variant="outline" onClick={handleClose} className="flex-1 font-sans bg-transparent">
//               Cancel
//             </Button>
//             <Button
//               type="submit"
//               disabled={isLoading || !url || !title}
//               className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 font-sans"
//             >
//               {isLoading ? "Saving..." : "Save Changes"}
//             </Button>
//           </div>
//         </motion.form>
//       </DialogContent>
//     </Dialog>
//   )
// }
