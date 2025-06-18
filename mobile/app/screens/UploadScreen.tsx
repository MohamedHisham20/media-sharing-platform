import * as ImagePicker from "expo-image-picker";
import { View, Button, TextInput, Alert } from "react-native";
import { useState, useContext, use } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

export default function UploadScreen() {
  const [title, setTitle] = useState("");
  const { token, userId } = useAuth();

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      quality: 1,
    });

    if (!result.canceled && result.assets.length > 0) {
      const file = result.assets[0];

      const formData = new FormData();
      formData.append("title", title);
      formData.append("file", {
        uri: file.uri,
        name: "upload.jpg",
        type: file.type || "image/jpeg",
      } as any);

      axios
        .post(`${process.env.EXPO_PUBLIC_API_URL}/media/upload`, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        })
        .then(() => Alert.alert("Upload successful"))
        .catch((e) => Alert.alert("Error uploading", e.message));
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <TextInput
        placeholder="Title"
        value={title}
        onChangeText={setTitle}
        style={{ borderWidth: 1, marginBottom: 10 }}
      />
      <Button title="Pick & Upload" onPress={pickImage} />
    </View>
  );
}
