// src/screens/HistorialPagos.tsx
import React, { useRef, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  ScrollView,
  SafeAreaView,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export default function HistorialPagos() {
  const cardSlideAnim = useRef(new Animated.Value(500)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const [historial] = useState([
    {
      id: 1,
      tratamiento: "Ortodoncia",
      fecha: "15/02/2024",
      monto: "$8,000",
      metodo: "Tarjeta",
      estado: "Completado",
    },
    {
      id: 2,
      tratamiento: "Carillas",
      fecha: null,
      monto: "$15,000",
      metodo: "Transferencia",
      estado: "Pendiente",
    },
  ]);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(cardSlideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View
        style={[
          styles.card,
          { transform: [{ translateY: cardSlideAnim }], opacity: fadeAnim },
        ]}
      >
        <Text style={styles.title}>Pagos Historial</Text>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 30 }}
        >
          {historial.map((pago) => (
            <View key={pago.id} style={styles.itemCard}>
              <View style={styles.textContainer}>
                <Text style={styles.tratamiento}>
                  Tratamiento: {pago.tratamiento}
                </Text>
                {pago.fecha && (
                  <Text style={styles.subText}>Fecha Cita: {pago.fecha}</Text>
                )}
                <Text style={styles.subText}>Monto: {pago.monto}</Text>
                <Text style={styles.subText}>Método: {pago.metodo}</Text>
              </View>

              <MaterialCommunityIcons
                name="cloud-check-outline"
                size={24}
                color={pago.estado === "Completado" ? "#1E88E5" : "#2e7d32"}
                style={{ marginRight: 8 }}
              />

              <View
                style={[
                  styles.estadoBadge,
                  pago.estado === "Completado"
                    ? styles.estadoOk
                    : styles.estadoPendiente,
                ]}
              >
                <Text style={styles.estadoText}>{pago.estado}</Text>
              </View>
            </View>
          ))}
        </ScrollView>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#EFEFEF",
  },

  // Lámina blanca con margen para que no se corten las orillas
  card: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
    padding: 20,
    paddingTop: 30,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    marginHorizontal: 10,
    marginTop: 8,
  },

  title: {
    fontSize: 24,
    fontFamily: "PoppinsSemiBold",
    marginBottom: 15,
    color: "#000",
  },

  itemCard: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 20,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  textContainer: {
    flex: 1,
    marginRight: 10,
  },

  tratamiento: {
    fontSize: 14,
    fontFamily: "PoppinsSemiBold",
    color: "#000",
    marginBottom: 2,
  },

  subText: {
    fontSize: 12,
    fontFamily: "PoppinsRegular",
    color: "#555",
    marginBottom: 1,
  },

  estadoBadge: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 999,
  },

  estadoOk: {
    backgroundColor: "#1E88E5",
  },

  estadoPendiente: {
    backgroundColor: "#2e7d32",
  },

  estadoText: {
    color: "#fff",
    fontSize: 11,
    fontFamily: "PoppinsSemiBold",
  },
});
