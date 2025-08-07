import { useEffect } from "react";
import { useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { ActivityIndicator, View } from "react-native";

// Clerk needs this to complete the session
WebBrowser.maybeCompleteAuthSession();

export default function SSOScreen() {
  const router = useRouter();

  useEffect(() => {
    // This screen is just a bridge, redirect to SignScreen after OAuth is handled
    router.replace("/SignScreen");
  }, []);

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "white",
      }}
    >
      <ActivityIndicator size="large" color="#0284C7" />
    </View>
  );
}
