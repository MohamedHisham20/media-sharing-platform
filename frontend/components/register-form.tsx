'use client'

import { useState } from "react"
import { useRouter } from "next/navigation"
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
import { api } from "@/lib/api"

export default function RegisterForm() {
  const router = useRouter()

  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | string[]>("")
  const [success, setSuccess] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    setLoading(true)

    try {
      const response = await api.auth.register({
        username,
        email,
        password,
      });

      if (response.success) {
        setSuccess(response.message || "Registration successful");
        setTimeout(() => {
          router.push("/login");
        }, 1500);
      } else {
        setError(response.message || "Registration failed");
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        // Try to parse validation errors from the API response
        try {
          const errorMessage = err.message;
          if (errorMessage.includes('Validation error')) {
            setError("Please check your input and try again");
          } else {
            setError(errorMessage);
          }
        } catch {
          setError(err.message);
        }
      } else {
        setError("An unexpected error occurred");
      }
    } finally {
      setLoading(false)
    }
  }

  const renderError = () => {
    if (!error) return null;
    
    if (Array.isArray(error)) {
      return (
        <div className="space-y-1">
          {error.map((err, index) => (
            <p key={index} className="text-sm text-red-500">{err}</p>
          ))}
        </div>
      );
    }
    
    return <p className="text-sm text-red-500">{error}</p>;
  };

  return (
    <Card className="w-full max-w-md mx-auto mt-20">
      <CardHeader>
        <CardTitle>Create an Account</CardTitle>
        <CardDescription>Sign up to access the platform.</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="flex flex-col gap-4">
          <div>
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              placeholder="johndoe"
              autoComplete="username"
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
              placeholder="john@example.com"
              autoComplete="email"
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
              placeholder="Enter your password"
              autoComplete="new-password"
            />
          </div>
          {renderError()}
          {success && <p className="text-sm text-green-500">{success}</p>}
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Creating account...' : 'Sign Up'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
