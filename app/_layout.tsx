import { Stack } from "expo-router";
import { tokenCache } from "@clerk/clerk-expo/token-cache";
import { ClerkProvider, ClerkLoaded } from "@clerk/clerk-expo";
import "./global.css";
import Toast from "react-native-toast-message";
import { View } from "react-native";

if (!process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY) {
  throw new Error(
    "EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY is not defined in the environment variables."
  );
}

export default function Layout() {
  return (
    <ClerkProvider
      publishableKey={process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY}
      tokenCache={tokenCache}
    >
      <ClerkLoaded>
        <View style={{ flex: 1 }}>
          <Stack
            screenOptions={{
              headerShown: false,
              animation: "fade_from_bottom",
            }}
          >
            <Stack.Screen
              name="index"
              options={{
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="SignScreen"
              options={{
                headerShown: false,
              }}
            />
          </Stack>

          <Toast />
        </View>
      </ClerkLoaded>
    </ClerkProvider>
  );
}
