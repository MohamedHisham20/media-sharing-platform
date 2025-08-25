// app/context/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type AuthContextType = {
  token: string | null;
  userId: string | null;
  login: (token: string, userId: string) => void;
  logout: () => void;
};

export const AuthContext = createContext<AuthContextType>({
  token: null,
  userId: null,
  login: () => {},
  logout: () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const loadAuth = async () => {
      try {
        const storedToken = await AsyncStorage.getItem("token");
        const storedUserId = await AsyncStorage.getItem("userId");
        
        // Only set state if both values exist and are not null
        if (storedToken && storedUserId) {
          setToken(storedToken);
          setUserId(storedUserId);
        }
      } catch (error) {
        console.error('Error loading auth data:', error);
        // Clear any corrupted data
        await AsyncStorage.removeItem("token");
        await AsyncStorage.removeItem("userId");
      }
    };
    loadAuth();
  }, []);

  const login = async (token: string, userId: string) => {
    // Validate that token and userId are not null/undefined
    if (!token || !userId) {
      console.error('Login failed: token or userId is null/undefined');
      return;
    }
    
    setToken(token);
    setUserId(userId);
    await AsyncStorage.setItem("token", token);
    await AsyncStorage.setItem("userId", userId);
  };

  const logout = async () => {
    try {
      setToken(null);
      setUserId(null);
      await AsyncStorage.removeItem("token");
      await AsyncStorage.removeItem("userId");
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ token, userId, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
