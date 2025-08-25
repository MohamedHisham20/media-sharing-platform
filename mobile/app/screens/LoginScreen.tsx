import React, { useState } from "react";
import { View, Text, TextInput, Button, StyleSheet, Alert, TouchableOpacity } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "../context/AuthContext";
import axios from "axios";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export default function LoginScreen({ navigation }: any) {
  const { login, token, userId } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter email and password");
      return;
    }

    try {
      setLoading(true);
      const res = await axios.post(
        `${API_URL}/users/login`,
        {
          email,
          password,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const response = res.data;

      // Check if the response structure is correct
      if (!response.success || !response.data || !response.data.token || !response.data.user) {
        throw new Error('Invalid response structure from server');
      }

      const token = response.data.token;
      // Backend returns user.id (not user._id)
      const userId = response.data.user.id;

      if (!token || !userId) {
        throw new Error('Missing token or user ID in response');
      }

      // Store the values in AsyncStorage
      await AsyncStorage.setItem("token", token);
      await AsyncStorage.setItem("userId", userId);
      
      // Update the auth context
      login(token, userId);
      navigation.navigate("App"); // Navigate to App (TabNavigator) after successful login
    } catch (error: any) {
      const message =
        error.response?.data?.message || error.message || "Login failed";
      Alert.alert("Login Error", message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <Button
        title={loading ? "Logging in..." : "Login"}
        onPress={handleLogin}
        disabled={loading}
      />
      
      <View style={styles.registerContainer}>
        <Text style={styles.registerText}>Don't have an account? </Text>
        <TouchableOpacity onPress={() => navigation.navigate("Register")}>
          <Text style={styles.registerLink}>Sign Up</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
  },
  registerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },
  registerText: {
    fontSize: 16,
    color: "#666",
  },
  registerLink: {
    fontSize: 16,
    color: "#007AFF",
    fontWeight: "600",
  },
});
