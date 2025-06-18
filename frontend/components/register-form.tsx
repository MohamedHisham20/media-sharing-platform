'use client'

import { useState } from "react"
import { useRouter } from "next/navigation"
import axios from "axios"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"

export default function RegisterForm() {
  const router = useRouter()

  const [username, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    try {
      const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/users/register`, {
        username,
        email,
        password,
      })

      setSuccess(res.data.message || "Registered successfully")
      router.push("/login")
    } catch (err: unknown) {
      let message = "Registration failed"
      if (err && typeof err === "object" && "response" in err) {
        const response = (err as { response?: { data?: { message?: string; error?: string } } }).response
        message = response?.data?.message || response?.data?.error || message
      }
      setError(message)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto mt-20">
      <CardHeader>
        <CardTitle>Create an Account</CardTitle>
        <CardDescription>Sign up to access the platform.</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="flex flex-col gap-4">
          <div>
            <Label htmlFor="username">User Name</Label>
            <Input
              id="username"
              value={username}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Jane Doe"
            />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="jane@example.com"
            />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
            />
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          {success && <p className="text-sm text-green-500">{success}</p>}
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full">
            Sign Up
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
