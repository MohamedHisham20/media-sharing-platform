"use client"
import dayjs from "dayjs"
import relativeTime from "dayjs/plugin/relativeTime"
dayjs.extend(relativeTime)
import Link from "next/link";
import { Plus, ChevronLeft, ChevronRight } from "lucide-react";
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
import { useAuth } from "@/context/AuthContext"
import { api } from "@/lib/api"

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
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [fullscreenUrl, setFullscreenUrl] = useState<string | null>(null);
  const fullscreenRef = useRef<HTMLDivElement>(null);

  const { user, isLoggedIn } = useAuth()

  useEffect(() => {
    fetchMedia(currentPage)
  }, [currentPage])

  const fetchMedia = async (page: number) => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await api.media.getAll(page, 10)
      
      if (response.success && response.data) {
        setMedia(response.data.media || [])
        setTotalPages(response.data.totalPages || 1)
      } else {
        setError(response.message || 'Failed to fetch media')
        setMedia([])
      }
    } catch (error) {
      console.error("Failed to fetch media:", error)
      setError("Failed to load media")
      setMedia([])
    } finally {
      setLoading(false)
    }
  }

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
    if (!user) return
    
    try {
      const response = await api.media.like(id)
      
      if (response.success && response.data) {
        setMedia((prev) =>
          prev.map((item) =>
            item._id === id
              ? { 
                  ...item, 
                  likes: response.data!.likes, 
                  dislikes: response.data!.dislikes ?? item.dislikes 
                }
              : item
          )
        );
      }
    } catch (error) {
      console.error("Failed to like:", error);
    }
  };

  const handleDislike = async (id: string) => {
    if (!user) return
    
    try {
      const response = await api.media.dislike(id)
      
      if (response.success && response.data) {
        setMedia((prev) =>
          prev.map((item) =>
            item._id === id
              ? { 
                  ...item, 
                  dislikes: response.data!.dislikes, 
                  likes: response.data!.likes ?? item.likes 
                }
              : item
          )
        );
      }
    } catch (error) {
      console.error("Failed to dislike:", error);
    }
  };

  // Helper to check if media is video
  const isVideo = (type: string, url: string) => {
    if (type.startsWith("video")) return true;
    // fallback: check file extension
    return /\.(mp4|webm|ogg)$/i.test(url);
  };

  // Loading state
  if (loading) {
    return (
      <div className="container flex flex-col items-center gap-6 py-10">
        <div className="flex items-center justify-center">
          <div className="text-lg">Loading media...</div>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="container flex flex-col items-center gap-6 py-10">
        <div className="text-red-500 text-center">
          <p className="text-lg font-medium">Error loading media</p>
          <p className="text-sm">{error}</p>
          <Button 
            onClick={() => fetchMedia(currentPage)} 
            className="mt-4"
            variant="outline"
          >
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container flex flex-col items-center gap-6 py-10">
      {/* Empty state */}
      {media.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-lg text-gray-500 mb-4">No media found</p>
          {isLoggedIn && (
            <Link href="/upload">
              <Button>Upload the first media</Button>
            </Link>
          )}
        </div>
      ) : (
        <>
          {/* Media Grid */}
          {media.map((item) => (
            <Card
              key={item._id}
              className="w-full max-w-2xl mx-auto rounded-lg shadow-md"
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
                      width={960}
                      height={540}
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
                      width={960}
                      height={540}
                      className="max-h-full max-w-full object-contain bg-black"
                      style={{ background: "#000", width: "100%", height: "100%" }}
                    />
                    </button>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button 
                  variant="outline" 
                  onClick={() => handleLike(item._id)}
                  disabled={!isLoggedIn}
                >
                  👍 {item.likes}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => handleDislike(item._id)}
                  disabled={!isLoggedIn}
                >
                  👎 {item.dislikes}
                </Button>
              </CardFooter>
            </Card>
          ))}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center gap-2 mt-6">
              <Button
                variant="outline"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Previous
              </Button>
              
              <span className="text-sm text-gray-600 px-4">
                Page {currentPage} of {totalPages}
              </span>
              
              <Button
                variant="outline"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                Next
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          )}
        </>
      )}

      {/* Upload Button - only show if logged in */}
      {isLoggedIn && (
        <Link href="/upload">
          <Button
            className="fixed bottom-6 right-6 rounded-full h-14 w-14 p-0 shadow-lg"
            size="icon"
          >
            <Plus className="w-6 h-6" />
          </Button>
        </Link>
      )}

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
      )}
    </div>
  )
}
