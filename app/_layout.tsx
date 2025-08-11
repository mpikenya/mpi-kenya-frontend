// File: app/_layout.tsx

import React, { useEffect ,useState} from "react";
import { Stack, useRouter, useRootNavigationState } from "expo-router";
import "./global.css";
import Toast from "react-native-toast-message";
import { View } from "react-native";
import { AuthProvider, useAuth } from "../context/AuthContext";

const InitialLayout = () => {
  const { user, isLoading } = useAuth();
  const router = useRouter();
   const [isInitialLayoutReady, setIsInitialLayoutReady] = useState(false);
  const navigationState = useRootNavigationState();

  useEffect(() => {
    // Wait until the navigator is ready and the auth state is no longer loading.
    if (!navigationState?.key || isLoading) {
      return;
    }

    // --- The Final, Flicker-Free Logic ---
      if (isInitialLayoutReady) {
      // If we've already done the initial redirect, do nothing more.
      return;
    }

    // --- The Final, Flicker-Free Logic (runs only ONCE) ---
    if (user) {
      // If a user is logged in, replace the loading screen with the main app.
      router.replace('/(tabs)/Home');
    } else {
      // If no user is logged in, replace the loading screen with the Welcome screen.
      router.replace('/WelcomeScreen');
    }

    // Mark the initial layout as ready so this logic doesn't run again.
    setIsInitialLayoutReady(true);
  }, [user, isLoading, navigationState?.key]); // Re-run when any of these change.

  // The layout simply defines all possible screens in the app.
  // The useEffect above controls which one is shown first.
  return (
    <View style={{ flex: 1 }}>
      <Stack screenOptions={{ headerShown: false }}>
        {/* Declare all your screens here so the router knows they exist */}
        <Stack.Screen name="index" /> 
        <Stack.Screen name="WelcomeScreen" /> 
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="SignScreen" options={{ presentation: "modal" }} />
        <Stack.Screen name="ForgotPasswordScreen" options={{ presentation: "modal", title: "Forgot Password" }} />
        <Stack.Screen name="EnterOTPScreen" options={{ presentation: "modal", title: "Verification" }} />
        <Stack.Screen name="ResetPasswordScreen" options={{ presentation: "modal", title: "New Password" }} />
        <Stack.Screen
          name="Profile"
          options={{
            headerShown: true,
            title: "Edit Profile",
            presentation: "modal",
          }}
        />
      </Stack>
      <Toast />
    </View>
  );
};

export default function RootLayout() {
  return (
    <AuthProvider>
      <InitialLayout />
    </AuthProvider>
  );
}