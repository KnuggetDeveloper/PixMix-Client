// contexts/AuthContext.tsx
import React, { createContext, useState, useEffect, useContext } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getCloudRunToken } from "../services/authService";
import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";

// Mock Firebase Auth types for development with Expo Go
type FirebaseUser = {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  getIdToken: (forceRefresh?: boolean) => Promise<string>;
};

// Define the context
type AuthContextType = {
  user: FirebaseUser | null;
  isLoading: boolean;
  cloudRunToken: string | null;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  refreshCloudRunToken: () => Promise<string | undefined>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  cloudRunToken: null,
  signInWithGoogle: async () => {},
  signOut: async () => {},
  refreshCloudRunToken: async () => undefined,
});

export const useAuth = () => useContext(AuthContext);

// Ensure WebBrowser redirects work correctly
WebBrowser.maybeCompleteAuthSession();

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [cloudRunToken, setCloudRunToken] = useState<string | null>(null);

  // Get client IDs from app.json
  const androidClientId = "493914627855-fmh1tvmgu2ng7m4c6uivhmjj1pn6uja3.apps.googleusercontent.com";

  // Set up Google Auth
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [request, response, promptAsync] = Google.useAuthRequest({
    androidClientId,
    scopes: ["profile", "email"],
  });

  // Handle auth response
  useEffect(() => {
    if (response?.type === "success") {
      const { authentication } = response;
      handleGoogleSignInForExpo(authentication?.accessToken);
    }
  }, [response]);

  // Check for existing user session
  useEffect(() => {
    const loadStoredUser = async () => {
      try {
        const storedUser = await AsyncStorage.getItem("user");
        const storedToken = await AsyncStorage.getItem("cloudRunToken");

        if (storedUser) {
          setUser(JSON.parse(storedUser));
          setCloudRunToken(storedToken);
        }
      } catch (error) {
        console.error("Error loading stored user:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadStoredUser();
  }, []);

  // Handle Google Sign-in with user info (for Expo Go)
  const handleGoogleSignInForExpo = async (accessToken: string | undefined) => {
    if (!accessToken) return;

    try {
      // Get user info from Google
      const response = await fetch(
        "https://www.googleapis.com/userinfo/v2/me",
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      const userInfo = await response.json();

      // Create a mock Firebase user
      const mockUser: FirebaseUser = {
        uid: userInfo.id,
        displayName: userInfo.name,
        email: userInfo.email,
        photoURL: userInfo.picture,
        getIdToken: async () => accessToken, // Use access token as ID token for simplicity
      };

      // Store user in state and AsyncStorage
      setUser(mockUser);
      await AsyncStorage.setItem("user", JSON.stringify(mockUser));

      // Get Cloud Run token
      const token = await getCloudRunToken(accessToken);
      setCloudRunToken(token);
      await AsyncStorage.setItem("cloudRunToken", token);
    } catch (error) {
      console.error("Error handling Google sign-in:", error);
      throw error;
    }
  };

  // Sign in with Google function for Expo Go
  const signInWithGoogle = async (): Promise<void> => {
    try {
      setIsLoading(true);
      await promptAsync();
    } catch (error) {
      console.error("Error signing in with Google:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Refresh Cloud Run token
  const refreshCloudRunToken = async () => {
    try {
      if (!user) return undefined;

      const idToken = await user.getIdToken(true);
      const token = await getCloudRunToken(idToken);

      setCloudRunToken(token);
      await AsyncStorage.setItem("cloudRunToken", token);

      return token;
    } catch (error) {
      console.error("Error refreshing Cloud Run token:", error);
      throw error;
    }
  };

  // Sign out
  const signOut = async (): Promise<void> => {
    try {
      // Clear local storage
      await AsyncStorage.removeItem("user");
      await AsyncStorage.removeItem("cloudRunToken");

      // Reset state
      setUser(null);
      setCloudRunToken(null);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        cloudRunToken,
        signInWithGoogle,
        signOut,
        refreshCloudRunToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
