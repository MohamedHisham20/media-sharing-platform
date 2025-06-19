"use client"
import dayjs from "dayjs"
import relativeTime from "dayjs/plugin/relativeTime"
dayjs.extend(relativeTime)
import Link from "next/link";
import { Plus } from "lucide-react";
import { useEffect, useState, useRef } from "react"
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
  const [fullscreenUrl, setFullscreenUrl] = useState<string | null>(null);
  const fullscreenRef = useRef<HTMLDivElement>(null);

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

  // close fullscreen when clicking outside or escape
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (fullscreenRef.current && !fullscreenRef.current.contains(event.target as Node)) {
        setFullscreenUrl(null);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setFullscreenUrl(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [fullscreenUrl]);

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

  // Helper to check if media is video
  const isVideo = (type: string, url: string) => {
    if (type.startsWith("video")) return true;
    // fallback: check file extension
    return /\.(mp4|webm|ogg)$/i.test(url);
  };

  return (
    <div className="container flex flex-col items-center gap-6 py-10">
      {media.map((item) => (
        <Card
          key={item._id}
          className="w-full max-w-2xl mx-auto rounded-lg shadow-md" // Increased from max-w-lg to max-w-2xl
        >
          <CardHeader>
            <CardTitle className="truncate">{item.title}</CardTitle>
            <CardDescription>
              Uploaded by {item.user.username} · {dayjs(item.createdAt).fromNow()}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="w-full aspect-[16/9] bg-neutral-100 flex items-center justify-center rounded-md overflow-hidden">
              {isVideo(item.type, item.url) ? (
                <video
                  src={item.url}
                  controls
                  className="max-h-full max-w-full object-contain bg-black"
                  style={{ background: "#000", width: "100%", height: "100%" }}
                  width={960} // Increased width
                  height={540} // Increased height for 16:9
                />
              ) : (
                <button
                  type="button"
                  className="w-full h-full"
                  style={{ cursor: "zoom-in", background: "none", border: "none", padding: 0 }}
                  onClick={() => setFullscreenUrl(item.url)}
                  aria-label="View image fullscreen"
                >
                <Image
                  src={item.url}
                  alt={item.title}
                  width={960} // Increased width
                  height={540} // Increased height for 16:9
                  className="max-h-full max-w-full object-contain bg-black"
                  style={{ background: "#000", width: "100%", height: "100%" }}
                />
                </button>
              )}
            </div>
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
      {/* Fullscreen Modal */}
      {fullscreenUrl && (
        <div
          ref={fullscreenRef}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90"
          onClick={(e) => {
            if (e.target === fullscreenRef.current) setFullscreenUrl(null);
          }}
          style={{ cursor: "zoom-out" }}
        >
          <Image
            src={fullscreenUrl}
            alt="Full screen"
            width={1600}
            height={900}
            className="object-contain max-h-[90vh] max-w-[90vw] rounded-lg shadow-2xl"
            style={{ background: "#000" }}
            onClick={(e) => e.stopPropagation()}
          />
    </div>
  )
}
    </div>
  )
}
