import React from "react";
import { View, ActivityIndicator } from "react-native";
import { Stack } from "expo-router";
import { Provider as PaperProvider } from "react-native-paper";
import {
  useFonts,
  Poppins_400Regular,
  Poppins_600SemiBold,
  Poppins_700Bold,
} from "@expo-google-fonts/poppins";
import { useAuth } from "@/hooks/useAuth"; // ⬅️ Importa tu hook personalizado

export default function RootLayout() {
  // Cargar las fuentes
  const [fontsLoaded] = useFonts({
    PoppinsRegular: Poppins_400Regular,
    PoppinsSemiBold: Poppins_600SemiBold,
    PoppinsBold: Poppins_700Bold,
  });

  // Estado de autenticación
  const { usuario, cargando } = useAuth();

  // Mientras cargan las fuentes o la autenticación
  if (!fontsLoaded || cargando) {
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

  return (
    <PaperProvider>
      <Stack screenOptions={{ headerShown: false }}>
        {usuario ? (
          // Si hay sesión, va a tabs
          <Stack.Screen name="(tabs)" />
        ) : (
          // Si no hay sesión, va a login/registro
          <Stack.Screen name="(auth)" />
        )}
      </Stack>
    </PaperProvider>
  );
}
