import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import styles from "./SignScreen2.styles";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import axios, { AxiosError } from "axios"; // Import AxiosError for better typing
import Toast from "react-native-toast-message";
import { useAuth, useUser, useOAuth } from "@clerk/clerk-expo";
import * as WebBrowser from "expo-web-browser";
import config from "../constants/config";
import * as SecureStore from "expo-secure-store"; // Import SecureStore for token storage

WebBrowser.maybeCompleteAuthSession();

// Define a shape for backend error responses for type safety
interface ErrorResponse {
  message: string;
}

const SignScreen = () => {


  const { user } = useUser();
  const { isSignedIn, isLoaded, signOut } = useAuth(); // We might need signOut for cleanup
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<"signup" | "login">("signup");
  const [showPassword, setShowPassword] = useState(false);
  
  // --- MODIFICATION 1: Separate Loading States ---
  const [isFormLoading, setIsFormLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  // --- MODIFICATION 2: State to prevent duplicate backend calls ---
  const [hasSyncedBackend, setHasSyncedBackend] = useState(false);

    // --- THIS IS THE FIX ---
  // We are now explicitly telling Clerk which redirect URL to use.
const { startOAuthFlow } = useOAuth({ strategy: "oauth_google" });
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  // This effect correctly redirects a user who is already fully signed in. No changes needed.
  useEffect(() => {
    if (isLoaded && isSignedIn && user) {
      router.replace("/(tabs)/Home");
    }
  }, [isLoaded, isSignedIn, user, router]);


  // --- MODIFICATION 3: Robust Backend Sync Effect ---
  // This effect now ensures it only runs ONCE per sign-in.
  useEffect(() => {
    // Exit if Clerk isn't ready, if there's no user, or if we've already synced.
    if (!isLoaded || !user || hasSyncedBackend) {
      return;
    }

    // Set the flag immediately to prevent this effect from re-triggering
    // if the `user` object re-renders.
    setHasSyncedBackend(true);

    console.log("📦 Syncing user to backend (one-time operation)...", user);

    axios
      .post(`${config.BASE_URL}/api/auth/clerk-login`, {
        clerkUserId: user.id,
        email: user.emailAddresses[0]?.emailAddress,
        name: user.fullName || user.username,
        googleId: user.id,
        photo: user.imageUrl,
      })
      .then(() => {
        Toast.show({ type: "success", text1: "Signed in successfully!" });
        router.replace("/(tabs)/Home");
      })
      .catch((err: AxiosError<ErrorResponse>) => {
        // This logic remains the same, but it's now protected from running multiple times.
        if (err.response && err.response.status === 409) {
          console.log("✅ User already exists in DB, proceeding.");
          Toast.show({ type: "success", text1: `Welcome back, ${user.fullName || user.username}!` });
          router.replace("/(tabs)/Home");
        } 
      });
  }, [isLoaded, user, hasSyncedBackend, router]);

  // This effect resets our sync flag if the user signs out.
  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      setHasSyncedBackend(false);
    }
  }, [isLoaded, isSignedIn]);


  const togglePasswordVisibility = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowPassword(!showPassword);
  };

  const handleTabChange = (tab: "signup" | "login") => setActiveTab(tab);
  

  const handleGoogleSignIn = async () => {
    // Prevent multiple clicks while process is running
    if (isGoogleLoading) return;
    setIsGoogleLoading(true);

    try {
      const res = await startOAuthFlow();

      if (res?.createdSessionId && res?.setActive) {
        await res.setActive({ session: res.createdSessionId });
        console.log("✅ Google session created successfully.");
        // The useEffect for backend sync will now take over.
      } else {
        // This case handles when the user closes the OAuth window without signing in.
        setIsGoogleLoading(false); // Reset loading state
      }
    } catch (err) {
      
      Toast.show({
        type: "error",
        text1: "Sign-in error",
        text2: err instanceof Error ? err.message : "Something went wrong",
      });
      setIsGoogleLoading(false); // Ensure loading state is reset on error
    }
    // Note: We don't set loading to false in the success case, because the app
    // will navigate away or be in a loading state managed by the useEffect.
  };

