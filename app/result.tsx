import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Share,
  Platform,
  StatusBar,
} from 'react-native';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';

export default function ResultScreen() {
  const router = useRouter();
  const { imageUrl, filterName } = useLocalSearchParams<{ imageUrl: string; filterName: string }>();
  const [isSaving, setSaving] = useState(false);
  const [saveComplete, setSaveComplete] = useState(false);

  // Handle saving the image to the device
  const saveImage = async () => {
    try {
      setSaving(true);

      // Request media library permissions
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        alert('Sorry, we need media library permissions to save the image.');
        setSaving(false);
        return;
      }

      // Download the image first
      const fileUri = `${FileSystem.cacheDirectory}pixmix-${Date.now()}.jpg`;
      const downloadResult = await FileSystem.downloadAsync(
        imageUrl as string,
        fileUri
      );

      if (downloadResult.status !== 200) {
        throw new Error('Failed to download image');
      }

      // Save to media library
      const asset = await MediaLibrary.createAssetAsync(fileUri);
      await MediaLibrary.createAlbumAsync('PixMix', asset, false);

      setSaveComplete(true);
      setTimeout(() => setSaveComplete(false), 3000);
    } catch (error) {
      console.error('Error saving image:', error);
      alert('Failed to save image. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // Handle sharing the image
  const shareImage = async () => {
    try {
      // Share options depend on whether we're on iOS or Android
      if (Platform.OS === 'ios') {
        await Share.share({
          url: imageUrl as string,
          message: `Check out my photo transformed with PixMix using the ${filterName} filter!`,
        });
      } else {
        // For Android, we need to download the image first
        const fileUri = `${FileSystem.cacheDirectory}pixmix-share-${Date.now()}.jpg`;
        await FileSystem.downloadAsync(imageUrl as string, fileUri);
        
        await Share.share({
          url: fileUri,
          message: `Check out my photo transformed with PixMix using the ${filterName} filter!`,
        });
      }
    } catch (error) {
      console.error('Error sharing image:', error);
      alert('Failed to share image. Please try again.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f5f5f5" />
      
      <Stack.Screen 
        options={{
          title: 'Transformed Image',
          headerShown: true,
          headerLeft: () => (
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={24} color="#0a7ea4" />
            </TouchableOpacity>
          ),
        }} 
      />
      
      <View style={styles.content}>
        <View style={styles.imageContainer}>
          {imageUrl ? (
            <Image 
              source={{ uri: imageUrl as string }} 
              style={styles.image}
              resizeMode="contain"
            />
          ) : (
            <View style={styles.imagePlaceholder}>
              <ActivityIndicator color="#0a7ea4" size="large" />
              <Text style={styles.loadingText}>Loading image...</Text>
            </View>
          )}
        </View>
        
        <View style={styles.infoBox}>
          <Text style={styles.filterTitle}>
            {filterName} Filter
          </Text>
          <Text style={styles.description}>
            Your image has been transformed with the {filterName} style.
          </Text>
        </View>
        
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={[styles.actionButton, styles.saveButton]}
            onPress={saveImage}
            disabled={isSaving || !imageUrl}
          >
            {isSaving ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                <Ionicons 
                  name={saveComplete ? "checkmark" : "download"} 
                  size={20} 
                  color="#fff" 
                />
                <Text style={styles.actionButtonText}>
                  {saveComplete ? "Saved!" : "Save"}
                </Text>
              </>
            )}
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, styles.shareButton]}
            onPress={shareImage}
            disabled={!imageUrl}
          >
            <Ionicons name="share-social" size={20} color="#fff" />
            <Text style={styles.actionButtonText}>Share</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  backButton: {
    marginLeft: 8,
    padding: 8,
  },
  content: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
  },
  imageContainer: {
    width: '100%',
    height: '65%',
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: '#777',
  },
  infoBox: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  filterTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0a7ea4',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 24,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    padding: 14,
    flex: 0.48,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  saveButton: {
    backgroundColor: '#0a7ea4',
  },
  shareButton: {
    backgroundColor: '#2a9d8f',
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: '600',
    marginLeft: 8,
  },
});