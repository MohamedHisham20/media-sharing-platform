import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import FeedScreen from "../screens/FeedScreen";
import ProfileScreen from "../screens/ProfileScreen";
import UploadScreen from "../screens/UploadScreen"; // Create this if not present

const Tab = createBottomTabNavigator();

export default function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarStyle: {
          backgroundColor: "#1e1e1e",
          borderTopColor: "#333",
          borderTopWidth: 1,
          paddingTop: 5,
          paddingBottom: 5,
          height: 60,
        },
        tabBarActiveTintColor: "#007AFF",
        tabBarInactiveTintColor: "#8E8E93",
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
          marginTop: 2,
        },
        headerStyle: {
          backgroundColor: "#1e1e1e",
          borderBottomColor: "#333",
        },
        headerTintColor: "#fff",
        headerTitleStyle: {
          fontWeight: "bold",
        },
      }}
    >
      <Tab.Screen 
        name="Feed" 
        component={FeedScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
          headerTitle: "Media Feed",
          headerLeft: () => (
            <Ionicons 
              name="apps-outline" 
              size={24} 
              color="#fff" 
              style={{ marginLeft: 15 }} 
            />
          ),
        }}
      />
      <Tab.Screen 
        name="Upload" 
        component={UploadScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="add-circle" size={size} color={color} />
          ),
          headerTitle: "Upload Media",
          headerLeft: () => (
            <Ionicons 
              name="cloud-upload-outline" 
              size={24} 
              color="#fff" 
              style={{ marginLeft: 15 }} 
            />
          ),
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
          headerTitle: "Profile",
          headerLeft: () => (
            <Ionicons 
              name="person-circle-outline" 
              size={24} 
              color="#fff" 
              style={{ marginLeft: 15 }} 
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
}