// app/components/MediaCard.tsx
import React, { useEffect, useRef, useState } from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";
import { Video, ResizeMode } from "expo-av";

const CARD_HEIGHT = 250;
const CARD_WIDTH = "100%";

function isVideo(type: string | undefined): boolean {
  const result = type === "video";
  return result;
}

interface MediaCardProps {
  media: {
    _id: string;
    url: string;
    title: string;
    createdAt: string;
    type: string;
    user: { username: string; _id: string };
    likes: number;
    dislikes: number;
  };
  onLike: () => void;
  onDislike: () => void;
  liked: boolean;
}

const MediaCard: React.FC<MediaCardProps> = ({ media, onLike, onDislike, liked }) => {
  const videoRef = useRef<Video>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const handlePlayPause = async () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      await videoRef.current.pauseAsync();
      setIsPlaying(false);
    } else {
      await videoRef.current.playAsync();
      setIsPlaying(true);
    }
  };

  

  return (
    <View style={styles.card}>
      <View style={styles.mediaContainer}>
        {isVideo(media.type) ? (
          <Video
            ref={videoRef}
            source={{ uri: media.url }}
            style={{ width: "100%", height: 250, backgroundColor: "#000" }}
            resizeMode={ResizeMode.CONTAIN}
            useNativeControls
            isLooping
            onError={e => console.log("Video error:", e)}
          />
        ) : (
          <Image
            source={{ uri: media.url }}
            style={styles.media}
            resizeMode="contain"
          />
        )}
      </View>
      <View style={styles.info}>
        <Text style={styles.title}>{media.title}</Text>
        <Text style={styles.meta}>
          Uploaded by <Text style={styles.bold}>{media.user?.username || "Unknown"}</Text>
        </Text>
        <View style={styles.buttons}>
          <TouchableOpacity onPress={onLike} style={styles.button}>
            <Text style={[styles.buttonText, liked && { color: "red" }]}>
              {liked ? "♥" : "♡"} {media.likes}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onDislike} style={styles.button}>
            <Text style={styles.buttonText}>👎 {media.dislikes}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    marginVertical: 10,
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: "#1e1e1e",
    elevation: 3,
  },
  mediaContainer: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
  },
  media: {
    width: "100%",
    height: "100%",
  },
  playPauseButton: {
    position: "absolute",
    top: "40%",
    left: "45%",
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 30,
    padding: 10,
  },
  playPauseText: {
    color: "#fff",
    fontSize: 32,
    textAlign: "center",
  },
  info: {
    padding: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
  },
  meta: {
    fontSize: 14,
    color: "#aaa",
    marginTop: 4,
  },
  bold: {
    fontWeight: "bold",
    color: "#fff",
  },
  buttons: {
    flexDirection: "row",
    marginTop: 10,
  },
  button: {
    marginRight: 16,
  },
  buttonText: {
    fontSize: 18,
    color: "#ccc",
  },
});

export default MediaCard;
