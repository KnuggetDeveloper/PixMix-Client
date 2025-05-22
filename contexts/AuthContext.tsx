/* eslint-disable @typescript-eslint/no-unused-vars */
// contexts/AuthContext.tsx
import React, { createContext, useState, useEffect, useContext } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getCloudRunToken } from "../services/authService";
import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";
import { 
  GoogleAuthProvider,
  onAuthStateChanged, 
  signInWithCredential, 
  signOut as firebaseSignOut,
  User 
} from "firebase/auth";
import { auth } from "../firebase.config";

// Define the context
type AuthContextType = {
  user: User | null;
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
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [cloudRunToken, setCloudRunToken] = useState<string | null>(null);

  // Get client IDs from app.json
  const androidClientId = "493914627855-fmh1tvmgu2ng7m4c6uivhmjj1pn6uja3.apps.googleusercontent.com";

  // Set up Google Auth
  const [request, response, promptAsync] = Google.useAuthRequest({
    androidClientId,
    scopes: ["profile", "email"],
  });

  // Handle auth response
  useEffect(() => {
    if (response?.type === "success") {
      const { id_token } = response.params;
      handleGoogleSignIn(id_token);
    }
  }, [response]);

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        try {
          // Get ID token
          const idToken = await firebaseUser.getIdToken();
          
          // Get Cloud Run token
          const token = await getCloudRunToken(idToken);
          setCloudRunToken(token);
          await AsyncStorage.setItem("cloudRunToken", token);
        } catch (error) {
          console.error("Error getting tokens:", error);
        }
      } else {
        setUser(null);
        setCloudRunToken(null);
        await AsyncStorage.removeItem("cloudRunToken");
      }
      setIsLoading(false);
    });

    // Cleanup subscription
    return () => unsubscribe();
  }, []);

  // Handle Google Sign-in with Firebase
  const handleGoogleSignIn = async (idToken: string) => {
    try {
      // Create a Google credential with the token
      const credential = GoogleAuthProvider.credential(idToken);
      
      // Sign in with credential
      await signInWithCredential(auth, credential);
      // Auth state listener will handle the rest
    } catch (error) {
      console.error("Error handling Google sign-in:", error);
      throw error;
    }
  };

  // Sign in with Google function
  const signInWithGoogle = async (): Promise<void> => {
    try {
      setIsLoading(true);
      await promptAsync();
    } catch (error) {
      console.error("Error signing in with Google:", error);
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
      await firebaseSignOut(auth);
      await AsyncStorage.removeItem("cloudRunToken");
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