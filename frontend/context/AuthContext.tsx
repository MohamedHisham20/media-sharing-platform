"use client"

import React, { createContext, useContext, useEffect, useState, useCallback } from "react"

interface User {
  id: string;
  email: string;
  username: string;
  createdAt: string;
}

interface AuthState {
  token: string | null;
  user: User | null;
  isLoggedIn: boolean;
  isLoading: boolean;
}

interface AuthContextType extends AuthState {
  login: (token: string, user: User) => void;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
  getAuthToken: () => string | null;
}

const AuthContext = createContext<AuthContextType>({
  token: null,
  user: null,
  isLoggedIn: false,
  isLoading: true,
  login: () => {},
  logout: () => {},
  updateUser: () => {},
  getAuthToken: () => null,
})

const AUTH_STORAGE_KEY = 'auth';

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [authState, setAuthState] = useState<AuthState>({
    token: null,
    user: null,
    isLoggedIn: false,
    isLoading: true,
  });

  // Load auth state from localStorage on mount
  useEffect(() => {
    const loadAuthState = () => {
      try {
        const storedAuth = localStorage.getItem(AUTH_STORAGE_KEY);
        if (storedAuth) {
          const parsed = JSON.parse(storedAuth);
          
          // Validate the stored data structure
          if (parsed.token && parsed.user && parsed.user.id) {
            setAuthState({
              token: parsed.token,
              user: parsed.user,
              isLoggedIn: true,
              isLoading: false,
            });
            return;
          }
        }
      } catch (error) {
        console.error('Failed to load auth state:', error);
        // Clear invalid data
        localStorage.removeItem(AUTH_STORAGE_KEY);
      }
      
      // No valid auth found
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
      }));
    };

    loadAuthState();
  }, []);

  // Save auth state to localStorage whenever it changes
  useEffect(() => {
    if (!authState.isLoading) {
      if (authState.isLoggedIn && authState.token && authState.user) {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({
          token: authState.token,
          user: authState.user,
        }));
      } else {
        localStorage.removeItem(AUTH_STORAGE_KEY);
      }
    }
  }, [authState]);

  const login = useCallback((token: string, user: User) => {
    setAuthState({
      token,
      user,
      isLoggedIn: true,
      isLoading: false,
    });
  }, []);

  const logout = useCallback(() => {
    setAuthState({
      token: null,
      user: null,
      isLoggedIn: false,
      isLoading: false,
    });
  }, []);

  const updateUser = useCallback((userData: Partial<User>) => {
    setAuthState(prev => {
      if (!prev.user) return prev;
      
      return {
        ...prev,
        user: {
          ...prev.user,
          ...userData,
        },
      };
    });
  }, []);

  const getAuthToken = useCallback(() => {
    return authState.token;
  }, [authState.token]);

  const contextValue: AuthContextType = {
    ...authState,
    login,
    logout,
    updateUser,
    getAuthToken,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
