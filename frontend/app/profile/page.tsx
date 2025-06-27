"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"
import { useAuth } from "@/context/AuthContext"

export default function ProfilePage() {
  const router = useRouter()
  const { isLoggedIn, logout } = useAuth()
  const [username, setUsername] = useState("User")

  useEffect(() => {
    if (!isLoggedIn) {
      router.replace("/login")
      return
    }

    const authRaw = localStorage.getItem("auth")
    if (authRaw) {
      try {
        const auth = JSON.parse(authRaw)
        setUsername(auth.username || "User")
      } catch {
        setUsername("User")
      }
    }
  }, [isLoggedIn, router])

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  return (
    <div className="container max-w-md mx-auto py-12 text-center">
      <h1 className="text-3xl font-bold mb-4">Welcome, {username}</h1>
      <p className="text-muted-foreground mb-8">Manage your account and preferences here.</p>
      <Button variant="destructive" onClick={handleLogout}>
        Logout
      </Button>
    </div>
  )
}