const handleSignup = async () => {
  if (isFormLoading) return;
  setIsFormLoading(true);

  try {
    // Note: You might want to get the user and token from the response here
    // to log them in automatically after signup. I'll assume the current logic for now.
    await axios.post(`${config.BASE_URL}/api/auth/register`, formData);
    
    Toast.show({
      type: "success",
      text1: "Account Created Successfully!",
      text2: "You can now log in.", // Or automatically log them in
    });

    // It's often better to navigate to the login screen after signup,
    // unless your API automatically logs the user in and returns a token.
    router.push("/(tabs)/Home"); // Or router.replace('/(tabs)/Home') if auto-login

  } catch (err) {
    const error = err as AxiosError<ErrorResponse>;
    
    // --- THIS IS THE KEY CHANGE ---
    // Check if error.response exists to differentiate network vs. server errors.
    if (!error.response) {
      // Handle Network Error (No Internet)
      Toast.show({
        type: "error",
        text1: "Network Error",
        text2: "Please check your internet connection and try again.",
      });
    } else {
      // Handle Server Error (e.g., email already exists)
      Toast.show({
        type: "error",
        text1: "Registration Failed",
        // Use the specific message from the server if it exists
        text2: error.response?.data?.message || "An unexpected error occurred.",
      });
    }

  } finally {
    setIsFormLoading(false);
  }
};

// In SignScreen.tsx

const handleLogin = async () => {
  if (isFormLoading) return;
  setIsFormLoading(true);

  try {
    const res = await axios.post(`${config.BASE_URL}/api/auth/login`, {
      email: formData.email,
      password: formData.password,
    });

    const { token, user } = res.data;

    // Save the authentication token securely
    await SecureStore.setItemAsync("userToken", token);
    
    // Save user details for display purposes
    await AsyncStorage.setItem("user", JSON.stringify(user));

    Toast.show({
      type: "success",
      text1: "Login Successful",
      text2: `Welcome back, ${user.name}`,
    });

    router.replace("/(tabs)/Home");

  } catch (err) {
    const error = err as AxiosError<ErrorResponse>;
   
    // --- THIS IS THE KEY CHANGE ---
    // Check if error.response exists. If it doesn't, it's a network error.
    if (!error.response) {
      // Handle Network Error (No Internet)
      Toast.show({
        type: "error",
        text1: "Network Error",
        text2: "Please check your internet connection and try again.",
      });
    } else {
      // Handle Server Error (e.g., invalid credentials)
      Toast.show({
        type: "error",
        text1: "Login Failed",
        text2:  "Invalid credentials or no network. Please try again.",
      });
    }

  } finally {
    setIsFormLoading(false);
  }
};

