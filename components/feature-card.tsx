"use client"

import { motion } from "framer-motion"
import type { ReactNode } from "react"

interface FeatureCardProps {
  icon: ReactNode
  title: string
  description: string
  delay?: number
}

export default function FeatureCard({ icon, title, description, delay = 0 }: FeatureCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
      viewport={{ once: true }}
      className="flex flex-col items-center text-center p-6 rounded-2xl bg-white/80 backdrop-blur-sm border border-gray-200 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
    >
      <div className="mb-4 p-3 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white">{icon}</div>
      <h3 className="text-xl font-semibold text-gray-800 mb-2 font-sans">{title}</h3>
      <p className="text-gray-600 leading-relaxed font-sans">{description}</p>
    </motion.div>
  )
}
