// App.tsx
import { NavigationContainer } from "@react-navigation/native";
import AppNavigator from "./app/navigation/AppNavigator";
import { AuthProvider, useAuth } from "./app/context/AuthContext";
import React from "react";
import AuthNavigator from "./app/navigation/AppNavigator"; // Make sure this import exists
import { GestureHandlerRootView } from "react-native-gesture-handler";

function Main() {
  const { token } = useAuth();
  return (
    <NavigationContainer>
      {token ? <AppNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Main />
    </AuthProvider>
  );
}
