"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useEffect } from "react"
import { useAuth } from "@/context/AuthContext"

export default function ProfilePage() {
  const router = useRouter()
  const { user, isLoggedIn, isLoading, logout } = useAuth()

  useEffect(() => {
    if (!isLoading && !isLoggedIn) {
      router.replace("/login")
    }
  }, [isLoggedIn, isLoading, router])

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="container max-w-md mx-auto py-12 text-center">
        <p>Loading...</p>
      </div>
    )
  }

  // Redirect if not logged in (handled by useEffect, but good fallback)
  if (!isLoggedIn || !user) {
    return null
  }

  return (
    <div className="container max-w-md mx-auto py-12 text-center">
      <h1 className="text-3xl font-bold mb-4">Welcome, {user.username}</h1>
      <div className="mb-8 space-y-2">
        <p className="text-muted-foreground">Manage your account and preferences here.</p>
        <div className="text-sm text-gray-600 bg-gray-50 p-4 rounded-lg">
          <p><strong>Username:</strong> {user.username}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Member since:</strong> {new Date(user.createdAt).toLocaleDateString()}</p>
        </div>
      </div>
      <Button variant="destructive" onClick={handleLogout}>
        Logout
      </Button>
    </div>
  )
}
