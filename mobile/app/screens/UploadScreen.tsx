import * as ImagePicker from "expo-image-picker";
import { View, Button, TextInput, Alert, StyleSheet, Text } from "react-native";
import { useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export default function UploadScreen() {
  const [video, setVideo] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [uploading, setUploading] = useState(false);
  const { token, userId } = useAuth();

const pickAndUploadImage = async () => {
  if (!userId || !token) {
    Alert.alert("Authentication Required", "You must be logged in to upload media.");
    return;
  }

  // ✅ Validate title is required (consistency with web frontend)
  if (!title.trim()) {
    Alert.alert("Title Required", "Please enter a title for your media before uploading.");
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

  const image = result.assets[0].uri;

  // 🔍 Ensure the file has a URI
  if (!image) {
    Alert.alert("Invalid file", "Selected file is not valid. Please try again.");
    return;
  }

  const formData = new FormData();
  formData.append("title", title.trim()); // ✅ Use trimmed title
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

    Alert.alert("Success!", "Your media has been uploaded successfully!");
    setTitle(""); // Clear the title after successful upload
  } catch (err: any) {
    Alert.alert(
      "Upload Failed",
      err?.response?.data?.message || err.message || "Unknown error occurred. Please try again."
    );
  } finally {
    setUploading(false);
  }
};

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Upload Media</Text>
      <Text style={styles.subtitle}>Share your photos and videos</Text>
      
      <TextInput
        placeholder="Enter a title for your media *"
        value={title}
        onChangeText={setTitle}
        style={[styles.input, !title.trim() && styles.inputRequired]}
        placeholderTextColor="#999"
        maxLength={100}
      />
      
      {title.trim() && (
        <Text style={styles.characterCount}>
          {title.trim().length}/100 characters
        </Text>
      )}
      
      <Button
        title={uploading ? "Uploading..." : "Pick & Upload Media"}
        onPress={pickAndUploadImage}
        disabled={uploading || !title.trim()}
        color={!title.trim() ? "#ccc" : "#007AFF"}
      />
      
      {!title.trim() && (
        <Text style={styles.helperText}>
          * Title is required to upload media
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 30,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    fontSize: 16,
    backgroundColor: "#f9f9f9",
  },
  inputRequired: {
    borderColor: "#ff6b6b",
    backgroundColor: "#fff5f5",
  },
  characterCount: {
    fontSize: 12,
    color: "#666",
    textAlign: "right",
    marginBottom: 20,
  },
  helperText: {
    fontSize: 12,
    color: "#ff6b6b",
    textAlign: "center",
    marginTop: 10,
    fontStyle: "italic",
  },
});
