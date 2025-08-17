"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import AnimatedBackground from "@/components/animated-background"
import FeatureCard from "@/components/feature-card"
import AuthModal from "@/components/auth/auth-modal"
import {
  LinkIcon,
  UsersIcon,
  EyeIcon,
  ShieldCheckIcon,
  SparklesIcon,
  RocketLaunchIcon,
  BoltIcon,
} from "@heroicons/react/24/outline"

export default function HomePage() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [authMode, setAuthMode] = useState<"login" | "signup">("signup")

  const openAuthModal = (mode: "login" | "signup") => {
    setAuthMode(mode)
    setIsAuthModalOpen(true)
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      <AnimatedBackground />

      {/* Hero Section */}
      <section className="relative z-10 min-h-screen flex items-center justify-center px-4">
        <div className="max-w-5xl mx-auto text-center">
          {/* Logo/Brand */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="mb-8"
          >
            <div className="inline-flex items-center gap-4 mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl blur-lg opacity-30 animate-pulse"></div>
                <div className="relative p-4 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-xl">
                  <LinkIcon className="w-10 h-10 text-white" />
                </div>
              </div>
              <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                ARTEFACT
              </h1>
            </div>
          </motion.div>

          {/* Main Headline */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="mb-8"
          >
            <h2 className="text-6xl md:text-8xl font-bold text-gray-900 mb-4 leading-tight">Organize URLs</h2>
            <h2 className="text-6xl md:text-8xl font-bold leading-tight">
              <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-500 bg-clip-text text-transparent">
                Like a Pro
              </span>
            </h2>
          </motion.div>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="text-xl md:text-2xl text-gray-600 mb-12 max-w-4xl mx-auto leading-relaxed"
          >
            The ultimate URL management platform for modern teams. Beautiful previews, smart organization, and seamless
            collaboration in one powerful tool.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col sm:flex-row gap-6 justify-center mb-16"
          >
            <Button
              size="lg"
              onClick={() => openAuthModal("signup")}
              className="relative overflow-hidden bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white px-10 py-5 text-xl font-semibold rounded-2xl shadow-2xl hover:shadow-indigo-500/25 transition-all duration-300 hover:scale-105 group border-0"
            >
              <span className="relative z-10 flex items-center">
                Start Building
                <RocketLaunchIcon className="w-6 h-6 ml-3 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-300" />
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => openAuthModal("login")}
              className="border-2 border-gray-300 hover:border-indigo-500 text-gray-700 hover:text-indigo-600 px-10 py-5 text-xl font-semibold rounded-2xl hover:shadow-xl transition-all duration-300 hover:scale-105 bg-white/90 backdrop-blur-sm hover:bg-white"
            >
              Sign In
            </Button>
          </motion.div>

          {/* Stats/Trust Indicators */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-2xl mx-auto"
          >
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 text-indigo-600 mb-2">
                <BoltIcon className="w-5 h-5" />
                <span className="text-2xl font-bold">10x</span>
              </div>
              <span className="text-gray-600">Faster Organization</span>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 text-purple-600 mb-2">
                <ShieldCheckIcon className="w-5 h-5" />
                <span className="text-2xl font-bold">100%</span>
              </div>
              <span className="text-gray-600">Secure & Private</span>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 text-cyan-600 mb-2">
                <SparklesIcon className="w-5 h-5" />
                <span className="text-2xl font-bold">Free</span>
              </div>
              <span className="text-gray-600">To Get Started</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 py-32 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            viewport={{ once: true, margin: "-100px" }}
            className="text-center mb-20"
          >
            <h3 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">Everything You Need</h3>
            <p className="text-2xl text-gray-600 max-w-3xl mx-auto">
              Powerful features designed for teams who value efficiency and collaboration
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard
              icon={<LinkIcon className="w-8 h-8" />}
              title="Smart Capture"
              description="Automatically extract titles, descriptions, and screenshots from any URL with AI-powered metadata detection."
              delay={0.1}
            />
            <FeatureCard
              icon={<UsersIcon className="w-8 h-8" />}
              title="Team Collaboration"
              description="Invite unlimited team members with granular permissions and real-time activity feeds."
              delay={0.2}
            />
            <FeatureCard
              icon={<EyeIcon className="w-8 h-8" />}
              title="Visual Previews"
              description="Rich visual cards with high-quality screenshots, favicons, and beautiful typography."
              delay={0.3}
            />
            <FeatureCard
              icon={<ShieldCheckIcon className="w-8 h-8" />}
              title="Enterprise Security"
              description="Bank-level encryption, SSO integration, and compliance with SOC 2 and GDPR standards."
              delay={0.4}
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 py-16 px-4 border-t border-gray-200 bg-white/90 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600">
              <LinkIcon className="w-8 h-8 text-white" />
            </div>
            <span className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              ARTEFACT
            </span>
          </div>
          <p className="text-lg text-gray-600">Built for teams who demand excellence in organization</p>
        </div>
      </footer>

      {/* Auth Modal */}
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} initialMode={authMode} />
    </div>
  )
}
