"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, Mail, ArrowRight, Loader2 } from "lucide-react"
import { toast } from "sonner"

export function VerificationPage() {
  const [code, setCode] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [isVerified, setIsVerified] = useState(false)
  const searchParams = useSearchParams()
  const router = useRouter()
  const email = searchParams.get("email")

  useEffect(() => {
    if (!email) {
      router.push("/")
    }
  }, [email, router])

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !code) return

    setIsLoading(true)
    try {
      const response = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      })

      const data = await response.json()

      if (response.ok) {
        setIsVerified(true)
        toast.success("Email verified successfully!")
        setTimeout(() => {
          router.push("/dashboard")
        }, 2000)
      } else {
        toast.error(data.error || "Verification failed")
      }
    } catch (error) {
      toast.error("Something went wrong")
    } finally {
      setIsLoading(false)
    }
  }

  const handleResend = async () => {
    if (!email) return

    setIsResending(true)
    try {
      const response = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success("Verification code sent!")
      } else {
        toast.error(data.error || "Failed to resend code")
      }
    } catch (error) {
      toast.error("Something went wrong")
    } finally {
      setIsResending(false)
    }
  }

  if (isVerified) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md">
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="text-center">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-green-800 mb-2">Email Verified!</h2>
              <p className="text-green-600 mb-4">
                Your account has been successfully verified. Redirecting to dashboard...
              </p>
              <div className="flex items-center justify-center text-green-600">
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                <span>Loading dashboard...</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
      <Card className="backdrop-blur-sm bg-white/10 border-white/20">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 p-3 rounded-full bg-indigo-500/20">
            <Mail className="h-8 w-8 text-indigo-400" />
          </div>
          <CardTitle className="text-2xl font-bold text-white">Verify Your Email</CardTitle>
          <CardDescription className="text-gray-300">
            We sent a 6-digit verification code to <span className="font-medium text-indigo-300">{email}</span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleVerify} className="space-y-4">
            <div>
              <Input
                type="text"
                placeholder="Enter 6-digit code"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                maxLength={6}
                className="text-center text-lg tracking-widest bg-white/10 border-white/20 text-white placeholder:text-gray-400"
              />
            </div>
            <Button
              type="submit"
              disabled={isLoading || code.length !== 6}
              className="w-full bg-indigo-600 hover:bg-indigo-700"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <ArrowRight className="h-4 w-4 mr-2" />}
              Verify Email
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-400 text-sm mb-2">Didn't receive the code?</p>
            <Button
              variant="ghost"
              onClick={handleResend}
              disabled={isResending}
              className="text-indigo-400 hover:text-indigo-300 hover:bg-white/10"
            >
              {isResending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Resend Code
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
