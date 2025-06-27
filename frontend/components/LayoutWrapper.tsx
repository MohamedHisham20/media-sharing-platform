// components/LayoutWrapper.tsx
"use client"

import { usePathname } from "next/navigation"
import Navbar from "./Navbar"
import { ReactNode } from "react"

export default function LayoutWrapper({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const showNavbar = pathname !== "/"

  return (
    <>
      {showNavbar && <Navbar />}
      {children}
    </>
  )
}
