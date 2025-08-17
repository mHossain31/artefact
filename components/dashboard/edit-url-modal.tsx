"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { XMarkIcon } from "@heroicons/react/24/outline"

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
  const [categoryId, setCategoryId] = useState("none") // Changed from "" to "none"
  const [isLoading, setIsLoading] = useState(false)
  const [isExtracting, setIsExtracting] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (urlData) {
      setUrl(urlData.url)
      setTitle(urlData.title)
      setDescription(urlData.description || "")
      setCategoryId(urlData.category?.id || "none") // Changed from "" to "none"
    }
  }, [urlData])

  const extractMetadata = async () => {
    if (!url) return

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
        toast({
          title: "Metadata updated!",
          description: "URL information has been refreshed.",
        })
      }
    } catch (error) {
      console.error("Metadata extraction error:", error)
    } finally {
      setIsExtracting(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!urlData) return

    setIsLoading(true)

    try {
      const response = await fetch(`/api/urls/${urlData.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url,
          title,
          description,
          categoryId: categoryId === "none" ? null : categoryId, // Convert "none" back to null
        }),
      })

      if (response.ok) {
        toast({
          title: "URL updated!",
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
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md bg-white">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle className="text-xl font-bold text-gray-900 font-sans">Edit URL</DialogTitle>
          <Button variant="ghost" size="sm" onClick={handleClose}>
            <XMarkIcon className="w-5 h-5" />
          </Button>
        </DialogHeader>

        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleSubmit}
          className="space-y-6"
        >
          <div className="space-y-2">
            <Label htmlFor="edit-url" className="text-sm font-medium text-gray-700 font-sans">
              URL *
            </Label>
            <div className="flex gap-2">
              <Input
                id="edit-url"
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com"
                required
                className="flex-1 font-mono text-sm"
              />
              <Button
                type="button"
                variant="outline"
                onClick={extractMetadata}
                disabled={!url || isExtracting}
                className="font-sans bg-transparent"
              >
                {isExtracting ? "..." : "Refresh"}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-title" className="text-sm font-medium text-gray-700 font-sans">
              Title *
            </Label>
            <Input
              id="edit-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter a descriptive title"
              required
              className="font-sans"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-description" className="text-sm font-medium text-gray-700 font-sans">
              Description
            </Label>
            <Textarea
              id="edit-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description..."
              rows={3}
              className="font-sans"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-category" className="text-sm font-medium text-gray-700 font-sans">
              Category
            </Label>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger className="font-sans">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none" className="font-sans">
                  No category
                </SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id} className="font-sans">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: category.color }} />
                      {category.icon} {category.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={handleClose} className="flex-1 font-sans bg-transparent">
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !url || !title}
              className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 font-sans"
            >
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </motion.form>
      </DialogContent>
    </Dialog>
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
