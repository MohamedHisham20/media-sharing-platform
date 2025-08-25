// app/components/MediaCard.tsx
import React, { useEffect, useRef, useState } from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";
import { Video, ResizeMode } from "expo-av";
import { Ionicons } from "@expo/vector-icons";

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
          <View style={styles.videoWrapper}>
            <Video
              ref={videoRef}
              source={{ uri: media.url }}
              style={{ width: "100%", height: 250, backgroundColor: "#000" }}
              resizeMode={ResizeMode.CONTAIN}
              useNativeControls
              isLooping
              onError={e => console.log("Video error:", e)}
            />
            <View style={styles.videoOverlay}>
              <Ionicons name="play-circle" size={48} color="rgba(255,255,255,0.8)" />
            </View>
          </View>
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
        <View style={styles.userInfo}>
          <Ionicons name="person-circle-outline" size={20} color="#aaa" />
          <Text style={styles.meta}>
            <Text style={styles.bold}>{media.user?.username || "Unknown"}</Text>
          </Text>
        </View>
        <View style={styles.buttons}>
          <TouchableOpacity onPress={onLike} style={[styles.button, styles.likeButton]}>
            <Ionicons 
              name={liked ? "heart" : "heart-outline"} 
              size={24} 
              color={liked ? "#FF6B6B" : "#ccc"} 
            />
            <Text style={[styles.buttonText, liked && { color: "#FF6B6B" }]}>
              {media.likes}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onDislike} style={[styles.button, styles.dislikeButton]}>
            <Ionicons 
              name="thumbs-down-outline" 
              size={22} 
              color="#ccc" 
            />
            <Text style={styles.buttonText}>{media.dislikes}</Text>
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
  videoWrapper: {
    width: "100%",
    height: "100%",
    position: "relative",
  },
  videoOverlay: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: [{ translateX: -24 }, { translateY: -24 }],
    zIndex: 1,
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
    marginBottom: 6,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  meta: {
    fontSize: 14,
    color: "#aaa",
    marginLeft: 6,
  },
  bold: {
    fontWeight: "bold",
    color: "#fff",
  },
  buttons: {
    flexDirection: "row",
    marginTop: 10,
    alignItems: "center",
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 20,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  likeButton: {
    backgroundColor: "rgba(255,107,107,0.1)",
  },
  dislikeButton: {
    backgroundColor: "rgba(156,163,175,0.1)",
  },
  buttonText: {
    fontSize: 16,
    color: "#ccc",
    marginLeft: 6,
    fontWeight: "600",
  },
});

export default MediaCard;
