import * as ImagePicker from "expo-image-picker";
import { View, TextInput, Alert, StyleSheet, Text, TouchableOpacity, ScrollView } from "react-native";
import { useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { Ionicons } from "@expo/vector-icons";

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
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <Ionicons name="cloud-upload" size={48} color="#007AFF" />
        <Text style={styles.title}>Upload Media</Text>
        <Text style={styles.subtitle}>Share your photos and videos with the community</Text>
      </View>
      
      <View style={styles.form}>
        <View style={styles.inputContainer}>
          <View style={styles.inputHeader}>
            <Ionicons name="create-outline" size={20} color="#666" />
            <Text style={styles.inputLabel}>Media Title</Text>
          </View>
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
        </View>

        <TouchableOpacity
          style={[styles.uploadButton, uploading && styles.uploadButtonDisabled]}
          onPress={pickAndUploadImage}
          disabled={uploading || !title.trim()}
        >
          <Ionicons 
            name={uploading ? "hourglass-outline" : "camera"} 
            size={24} 
            color="#fff" 
          />
          <Text style={styles.uploadButtonText}>
            {uploading ? "Uploading..." : "Pick & Upload Media"}
          </Text>
        </TouchableOpacity>

        {!title.trim() && (
          <View style={styles.helperContainer}>
            <Ionicons name="information-circle-outline" size={16} color="#FF6B6B" />
            <Text style={styles.helperText}>
              Title is required to upload media
            </Text>
          </View>
        )}

        <View style={styles.tipContainer}>
          <Ionicons name="bulb-outline" size={20} color="#FFA500" />
          <View style={styles.tipContent}>
            <Text style={styles.tipTitle}>Tips for better uploads:</Text>
            <Text style={styles.tipText}>• Use descriptive titles</Text>
            <Text style={styles.tipText}>• Choose high-quality images/videos</Text>
            <Text style={styles.tipText}>• Keep content appropriate</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  contentContainer: {
    flexGrow: 1,
    padding: 20,
  },
  header: {
    alignItems: "center",
    marginBottom: 30,
    paddingVertical: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginTop: 12,
    marginBottom: 8,
    textAlign: "center",
    color: "#333",
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    paddingHorizontal: 20,
  },
  form: {
    flex: 1,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginLeft: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    backgroundColor: "#fff",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  inputRequired: {
    borderColor: "#FF6B6B",
    borderWidth: 2,
  },
  characterCount: {
    fontSize: 12,
    color: "#666",
    textAlign: "right",
    marginTop: 4,
  },
  uploadButton: {
    backgroundColor: "#007AFF",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 20,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  uploadButtonDisabled: {
    backgroundColor: "#ccc",
  },
  uploadButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  helperContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    padding: 12,
    backgroundColor: "#FFE5E5",
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: "#FF6B6B",
  },
  helperText: {
    fontSize: 14,
    color: "#FF6B6B",
    marginLeft: 8,
    fontWeight: "500",
  },
  tipContainer: {
    flexDirection: "row",
    padding: 16,
    backgroundColor: "#FFF8E1",
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#FFA500",
    marginTop: 20,
  },
  tipContent: {
    marginLeft: 12,
    flex: 1,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  tipText: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
    marginBottom: 2,
  },
});
