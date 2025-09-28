import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

export default function MenuIndex() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Menú Principal</Text>



      {/* Cerrar Sesión */}
      <TouchableOpacity
        style={[styles.button, { borderColor: "red" }]}
        onPress={() => router.replace("/(auth)/login")}
      >
        <Ionicons name="log-out-outline" size={24} color="red" style={styles.icon} />
        <Text style={[styles.item, { color: "red" }]}>Cerrar Sesión</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 20,
    paddingTop: 40,
  },
  title: {
    fontSize: 22,
    fontFamily: "PoppinsBold",
    marginBottom: 30,
    color: "#0901F5",
    textAlign: "center",
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    marginBottom: 15,
    backgroundColor: "#f9f9f9",
    elevation: 2,
  },
  icon: {
    marginRight: 12,
  },
  item: {
    fontSize: 16,
    fontFamily: "PoppinsRegular",
    color: "#333",
  },
});
