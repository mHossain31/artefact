"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { XMarkIcon, UserPlusIcon } from "@heroicons/react/24/outline"

interface InviteTeamModalProps {
  isOpen: boolean
  onClose: () => void
  onMemberInvited?: () => void
}

export default function InviteTeamModal({ isOpen, onClose, onMemberInvited }: InviteTeamModalProps) {
  const [email, setEmail] = useState("")
  const [role, setRole] = useState("VIEWER")
  const [message, setMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email.trim()) {
      toast({
        title: "Email required",
        description: "Please enter an email address.",
        variant: "destructive",
      })
      return
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch("/api/team/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          role,
          message: message.trim() || undefined,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Invitation sent!",
          description: `Team invitation has been sent to ${email}`,
        })
        
        // Reset form
        setEmail("")
        setRole("VIEWER")
        setMessage("")
        
        // Close modal and refresh team data
        onClose()
        onMemberInvited?.()
      } else {
        toast({
          title: "Failed to send invitation",
          description: data.error || "Please try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Invite error:", error)
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
    if (!isLoading) {
      setEmail("")
      setRole("VIEWER")
      setMessage("")
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md bg-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-gray-900 font-sans">
            Invite Team Member
          </DialogTitle>
        </DialogHeader>

        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleSubmit}
          className="space-y-6"
        >
          {/* Email Input */}
          <div className="space-y-2">
            <Label htmlFor="invite-email" className="text-sm font-medium text-gray-700 font-sans">
              Email Address *
            </Label>
            <Input
              id="invite-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="colleague@example.com"
              required
              disabled={isLoading}
              className="font-sans"
            />
            <p className="text-xs text-gray-500 font-sans">
              They'll receive an email invitation to join your workspace
            </p>
          </div>

          {/* Role Selection */}
          <div className="space-y-2">
            <Label htmlFor="invite-role" className="text-sm font-medium text-gray-700 font-sans">
              Role *
            </Label>
            <Select value={role} onValueChange={setRole} disabled={isLoading}>
              <SelectTrigger className="font-sans">
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ADMIN" className="font-sans">
                  <div className="flex flex-col items-start">
                    <span className="font-medium">Admin</span>
                    <span className="text-xs text-gray-500">Can manage members and settings</span>
                  </div>
                </SelectItem>
                <SelectItem value="EDITOR" className="font-sans">
                  <div className="flex flex-col items-start">
                    <span className="font-medium">Editor</span>
                    <span className="text-xs text-gray-500">Can add and edit URLs</span>
                  </div>
                </SelectItem>
                <SelectItem value="VIEWER" className="font-sans">
                  <div className="flex flex-col items-start">
                    <span className="font-medium">Viewer</span>
                    <span className="text-xs text-gray-500">Can view workspace content</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Personal Message */}
          <div className="space-y-2">
            <Label htmlFor="invite-message" className="text-sm font-medium text-gray-700 font-sans">
              Personal Message (Optional)
            </Label>
            <Textarea
              id="invite-message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Add a personal note to the invitation..."
              rows={3}
              disabled={isLoading}
              className="font-sans resize-none"
              maxLength={500}
            />
            <p className="text-xs text-gray-500 font-sans">
              {message.length}/500 characters
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleClose} 
              disabled={isLoading}
              className="flex-1 font-sans"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !email.trim()}
              className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 font-sans"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Sending...
                </div>
              ) : (
                <div className="flex items-center">
                  <UserPlusIcon className="w-4 h-4 mr-2" />
                  Send Invitation
                </div>
              )}
            </Button>
          </div>
        </motion.form>
      </DialogContent>
    </Dialog>
  )
}













// "use client"

// import type React from "react"

// import { useState } from "react"
// import { motion } from "framer-motion"
// import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import { Label } from "@/components/ui/label"
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
// import { Textarea } from "@/components/ui/textarea"
// import { useToast } from "@/hooks/use-toast"
// import { XMarkIcon, EnvelopeIcon } from "@heroicons/react/24/outline"

