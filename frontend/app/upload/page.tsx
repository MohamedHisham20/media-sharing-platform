"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const router = useRouter();

  // Get auth from localStorage on mount (like FeedPage)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const authRaw = localStorage.getItem("auth");
      if (authRaw) {
        try {
          const auth = JSON.parse(authRaw);
          setUserId(auth.userId);
          setToken(auth.token);
        } catch {
          setUserId(null);
          setToken(null);
        }
      }
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return alert("Please select a file.");
    if (!userId || !token) return alert("You must be logged in to upload.");

    const formData = new FormData();
    formData.append("title", title);
    formData.append("userId", userId);
    formData.append("file", file);

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/media/upload`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (res.ok) {
      router.push("/feed");
    } else {
      const err = await res.json();
      alert("Upload failed: " + err.message);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-md mx-auto p-6 flex flex-col gap-4"
    >
      <h2 className="text-2xl font-semibold">Upload a Photo</h2>
      <div className="flex flex-col gap-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="file">Image File</Label>
        <Input
          id="file"
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          required
        />
      </div>
      <Button type="submit">Upload</Button>
    </form>
  );
}
