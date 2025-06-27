"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/context/AuthContext"

export default function Navbar() {
  const { isLoggedIn } = useAuth()
  const pathname = usePathname()

  return (
    <nav className="w-full px-6 py-4 flex justify-between items-center bg-background border-b">
      <Link href="/" className="text-xl font-bold">MediaShare</Link>

      <div className="flex gap-4">
        {isLoggedIn ? (
          <>
            <Link href="/feed">
              <Button variant="ghost">Feed</Button>
            </Link>
            <Link href="/profile">
              <Button variant="ghost">Profile</Button>
            </Link>
          </>
        ) : (
          <Link href={pathname === "/login" ? "/register" : "/login"}>
            <Button variant="ghost">
              {pathname === "/login" ? "Register" : "Login"}
            </Button>
          </Link>
        )}
      </div>
    </nav>
  )
}
