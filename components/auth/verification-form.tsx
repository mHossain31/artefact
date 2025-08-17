"use client"

import type React from "react"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"

interface VerificationFormProps {
  email: string
  onVerified: () => void
  onBack: () => void
}

export default function VerificationForm({ email, onVerified, onBack }: VerificationFormProps) {
  const [code, setCode] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Email verified!",
          description: "Your account has been successfully verified.",
        })
        onVerified()
      } else {
        toast({
          title: "Verification failed",
          description: data.error || "Invalid verification code.",
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

  const handleResend = async () => {
    setIsResending(true)

    try {
      const response = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      if (response.ok) {
        toast({
          title: "Code sent!",
          description: "A new verification code has been sent to your email.",
        })
      } else {
        toast({
          title: "Failed to resend",
          description: "Please try again later.",
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
      setIsResending(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="w-full max-w-md mx-auto bg-white/95 backdrop-blur-sm border-0 shadow-2xl">
        <CardHeader className="text-center pb-6">
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent font-sans">
            Verify Your Email
          </CardTitle>
          <CardDescription className="text-gray-600 font-sans">
            We've sent a 6-digit code to <br />
            <span className="font-medium text-gray-800">{email}</span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="code" className="text-sm font-medium text-gray-700 font-sans">
                Verification Code
              </Label>
              <Input
                id="code"
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="Enter 6-digit code"
                maxLength={6}
                required
                className="h-12 rounded-xl border-gray-200 focus:border-indigo-500 focus:ring-indigo-500 text-center text-lg font-mono tracking-widest font-sans"
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading || code.length !== 6}
              className="w-full h-12 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 font-sans"
            >
              {isLoading ? "Verifying..." : "Verify Email"}
            </Button>

            <div className="text-center space-y-2">
              <button
                type="button"
                onClick={handleResend}
                disabled={isResending}
                className="text-sm text-indigo-600 hover:text-indigo-700 font-medium transition-colors font-sans"
              >
                {isResending ? "Sending..." : "Resend code"}
              </button>
              <br />
              <button
                type="button"
                onClick={onBack}
                className="text-sm text-gray-500 hover:text-gray-700 transition-colors font-sans"
              >
                Back to signup
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  )
}
