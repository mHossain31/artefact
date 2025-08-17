"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import {
  XMarkIcon,
  UserPlusIcon,
  EnvelopeIcon,
  ShieldCheckIcon,
  PencilIcon,
  EyeIcon,
  ArrowPathIcon,
  CheckIcon,
  ExclamationTriangleIcon,
  SparklesIcon
} from "@heroicons/react/24/outline"

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
  const [emailValid, setEmailValid] = useState(true)
  const { toast } = useToast()

  const validateEmail = (emailString: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    const isValid = emailRegex.test(emailString)
    setEmailValid(isValid || emailString === "")
    return isValid
  }

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

    if (!emailValid) {
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
          title: "🎉 Invitation sent!",
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
      setEmailValid(true)
      onClose()
    }
  }

  const handleEmailChange = (value: string) => {
    setEmail(value)
    validateEmail(value)
  }

  const modalVariants = {
    hidden: { 
      opacity: 0, 
      scale: 0.95,
      y: 20
    },
    visible: { 
      opacity: 1, 
      scale: 1,
      y: 0,
      transition: {
        type: "spring" as const,
        stiffness: 400,
        damping: 25,
        mass: 0.5
      }
    },
    exit: { 
      opacity: 0, 
      scale: 0.95,
      y: 20,
      transition: { duration: 0.15 }
    }
  }

  const contentVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        delay: 0.1,
        staggerChildren: 0.05
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  }

  const roleOptions = [
    {
      value: "ADMIN",
      label: "Admin",
      description: "Can manage members and settings",
      icon: ShieldCheckIcon,
      gradient: "from-purple-50 to-indigo-50",
      color: "text-purple-600"
    },
    {
      value: "EDITOR", 
      label: "Editor",
      description: "Can add and edit URLs",
      icon: PencilIcon,
      gradient: "from-blue-50 to-cyan-50",
      color: "text-blue-600"
    },
    {
      value: "VIEWER",
      label: "Viewer", 
      description: "Can view workspace content",
      icon: EyeIcon,
      gradient: "from-green-50 to-emerald-50",
      color: "text-green-600"
    }
  ]

  const selectedRole = roleOptions.find(r => r.value === role)

  return (
    <AnimatePresence>
      {isOpen && (
        <Dialog open={isOpen} onOpenChange={() => {}}>
          <DialogContent 
            className="max-w-2xl bg-white border-0 shadow-2xl rounded-3xl overflow-hidden"
            onInteractOutside={(e) => e.preventDefault()}
            onEscapeKeyDown={(e) => e.preventDefault()}
            showCloseButton={false}
          >
            <motion.div
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              {/* Enhanced Header */}
              <DialogHeader className="relative p-6 border-b border-gray-100 bg-gradient-to-r from-emerald-50 via-teal-50 to-cyan-50">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="relative flex-shrink-0">
                      <div className="p-3 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg">
                        <UserPlusIcon className="w-6 h-6 text-white" />
                      </div>
                      {/* Animated ring */}
                      <motion.div
                        className="absolute inset-0 rounded-2xl border-2 border-emerald-400/30"
                        animate={{ 
                          scale: [1, 1.1, 1],
                          opacity: [0.5, 0, 0.5]
                        }}
                        transition={{ 
                          duration: 2, 
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <DialogTitle className="text-2xl font-bold text-gray-900 font-sans leading-tight">
                        Invite Team Member
                      </DialogTitle>
                      <p className="text-sm text-gray-600 font-sans mt-1 leading-relaxed">
                        Send an invitation to join your workspace
                      </p>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={handleClose}
                    disabled={isLoading}
                    className="h-9 w-9 p-0 hover:bg-emerald-100 rounded-full transition-all duration-200 flex-shrink-0"
                  >
                    <XMarkIcon className="w-5 h-5 text-gray-500 hover:text-emerald-600" />
                  </Button>
                </div>
              </DialogHeader>

              <motion.form
                variants={contentVariants}
                initial="hidden"
                animate="visible"
                onSubmit={handleSubmit}
                className="p-6 space-y-6"
              >
                {/* Enhanced Email Input */}
                <motion.div variants={itemVariants} className="space-y-3">
                  <Label htmlFor="invite-email" className="text-sm font-semibold text-gray-700 font-sans flex items-center gap-2">
                    <EnvelopeIcon className="w-4 h-4" />
                    Email Address
                  </Label>
                  <div className="relative">
                    <Input
                      id="invite-email"
                      type="email"
                      value={email}
                      onChange={(e) => handleEmailChange(e.target.value)}
                      placeholder="colleague@example.com"
                      required
                      disabled={isLoading}
                      className={`font-sans pr-10 transition-all duration-200 ${
                        !emailValid && email ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : 
                        emailValid && email ? 'border-green-300 focus:border-green-500 focus:ring-green-200' : ''
                      }`}
                    />
                    {/* Email Validation Indicator */}
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      {email && (
                        emailValid ? (
                          <CheckIcon className="w-4 h-4 text-green-500" />
                        ) : (
                          <ExclamationTriangleIcon className="w-4 h-4 text-red-500" />
                        )
                      )}
                    </div>
                  </div>
                  {!emailValid && email && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-xs text-red-600 font-sans"
                    >
                      Please enter a valid email address
                    </motion.p>
                  )}
                  <p className="text-xs text-gray-500 font-sans">
                    They'll receive an email invitation to join your workspace
                  </p>
                </motion.div>

                {/* Enhanced Role Selection */}
                <motion.div variants={itemVariants} className="space-y-3">
                  <Label htmlFor="invite-role" className="text-sm font-semibold text-gray-700 font-sans flex items-center gap-2">
                    <ShieldCheckIcon className="w-4 h-4" />
                    Role & Permissions
                  </Label>
                  <Select value={role} onValueChange={setRole} disabled={isLoading}>
                    <SelectTrigger className="font-sans h-14 transition-all duration-200 focus:ring-2 focus:ring-emerald-200">
                      <SelectValue>
                        {selectedRole && (
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-lg bg-gradient-to-r ${selectedRole.gradient} flex items-center justify-center`}>
                              <selectedRole.icon className={`w-4 h-4 ${selectedRole.color}`} />
                            </div>
                            <div className="text-left">
                              <div className="font-semibold text-gray-900">{selectedRole.label}</div>
                              <div className="text-xs text-gray-500">{selectedRole.description}</div>
                            </div>
                          </div>
                        )}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent className="max-h-60">
                      {roleOptions.map((roleOption) => (
                        <SelectItem key={roleOption.value} value={roleOption.value} className="font-sans p-3">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-lg bg-gradient-to-r ${roleOption.gradient} flex items-center justify-center`}>
                              <roleOption.icon className={`w-4 h-4 ${roleOption.color}`} />
                            </div>
                            <div className="flex-1">
                              <div className="font-semibold text-gray-900">{roleOption.label}</div>
                              <div className="text-xs text-gray-500">{roleOption.description}</div>
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </motion.div>

                {/* Role Permissions Preview */}
                <motion.div variants={itemVariants}>
                  <div className={`bg-gradient-to-r ${selectedRole?.gradient} rounded-xl p-4 border border-gray-200/50`}>
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`w-6 h-6 rounded-lg bg-white/70 flex items-center justify-center`}>
                        {selectedRole && <selectedRole.icon className={`w-3 h-3 ${selectedRole.color}`} />}
                      </div>
                      <h4 className="font-semibold text-gray-900 text-sm">
                        {selectedRole?.label} Permissions
                      </h4>
                    </div>
                    <p className="text-xs text-gray-600 leading-relaxed">
                      {selectedRole?.description}. They can collaborate with your team according to their role level.
                    </p>
                  </div>
                </motion.div>

                {/* Enhanced Personal Message */}
                <motion.div variants={itemVariants} className="space-y-3">
                  <Label htmlFor="invite-message" className="text-sm font-semibold text-gray-700 font-sans flex items-center gap-2">
                    <SparklesIcon className="w-4 h-4" />
                    Personal Message
                    <span className="text-gray-400 font-normal ml-1">(Optional)</span>
                  </Label>
                  <Textarea
                    id="invite-message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Add a personal note to make the invitation more welcoming..."
                    rows={3}
                    disabled={isLoading}
                    className="font-sans resize-none transition-all duration-200 focus:ring-2 focus:ring-emerald-200"
                    maxLength={500}
                  />
                  <div className="flex justify-between items-center">
                    <p className="text-xs text-gray-500 font-sans">
                      This message will be included in the invitation email
                    </p>
                    <p className="text-xs text-gray-400 font-sans">
                      {message.length}/500
                    </p>
                  </div>
                </motion.div>

                {/* Enhanced Action Buttons */}
                <motion.div variants={itemVariants} className="flex gap-4 pt-6">
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-1">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={handleClose} 
                      disabled={isLoading}
                      className="w-full font-sans h-12 border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-all duration-200 rounded-xl"
                    >
                      <span className="font-semibold">Cancel</span>
                    </Button>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-1">
                    <Button
                      type="submit"
                      disabled={isLoading || !email.trim() || !emailValid}
                      className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 font-sans h-12 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 rounded-xl border-0"
                    >
                      {isLoading ? (
                        <div className="flex items-center gap-2">
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          >
                            <ArrowPathIcon className="w-4 h-4" />
                          </motion.div>
                          <span className="font-semibold">Sending...</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <UserPlusIcon className="w-4 h-4" />
                          <span className="font-semibold">Send Invitation</span>
                        </div>
                      )}
                    </Button>
                  </motion.div>
                </motion.div>

                {/* Security Note */}
                <motion.div variants={itemVariants}>
                  <div className="flex items-center justify-center gap-2 text-xs text-gray-500 pt-2">
                    <ShieldCheckIcon className="w-4 h-4" />
                    <span className="font-medium">Invitations are secure and can only be used once</span>
                  </div>
                </motion.div>
              </motion.form>
            </motion.div>
          </DialogContent>
        </Dialog>
      )}
    </AnimatePresence>
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
