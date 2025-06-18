// app/screens/FeedScreen.tsx
import React, { useEffect, useState } from "react";
import { View, ScrollView, ActivityIndicator, StyleSheet } from "react-native";
import MediaCard from "../components/MediaCard";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

interface MediaItem {
  _id: string;
  url: string;
  title: string;
  createdAt: string;
  user: { username: string; _id: string };
  likes: number;
  dislikes: number;
}

const FeedScreen = () => {
  const { token, userId } = useAuth();
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [likedMedia, setLikedMedia] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMedia = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/media`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMedia(res.data);
    } catch (error) {
      console.error("Error fetching media:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchLikedMedia = async () => {
    try {
      // Try to load from local storage first (optional)
      const cached = await AsyncStorage.getItem("likedMedia");
      if (cached) setLikedMedia(JSON.parse(cached));

      // Always fetch from backend for accuracy
      const res = await axios.get(`${API_URL}/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLikedMedia(res.data.likedMedia || []);
      await AsyncStorage.setItem("likedMedia", JSON.stringify(res.data.likedMedia || []));
    } catch (error) {
      console.error("Error fetching liked media:", error);
    }
  };

  const fetchDislikedMedia = async () => {
    try {
        const res = await axios.get(`${API_URL}/users/${userId}`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        // Assuming the response contains a list of disliked media IDs
        return res.data.dislikedMedia || [];
        } catch (error) {
        console.error("Error fetching disliked media:", error);
        return [];
    }
    };

  const handleLike = async (id: string) => {
    try {
      await axios.post(
        `${API_URL}/media/${id}/like`,
        { userId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchMedia();
      fetchLikedMedia();
      fetchDislikedMedia();
            // Optionally, you can also update the local state immediately
            setLikedMedia((prev) => [...prev, id]);
    } catch (error) {
      console.error("Like failed:", error);
    }
  };

  const handleDislike = async (id: string) => {
    try {
      await axios.post(
        `${API_URL}/media/${id}/dislike`,
        { userId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchMedia();
      fetchLikedMedia();
        fetchDislikedMedia();
                // Optionally, you can also update the local state immediately
                setLikedMedia((prev) => prev.filter((mediaId) => mediaId !== id));
    } catch (error) {
      console.error("Dislike failed:", error);
    }
  };

  useEffect(() => {
    fetchMedia();
    fetchLikedMedia();
    fetchDislikedMedia();
    // // set up a polling mechanism to refresh the feed periodically
    // const interval = setInterval(() => {
    //   fetchMedia();
    //   fetchLikedMedia();
    //   fetchDislikedMedia();
    // }, 30000); // Refresh every 30 seconds
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {media.map((item) => (
        <MediaCard
          key={item._id}
          media={item}
          liked={likedMedia.includes(item._id)}
          onLike={() => handleLike(item._id)}
          onDislike={() => handleDislike(item._id)}
        />
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 12,
    backgroundColor: "#121212",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#121212",
  },
});

export default FeedScreen;
