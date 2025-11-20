// app/_layout.tsx
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
import { useAuth } from "@/hooks/useAuth";
import * as WebBrowser from "expo-web-browser";
WebBrowser.maybeCompleteAuthSession();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    PoppinsRegular: Poppins_400Regular,
    PoppinsSemiBold: Poppins_600SemiBold,
    PoppinsBold: Poppins_700Bold,
  });

  const { usuario, cargando } = useAuth();

  if (!fontsLoaded || cargando) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#0901F5" }}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  return (
    <PaperProvider>
      <Stack screenOptions={{ headerShown: false }}>
        {usuario ? (
          <>
            {/* navegación principal */}
            <Stack.Screen name="(tabs)" />
            {/* IMPORTANTE: registrar el sub-árbol /pagos (oculto en tabs) */}
            <Stack.Screen name="pagos" />
          </>
        ) : (
          <Stack.Screen name="(auth)" />
        )}
      </Stack>
    </PaperProvider>
  );
}
