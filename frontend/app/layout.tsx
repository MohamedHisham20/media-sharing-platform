// app/layout.tsx
import "./globals.css"
import { Geist, Geist_Mono } from "next/font/google"
import type { Metadata } from "next"
import { AuthProvider } from "@/context/AuthContext"
import LayoutWrapper from "@/components/LayoutWrapper"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "Mo. Hisham | Media Sharing Platform",
  description: "A simple media sharing platform built with Next.js, MongoDB, and TypeScript",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <AuthProvider>
          <LayoutWrapper>{children}</LayoutWrapper>
        </AuthProvider>
      </body>
    </html>
  )
}
