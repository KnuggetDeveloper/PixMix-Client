import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

// Component for expandable info section
const InfoSection = ({ title, children }: { title: string; children: React.ReactNode }) => {
  const [expanded, setExpanded] = React.useState(false);

  return (
    <View style={styles.infoSection}>
      <TouchableOpacity 
        style={styles.infoHeader}
        onPress={() => setExpanded(!expanded)}
      >
        <Text style={styles.infoTitle}>{title}</Text>
        <Ionicons 
          name={expanded ? 'chevron-up' : 'chevron-down'} 
          size={20} 
          color="#0a7ea4" 
        />
      </TouchableOpacity>
      
      {expanded && (
        <View style={styles.infoContent}>
          {children}
        </View>
      )}
    </View>
  );
};

export default function ExploreScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f5f5f5" />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Explore</Text>
      </View>
      
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={styles.welcomeText}>
          Welcome to PixMix! Discover how our AI-powered image filters can transform your photos into amazing artwork.
        </Text>
        
        <InfoSection title="How It Works">
          <Text style={styles.infoText}>
            1. Take or select a photo from your gallery{'\n'}
            2. Choose from our curated selection of AI styles{'\n'}
            3. Tap &apos;Apply Filter&apos; to process your image{'\n'}
            4. Receive a notification when your transformed image is ready{'\n'}
            5. Save or share your creation
          </Text>
        </InfoSection>
        
        <InfoSection title="Our AI Filters">
          <Text style={styles.infoText}>
            <Text style={styles.bold}>Ghibli:</Text> Transform your photos with the magical, whimsical style of Studio Ghibli animations.{'\n\n'}
            
            <Text style={styles.bold}>Pixar:</Text> Give your images the polished 3D look of Pixar animations with vibrant colors and depth.{'\n\n'}
            
            <Text style={styles.bold}>Sketch:</Text> Convert photos into detailed pencil sketches with artistic shading and fine line work.{'\n\n'}
            
            <Text style={styles.bold}>Cyberpunk:</Text> Add a futuristic dystopian vibe with neon lights and high-tech elements.
          </Text>
        </InfoSection>
        
        <InfoSection title="Technology">
          <Text style={styles.infoText}>
            PixMix uses cutting-edge AI technology powered by OpenAI to transform your images. Each filter is carefully crafted to create stunning results while preserving the essence of your original photo.{'\n\n'}
            
            Our secure cloud processing ensures your images are handled with care, and we use Firebase for authentication and notifications.
          </Text>
        </InfoSection>
        
        <InfoSection title="Tips for Best Results">
          <Text style={styles.infoText}>
            • Use high-quality images with good lighting{'\n'}
            • For portraits, ensure faces are clearly visible{'\n'}
            • Landscape photos work particularly well with Ghibli and Cyberpunk filters{'\n'}
            • For detailed artwork, try the Sketch filter{'\n'}
            • Characters and objects work great with the Pixar filter
          </Text>
        </InfoSection>
        
        <TouchableOpacity 
          style={styles.feedbackButton}
          onPress={() => Linking.openURL('mailto:feedback@pixmix.com')}
        >
          <Text style={styles.feedbackButtonText}>Send Feedback</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eaeaea',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#0a7ea4',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100, // Extra padding for tab bar
  },
  welcomeText: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 20,
    color: '#444',
  },
  infoSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  infoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  infoContent: {
    padding: 16,
  },
  infoText: {
    fontSize: 14,
    lineHeight: 22,
    color: '#555',
  },
  bold: {
    fontWeight: 'bold',
    color: '#333',
  },
  feedbackButton: {
    backgroundColor: '#0a7ea4',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 40,
  },
  feedbackButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});