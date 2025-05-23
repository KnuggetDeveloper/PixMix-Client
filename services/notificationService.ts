import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import { User } from "firebase/auth";

// API URLs
const BACKEND_URL = "http://localhost:3000";

/**
 * Register FCM device token with backend
 *
 * @param user Firebase user
 * @param fcmToken FCM device token
 * @param platform Device platform (ios/android)
 */
export const registerFCMToken = async (
  user: User,
  fcmToken: string,
  platform: string
): Promise<void> => {
  try {
    // Store locally for use in other services
    await AsyncStorage.setItem("fcmToken", fcmToken);

    // Get Cloud Run token
    const cloudRunToken = await AsyncStorage.getItem("cloudRunToken");
    if (!cloudRunToken) {
      throw new Error("Authentication token not found");
    }

    // Register with backend
    await axios.post(
      `${BACKEND_URL}/register-token`,
      {
        userId: user.uid,
        fcmToken,
        platform,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${cloudRunToken}`,
        },
      }
    );

    console.log("FCM token registered successfully");
  } catch (error) {
    console.error("Error registering FCM token:", error);
    throw error;
  }
};

/**
 * Configure push notification handling
 */
export const configurePushNotifications = async (): Promise<void> => {
  // Set notification handler
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });

  // Check existing permissions
  const { status: existingStatus } = await Notifications.getPermissionsAsync();

  // Request permissions if needed
  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== "granted") {
      return;
    }
  }

  // Get FCM token
  const tokenData = await Notifications.getDevicePushTokenAsync();

  // Store token locally
  await AsyncStorage.setItem("fcmToken", tokenData.data);

  return;
};
