"use client"

import { useEffect, useRef } from "react"

export default function FluidBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let animationId: number
    let time = 0

    const resize = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio
      canvas.height = canvas.offsetHeight * window.devicePixelRatio
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio)
    }

    const createGradient = (x: number, y: number, radius: number, color1: string, color2: string) => {
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius)
      gradient.addColorStop(0, color1)
      gradient.addColorStop(1, color2)
      return gradient
    }

    const animate = () => {
      time += 0.01

      ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight)

      // Create flowing orbs with smooth movement
      const orbs = [
        {
          x: canvas.offsetWidth * 0.2 + Math.sin(time * 0.8) * 100,
          y: canvas.offsetHeight * 0.3 + Math.cos(time * 0.6) * 80,
          radius: 150 + Math.sin(time * 1.2) * 30,
          color1: "rgba(99, 102, 241, 0.3)",
          color2: "rgba(99, 102, 241, 0)",
        },
        {
          x: canvas.offsetWidth * 0.8 + Math.cos(time * 0.9) * 120,
          y: canvas.offsetHeight * 0.7 + Math.sin(time * 0.7) * 90,
          radius: 180 + Math.cos(time * 1.1) * 40,
          color1: "rgba(236, 72, 153, 0.25)",
          color2: "rgba(236, 72, 153, 0)",
        },
        {
          x: canvas.offsetWidth * 0.6 + Math.sin(time * 1.1) * 80,
          y: canvas.offsetHeight * 0.2 + Math.cos(time * 0.8) * 60,
          radius: 120 + Math.sin(time * 0.9) * 25,
          color1: "rgba(6, 182, 212, 0.2)",
          color2: "rgba(6, 182, 212, 0)",
        },
      ]

      orbs.forEach((orb) => {
        const gradient = createGradient(orb.x, orb.y, orb.radius, orb.color1, orb.color2)
        ctx.fillStyle = gradient
        ctx.beginPath()
        ctx.arc(orb.x, orb.y, orb.radius, 0, Math.PI * 2)
        ctx.fill()
      })

      animationId = requestAnimationFrame(animate)
    }

    resize()
    animate()

    window.addEventListener("resize", resize)

    return () => {
      window.removeEventListener("resize", resize)
      cancelAnimationFrame(animationId)
    }
  }, [])

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" style={{ filter: "blur(1px)" }} />
}