// ... the rest of your file (handlePress, renderForm, etc.) remains the same ...
// You will just need to update the JSX to use `isFormLoading` and `isGoogleLoading`.

 

   // This function correctly decides which form handler to call.
  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (activeTab === "signup") {
      handleSignup();
    } else {
      handleLogin();
    }
  };

  // The renderForm function is now updated to use the new loading states.
  const renderForm = () => (
    <View style={styles.formContainer}>
      {activeTab === "signup" && (
        <Input
          placeholder="Full Name"
          icon="user"
          value={formData.name}
          onChangeText={(text) => setFormData({ ...formData, name: text })}
          // --- FIXED ---
          // Only disable form fields when the form itself is loading.
          editable={!isFormLoading}
        />
      )}
      <Input
        placeholder="Email Address"
        icon="mail"
        value={formData.email}
        onChangeText={(text) => setFormData({ ...formData, email: text })}
        // --- FIXED ---
        editable={!isFormLoading}
      />
      <Input
        placeholder="Password"
        icon="lock"
        secureTextEntry={!showPassword}
        showPasswordToggle
        showPassword={showPassword}
        onToggleVisibility={togglePasswordVisibility}
        value={formData.password}
        onChangeText={(text) => setFormData({ ...formData, password: text })}
        // --- FIXED ---
        editable={!isFormLoading}
      />
      {activeTab === "signup" && (
        <Input
          placeholder="Confirm Password"
          icon="lock"
          secureTextEntry={!showPassword}
          showPasswordToggle
          showPassword={showPassword}
          onToggleVisibility={togglePasswordVisibility}
          value={formData.confirmPassword}
          onChangeText={(text) =>
            setFormData({ ...formData, confirmPassword: text })
          }
          // --- FIXED ---
          editable={!isFormLoading}
        />
      )}

      {/* --- FIXED --- Submit button now uses `isFormLoading` */}
      <TouchableOpacity
        style={[styles.submitButton, isFormLoading && { opacity: 0.6 }]}
        onPress={handlePress}
        disabled={isFormLoading || isGoogleLoading}
      >
        {isFormLoading ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <>
            <Text style={styles.submitButtonText}>
              {activeTab === "signup" ? "Create Account" : "Sign In"}
            </Text>
            <Feather name="arrow-right" size={20} color="white" />
          </>
        )}
      </TouchableOpacity>

      <View style={styles.socialContainer}>
        <Text style={styles.socialText}>Or continue with</Text>
        <View style={styles.socialButtons}>
          {/* --- FIXED --- Google button now uses `isGoogleLoading` */}
          <TouchableOpacity
            onPress={handleGoogleSignIn}
            style={styles.socialButton}
            disabled={isFormLoading || isGoogleLoading}
          >
            {isGoogleLoading ? (
              <ActivityIndicator size="small" color="#0ea5e9" />
            ) : (
              <Image
                source={require("../assets/images/google.png")}
                style={{ width: "100%", height: "100%" }}
                resizeMode="contain"
              />
            )}
          </TouchableOpacity>
        </View>
        {activeTab === "login" && (
          <TouchableOpacity
            style={styles.laaButton}
            onPress={() => router.push("/Admin/AdminAuth")}
            // Disable this button during any loading operation
            disabled={isFormLoading || isGoogleLoading}
          >
            <Text style={styles.laaText}>LAA</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.container}>
          <View style={styles.header}>
            <Image
              source={require("../assets/images/mpi-logo.jpeg")}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>

          <View style={styles.tabContainer}>
            {["signup", "login"].map((tab) => (
              <TouchableOpacity
                key={tab}
                style={styles.tab}
                onPress={() => handleTabChange(tab as "signup" | "login")}
                // --- FIXED ---
                // Disable tabs if any action is in progress
                disabled={isFormLoading || isGoogleLoading}
              >
                <Text
                  style={[
                    styles.tabText,
                    activeTab === tab && styles.activeTabText,
                  ]}
                >
                  {tab === "signup" ? "Sign Up" : "Login"}
                </Text>
                {activeTab === tab && <View style={styles.activeIndicator} />}
              </TouchableOpacity>
            ))}
          </View>

          {renderForm()}

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              {activeTab === "signup"
                ? "Already have an account? "
                : "Don't have an account? "}
              <Text
                style={styles.footerLink}
                onPress={() =>
                  // --- FIXED ---
                  // Prevent switching tabs if any action is in progress
                  !(isFormLoading || isGoogleLoading) &&
                  handleTabChange(activeTab === "signup" ? "login" : "signup")
                }
              >
                {activeTab === "signup" ? "Login" : "Sign Up"}
              </Text>
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

// This custom Input component does not need any changes. It is correct.
type FeatherIconName = keyof typeof Feather.glyphMap;

type InputProps = {
  placeholder: string;
  icon: FeatherIconName;
  secureTextEntry?: boolean;
  showPasswordToggle?: boolean;
  onToggleVisibility?: () => void;
  showPassword?: boolean;
  value: string;
  onChangeText: (text: string) => void;
  editable?: boolean;
};

const Input: React.FC<InputProps> = ({
  placeholder,
  icon,
  secureTextEntry,
  showPasswordToggle,
  onToggleVisibility,
  showPassword,
  value,
  onChangeText,
  editable = true,
}) => (
  <View style={styles.inputContainer}>
    <Feather name={icon} size={20} color="#0ea5e9" style={styles.inputIcon} />
    <TextInput
      style={styles.input}
      placeholder={placeholder}
      placeholderTextColor="#94a3b8"
      secureTextEntry={secureTextEntry}
      value={value}
      onChangeText={onChangeText}
      editable={editable}
    />
    {showPasswordToggle && (
      <TouchableOpacity onPress={onToggleVisibility} style={styles.eyeIcon}>
        <Feather
          name={showPassword ? "eye-off" : "eye"}
          size={20}
          color="#0ea5e9"
        />
      </TouchableOpacity>
    )}
  </View>
);

export default SignScreen;