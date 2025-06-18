"use client";

import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import Image from "next/image";
import { useEffect, useState } from "react";

interface MediaItem {
  _id: string;
  url: string;
  title: string;
}

interface PositionedImage {
  src: string;
  top: number;
  left: number;
  size: number;
  blur: number;
}

export default function LandingPage() {
  const [images, setImages] = useState<PositionedImage[]>([]);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/media/public`);
        const data: MediaItem[] = await res.json();

        const limited = data.slice(0, 6); // Limit to latest 6 images

        const positioned: PositionedImage[] = limited.map((item) => ({
          src: item.url,
          top: Math.random() * 60 + 10, // 10–70vh
          left: Math.random() * 80 + 10, // 10–90vw
          size: Math.random() * 120 + 100, // 100–220px
          blur: Math.random() * 3 + 2, // 2–5px
        }));

        setImages(positioned);
      } catch (error) {
        console.error("Failed to fetch public media:", error);
      }
    };

    fetchImages();
    const interval = setInterval(fetchImages, 6000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative h-screen w-full overflow-hidden bg-black text-white">
      {/* Background Images */}
      <div className="absolute inset-0 z-0">
        {images.map((img, idx) => (
          <Image
            key={idx}
            src={img.src}
            alt="bg-img"
            width={img.size}
            height={img.size}
            className="absolute rounded-xl object-cover opacity-20 transition-all duration-1000"
            style={{
              top: `${img.top}vh`,
              left: `${img.left}vw`,
              filter: `blur(${img.blur}px)`,
            }}
          />
        ))}
      </div>

      {/* Overlay */}
      <div className="relative z-10 flex h-full w-full flex-col items-center justify-center gap-6 bg-black/40 text-center px-6">
        <motion.h1
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-4xl font-bold md:text-6xl"
        >
          Share Your World
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.7 }}
          className="max-w-xl text-muted-foreground"
        >
          A vibrant platform for sharing your best moments with the world. Join now to upload, like, and explore.
        </motion.p>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="flex gap-4"
        >
          <Button variant="default">Login</Button>
          <Button variant="secondary">Register</Button>
        </motion.div>
      </div>
    </div>
  );
}
