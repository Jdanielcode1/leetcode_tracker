import React, { createContext, useContext, useState, useEffect } from 'react'
import type { AuthContextType, User, ValidUsername } from '../types/auth'
import { VALID_USERS } from '../types/auth'

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: React.ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check for existing session on mount
    try {
      // Check if we're in a browser environment
      if (typeof window !== 'undefined' && window.localStorage) {
        const savedUser = localStorage.getItem('leetcode-tracker-user')
        if (savedUser) {
          try {
            const parsedUser = JSON.parse(savedUser)
            setUser(parsedUser)
          } catch (error) {
            localStorage.removeItem('leetcode-tracker-user')
          }
        }
      }
    } catch (error) {
      console.warn('localStorage not available:', error)
    }
    setIsLoading(false)
  }, [])

  const login = async (username: string, password: string): Promise<boolean> => {
    setIsLoading(true)
    
    // Simulate async login (you could add a small delay here if desired)
    await new Promise(resolve => setTimeout(resolve, 500))
    
    const trimmedUsername = username.trim().toLowerCase()
    
    if (trimmedUsername in VALID_USERS && VALID_USERS[trimmedUsername as ValidUsername] === password) {
      const newUser: User = { username: trimmedUsername }
      setUser(newUser)
      
      // Save to localStorage if available
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem('leetcode-tracker-user', JSON.stringify(newUser))
      }
      
      setIsLoading(false)
      return true
    }
    
    setIsLoading(false)
    return false
  }

  const logout = () => {
    setUser(null)
    
    // Remove from localStorage if available
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem('leetcode-tracker-user')
    }
  }

  const value: AuthContextType = {
    user,
    login,
    logout,
    isLoading
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
