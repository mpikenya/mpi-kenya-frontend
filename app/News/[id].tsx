// File Location: app/news/[id].tsx

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  ActivityIndicator,
  StyleSheet,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import axios, { AxiosError } from 'axios';
import config from '../../constants/config';
import Toast from 'react-native-toast-message';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
// MODIFICATION: Import the icon library
import { Feather } from '@expo/vector-icons';

interface NewsPost {
  _id: string;
  title: string;
  content: string;
  imageUrl?: string;
  date: string;
}

const NewsDetailsPage = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const [post, setPost] = useState<NewsPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      const fetchPostDetails = async () => {
        try {
          setLoading(true);
          setError(null);
          const response = await axios.get(`${config.BASE_URL}/api/news/${id}`);
          setPost(response.data);
        } catch (err) {
          const error = err as AxiosError;
          if (!error.response) {
            Toast.show({ type: 'error', text1: 'Network Error', text2: 'Please check your internet connection.' });
            setError('Could not connect to the server.');
          } else {
            Toast.show({ type: 'error', text1: 'Error Loading Post', text2: 'The requested post could not be found.' });
            setError('This post could not be loaded.');
          }
        } finally {
          setLoading(false);
        }
      };
      fetchPostDetails();
    }
  }, [id]);

  if (loading) {
    return <View style={styles.centerContainer}><ActivityIndicator size="large" color="#0369A1" /></View>;
  }

  if (error || !post) {
    return <View style={styles.centerContainer}><Text style={styles.errorText}>{error || 'This post could not be found.'}</Text></View>;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />
      
      <Stack.Screen
        options={{
          headerTransparent: true,
          headerTitle: '',
          headerTintColor: '#FFFFFF',
          headerBackTitle: '',
        }}
      />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        {post.imageUrl && (
          <Image 
            source={{ uri: post.imageUrl }} 
            // NOTE: I removed the extra '30 +' to keep the image perfectly aligned after the safe area.
            // You can add it back if you prefer the larger gap.
            style={[styles.heroImage, { marginTop: 0 + insets.top }]} 
            resizeMode="cover"
          />
        )}

        {/* --- MODIFICATION: The entire content section is restyled --- */}
        <View style={styles.contentWrapper}>
          {/* Title remains prominent */}
          <Text style={styles.title}>Event: {post.title}</Text>

          {/* New Metadata box */}
          <View style={styles.metaContainer}>
            <View style={styles.metaItem}>
              <Feather name="calendar" style={styles.metaIcon} />
              <Text style={styles.metaText}>Posted on: {" "}
                {new Date(post.date).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </Text>
            </View>
            <View style={styles.metaItem}>
              <Feather name="user" style={styles.metaIcon} />
              <Text style={styles.metaText}>Posted by MPI-Kenya Admin</Text>
            </View>
          </View>

          {/* Divider and content header */}
          <View style={styles.divider} />
          <Text style={styles.contentHeader}>Full Story</Text>
          <Text style={styles.content}>{post.content}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// --- MODIFICATION: All content styles are updated for a clearer, more professional layout ---
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#475569',
    textAlign: 'center',
  },
  scrollContainer: {
    paddingBottom: 40,
  },
  heroImage: {
    width: '100%',
    height: 320, // Slightly taller image
  },
  contentWrapper: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    marginTop: -30, // Increased overlap for a more modern feel
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#0ea5e9',
    lineHeight: 34,
    marginBottom: 16,
  },
  // New styles for the metadata section
  metaContainer: {
    backgroundColor: '#F8FAFC', // Very light gray, almost white
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  metaIcon: {
    fontSize: 16,
    color: '#0369A1', // Accent color
    marginRight: 10,
  },
  metaText: {
    fontSize: 14,
    color: '#475569',
  },
  // New styles for the divider and content header
  divider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginBottom: 20,
  },
  contentHeader: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0ea5e9',
    marginBottom: 12,
  },
  content: {
    fontSize: 16,
    color: '#334155',
    lineHeight: 28, // Excellent readability
  },
});

export default NewsDetailsPage;