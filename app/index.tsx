import { Stack } from 'expo-router';
import { Text, View, StyleSheet } from 'react-native';

export default function ExploreIndex() {
  // This redirects to the explore screen. You don't need this file, 
  // but we're keeping it to enable correct routing with expo-router.
  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Explore' }} />
      <Text>Loading explore content...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});