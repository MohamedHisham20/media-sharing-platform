import * as ImagePicker from "expo-image-picker";
import { View, Button, TextInput, Alert } from "react-native";
import { useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export default function UploadScreen() {
  const [image, setImage] = useState<string | null>(null);
  const [video, setVideo] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [uploading, setUploading] = useState(false);
  const { token, userId } = useAuth();

const pickAndUploadImage = async () => {
  if (!userId || !token) {
    Alert.alert("You must be logged in to upload.");
    return;
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images', 'videos'], 
    allowsEditing: true,
    quality: 1,
  });

  console.log("ImagePicker result:", result);

  if (result.canceled || result.assets.length === 0) {
    return;
  }

  setImage(result.assets[0].uri);

  // 🔍 Ensure the file has a URI
  if (!image) {
    Alert.alert("Invalid file");
    return;
  }

  const formData = new FormData();
  formData.append("title", title);
  formData.append("userId", userId);
  formData.append("file", {
    uri: image,
    name: result.assets[0].fileName || "upload.jpg", // Use fileName if available
    type: result.assets[0].mimeType || "image/jpeg", // Default to jpeg if
    // type is not provided
  } as any);
  setUploading(true);
  try {
    const res = await axios.post(`${API_URL}/media/upload`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data", // ✅ Required in React Native
      }
    });

    Alert.alert("Upload successful!");
    setTitle("");
  } catch (err: any) {
    Alert.alert(
      "Upload failed",
      err?.response?.data?.message || err.message || "Unknown error"
    );
  } finally {
    setUploading(false);
  }
};

  return (
    <View style={{ padding: 20 }}>
      <TextInput
        placeholder="Title"
        value={title}
        onChangeText={setTitle}
        style={{ borderWidth: 1, marginBottom: 10, padding: 8 }}
      />
      <Button
        title={uploading ? "Uploading..." : "Pick & Upload"}
        onPress={pickAndUploadImage}
        disabled={uploading}
      />
    </View>
  );
}
