import React, { useState } from 'react';
import {
  View,
  Text,
  ImageBackground,
  TextInput,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import axios,{AxiosError} from 'axios';
import Toast from 'react-native-toast-message';
import config from '@/constants/config';

interface VolunteerFormState {
  fullName: string;
  email: string;
  phone: string;
  reason: string;
}

const VolunteerScreen = () => {
  const [form, setForm] = useState<VolunteerFormState>({
    fullName: '',
    email: '',
    phone: '',
    reason: '',
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (field: keyof VolunteerFormState, value: string) => {
    setForm({ ...form, [field]: value });
  };

// Define the shape of a potential error response from your API
interface ErrorResponse {
  message: string;
}

const handleSubmit = async () => {
  // --- Client-side validation remains the same ---
  if (!form.fullName || !form.email || !form.phone || !form.reason) {
    Toast.show({
      type: 'error',
      text1: 'Incomplete Form',
      text2: 'Please fill in all the required fields to apply.',
    });
    return;
  }

  setLoading(true);
  try {
    await axios.post(`${config.BASE_URL}/api/volunteer`, form);

    Toast.show({
      type: 'success',
      text1: 'Application Sent!',
      text2: 'Thank you for your interest! We will review your application and be in touch soon.',
    });

    // Reset form after successful submission
    setForm({ fullName: '', email: '', phone: '', reason: '' });

  } catch (err) {
    const error = err as AxiosError<ErrorResponse>;

    // --- THIS IS THE KEY CHANGE ---
    // Differentiate between network and server errors
    if (!error.response) {
      // Handle Network Error (e.g., no internet)
      Toast.show({
        type: 'error',
        text1: 'Network Error',
        text2: 'Please check your internet connection and try again.',
      });
    } else {
      // Handle Server-Side Errors
      Toast.show({
        type: 'error',
        text1: 'Submission Failed',
        // Show a specific message from the server if available
        text2: error.response?.data?.message || 'An error occurred. Please try again later.',
      });
    }
  } finally {
    setLoading(false);
  }
};


  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContainer}
        >
          <ImageBackground
            source={require('../../assets/images/volunteer-icon.jpg')}
            style={styles.headerImage}
            resizeMode="cover"
          >
            <View style={styles.headerOverlay}>
              <Text style={styles.headerTitle}>Become a Volunteer</Text>
              <Text style={styles.headerSubtitle}>
                Join our mission and make a tangible impact at MPI Kenya.
              </Text>
            </View>
          </ImageBackground>

          <View style={styles.formContainer}>
            <Text style={styles.formTitle}>Volunteer Application</Text>
            
            <TextInput
              placeholder="Full Name"
              placeholderTextColor="#9CA3AF"
              value={form.fullName}
              onChangeText={(text) => handleChange('fullName', text)}
              style={styles.input}
              autoCapitalize="words"
            />

            <TextInput
              placeholder="Email Address"
              placeholderTextColor="#9CA3AF"
              keyboardType="email-address"
              autoCapitalize="none"
              value={form.email}
              onChangeText={(text) => handleChange('email', text)}
              style={styles.input}
            />

            <TextInput
              placeholder="Phone Number"
              placeholderTextColor="#9CA3AF"
              keyboardType="phone-pad"
              value={form.phone}
              onChangeText={(text) => handleChange('phone', text)}
              style={styles.input}
            />

            <TextInput
              placeholder="Why do you want to volunteer?"
              placeholderTextColor="#9CA3AF"
              value={form.reason}
              onChangeText={(text) => handleChange('reason', text)}
              multiline
              style={[styles.input, styles.textArea]}
            />

            <TouchableOpacity
              onPress={handleSubmit}
              style={[styles.submitButton, loading && styles.submitButtonDisabled]}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.submitButtonText}>Submit Application</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

// --- YOUR PROVIDED STYLES ---
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
  },
  scrollContainer: {
    paddingBottom: 130,
  },
  headerImage: {
    height: 350,
    width: '100%',
    justifyContent: 'flex-end',
  },
  headerOverlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 24,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#E5E7EB',
    marginTop: 8,
  },
  formContainer: {
    padding: 24,
    backgroundColor: '#FFFFFF',
  },
  formTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 20,
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#111827',
    marginBottom: 16,
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: '#0369A1', // sky-700
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  // Added for consistency with the loading logic
  submitButtonDisabled: {
    backgroundColor: '#7DD3FC', // A lighter sky-300
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default VolunteerScreen;