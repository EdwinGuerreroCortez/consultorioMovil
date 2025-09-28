import React from "react";
import { View, ActivityIndicator } from "react-native";
import { Stack } from "expo-router";
import {
  useFonts,
  Poppins_400Regular,
  Poppins_600SemiBold,
  Poppins_700Bold,
} from "@expo-google-fonts/poppins";

export default function RootLayout() {
  // Cargar las fuentes
  const [fontsLoaded] = useFonts({
    PoppinsRegular: Poppins_400Regular,
    PoppinsSemiBold: Poppins_600SemiBold,
    PoppinsBold: Poppins_700Bold,
  });

  // Mientras cargan las fuentes muestra loader
  if (!fontsLoaded) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#0901F5",
        }}
      >
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  // Layout principal
  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* Flujo de autenticación */}
      <Stack.Screen name="(auth)" />

      {/* Tabs principales (después de login) */}
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}
