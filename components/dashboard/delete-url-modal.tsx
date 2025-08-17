"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { 
  XMarkIcon, 
  ExclamationTriangleIcon, 
  TrashIcon,
  ArrowPathIcon,
  ShieldExclamationIcon
} from "@heroicons/react/24/outline"

interface DeleteUrlModalProps {
  isOpen: boolean
  onClose: () => void
  urlData?: {
    id: string
    title: string
    url: string
  }
  onUrlDeleted?: () => void
}

export default function DeleteUrlModal({ isOpen, onClose, urlData, onUrlDeleted }: DeleteUrlModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleDelete = async () => {
    if (!urlData) return

    setIsLoading(true)

    try {
      const response = await fetch(`/api/urls/${urlData.id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast({
          title: "🗑️ URL deleted!",
          description: "The URL has been permanently removed.",
        })
        onUrlDeleted?.()
        onClose()
      } else {
        const data = await response.json()
        toast({
          title: "Failed to delete URL",
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

  return (
    <AnimatePresence>
      {isOpen && (
        <Dialog open={isOpen} onOpenChange={() => {}}>
          <DialogContent 
            className="max-w-lg bg-white border-0 shadow-2xl rounded-3xl overflow-hidden"
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
              {/* Enhanced Header with Gradient Background */}
              <DialogHeader className="relative p-6 border-b border-gray-100 bg-gradient-to-r from-red-50 via-rose-50 to-pink-50">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="relative flex-shrink-0">
                      <div className="p-3 rounded-2xl bg-gradient-to-br from-red-500 to-rose-600 shadow-lg">
                        <TrashIcon className="w-6 h-6 text-white" />
                      </div>
                      {/* Pulsing ring animation */}
                      <motion.div
                        className="absolute inset-0 rounded-2xl border-2 border-red-400/30"
                        animate={{ 
                          scale: [1, 1.2, 1],
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
                        Delete URL
                      </DialogTitle>
                      <p className="text-sm text-gray-600 font-sans mt-1 leading-relaxed">
                        This action is permanent and cannot be undone
                      </p>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={onClose}
                    className="h-9 w-9 p-0 hover:bg-red-100 rounded-full transition-all duration-200 flex-shrink-0"
                  >
                    <XMarkIcon className="w-5 h-5 text-gray-500 hover:text-red-600" />
                  </Button>
                </div>
              </DialogHeader>

              <motion.div 
                variants={contentVariants}
                initial="hidden"
                animate="visible"
                className="p-6 space-y-6"
              >
                {/* Enhanced Warning Section */}
                <motion.div 
                  variants={itemVariants}
                  className="relative overflow-hidden"
                >
                  <div className="flex items-start gap-4 p-5 bg-gradient-to-r from-red-50 to-rose-50 rounded-2xl border border-red-200/50 relative">
                    {/* Animated background pattern */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-red-100/20 to-rose-100/20"
                      animate={{ 
                        x: [-100, 100, -100],
                        opacity: [0.3, 0.6, 0.3]
                      }}
                      transition={{ 
                        duration: 3, 
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    />
                    
                    <div className="relative z-10 flex-shrink-0">
                      <div className="p-2 rounded-xl bg-red-500/10">
                        <ShieldExclamationIcon className="w-6 h-6 text-red-600" />
                      </div>
                    </div>
                    <div className="relative z-10">
                      <h3 className="font-bold text-red-900 font-sans text-lg mb-1">Are you sure?</h3>
                      <p className="text-sm text-red-700 font-sans leading-relaxed">
                        This URL will be permanently deleted from your collection. This action cannot be undone.
                      </p>
                    </div>
                  </div>
                </motion.div>

                {/* Enhanced URL Preview */}
                {urlData && (
                  <motion.div variants={itemVariants}>
                    <div className="p-5 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border border-gray-200/50 relative overflow-hidden">
                      {/* Subtle pattern overlay */}
                      <div className="absolute inset-0 opacity-30">
                        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/50 to-transparent" />
                      </div>
                      
                      <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                            <div className="w-4 h-4 bg-white rounded-sm" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-gray-900 mb-1 font-sans text-lg leading-tight">
                              {urlData.title}
                            </h4>
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                              <p className="text-sm text-gray-600 font-mono truncate">
                                {new URL(urlData.url).hostname}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="p-3 bg-white/50 rounded-xl border border-gray-200/30">
                          <p className="text-xs text-gray-500 font-mono break-all leading-relaxed">
                            {urlData.url}
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Enhanced Action Buttons */}
                <motion.div variants={itemVariants}>
                  <div className="flex gap-4 pt-2">
                    <motion.div 
                      whileHover={{ scale: 1.02 }} 
                      whileTap={{ scale: 0.98 }} 
                      className="flex-1"
                    >
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={onClose} 
                        className="w-full font-sans h-12 border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-all duration-200 rounded-xl"
                      >
                        <span className="font-semibold">Cancel</span>
                      </Button>
                    </motion.div>
                    
                    <motion.div 
                      whileHover={{ scale: 1.02 }} 
                      whileTap={{ scale: 0.98 }} 
                      className="flex-1"
                    >
                      <Button
                        onClick={handleDelete}
                        disabled={isLoading}
                        className="w-full bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white font-sans h-12 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 rounded-xl border-0"
                      >
                        {isLoading ? (
                          <div className="flex items-center gap-2">
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            >
                              <ArrowPathIcon className="w-4 h-4" />
                            </motion.div>
                            <span className="font-semibold">Deleting...</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <TrashIcon className="w-4 h-4" />
                            <span className="font-semibold">Delete URL</span>
                          </div>
                        )}
                      </Button>
                    </motion.div>
                  </div>
                </motion.div>

                {/* Additional Security Note */}
                <motion.div variants={itemVariants}>
                  <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
                    <ExclamationTriangleIcon className="w-4 h-4" />
                    <span className="font-medium">This action will permanently remove the URL from your collection</span>
                  </div>
                </motion.div>
              </motion.div>
            </motion.div>
          </DialogContent>
        </Dialog>
      )}
    </AnimatePresence>
  )
}