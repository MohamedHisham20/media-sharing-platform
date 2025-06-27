"use client"

import React, { createContext, useContext, useEffect, useState } from "react"

interface AuthContextType {
  isLoggedIn: boolean
  login: (token: string, userId: string) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType>({
  isLoggedIn: false,
  login: () => {},
  logout: () => {},
})

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    const auth = localStorage.getItem("auth")
    setIsLoggedIn(!!auth)
  }, [])

  const login = (token: string, userId: string) => {
    localStorage.setItem("auth", JSON.stringify({ token, userId }))
    setIsLoggedIn(true)
  }

  const logout = () => {
    localStorage.removeItem("auth")
    setIsLoggedIn(false)
  }

  return (
    <AuthContext.Provider value={{ isLoggedIn, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
