import React, { useEffect } from "react";
import { Stack, useRouter, useSegments } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import { AuthProvider, useAuth } from "../contexts/AuthContext";
import { NotificationProvider } from "../contexts/NotificationContext";

// Auth redirect logic
function AuthRedirect() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (isLoading) return;

    // Check if the user is on an authentication screen
    const isInAuthGroup = segments[0] === "(auth)";

    if (!user && !isInAuthGroup) {
      // If not authenticated and not on an auth screen, redirect to auth
      router.replace("/(auth)/login" as any);
    } else if (user && isInAuthGroup) {
      // If authenticated and on an auth screen, redirect to main app
      router.replace("/(tabs)/home" as any);
    }
  }, [user, isLoading, segments, router]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#0a7ea4" />
      </View>
    );
  }

  return null;
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen
            name="result"
            options={{
              presentation: "card",
              headerShown: true,
              title: "Transformed Image",
            }}
          />
          <Stack.Screen name="index" options={{ headerShown: false }} />
        </Stack>
        <AuthRedirect />
      </NotificationProvider>
    </AuthProvider>
  );
}