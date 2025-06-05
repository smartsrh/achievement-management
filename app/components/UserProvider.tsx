'use client'
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { supabase } from '../../lib/supabase'

interface User {
  id: string
  email: string
  name: string
  role: string
  department?: string
  title?: string
  phone?: string
}

interface UserContextType {
  user: User | null
  loading: boolean
  login: (user: User) => void
  logout: () => void
  isAdmin: boolean
  refreshUser: () => Promise<void>
}

const UserContext = createContext<UserContextType | undefined>(undefined)

interface UserProviderProps {
  children: ReactNode
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuthStatus()
  }, [])

  const checkAuthStatus = async () => {
    try {
      // 从 localStorage 检查用户状态
      const storedUser = localStorage.getItem('currentUser')
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser)
        
        // 验证用户信息仍然有效
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', parsedUser.id)
          .single()
        
        if (data && !error) {
          setUser(data)
        } else {
          // 用户信息无效，清除本地存储
          localStorage.removeItem('currentUser')
        }
      }
    } catch (error) {
      console.error('检查认证状态失败:', error)
      localStorage.removeItem('currentUser')
    } finally {
      setLoading(false)
    }
  }

  const login = (userData: User) => {
    setUser(userData)
    localStorage.setItem('currentUser', JSON.stringify(userData))
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('currentUser')
  }

  const refreshUser = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()
      
      if (data && !error) {
        setUser(data)
        localStorage.setItem('currentUser', JSON.stringify(data))
      }
    } catch (error) {
      console.error('刷新用户信息失败:', error)
    }
  }

  const value: UserContextType = {
    user,
    loading,
    login,
    logout,
    isAdmin: user?.role === 'admin',
    refreshUser
  }

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  )
}

export const useUser = (): UserContextType => {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider')
  }
  return context
}

export default UserProvider 