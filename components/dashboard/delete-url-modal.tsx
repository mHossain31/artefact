"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { XMarkIcon, ExclamationTriangleIcon } from "@heroicons/react/24/outline"

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
          title: "URL deleted!",
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-white">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle className="text-xl font-bold text-gray-900 font-sans">Delete URL</DialogTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <XMarkIcon className="w-5 h-5" />
          </Button>
        </DialogHeader>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="flex items-center gap-4 p-4 bg-red-50 rounded-lg border border-red-200">
            <ExclamationTriangleIcon className="w-8 h-8 text-red-600 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-red-900 font-sans">Are you sure?</h3>
              <p className="text-sm text-red-700 font-sans">This action cannot be undone.</p>
            </div>
          </div>

          {urlData && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-1 font-sans">{urlData.title}</h4>
              <p className="text-sm text-gray-600 font-mono break-all">{urlData.url}</p>
            </div>
          )}

          <div className="flex gap-3">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1 font-sans bg-transparent">
              Cancel
            </Button>
            <Button
              onClick={handleDelete}
              disabled={isLoading}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white font-sans"
            >
              {isLoading ? "Deleting..." : "Delete URL"}
            </Button>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  )
}
