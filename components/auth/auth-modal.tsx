"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X } from "lucide-react"
import LoginForm from "./login-form"
import SignupForm from "./signup-form"
import VerificationForm from "./verification-form"

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  initialMode?: "login" | "signup"
}

type AuthMode = "login" | "signup" | "verification"

export default function AuthModal({ isOpen, onClose, initialMode = "login" }: AuthModalProps) {
  const [mode, setMode] = useState<AuthMode>(initialMode)
  const [verificationEmail, setVerificationEmail] = useState("")

  const handleSwitchToLogin = () => setMode("login")
  const handleSwitchToSignup = () => setMode("signup")
  const handleVerificationNeeded = (email: string) => {
    setVerificationEmail(email)
    setMode("verification")
  }
  const handleVerified = () => {
    onClose()
    window.location.href = "/dashboard"
  }
  const handleBackToSignup = () => setMode("signup")

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose} // Close on backdrop click
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()} // Prevent close when clicking inside modal
      >
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 animate-gradient" />

        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 text-gray-400 hover:text-gray-600 hover:bg-white/80 rounded-full transition-all duration-200 backdrop-blur-sm hover:scale-110"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="relative z-10 p-6 sm:p-8">
          <AnimatePresence mode="wait">
            {mode === "login" && (
              <motion.div
                key="login"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
              >
                <LoginForm onSwitchToSignup={handleSwitchToSignup} onClose={onClose} />
              </motion.div>
            )}

            {mode === "signup" && (
              <motion.div
                key="signup"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
              >
                <SignupForm
                  onSwitchToLogin={handleSwitchToLogin}
                  onVerificationNeeded={handleVerificationNeeded}
                  onClose={onClose}
                />
              </motion.div>
            )}

            {mode === "verification" && (
              <motion.div
                key="verification"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
              >
                <VerificationForm email={verificationEmail} onVerified={handleVerified} onBack={handleBackToSignup} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  )
}
