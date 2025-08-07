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
import { useUser, useAuth } from "@clerk/clerk-expo";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Toast } from "react-native-toast-message/lib/src/Toast";

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
    name: "Victor Were",
    text: "The workshops and mentorship at MPI are top-notch!",
    image: require("../../assets/images/victor-were.jpeg"),
  },
  {
    id: "3",
    name: "Kenneth Obul (App developer)",
    text: "I love how MPI empowers youth through technology and innovation. Very happy to be part of this team.",
    image: require("../../assets/images/ken-obul.jpeg"),
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
    name: "Thriving Mind Initiative",
    description: "Empowering youth through mental health awareness.",
    image: require("../../assets/images/thriving-mind-initiative.jpeg"),
  },
  {
    id: "2",
    name: "Community Health Promoters",
    description: "Promoting health awareness and services in Mathare.",
    image: require("../../assets/images/community-health-promoters.jpeg"),
  },
  {
    id: "3",
    name: "Government of Kenya",
    description: "Supporting initiatives for national development.",
    image: require("../../assets/images/gok.jpg"),
  },
  {
    id: "4",
    name: "NACADA",
    description:
      "National Authority for the Campaign Against Alcohol and Drug Abuse.",
    image: require("../../assets/images/nacada.png"),
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
  const { user } = useUser();
  const { signOut } = useAuth();
  const [modalVisible, setModalVisible] = useState(false);
  const [localUser, setLocalUser] = useState<LocalUser | null>(null);
  const router = useRouter();
  const partnersFlatListRef = useRef<FlatList<Partner> | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isAutoplay, setIsAutoplay] = useState(true);

  // For loading indicator

  // Effect to load user data from local storage
  useEffect(() => {
    const loadLocalUser = async () => {
      try {
        const userDataString = await AsyncStorage.getItem("user");
        if (userDataString) {
          setLocalUser(JSON.parse(userDataString));
        }
      } catch (err) {
       Toast.show({ type: 'error', text1: 'Error Loading User Data', text2: 'Could not retrieve user data from storage.' });
      }
    };
    loadLocalUser();
  }, []);

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

  return (
    <ScrollView
      className="flex-1 bg-white"
      contentContainerStyle={{ paddingBottom: 140 }}
    >
      {/* User Avatar Top-Right */}
      <View className="absolute top-6 right-5 p-3 z-10">
        <TouchableOpacity onPress={() => setModalVisible(true)}>
          {user?.imageUrl ? (
            <Image
              source={{ uri: user.imageUrl }}
              style={{ width: 40, height: 40, borderRadius: 20 }}
            />
          ) : localUser ? (
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: "#0ea5e9",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Text
                style={{ color: "white", fontWeight: "bold", fontSize: 18 }}
              >
                {localUser.name?.charAt(0).toUpperCase() || "U"}
              </Text>
            </View>
          ) : (
            // Fallback in case there is no user data at all
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: "#cbd5e1",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Feather name="user" size={20} color="#64748b" />
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Greeting and Daily Verse */}
      <View style={{ paddingHorizontal: 20, paddingTop: 60 }}>
        <ImageBackground
          source={require("../../assets/images/my-home-bg.png")}
          resizeMode="cover"
          style={{ borderRadius: 20, overflow: "hidden" }}
        >
          <View style={{ padding: 20 }}>
            <Image
              source={require("../../assets/images/mpi-logo.jpeg")}
              className="w-40 h-24 mx-auto mb-4"
              resizeMode="contain"
            />
            <Text className="text-2xl font-semibold text-white text-center mb-3">
              {getGreeting()},{" "}
              {user?.firstName ||
                localUser?.name?.split(" ")[0] ||
                "Peace Builder"}{" "}
              👋
            </Text>
            <View className="bg-white/80 rounded-xl p-4 mb-2">
              <Text className="text-sky-600 font-bold text-base mb-2">
                🌿 Verse of the Day
              </Text>
              <Text className="text-slate-700 text-sm leading-relaxed">
                “Blessed are the peacemakers, for they will be called children
                of God.” – Matthew 5:9
              </Text>
            </View>
          </View>
        </ImageBackground>
      </View>

      {/* MPI Introduction Section */}
      <View style={{ paddingHorizontal: 20, paddingTop: 30 }}>
        <ImageBackground
          source={require("../../assets/images/home-bg-3.png")}
          resizeMode="cover"
          style={{ borderRadius: 20, overflow: "hidden" }}
        >
          <View style={{ padding: 20 }}>
            <View className="bg-white/80 rounded-xl p-4">
              <Text className="text-sky-600 font-bold text-base mb-2">
                🕊️ Who We Are
              </Text>
              <Text className="text-slate-800 text-sm leading-relaxed">
                Mathare Peace Initiative – Kenya (MPI) is a youth-led
                organization based in Nairobi’s Mathare informal settlement. We
                are committed to promoting peace, social justice, and youth
                empowerment through education, arts, sports, and civic
                engagement.
              </Text>
              <Text className="text-slate-800 text-sm leading-relaxed mt-2">
                At MPI, we believe in building bridges, nurturing talents, and
                transforming communities—one peacebuilder at a time.
              </Text>
            </View>
          </View>
        </ImageBackground>
      </View>

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
          source={require('../../assets/images/cta-bg.png')} // Suggest creating a nice dark/gradient background image
          resizeMode="cover"
          style={styles.ctaBackground}
        >
          <Text style={styles.ctaTitle}>Become a Peacebuilder</Text>
          <Text style={styles.ctaSubtitle}>
            Your support helps us build a more just and peaceful community in Mathare and beyond.
          </Text>

          {/* --- Action Card 1: Donate --- */}
          <TouchableOpacity 
            style={styles.ctaCard} 
            onPress={() => router.push('/(tabs)/Donate')} // Assumes you have a Donate tab
          >
            <Feather name="heart" size={24} style={styles.ctaIcon} />
            <View style={styles.ctaTextContainer}>
              <Text style={styles.ctaCardTitle}>Donate</Text>
              <Text style={styles.ctaCardDescription}>Every contribution makes a difference.</Text>
            </View>
            <Feather name="chevron-right" size={24} style={styles.ctaArrow} />
          </TouchableOpacity>

          {/* --- Action Card 2: Volunteer --- */}
          <TouchableOpacity 
            style={styles.ctaCard} 
            onPress={() => router.push('/(tabs)/Volunteer')} // Assumes you have a Volunteer tab
          >
            <Feather name="users" size={24} style={styles.ctaIcon} />
            <View style={styles.ctaTextContainer}>
              <Text style={styles.ctaCardTitle}>Volunteer</Text>
              <Text style={styles.ctaCardDescription}>Join our team and share your skills.</Text>
            </View>
            <Feather name="chevron-right" size={24} style={styles.ctaArrow} />
          </TouchableOpacity>

          {/* --- Action Card 3: Contact Us --- */}
          <TouchableOpacity 
            style={styles.ctaCard} 
            onPress={() => router.push('/(tabs)/Contact')} // Assumes you have a Contact tab
          >
            <Feather name="mail" size={24} style={styles.ctaIcon} />
            <View style={styles.ctaTextContainer}>
              <Text style={styles.ctaCardTitle}>Contact Us</Text>
              <Text style={styles.ctaCardDescription}>Have questions? We’d love to talk.</Text>
            </View>
            <Feather name="chevron-right" size={24} style={styles.ctaArrow} />
          </TouchableOpacity>

        </ImageBackground>
      </View>
      {/***********************************************}
      {/*               END OF NEW SECTION            */}
      {/***********************************************}



      {/* MODAL FOR USER PROFILE AND LOGOUT */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.4)",
            justifyContent: "center",
            alignItems: "center",
          }}
          onPress={() => setModalVisible(false)} // This allows closing the modal by tapping the background
        >
          <Pressable
            style={{
              backgroundColor: "white",
              padding: 20,
              borderRadius: 20,
              alignItems: "center",
              width: 280,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.25,
              shadowRadius: 4,
              elevation: 5,
            }}
            onPress={() => {}} // This prevents the modal from closing when tapping inside it
          >
            {/* User Avatar in Modal */}
            {user?.imageUrl ? (
              <Image
                source={{ uri: user.imageUrl }}
                style={{
                  width: 70,
                  height: 70,
                  borderRadius: 35,
                  marginBottom: 10,
                  borderWidth: 2,
                  borderColor: "#0ea5e9",
                }}
              />
            ) : (
              <View
                style={{
                  width: 70,
                  height: 70,
                  borderRadius: 35,
                  backgroundColor: "#0ea5e9",
                  justifyContent: "center",
                  alignItems: "center",
                  marginBottom: 10,
                }}
              >
                <Text
                  style={{ color: "white", fontSize: 28, fontWeight: "bold" }}
                >
                  {localUser?.name?.charAt(0).toUpperCase() || "U"}
                </Text>
              </View>
            )}

            {/* User Name in Modal */}
            <Text className="text-lg font-semibold text-slate-800 mb-6 text-center">
              Signed in as {user?.fullName || localUser?.name || "User"}
            </Text>

            {/* Logout Button */}
            <TouchableOpacity
              onPress={async () => {
                setModalVisible(false); // Close the modal first
                await AsyncStorage.clear(); // Clear local user and token
                if (user) {
                  await signOut(); // Clerk logout if signed in with Clerk
                }
                // After all cleanup, navigate the user back to the sign-in screen
                router.replace("/SignScreen");
              }}
              className="flex-row items-center bg-sky-600 px-6 py-3 rounded-xl"
            >
              <Feather name="log-out" size={20} color="white" />
              <Text className="text-white ml-2 font-semibold text-base">
                Logout
              </Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  partnersContainer: {
    marginTop: 40,
    paddingBottom: 40,
  },
  partnersTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0369a1", // sky-700
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  partnerCard: {
    width: 280,
    backgroundColor: "#e0f2fe", // sky-100
    borderRadius: 20,
    padding: 16,
    marginRight: 16,
    shadowColor: "#0284c7", // sky-600
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
    color: "#0369a1", // sky-700
    textAlign: "center",
  },
  partnerDescription: {
    fontSize: 13,
    color: "#334155", // slate-700
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
    overflow: 'hidden', // This is crucial for the background image's border radius to work
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 10,
  },
  ctaBackground: {
    paddingVertical: 32,
    paddingHorizontal: 24,
    backgroundColor: '#1e3a8a', // A deep blue fallback color
  },
  ctaTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 8,
  },
  ctaSubtitle: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  ctaCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)', // A translucent white
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  ctaIcon: {
    color: '#93c5fd', // A light blue accent
    marginRight: 16,
  },
  ctaTextContainer: {
    flex: 1, // This makes the text take up the available space
  },
  ctaCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  ctaCardDescription: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 2,
  },
  ctaArrow: {
    color: 'rgba(255, 255, 255, 0.5)',
  },
});

export default HomeScreen;
