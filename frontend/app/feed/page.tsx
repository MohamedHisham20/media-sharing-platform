"use client"
// import { formatDistanceToNow } from "date-fns"
import dayjs from "dayjs"
import relativeTime from "dayjs/plugin/relativeTime"
dayjs.extend(relativeTime)
import Link from "next/link";
import { Plus } from "lucide-react";


import { useEffect, useState } from "react"
import Image from "next/image"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface MediaItem {
  _id: string
  title: string
  url: string
  type: string
  likes: number
  dislikes: number
  createdAt: string
  user: {
    _id: string
    username: string
  }
}

export default function FeedPage() {
  const [media, setMedia] = useState<MediaItem[]>([])
  const [userId, setUserId] = useState<string | null>(null)
  const [token, setToken] = useState<string | null>(null)

  useEffect(() => {
    // Get auth from localStorage (browser only)
    const authRaw = typeof window !== "undefined" ? localStorage.getItem("auth") : null
    let userId = null
    let token = null
    if (authRaw) {
      try {
        const auth = JSON.parse(authRaw)
        userId = auth.userId
        token = auth.token
        setUserId(userId)
        setToken(token)
      } catch {
        setUserId(null)
        setToken(null)
      }
    }

    // Fetch media
    const fetchMedia = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/media`, {
          headers: token
            ? {
                Authorization: `Bearer ${token}`,
              }
            : {},
        })
        const data = await res.json()
        setMedia(Array.isArray(data) ? data : [])
      } catch (error) {
        console.error("Failed to fetch media:", error)
        setMedia([])
      }
    }

    fetchMedia()
  }, [])

const handleLike = async (id: string) => {
  if (!userId || !token) return
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/media/${id}/like`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ userId }),
    });

    const data = await res.json();

    setMedia((prev) =>
      prev.map((item) =>
        item._id === id
          ? { ...item, likes: data.likes, dislikes: data.dislikes ?? item.dislikes }
          : item
      )
    );
  } catch (err) {
    console.error("Failed to like:", err);
  }
};

const handleDislike = async (id: string) => {
  if (!userId || !token) return
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/media/${id}/dislike`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ userId }),
    });

    const data = await res.json();

    setMedia((prev) =>
      prev.map((item) =>
        item._id === id
          ? { ...item, dislikes: data.dislikes, likes: data.likes ?? item.likes }
          : item
      )
    );
  } catch (err) {
    console.error("Failed to dislike:", err);
  }
};



  return (
    <div className="container grid gap-6 py-10 md:grid-cols-2 lg:grid-cols-3">
      {media.map((item) => (
        <Card key={item._id}>
          <CardHeader>
            <CardTitle>{item.title}</CardTitle>
            <CardDescription>
                Uploaded by {item.user.username} ·{" "}
                {/* {new Date(item.createdAt).toLocaleString()} */}
                {/* {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })} */}
                {dayjs(item.createdAt).fromNow()}
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
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={() => handleLike(item._id)}>
              👍 {item.likes}
            </Button>
            <Button variant="outline" onClick={() => handleDislike(item._id)}>
              👎
            </Button>
          </CardFooter>
        </Card>
      ))}
      {/* Upload Button */}
      <Link href="/upload">
        <Button
          className="fixed bottom-6 right-6 rounded-full h-14 w-14 p-0 shadow-lg"
          size="icon"
        >
          <Plus className="w-6 h-6" />
        </Button>
      </Link>
    </div>
  )
}
