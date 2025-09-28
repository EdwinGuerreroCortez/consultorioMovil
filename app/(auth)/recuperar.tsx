import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";

export default function Recuperar() {
  const router = useRouter();

  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <Text>-Pantalla Recuperar Contraseña-</Text>
      <TouchableOpacity onPress={() => router.push("/(auth)/cambiarPassword")}>
        <Text>Ir a Cambiar Password</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => router.back()}>
        <Text>Volver</Text>
      </TouchableOpacity>
    </View>
  );
}
