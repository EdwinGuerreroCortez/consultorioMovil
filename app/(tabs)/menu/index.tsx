// src/app/(tabs)/menu/index.tsx  (ajusta la ruta según tu estructura)
import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Snackbar } from "react-native-paper";
import { eliminarToken } from "@/services/authService";

export default function MenuIndex() {
  const router = useRouter();

  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarColor, setSnackbarColor] = useState("#333");

  const showSnackbar = (message: string, color: string = "#333") => {
    setSnackbarMessage(message);
    setSnackbarColor(color);
    setSnackbarVisible(true);
  };

  const handleLogoutConfirm = async () => {
    try {
      // Elimina el token del almacenamiento
      await eliminarToken();

      showSnackbar("Sesión cerrada correctamente", "#2E7D32");

      // Redirige al login y limpia el stack
      setTimeout(() => {
        router.replace("/(auth)/login");
      }, 800);
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
      showSnackbar("No se pudo cerrar sesión", "#D32F2F");
    }
  };

  const handleLogoutPress = () => {
    Alert.alert(
      "Cerrar sesión",
      "¿Seguro que quieres cerrar sesión?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Cerrar sesión",
          style: "destructive",
          onPress: handleLogoutConfirm,
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Menú Principal</Text>

      {/* Cerrar Sesión */}
      <TouchableOpacity
        style={[styles.button, { borderColor: "red" }]}
        onPress={handleLogoutPress}
      >
        <Ionicons
          name="log-out-outline"
          size={24}
          color="red"
          style={styles.icon}
        />
        <Text style={[styles.item, { color: "red" }]}>Cerrar Sesión</Text>
      </TouchableOpacity>

      {/* Snackbar */}
      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={2000}
        style={{ backgroundColor: snackbarColor }}
        action={{
          label: "OK",
          textColor: "#fff",
          onPress: () => setSnackbarVisible(false),
        }}
      >
        <Text style={{ color: "#fff", fontFamily: "PoppinsSemiBold" }}>
          {snackbarMessage}
        </Text>
      </Snackbar>
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
