import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ImageBackground,
  StyleSheet,
  ActivityIndicator,
  Linking,
} from "react-native";
import { Feather, FontAwesome6, Entypo } from "@expo/vector-icons";
import axios, { AxiosError } from "axios";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import config from "@/constants/config";

// Helper for social links
const openLink = (url: string) => {
  // 2. Use a try-catch block for async/await or .catch for promises
  Linking.openURL(url).catch(() => {
    Toast.show({
      type: "error", // Can be 'success', 'error', 'info'
      text1: "Failed to Open Link",
      text2: "Could not open the page. Please try again later.",
      position: "bottom", // Show the toast at the bottom
      visibilityTime: 4000, // Duration in milliseconds
    });
  });
};

export default function ContactScreen() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  interface ErrorResponse {
    message: string;
  }

  const handleSubmit = async () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // --- Client-side validation remains the same ---
    if (!name.trim() || !email.trim() || !message.trim()) {
      Toast.show({
        type: "error",
        text1: "Missing Fields",
        text2: "Please fill in all the required fields.",
      });
      return;
    }

    if (!emailRegex.test(email)) {
      Toast.show({
        type: "error",
        text1: "Invalid Email",
        text2: "Please enter a valid email address.",
      });
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${config.BASE_URL}/api/contact`, {
        name,
        email,
        message,
      });

      Toast.show({
        type: "success",
        text1: "Message Sent!",
        text2: "Thank you for contacting us. We will get back to you soon.",
      });

      // Clear the form on successful submission
      setName("");
      setEmail("");
      setMessage("");
    } catch (err) {
      const error = err as AxiosError<ErrorResponse>;

      // --- THIS IS THE KEY CHANGE ---
      // Check for the existence of error.response to determine the error type
      if (!error.response) {
        // Handle Network Error (No Internet Connection)
        Toast.show({
          type: "error",
          text1: "Network Error",
          text2: "Please check your internet connection and try again.",
        });
      } else {
        // Handle Server-Side Errors (e.g., API is down, validation failed on backend)
        Toast.show({
          type: "error",
          text1: "Submission Error",
          // Use a specific message from the server if available, otherwise show a generic one
          text2:
            error.response?.data?.message ||
            "Something went wrong. Please try again later.",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* --- HEADER --- */}
        <ImageBackground
          source={require("../../assets/images/mpi-kenya-google-map.png")}
          style={styles.headerImage}
          imageStyle={styles.headerImageStyle}
        >
          <View style={styles.headerOverlay}>
            <Text style={styles.headerTitle}>Get In Touch</Text>
            <Text style={styles.headerSubtitle}>
              We're here to help and answer any question you might have.
            </Text>
          </View>
        </ImageBackground>

        {/* --- CONTACT DETAILS CARD --- */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Contact Information</Text>
          <View style={styles.infoRow}>
            <Feather name="phone" size={20} color="#4F46E5" />
            <Text style={styles.infoText}>+254 722 419 980</Text>
          </View>
          <View style={styles.infoRow}>
            <Feather name="mail" size={20} color="#4F46E5" />
            <Text style={styles.infoText}>
              info@mpikenya.org, mathare4peace@gmail.com
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Feather name="map-pin" size={20} color="#4F46E5" />
            <Text style={styles.infoText}>
              Behind Mathare DCC Office, Nairobi
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => Linking.openURL("https://www.mpikenya.org")}
          >
            <View style={styles.infoRow}>
              <Feather name="globe" size={20} color="#4F46E5" />
              <Text style={[styles.infoText, { color: "#4F46E5" }]}>
                www.mpikenya.org
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* --- MESSAGE FORM CARD --- */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Send Us a Message</Text>
          <TextInput
            style={styles.input}
            placeholder="Your Name"
            placeholderTextColor="#9CA3AF"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
          />
          <TextInput
            style={styles.input}
            placeholder="Your Email"
            placeholderTextColor="#9CA3AF"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Your Message"
            placeholderTextColor="#9CA3AF"
            multiline
            numberOfLines={4}
            value={message}
            onChangeText={setMessage}
          />
          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.buttonText}>Submit Message</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* --- SOCIAL MEDIA CARD --- */}
        {/* --- SOCIAL MEDIA CARD --- */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Follow & Subscribe</Text>

          {/* Existing Social Icons */}
          <View style={styles.socialRow}>
            <TouchableOpacity
              onPress={() => openLink("https://twitter.com/mpi_kenya")}
            >
              <FontAwesome6 name="x-twitter" size={24} color="#000000" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() =>
                openLink(
                  "https://www.linkedin.com/in/mathare-peace-initiative-95b86411b/?originalSubdomain=ke"
                )
              }
            >
              <FontAwesome6 name="linkedin" size={24} color="#0A66C2" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() =>
                openLink("https://www.facebook.com/matharepeaceinitiativekenya")
              }
            >
              <FontAwesome6 name="facebook" size={24} color="#1877F2" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => openLink("https://instagram.com/mpi_kenya")}
            >
              <Entypo name="instagram-with-circle" size={24} color="#E4405F" />
            </TouchableOpacity>
          </View>

          {/* --- MODIFICATION: New YouTube Section --- */}
          <View style={styles.divider} />

          <TouchableOpacity
            style={styles.youtubeButton}
            onPress={() =>
              openLink(
                "https://www.youtube.com/results?search_query=mathare+peace+initiative+kenya"
              )
            } // Replace with your actual YouTube channel URL
          >
            <FontAwesome6 name="youtube" size={32} style={styles.youtubeIcon} />
            <View style={styles.youtubeTextContainer}>
              <Text style={styles.youtubeTitle}>Subscribe on YouTube</Text>
              <Text style={styles.youtubeSubtitle}>
                Watch our latest videos and community stories.
              </Text>
            </View>
            <Feather
              name="chevron-right"
              size={24}
              style={styles.youtubeArrow}
            />
          </TouchableOpacity>
          {/* --- End of Modification --- */}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F3F4F6",
  },
  scrollContainer: {
    paddingBottom: 120,
  },
  headerImage: {
    height: 200,
    justifyContent: "center",
  },
  headerImageStyle: {
    opacity: 0.3,
  },
  headerOverlay: {
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    padding: 24,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#FFFFFF",
    textAlign: "center",
  },
  headerSubtitle: {
    fontSize: 16,
    color: "#E5E7EB",
    textAlign: "center",
    marginTop: 8,
  },
  card: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 16,
    marginTop: 24,
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 20,
    textAlign: "center",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  infoText: {
    fontSize: 16,
    color: "#374151",
    marginLeft: 16,
    flex: 1, // Allows text to wrap
  },
  input: {
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: "#111827",
    marginBottom: 16,
  },
  textArea: {
    height: 120,
    textAlignVertical: "top",
  },
  button: {
    backgroundColor: "#4F46E5",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  buttonDisabled: {
    backgroundColor: "#A5B4FC",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
  },
  socialRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },

  divider: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginVertical: 24, // Creates space above and below the line
  },
  youtubeButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB", // A very light gray to make it pop
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  youtubeIcon: {
    color: "#FF0000", // YouTube's brand red
    marginRight: 16,
  },
  youtubeTextContainer: {
    flex: 1, // Allows text to take up available space
  },
  youtubeTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
  },
  youtubeSubtitle: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 2,
  },
  youtubeArrow: {
    color: "#9CA3AF",
  },
  //
});
