import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";

export default function RegistroCuenta() {
  const router = useRouter();

  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <Text>Pantalla Crear Cuenta</Text>

      <TouchableOpacity onPress={() => router.replace("/(auth)/login")}>
        <Text>Registrarse y volver al Login</Text>
      </TouchableOpacity>
    </View>
  );
}
