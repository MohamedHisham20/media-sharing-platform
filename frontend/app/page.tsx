// app/page.tsx
"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import dayjs from "dayjs"
import relativeTime from "dayjs/plugin/relativeTime"

dayjs.extend(relativeTime)

interface MediaItem {
  _id: string
  title: string
  url: string
  createdAt: string
  user: {
    username: string
  }
}

export default function LandingPage() {
  const [media, setMedia] = useState<MediaItem[]>([])

  useEffect(() => {
    const fetchMedia = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/media/public`)
        const data = await res.json()
        setMedia(data.slice(0, 6)) // Show top 6 most recent media
      } catch (err) {
        console.error("Error fetching media:", err)
      }
    }

    fetchMedia()
  }, [])

  return (
    <main className="min-h-screen bg-background px-4 py-20 text-center">
      <section className="space-y-6">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Welcome to MediaShare
        </h1>
        <p className="text-muted-foreground max-w-xl mx-auto text-lg">
          Share photos, discover posts, and engage with others.
        </p>
        <div className="flex justify-center gap-4">
          <Link href="/login">
            <Button size="lg">Login</Button>
          </Link>
          <Link href="/register">
            <Button variant="outline" size="lg">
              Register
            </Button>
          </Link>
        </div>
      </section>

      {/* Live Feed Preview */}
      <section className="mt-16">
        <h2 className="text-2xl font-semibold mb-6">Recent Uploads</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {media.map((item) => (
            <Card key={item._id}>
              <CardHeader>
                <CardTitle>{item.title}</CardTitle>
                <CardDescription>
                  Uploaded by {item.user.username} · {dayjs(item.createdAt).fromNow()}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center">
                <Image
                  src={item.url}
                  alt={item.title}
                  width={400}
                  height={300}
                  className="rounded-md object-cover"
                />
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </main>
  )
}
