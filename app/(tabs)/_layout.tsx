import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import React, { useRef } from "react";
import { View, Text, Image, Vibration, Animated } from "react-native";
import { Audio } from "expo-av";

export default function TabLayout() {
  // Animaciones separadas para cada tab
  const scaleHome = useRef(new Animated.Value(1)).current;
  const scaleCitas = useRef(new Animated.Value(1)).current;
  const scalePagos = useRef(new Animated.Value(1)).current;
  const scaleMenu = useRef(new Animated.Value(1)).current;

  // 🔧 Función para vibrar + sonido + animar el icono correcto
  const handleFeedback = async (anim: Animated.Value) => {
    Vibration.vibrate(50);

    Animated.sequence([
      Animated.timing(anim, {
        toValue: 1.2,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(anim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    try {
      const { sound } = await Audio.Sound.createAsync(
        require("@/assets/sounds/click.mp3"),
        { shouldPlay: true }
      );
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          sound.unloadAsync();
        }
      });
    } catch (e) {
      console.log("Error sonido:", e);
    }
  };

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#fff",
        tabBarStyle: {
          backgroundColor: "#0901F5",
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          height: 60,
        },
        tabBarLabelStyle: { fontFamily: "PoppinsSemiBold", fontSize: 12 },
        header: () => (
          <View
            style={{
              backgroundColor: "#0901F5",
              paddingTop: 25,
              paddingBottom: 12,
              paddingHorizontal: 20,
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Text
              style={{
                color: "#fff",
                fontFamily: "PoppinsBold",
                fontSize: 18,
              }}
            >
              Consultorio Dental
            </Text>
            <Image
              source={require("@/assets/images/Logo.png")}
              style={{ width: 40, height: 40, borderRadius: 20 }}
              resizeMode="contain"
            />
          </View>
        ),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => (
            <Animated.View style={{ transform: [{ scale: scaleHome }] }}>
              <Ionicons name="home" size={size} color={color} />
            </Animated.View>
          ),
        }}
        listeners={{
          tabPress: () => handleFeedback(scaleHome),
        }}
      />

      <Tabs.Screen
        name="citas"
        options={{
          title: "Citas",
          tabBarIcon: ({ color, size }) => (
            <Animated.View style={{ transform: [{ scale: scaleCitas }] }}>
              <Ionicons name="calendar" size={size} color={color} />
            </Animated.View>
          ),
        }}
        listeners={{
          tabPress: () => handleFeedback(scaleCitas),
        }}
      />

      <Tabs.Screen
        name="pagos"
        options={{
          title: "Pagos",
          tabBarIcon: ({ color, size }) => (
            <Animated.View style={{ transform: [{ scale: scalePagos }] }}>
              <Ionicons name="cash" size={size} color={color} />
            </Animated.View>
          ),
        }}
        listeners={{
          tabPress: () => handleFeedback(scalePagos),
        }}
      />

      <Tabs.Screen
        name="menu"
        options={{
          title: "Más",
          tabBarIcon: ({ color, size }) => (
            <Animated.View style={{ transform: [{ scale: scaleMenu }] }}>
              <Ionicons name="menu" size={size} color={color} />
            </Animated.View>
          ),
        }}
        listeners={{
          tabPress: () => handleFeedback(scaleMenu),
        }}
      />
    </Tabs>
  );
}
