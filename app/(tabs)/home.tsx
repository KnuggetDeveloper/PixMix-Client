import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
  StatusBar,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../contexts/AuthContext";
import { applyFilter } from "../../services/imageService";

// Available filter types with icons and descriptions
const filters = [
  {
    id: "Ghibli",
    name: "Ghibli",
    icon: "🏯",
    description:
      "Dreamlike, whimsical style inspired by Studio Ghibli animations",
  },
  {
    id: "Pixar",
    name: "Pixar",
    icon: "🧸",
    description:
      "3D animated style with Pixar's signature lighting and textures",
  },
  {
    id: "Sketch",
    name: "Sketch",
    icon: "✏️",
    description: "Hand-drawn artistic pencil sketch with fine details",
  },
  {
    id: "Cyberpunk",
    name: "Cyberpunk",
    icon: "🌆",
    description:
      "Futuristic dystopian style with neon lights and tech elements",
  },
];

export default function HomeScreen() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Image picker function
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
      // Reset filter when new image is selected
      setSelectedFilter(null);
    }
  };

  // Handle filter application
  const handleApplyFilter = async () => {
    if (!selectedImage || !selectedFilter) {
      alert("Please select both an image and a filter");
      return;
    }

    setIsProcessing(true);

    try {
      const response = await applyFilter(selectedImage, selectedFilter);

      // Navigate to result screen with the processed image URL
      router.push({
        pathname: "/result",
        params: {
          imageUrl: response.imageUrl,
          filterName: selectedFilter,
        },
      });
    } catch (error) {
      console.error("Error applying filter:", error);
      alert("Failed to process image. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const getFilterDescription = (filterId: string) => {
    return filters.find((filter) => filter.id === filterId)?.description || "";
  };

  return (
    <SafeAreaView edges={["top"]} style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f5f5f5" />

      {/* Header with user info */}
      <View style={styles.header}>
        <View style={styles.userInfo}>
          {user?.photoURL ? (
            <Image source={{ uri: user.photoURL }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarPlaceholder]}>
              <Text style={styles.avatarText}>
                {user?.displayName?.charAt(0) || "U"}
              </Text>
            </View>
          )}
          <Text style={styles.userName}>{user?.displayName || "User"}</Text>
        </View>
        <TouchableOpacity style={styles.signOutButton} onPress={signOut}>
          <Ionicons name="log-out-outline" size={24} color="#0a7ea4" />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Image placeholder or selected image */}
        <TouchableOpacity style={styles.imageContainer} onPress={pickImage}>
          {selectedImage ? (
            <Image
              source={{ uri: selectedImage }}
              style={styles.selectedImage}
            />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Ionicons name="image-outline" size={48} color="#888" />
              <Text style={styles.imagePlaceholderText}>
                Tap to select an image
              </Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Filter selection */}
        <Text style={styles.sectionTitle}>Choose a Filter</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterList}
          contentContainerStyle={styles.filterListContent}
        >
          {filters.map((filter) => (
            <TouchableOpacity
              key={filter.id}
              style={[
                styles.filterItem,
                selectedFilter === filter.id && styles.selectedFilterItem,
              ]}
              onPress={() => setSelectedFilter(filter.id)}
            >
              <Text style={styles.filterIcon}>{filter.icon}</Text>
              <Text style={styles.filterName}>{filter.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Selected filter description */}
        {selectedFilter && (
          <Text style={styles.filterDescription}>
            {getFilterDescription(selectedFilter)}
          </Text>
        )}

        {/* Apply button */}
        <TouchableOpacity
          style={[
            styles.applyButton,
            (!selectedImage || !selectedFilter || isProcessing) &&
              styles.disabledButton,
          ]}
          onPress={handleApplyFilter}
          disabled={!selectedImage || !selectedFilter || isProcessing}
        >
          {isProcessing ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.applyButtonText}>
              {selectedImage && selectedFilter
                ? "Apply Filter"
                : "Select Image & Filter"}
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100, // Extra padding at bottom for tab bar
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eaeaea",
    backgroundColor: "#fff",
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 8,
  },
  avatarPlaceholder: {
    backgroundColor: "#0a7ea4",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  userName: {
    fontSize: 16,
    fontWeight: "500",
  },
  signOutButton: {
    padding: 8,
  },
  imageContainer: {
    aspectRatio: 4 / 3,
    backgroundColor: "#e1e1e1",
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  selectedImage: {
    width: "100%",
    height: "100%",
  },
  imagePlaceholder: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  imagePlaceholderText: {
    color: "#888",
    fontSize: 16,
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
  },
  filterList: {
    flexDirection: "row",
    marginBottom: 16,
  },
  filterListContent: {
    paddingRight: 20,
  },
  filterItem: {
    alignItems: "center",
    marginRight: 16,
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    width: 100,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  selectedFilterItem: {
    backgroundColor: "#e6f2f7",
    borderColor: "#0a7ea4",
    borderWidth: 2,
  },
  filterIcon: {
    fontSize: 28,
    marginBottom: 8,
  },
  filterName: {
    fontSize: 14,
    fontWeight: "500",
  },
  filterDescription: {
    color: "#555",
    fontSize: 14,
    marginBottom: 24,
    fontStyle: "italic",
  },
  applyButton: {
    backgroundColor: "#0a7ea4",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginTop: 16,
  },
  disabledButton: {
    backgroundColor: "#aaa",
  },
  applyButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});