// interface InviteTeamModalProps {
//   isOpen: boolean
//   onClose: () => void
//   onMemberInvited?: () => void
// }

// export default function InviteTeamModal({ isOpen, onClose, onMemberInvited }: InviteTeamModalProps) {
//   const [email, setEmail] = useState("")
//   const [role, setRole] = useState("VIEWER")
//   const [message, setMessage] = useState("")
//   const [isLoading, setIsLoading] = useState(false)
//   const { toast } = useToast()

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault()
//     setIsLoading(true)

//     try {
//       const response = await fetch("/api/team/invite", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           email,
//           role,
//           message,
//         }),
//       })

//       if (response.ok) {
//         toast({
//           title: "Invitation sent!",
//           description: `An invitation has been sent to ${email}.`,
//         })
//         onMemberInvited?.()
//         handleClose()
//       } else {
//         const data = await response.json()
//         toast({
//           title: "Failed to send invitation",
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
//     setEmail("")
//     setRole("VIEWER")
//     setMessage("")
//     onClose()
//   }

//   return (
//     <Dialog open={isOpen} onOpenChange={handleClose}>
//       <DialogContent className="max-w-md bg-white">
//         <DialogHeader className="flex flex-row items-center justify-between">
//           <DialogTitle className="text-xl font-bold text-gray-900 font-sans">Invite Team Member</DialogTitle>
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
//             <Label htmlFor="invite-email" className="text-sm font-medium text-gray-700 font-sans">
//               Email Address *
//             </Label>
//             <div className="relative">
//               <EnvelopeIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
//               <Input
//                 id="invite-email"
//                 type="email"
//                 value={email}
//                 onChange={(e) => setEmail(e.target.value)}
//                 placeholder="colleague@example.com"
//                 required
//                 className="pl-10 font-sans"
//               />
//             </div>
//           </div>

//           <div className="space-y-2">
//             <Label htmlFor="invite-role" className="text-sm font-medium text-gray-700 font-sans">
//               Role *
//             </Label>
//             <Select value={role} onValueChange={setRole}>
//               <SelectTrigger className="font-sans">
//                 <SelectValue placeholder="Select a role" />
//               </SelectTrigger>
//               <SelectContent>
//                 <SelectItem value="ADMIN" className="font-sans">
//                   <div className="flex flex-col">
//                     <span className="font-medium">Admin</span>
//                     <span className="text-xs text-gray-500">Can manage team members and workspace settings</span>
//                   </div>
//                 </SelectItem>
//                 <SelectItem value="EDITOR" className="font-sans">
//                   <div className="flex flex-col">
//                     <span className="font-medium">Editor</span>
//                     <span className="text-xs text-gray-500">Can add, edit, and delete URLs</span>
//                   </div>
//                 </SelectItem>
//                 <SelectItem value="VIEWER" className="font-sans">
//                   <div className="flex flex-col">
//                     <span className="font-medium">Viewer</span>
//                     <span className="text-xs text-gray-500">Can view workspace content only</span>
//                   </div>
//                 </SelectItem>
//               </SelectContent>
//             </Select>
//           </div>

//           <div className="space-y-2">
//             <Label htmlFor="invite-message" className="text-sm font-medium text-gray-700 font-sans">
//               Personal Message (Optional)
//             </Label>
//             <Textarea
//               id="invite-message"
//               value={message}
//               onChange={(e) => setMessage(e.target.value)}
//               placeholder="Add a personal message to your invitation..."
//               rows={3}
//               className="font-sans"
//             />
//           </div>

//           <div className="flex gap-3 pt-4">
//             <Button type="button" variant="outline" onClick={handleClose} className="flex-1 font-sans bg-transparent">
//               Cancel
//             </Button>
//             <Button
//               type="submit"
//               disabled={isLoading || !email}
//               className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 font-sans"
//             >
//               {isLoading ? "Sending..." : "Send Invitation"}
//             </Button>
//           </div>
//         </motion.form>
//       </DialogContent>
//     </Dialog>
//   )
// }
