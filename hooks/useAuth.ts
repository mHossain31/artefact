import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface User {
  id: string
  name?: string
  email: string
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      console.log('🔍 Checking authentication...')
      
      const response = await fetch('/api/auth/me', {
        credentials: 'include'
      })

      if (response.ok) {
        const userData = await response.json()
        console.log('✅ User authenticated:', userData.user)
        setUser(userData.user)
      } else {
        console.log('❌ User not authenticated, redirecting to home')
        router.push('/')
      }
    } catch (error) {
      console.error('❌ Auth check failed:', error)
      router.push('/')
    } finally {
      setLoading(false)
    }
  }

  return { user, loading, checkAuth }
}