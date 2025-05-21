import messaging from "@react-native-firebase/messaging";
import { Platform } from "react-native";

// Request user permission for notifications
export const requestUserPermission = async () => {
  if (Platform.OS === "android") {
    // Android permissions are handled in manifest
    return true;
  }

  const authStatus = await messaging().requestPermission();
  const enabled =
    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authStatus === messaging.AuthorizationStatus.PROVISIONAL;

  return enabled;
};

// Get FCM token
export const getFCMToken = async () => {
  try {
    const token = await messaging().getToken();
    console.log("FCM Token:", token);
    return token;
  } catch (error) {
    console.error("Failed to get FCM token:", error);
    return null;
  }
};

// Set up FCM listeners
export const setupFCMListeners = () => {
  // Handle background messages
  messaging().setBackgroundMessageHandler(async (remoteMessage) => {
    console.log("Message handled in the background:", remoteMessage);
  });

  // Handle foreground messages
  const unsubscribe = messaging().onMessage(async (remoteMessage) => {
    console.log("Foreground Message received:", remoteMessage);
    // You can add your notification handling logic here
  });

  return unsubscribe;
};
