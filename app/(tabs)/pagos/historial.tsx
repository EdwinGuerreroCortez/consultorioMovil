import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function HistorialPagos() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Pantalla Historial de Pagos</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  text: { fontSize: 18, fontWeight: "bold" },
});
