// app/components/MediaCard.tsx
import React from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";
import { formatDistanceToNow } from "date-fns";

interface MediaCardProps {
  media: {
    _id: string;
    url: string;
    title: string;
    createdAt: string;
    user: { username: string, _id: string };
    likes: number;
    dislikes: number;
  };
  onLike: () => void;
  onDislike: () => void;
  liked: boolean;
}

const MediaCard: React.FC<MediaCardProps> = ({ media, onLike, onDislike, liked }) => {
  return (
    <View style={styles.card}>
      <Image source={{ uri: media.url }} style={styles.image} />
      <View style={styles.info}>
        <Text style={styles.title}>{media.title}</Text>
        <Text style={styles.meta}>
          Uploaded by <Text style={styles.bold}>{media.user?.username || "Unknown"}</Text> ·{" "}
          {formatDistanceToNow(new Date(media.createdAt), { addSuffix: true })}
        </Text>

        <View style={styles.buttons}>
          <TouchableOpacity onPress={onLike} style={styles.button}>
            <Text style={[styles.buttonText, liked && { color: "red" }]}>
              {liked ? "♥" : "♡"} {media.likes}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onDislike} style={styles.button}>
            <Text style={styles.buttonText}>
              👎 {media.dislikes}
            </Text>
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
  image: {
    width: "100%",
    height: 250,
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
