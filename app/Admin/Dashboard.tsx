import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  TextInput,
  Alert,
  ImageSourcePropType,
} from "react-native";
import * as SecureStore from "expo-secure-store";
import axios, { AxiosError } from "axios";
import config from "../../constants/config";
import defaultAvatar from "../../assets/images/admin-pic.png";
import { useRouter } from "expo-router";
import Toast from "react-native-toast-message"; // Import Toast for better UX

// --- TypeScript Type Definitions ---

interface AdminState {
  name: string;
  email: string;
  avatar: string | ImageSourcePropType;
}

interface DashboardResponse {
  name: string;
  email: string;
  avatar?: string;
}

// NEW: Define the shape of the stats object from our new API
interface DashboardStats {
  totalNews: number;
  totalImages: number;
  recentUploadsCount: number;
}

interface ErrorResponse {
  message: string;
}

const Dashboard = () => {
  // --- Typed State ---
  const [admin, setAdmin] = useState<AdminState>({
    name: "",
    email: "",
    avatar: defaultAvatar,
  });
  // NEW: State to hold the fetched dashboard statistics
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isMenuVisible, setMenuVisible] = useState<boolean>(false);
  const [isAddAdminVisible, setAddAdminVisible] = useState<boolean>(false);

  const router = useRouter();

  const [newAdminName, setNewAdminName] = useState<string>("");
  const [newAdminEmail, setNewAdminEmail] = useState<string>("");
  const [newAdminPassword, setNewAdminPassword] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

    useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = await SecureStore.getItemAsync("adminToken");
        if (!token) {
          router.replace("./AdminAuth");
          return;
        }

        // --- START OF DEBUGGING BLOCK ---
        console.log("Starting data fetch with token:", token);

        // --- 1. Test the /dashboard endpoint ---
        let adminRes;
        try {
          console.log("Fetching /api/admin/dashboard...");
          adminRes = await axios.get<DashboardResponse>(
            `${config.BASE_URL}/api/admin/dashboard`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          console.log("✅ SUCCESS: Fetched admin data:", adminRes.data);
        } catch (dashboardError: any) {
          console.error("❌ FAILED: Could not fetch /api/admin/dashboard");
          if (dashboardError.response) {
             console.error("Dashboard Error Status:", dashboardError.response.status);
             console.error("Dashboard Error Data:", JSON.stringify(dashboardError.response.data, null, 2));
          } else {
             console.error("Dashboard Error Message:", dashboardError.message);
          }
          throw dashboardError; // Re-throw to trigger the outer catch block
        }

        // --- 2. Test the /stats endpoint ---
        let statsRes;
        try {
          console.log("Fetching /api/admin/stats...");
          statsRes = await axios.get<DashboardStats>(`${config.BASE_URL}/api/admin/stats`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          console.log("✅ SUCCESS: Fetched stats data:", statsRes.data);
        } catch (statsError: any) {
          console.error("❌ FAILED: Could not fetch /api/admin/stats");
           if (statsError.response) {
             console.error("Stats Error Status:", statsError.response.status);
             console.error("Stats Error Data:", JSON.stringify(statsError.response.data, null, 2));
          } else {
             console.error("Stats Error Message:", statsError.message);
          }
          throw statsError; // Re-throw
        }
        // --- END OF DEBUGGING BLOCK ---


        // Set state only after both succeed
        setAdmin({
          name: adminRes.data.name,
          email: adminRes.data.email,
          avatar: adminRes.data.avatar || defaultAvatar,
        });
        setStats(statsRes.data);

      } catch (err) {
        // Your outer catch block will now catch the re-thrown error
        // and show the appropriate toast.
        const error = err as AxiosError<ErrorResponse>;

        // Your original logic here is fine
        Toast.show({
          type: "error",
          text1: "Error fetching dashboard data",
          text2: error.response?.data?.message || 'Please check your connection.'
        });
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
          await SecureStore.deleteItemAsync("adminToken");
          router.replace("./AdminAuth");
          Toast.show({
            type: "error",
            text1: "Session Expired",
            text2: "Please log in again.",
          });
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [router]);

  const handleLogout = async () => {
    await SecureStore.deleteItemAsync("adminToken");
    setMenuVisible(false);
    router.replace("./AdminAuth");
  };

  const handleAddAdmin = async () => {
    if (!newAdminName || !newAdminEmail || !newAdminPassword) {
      Toast.show({
        type: "error",
        text1: "Missing Fields",
        text2: "Please fill in all fields.",
      });
      return;
    }
    setIsSubmitting(true);
    try {
      const token = await SecureStore.getItemAsync("adminToken");
      await axios.post(
        `${config.BASE_URL}/api/admin/add-admin`,
        {
          name: newAdminName,
          email: newAdminEmail,
          password: newAdminPassword,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      Toast.show({
        type: "success",
        text1: "Success",
        text2: "New admin created successfully!",
      });
      setNewAdminName("");
      setNewAdminEmail("");
      setNewAdminPassword("");
      setAddAdminVisible(false);
    } catch (err) {
      const error = err as AxiosError<ErrorResponse>;
      // MODIFICATION: Add network error check
      if (!error.response) {
        Toast.show({
          type: "error",
          text1: "Network Error",
          text2: "Check your internet connection.",
        });
      } else {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: error.response.data.message || "Failed to add admin.",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#0ea5e9" />
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-white p-6 pt-10">
      <View className="m-6">
        <Text>
          Welcome Admin <Text className="font-bold">{admin.name}</Text>!
        </Text>
      </View>

       {/* Admin Header Section */}
      <View className="flex-row justify-between items-center bg-blue-900 rounded-2xl px-4 py-4 shadow-lg shadow-blue-900/20 mb-6">
        <View className="flex-row items-center flex-1">
          <TouchableOpacity onPress={() => setMenuVisible(true)}>
            <Image
              source={
                typeof admin.avatar === "string"
                  ? { uri: admin.avatar }
                  : admin.avatar
              }
              className="w-12 h-12 rounded-full border-2 border-sky-300"
            />
          </TouchableOpacity>
          <View className="ml-4 flex-1">
            <Text className="text-white font-bold text-lg" numberOfLines={1}>
              {admin.name}
            </Text>
            <Text className="text-xs text-sky-200" numberOfLines={1}>
              {admin.email}
            </Text>
          </View>
        </View>
      </View>

      {/* Action Cards */}
      <View className="mt-6 flex-col justify-center items-center space-y-4 mb-4 px-4">
        {/* MODIFICATION: Added the missing Text components */}
        <TouchableOpacity
          onPress={() => router.push("./AdminPosts")}
          className="w-full bg-sky-50 p-6 rounded-xl border mb-4 border-sky-100 shadow-sm"
        >
          <Text className="text-sky-600 font-semibold text-lg">
            + Post News
          </Text>
          <Text className="text-gray-500 text-sm mt-1">
            Publish latest updates
          </Text>
        </TouchableOpacity>

        {/* MODIFICATION: Added the missing Text components */}
        <TouchableOpacity
          onPress={() => router.push("./AdminPhotos")}
          className="w-full bg-gray-50 p-6 mb-4 rounded-xl border border-gray-200 shadow-sm"
        >
          <Text className="text-gray-800 font-semibold text-lg">
            📷 Upload Photos
          </Text>
          <Text className="text-gray-500 text-sm mt-1">
            Add event photos to the gallery
          </Text>
        </TouchableOpacity>
      </View>

      {/* MODIFICATION: This button now links to the Normal Users screen */}
      <TouchableOpacity
        onPress={() => router.push("./NormalUsersView")}
        className="w-full bg-gray-50 p-6 rounded-xl border mb-4 border-gray-200 shadow-sm"
      >
        <Text className="text-gray-800 font-semibold text-lg">
          👥 View All Users
        </Text>
        <Text className="text-gray-500 text-sm mt-1">
          Manage normal user accounts
        </Text>
      </TouchableOpacity>

      {/* MODIFICATION: This button now links to the Admin Personnel screen */}
      <TouchableOpacity
        onPress={() => router.push("./AdminPersonnel")}
        className="w-full bg-gray-50 p-6 rounded-xl border border-gray-200 shadow-sm"
      >
        <Text className="text-gray-800 font-semibold text-lg">
          🛡️ View Admin Personnel
        </Text>
        <Text className="text-gray-500 text-sm mt-1">
          Browse admin accounts
        </Text>
      </TouchableOpacity>

      {/* REAL STATS: Replace dummy stats with fetched data */}
      <View className="flex-row justify-around mt-8 bg-gray-50 p-4 rounded-xl border border-gray-200">
        <View className="items-center">
          {/* Show a loading indicator until stats are loaded */}
          <Text className="text-2xl font-bold text-sky-600">
            {stats ? stats.totalNews : "..."}
          </Text>
          <Text className="text-sm text-gray-500 mt-1">Total News</Text>
        </View>
        <View className="items-center">
          <Text className="text-2xl font-bold text-sky-600">
            {stats ? stats.totalImages : "..."}
          </Text>
          <Text className="text-sm text-gray-500 mt-1">Total Images</Text>
        </View>
        <View className="items-center">
          <Text className="text-2xl font-bold text-sky-600">
            {stats ? stats.recentUploadsCount : "..."}
          </Text>
          <Text className="text-sm text-gray-500 mt-1">Recent Uploads</Text>
        </View>
      </View>

      <Modal
        animationType="slide"
        transparent={true}
        visible={isMenuVisible}
        onRequestClose={() => setMenuVisible(false)}
      >
        <TouchableOpacity
          style={{ flex: 1 }}
          activeOpacity={1}
          onPressOut={() => setMenuVisible(false)}
        >
          <View className="flex-1 justify-end bg-black/40">
            <TouchableOpacity activeOpacity={1}>
              <View className="bg-white p-6 rounded-t-3xl shadow-2xl">
                <Text className="text-xl font-bold text-gray-800 mb-5 text-center">
                  Profile Actions
                </Text>
                <TouchableOpacity
                  className="bg-blue-100 p-4 rounded-xl mb-3"
                  onPress={() => {
                    setMenuVisible(false);
                    setAddAdminVisible(true);
                  }}
                >
                  <Text className="text-blue-600 font-semibold text-center text-base">
                    Add a New Admin
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className="bg-red-100 p-4 rounded-xl"
                  onPress={handleLogout}
                >
                  <Text className="text-red-600 font-semibold text-center text-base">
                    Logout
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className="mt-6 bg-gray-100 p-3 rounded-xl"
                  onPress={() => setMenuVisible(false)}
                >
                  <Text className="text-gray-600 text-center font-medium">
                    Cancel
                  </Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Add Admin Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={isAddAdminVisible}
        onRequestClose={() => setAddAdminVisible(false)}
      >
        <View className="flex-1 justify-center items-center bg-black/60 p-4">
          <View className="bg-white w-full p-6 rounded-2xl shadow-xl">
            <Text className="text-xl font-bold text-gray-800 mb-5">
              Add New Admin
            </Text>
            <TextInput
              className="bg-gray-100 p-3 rounded-lg mb-3 border border-gray-200"
              placeholder="Full Name"
              value={newAdminName}
              onChangeText={setNewAdminName}
            />
            <TextInput
              className="bg-gray-100 p-3 rounded-lg mb-3 border border-gray-200"
              placeholder="Email Address"
              value={newAdminEmail}
              onChangeText={setNewAdminEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <TextInput
              className="bg-gray-100 p-3 rounded-lg mb-5 border border-gray-200"
              placeholder="Password"
              value={newAdminPassword}
              onChangeText={setNewAdminPassword}
              secureTextEntry
            />
            <TouchableOpacity
              className={`bg-blue-500 p-4 rounded-xl ${isSubmitting ? "opacity-50" : ""}`}
              onPress={handleAddAdmin}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="text-white font-bold text-center text-base">
                  Create Admin
                </Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              className="mt-4"
              onPress={() => setAddAdminVisible(false)}
            >
              <Text className="text-gray-500 text-center">Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

export default Dashboard;
