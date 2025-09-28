import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";

export default function CambiarPassword() {
  const router = useRouter();

  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <Text>Pantalla Cambiar Contraseña</Text>

      <TouchableOpacity onPress={() => router.replace("/(auth)/login")}>
        <Text>Guardar y volver al Login</Text>
      </TouchableOpacity>
    </View>
  );
}
