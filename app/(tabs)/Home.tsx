// HomeScreen.tsx (with subscription logic removed)

import React, { useState, useEffect, useRef } from "react";
import {
  ScrollView,
  Text,
  View,
  Image,
  ImageBackground,
  FlatList,
  Modal,
  Pressable,
  TouchableOpacity,
  StyleSheet,
} from "react-native";

import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Toast } from "react-native-toast-message/lib/src/Toast";
import { useAuth } from "../../context/AuthContext";

// --- For clarity and type safety ---
interface Review {
  id: string;
  name: string;
  text: string;
  image: any; // Or ImageSourcePropType from 'react-native'
}

interface Partner {
  id: string;
  name: string;
  description: string;
  image: any;
}

interface LocalUser {
  name: string;
  email?: string;
  imageUrl?: string;
}

const reviewsData: Review[] = [
  {
    id: "1",
    name: "Alphonce Were (Director)",
    text: "Being part of MPI has changed how I see peacebuilding in our community.",
    image: require("../../assets/images/alphonce.png"),
  },
  {
    id: "2",
    name: "Kenneth Obul (App developer)",
    text: "I love how MPI empowers youth through technology and innovation. Very happy to be part of this team.",
    image: require("../../assets/images/ken-obul.jpeg"),
  },
  {
    id: "3",
    name: "Victor Were",
    text: "The workshops and mentorship at MPI are top-notch!",
    image: require("../../assets/images/victor-were.jpeg"),
  },

  {
    id: "4",
    name: "Rosaline Mrisha",
    text: "I’ve gained leadership skills and lifelong friendships here.",
    image: require("../../assets/images/Rosaline-Mrisha.png"),
  },
  {
    id: "5",
    name: "Catherine Marvelous",
    text: "MPI empowered me to believe in community-driven peacebuilding.",
    image: require("../../assets/images/Catherine-Marvelous.png"),
  },
];

const partnersData: Partner[] = [
  {
    id: "1",
    name: "MATHARE Peace Initiative",
    description: "Empowering youth through mental health awareness.",
    image: require("../../assets/images/mpi-logo.jpeg"),
  },
  {
    id: "2",
    name: "Unified Methodist Community on Relief",
    description: "Providing disaster relief and community development support.",
    image: require("../../assets/images/umcor-logo.png"),
  },
  {
    id: "3",
    name: "Thriving Mind Initiative",
    description: "Promoting mental health and emotional well-being for all.",
    image: require("../../assets/images/thriving-mind-initiative.jpeg"),
  },
  {
    id: "4",
    name: "Government of Kenya",
    description: "Supporting initiatives for national development.",
    image: require("../../assets/images/gok.jpg"),
  },
  {
    id: "5",
    name: "NACADA",
    description:
      "National Authority for the Campaign Against Alcohol and Drug Abuse.",
    image: require("../../assets/images/nacada.png"),
  },
  {
    id: "6",
    name: "NCIC Commission",
    description: "Fostering national cohesion and integration across Kenya.",
    image: require("../../assets/images/ncic-logo.png"),
  },
  {
    id: "7",
    name: "Kutoka Network",
    description:
      "Empowering communities through advocacy and grassroots programs.",
    image: require("../../assets/images/kutoka-network.jpeg"),
  },
  {
    id: "8",
    name: "Mathare Vocational Training Center",
    description: "Providing vocational skills training for youth in Mathare.",
    image: require("../../assets/images/mvtc-logo.jpeg"),
  },
  {
    id: "9",
    name: "Young TIT Crew",
    description:
      "A vibrant dancing crew from Mathare showcasing talent and creativity.",
    image: require("../../assets/images/youngtit-crew.jpeg"),
  },
  {
    id: "10",
    name: "Family Health Options Kenya",
    description:
      "Offering reproductive health services and youth empowerment programs.",
    image: require("../../assets/images/family-health-options-kenya.jpeg"),
  },
  {
    id: "11",
    name: "OA-youth",
    description:
      "Youth-led initiatives for social change and community development.",
    image: require("../../assets/images/Oayouth.jpeg"),
  },
  {
    id: "12",
    name: "Nairobi City Council",
    description:
      "To provide affordable, accessible and sustainable quality services, enhancing community participation and creating a secure climate for political, social and economic development.",
    image: require("../../assets/images/ncc.png"),
  },
];

const getGreeting = (): string => {
  const hour = new Date().getHours();

  if (hour < 12) {
    return "Good morning";
  } else if (hour < 17) {
    return "Good afternoon";
  } else {
    return "Good evening";
  }
};

const HomeScreen = () => {
  const { user, signOut } = useAuth();
  const [modalVisible, setModalVisible] = useState(false);

  const router = useRouter();
  const partnersFlatListRef = useRef<FlatList<Partner> | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isAutoplay, setIsAutoplay] = useState(true);

  // For loading indicator

  // Effect for the autoplaying partners carousel
  useEffect(() => {
    if (isAutoplay) {
      const intervalId = setInterval(() => {
        setActiveIndex((prevIndex) => {
          const nextIndex = (prevIndex + 1) % partnersData.length;
          partnersFlatListRef.current?.scrollToIndex({
            index: nextIndex,
            animated: true,
          });
          return nextIndex;
        });
      }, 3000);
      return () => clearInterval(intervalId);
    }
  }, [isAutoplay]);

  // A clean, dedicated function to handle logging out.
  const handleLogout = async () => {
    setModalVisible(false); // Close the modal first
    await signOut(); // Call the signOut function from our context
    // The redirect to the SignScreen is handled automatically by _layout.tsx
    // After the user is signed out, tell the router exactly where to go.
    // We use `replace` to prevent the user from pressing the "back" button
    // and getting back into the protected part of the app.
    router.replace("/WelcomeScreen"); // Go back to the welcome screen
  };
  // ----

  return (
    <ScrollView
      className="flex-1 bg-white"
      contentContainerStyle={{ paddingBottom: 140 }}
    >
      {/* --- CORRECTED HEADER SECTION --- */}
      <View style={styles.headerContainer}>
        <View style={styles.greetingContainer}>
          <Text style={styles.greetingText}>{getGreeting()},</Text>
          <Text style={styles.userNameText}>
            {user?.name?.split(" ")[0] || "Peace Builder"} 👋
          </Text>
        </View>
        <TouchableOpacity onPress={() => setModalVisible(true)}>
          {user ? (
            user.photo ? (
              <Image source={{ uri: user.photo }} style={styles.headerAvatar} />
            ) : (
              <View style={[styles.headerAvatar, styles.headerAvatarInitials]}>
                <Text style={styles.headerAvatarInitialsText}>
                  {user.name?.charAt(0).toUpperCase() || "A"}
                </Text>
              </View>
            )
          ) : (
            <View style={[styles.headerAvatar, styles.headerAvatarGuest]}>
              <Feather name="user" size={24} color="#64748b" />
            </View>
          )}
        </TouchableOpacity>
      </View>
      {/* --- END OF HEADER SECTION --- */}

      {/* Daily Verse Section - Greeting Text is now removed from here */}
      <View style={{ paddingHorizontal: 20, paddingTop: 10 }}>
        <ImageBackground
          source={require("../../assets/images/my-home-bg.png")}
          resizeMode="cover"
          style={{ borderRadius: 20, overflow: "hidden" }}
        >
          <View style={{ padding: 20 }}>
            <Image
              source={require("../../assets/images/mpi-logo.jpeg")}
              style={{
                width: 160,
                height: 96,
                alignSelf: "center",
                marginBottom: 16,
              }}
              resizeMode="contain"
            />
            {/* The Greeting Text was here, but has been moved to the header */}
            <View
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.8)",
                borderRadius: 12,
                padding: 16,
                marginBottom: 8,
              }}
            >
              <Text
                style={{
                  color: "#0369A1",
                  fontWeight: "bold",
                  fontSize: 16,
                  marginBottom: 8,
                }}
              >
                🌿 Theme of the verse
              </Text>
              <Text style={{ color: "#334155", fontSize: 14, lineHeight: 22 }}>
                “Blessed are the peacemakers, for they will be called children
                of God.” – Matthew 5:9
              </Text>
            </View>
          </View>
        </ImageBackground>
      </View>

      {/* The rest of your content remains the same... */}
      {/* Vision & Mission Section */}
      <View style={{ paddingHorizontal: 20, paddingTop: 30 }}>
        <ImageBackground
          source={require("../../assets/images/home-bg-2.png")}
          resizeMode="cover"
          style={{ borderRadius: 20, overflow: "hidden" }}
        >
          <View className="w-full px-6 py-10">
            <View className="bg-white/80 rounded-2xl p-6">
              <Text className="text-lg font-semibold text-sky-700 mb-3">
                📌 Our Vision
              </Text>
              <Text className="text-slate-700 text-sm mb-5 leading-relaxed">
                To have a fair, just, peaceful human right community for all.
              </Text>

              <Text className="text-lg font-semibold text-sky-700 mb-3">
                🎯 Our Mission
              </Text>
              <Text className="text-slate-700 text-sm leading-relaxed">
                MPI Kenya is dedicated to build lasting peace by reinforcing the
                capacities of societies to overcome deep divisions and to
                address conflict in non-violent ways. We are rooted in local
                realities, drawing strength from alliance of national teams with
                a long-term commitment to building peace in their own societies.
              </Text>
            </View>
          </View>
        </ImageBackground>
      </View>

      {/* Services Section */}
      <View className="mt-8 px-6">
        <View className="bg-sky-100 rounded-3xl p-6 shadow-sm">
          <Text className="text-xl font-bold text-sky-800 mb-4">
            🕊️ Peacebuilding Services
          </Text>

          <Text className="text-slate-700 mb-2">
            At Mathare Peace Initiative, we are deeply committed to nurturing a
            peaceful, just, and inclusive society. Our peacebuilding services
            include:
          </Text>

          <View className="mb-5 pl-2">
            <Text className="text-sky-700">
              • Community Dialogues & Mediation
            </Text>
            <Text className="text-sky-700">• Conflict Resolution Training</Text>
            <Text className="text-sky-700">
              • Youth Mentorship & Empowerment
            </Text>
            <Text className="text-sky-700">
              • Civic Education & Human Rights Advocacy
            </Text>
            <Text className="text-sky-700">
              • Peace Campaigns and Community Events
            </Text>
          </View>

          <Text className="text-xl font-bold text-sky-800 mb-4">
            💼 Professional & Monetized Services
          </Text>

          <Text className="text-slate-700 mb-2">
            We also provide income-generating services that equip youth with
            practical skills and contribute to sustaining our operations:
          </Text>

          <View className="pl-2">
            <Text className="text-sky-700">
              • Computer Packages Training (Beginner to Advanced)
            </Text>
            <Text className="text-sky-700">
              • Professional Video & Photo Editing
            </Text>
            <Text className="text-sky-700">
              • Branding & Printing (Clothes, Hoodies, Posters)
            </Text>
            <Text className="text-sky-700">
              • Sale of Branded Clothing & Merchandise
            </Text>
            <Text className="text-sky-700">
              • Professional Web & Mobile App Development (Frontend & Backend)
            </Text>
          </View>
        </View>
      </View>

      {/* Member Reviews Section */}
      <View className="mt-10 px-0 mb-5">
        <Text className="text-lg font-semibold text-slate-800 mb-4 px-6">
          💬 What Members Say
        </Text>
        <FlatList
          horizontal
          data={reviewsData}
          keyExtractor={(item) => item.id}
          showsHorizontalScrollIndicator={false}
          snapToInterval={280 + 16} // card width + margin
          decelerationRate="fast"
          contentContainerStyle={{ paddingLeft: 20, paddingRight: 10 }}
          renderItem={({ item }) => (
            <View
              style={{
                width: 280,
                marginRight: 16,
                backgroundColor: "#F0F9FF", // soft blue background
                borderRadius: 20,
                padding: 16,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 3 },
                shadowOpacity: 0.1,
                shadowRadius: 6,
                elevation: 4,
              }}
            >
              {/* Avatar & Name */}
              <View className="flex-row items-center mb-3 flex-wrap">
                <Image
                  source={item.image}
                  style={{
                    width: 50,
                    height: 50,
                    borderRadius: 25,
                    borderWidth: 2,
                    borderColor: "#38bdf8", // sky-400
                    marginRight: 12,
                    backgroundColor: "#ffffff",
                  }}
                />
                <Text className="text-sky-800 font-semibold text-base flex-1">
                  {item.name}
                </Text>
              </View>

              {/* Review Text */}
              <Text
                style={{
                  color: "#334155", // slate-700
                  fontSize: 14,
                  lineHeight: 20,
                  fontStyle: "italic",
                }}
              >
                “{item.text}”
              </Text>
            </View>
          )}
        />
      </View>

      {/* Partners Swipeable Section */}
      <View style={styles.partnersContainer}>
        <Text style={styles.partnersTitle}>
          🤝 Some of our Esteemed Partners
        </Text>

        <FlatList
          ref={partnersFlatListRef}
          horizontal
          data={partnersData}
          keyExtractor={(item) => item.id}
          showsHorizontalScrollIndicator={false}
          snapToInterval={280 + 16} // Card width + margin
          decelerationRate="fast"
          contentContainerStyle={{ paddingHorizontal: 20 }}
          onScrollBeginDrag={() => setIsAutoplay(false)}
          onMomentumScrollEnd={(event) => {
            const index = Math.round(
              event.nativeEvent.contentOffset.x / (280 + 16)
            );
            setActiveIndex(index);
          }}
          renderItem={({ item }) => (
            <View style={styles.partnerCard}>
              <Image source={item.image} style={styles.partnerImage} />
              <Text style={styles.partnerName}>{item.name}</Text>
              <Text style={styles.partnerDescription}>{item.description}</Text>
            </View>
          )}
        />
        {/* Pagination Dots */}
        <View style={styles.paginationContainer}>
          {partnersData.map((_, index) => (
            <View
              key={index}
              style={[
                styles.paginationDot,
                {
                  backgroundColor:
                    index === activeIndex ? "#0369a1" : "#cbd5e1",
                },
              ]}
            />
          ))}
        </View>
      </View>

      <View style={styles.ctaContainer}>
        <ImageBackground
          source={require("../../assets/images/cta-bg.png")} // Suggest creating a nice dark/gradient background image
          resizeMode="cover"
          style={styles.ctaBackground}
        >
          <Text style={styles.ctaTitle}>Become a Peacebuilder</Text>
          <Text style={styles.ctaSubtitle}>
            Your support helps us build a more just and peaceful community in
            Mathare and beyond.
          </Text>

          {/* --- Action Card 1: Donate --- */}
          <TouchableOpacity
            style={styles.ctaCard}
            onPress={() => router.push("/(tabs)/Donate")} // Assumes you have a Donate tab
          >
            <Feather name="heart" size={24} style={styles.ctaIcon} />
            <View style={styles.ctaTextContainer}>
              <Text style={styles.ctaCardTitle}>Donate</Text>
              <Text style={styles.ctaCardDescription}>
                Every contribution makes a difference.
              </Text>
            </View>
            <Feather name="chevron-right" size={24} style={styles.ctaArrow} />
          </TouchableOpacity>

          {/* --- Action Card 2: Volunteer --- */}
          <TouchableOpacity
            style={styles.ctaCard}
            onPress={() => router.push("/(tabs)/Volunteer")} // Assumes you have a Volunteer tab
          >
            <Feather name="users" size={24} style={styles.ctaIcon} />
            <View style={styles.ctaTextContainer}>
              <Text style={styles.ctaCardTitle}>Volunteer</Text>
              <Text style={styles.ctaCardDescription}>
                Join our team and share your skills.
              </Text>
            </View>
            <Feather name="chevron-right" size={24} style={styles.ctaArrow} />
          </TouchableOpacity>

          {/* --- Action Card 3: Contact Us --- */}
          <TouchableOpacity
            style={styles.ctaCard}
            onPress={() => router.push("/(tabs)/Contact")} // Assumes you have a Contact tab
          >
            <Feather name="mail" size={24} style={styles.ctaIcon} />
            <View style={styles.ctaTextContainer}>
              <Text style={styles.ctaCardTitle}>Contact Us</Text>
              <Text style={styles.ctaCardDescription}>
                Have questions? We’d love to talk.
              </Text>
            </View>
            <Feather name="chevron-right" size={24} style={styles.ctaArrow} />
          </TouchableOpacity>
        </ImageBackground>
      </View>
      {/***********************************************}
      {/*               END OF NEW SECTION            */}
      {/***********************************************/}

      {/* MODAL FOR USER PROFILE AND ACTIONS */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable
          style={styles.modalBackdrop}
          onPress={() => setModalVisible(false)}
        >
          <Pressable style={styles.modalContent} onPress={() => {}}>
            {user ? (
              <>
                {user.photo ? (
                  <Image
                    source={{ uri: user.photo }}
                    style={styles.modalAvatar}
                  />
                ) : (
                  <View style={styles.modalAvatarInitialsContainer}>
                    <Text style={styles.modalAvatarInitialsText}>
                      {user.name?.charAt(0).toUpperCase() || "A"}
                    </Text>
                  </View>
                )}
                <Text style={styles.modalUserName}>{user.name}</Text>
                <Text style={styles.modalUserEmail}>{user.email}</Text>
              </>
            ) : (
              <Text style={styles.modalUserName}>Welcome, Guest!</Text>
            )}

            {user && (
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => {
                  setModalVisible(false);
                  router.push("./../Profile");
                }}
              >
                <Feather name="edit-3" size={20} color="#334155" />
                <Text style={styles.modalButtonText}>
                  Edit Profile Picture{" "}
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[
                styles.modalButton,
                user ? styles.logoutButton : styles.loginButton,
              ]}
              onPress={handleLogout}
            >
              <Feather
                name={user ? "log-out" : "log-in"}
                size={20}
                color="white"
              />
              <Text style={styles.modalButtonTextWhite}>
                {user ? "Logout" : "Login"}
              </Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  // --- NEW HEADER STYLES ---
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between", // Puts space between items
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 50, // Safe area for iOS status bar
    paddingBottom: 10,
    backgroundColor: "#FFFFFF",
  },
  greetingContainer: {
    // This container holds the text
  },
  greetingText: {
    fontSize: 16,
    color: "#6B7280",
  },
  userNameText: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#1F2937",
  },
  headerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  headerAvatarInitials: {
    backgroundColor: "#0ea5e9",
    justifyContent: "center",
    alignItems: "center",
  },
  headerAvatarInitialsText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 20,
  },
  headerAvatarGuest: {
    backgroundColor: "#e2e8f0", // Lighter gray
    justifyContent: "center",
    alignItems: "center",
  },
  // --- END OF NEW HEADER STYLES ---

  partnersContainer: {
    marginTop: 40,
    paddingBottom: 40,
  },
  partnersTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0369a1",
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  partnerCard: {
    width: 280,
    backgroundColor: "#e0f2fe",
    borderRadius: 20,
    padding: 16,
    marginRight: 16,
    shadowColor: "#0284c7",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  partnerImage: {
    width: 140,
    height: 140,
    resizeMode: "contain",
    borderRadius: 12,
    marginBottom: 12,
    backgroundColor: "#ffffff",
  },
  partnerName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0369a1",
    textAlign: "center",
  },
  partnerDescription: {
    fontSize: 13,
    color: "#334155",
    textAlign: "center",
    marginTop: 4,
  },
  paginationContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  ctaContainer: {
    marginTop: 20,
    marginHorizontal: 20,
    borderRadius: 24,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 10,
  },
  ctaBackground: {
    paddingVertical: 32,
    paddingHorizontal: 24,
    backgroundColor: "#1e3a8a",
  },
  ctaTitle: {
    fontSize: 26,
    fontWeight: "bold",
    color: "white",
    textAlign: "center",
    marginBottom: 8,
  },
  ctaSubtitle: {
    fontSize: 15,
    color: "rgba(255, 255, 255, 0.8)",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 22,
  },
  ctaCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  ctaIcon: {
    color: "#93c5fd",
    marginRight: 16,
  },
  ctaTextContainer: {
    flex: 1,
  },
  ctaCardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
  },
  ctaCardDescription: {
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.7)",
    marginTop: 2,
  },
  ctaArrow: {
    color: "rgba(255, 255, 255, 0.5)",
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "white",
    padding: 24,
    borderRadius: 20,
    alignItems: "center",
    width: "100%",
    maxWidth: 320,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: "#0ea5e9",
  },
  modalAvatarInitialsContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#0ea5e9",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  modalAvatarInitialsText: {
    color: "white",
    fontSize: 32,
    fontWeight: "bold",
  },
  modalUserName: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 4,
    textAlign: "center",
  },
  modalUserEmail: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 24,
    textAlign: "center",
  },
  modalButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    padding: 14,
    borderRadius: 12,
    marginBottom: 12,
    backgroundColor: "#F3F4F6",
  },
  modalButtonText: {
    marginLeft: 10,
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
  },
  logoutButton: {
    backgroundColor: "#DC2626",
  },
  loginButton: {
    backgroundColor: "#0ea5e9",
  },
  modalButtonTextWhite: {
    marginLeft: 10,
    fontSize: 16,
    fontWeight: "600",
    color: "white",
  },
});

export default HomeScreen;
