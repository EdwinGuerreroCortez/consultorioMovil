import React, { useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  ScrollView,
  TouchableOpacity,
} from "react-native";

interface PagoPendiente {
  id: number;
  tratamiento: string;
  montoTexto: string;
  fechaTexto: string;
}

const pagosPendientes: PagoPendiente[] = [
  {
    id: 1,
    tratamiento: "Ortodoncia",
    montoTexto: "$8,000",
    fechaTexto: "15/03/2024",
  },
  {
    id: 2,
    tratamiento: "Ortodoncia",
    montoTexto: "$8,000",
    fechaTexto: "15/03/2024",
  },
  {
    id: 3,
    tratamiento: "Ortodoncia",
    montoTexto: "$8,000",
    fechaTexto: "15/03/2024",
  },
];

export default function PagosPendientes() {
  const cardSlideAnim = useRef(new Animated.Value(500)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

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

  const handlePagarAhora = (pago: PagoPendiente) => {
    // Aquí integrarás tu flujo real de pago para una sola cita
    console.log("Pagar ahora:", pago.id);
  };

  const handlePagarTodo = () => {
    // Aquí integrarás tu flujo real de pago de todo el tratamiento
    console.log("Pagar todo el tratamiento");
  };

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.card,
          { transform: [{ translateY: cardSlideAnim }], opacity: fadeAnim },
        ]}
      >
        <Text style={styles.title}>Pagos Pendientes</Text>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {pagosPendientes.map((pago) => (
            <View key={pago.id} style={styles.paymentCard}>
              <View style={styles.paymentInfo}>
                <Text style={styles.paymentTitle}>
                  Tratamiento: {pago.tratamiento}
                </Text>

                <View style={{ marginTop: 6 }}>
                  <Text style={styles.paymentMeta}>
                    Monto{" "}
                    <Text style={styles.paymentMetaBold}>
                      {pago.montoTexto}
                    </Text>
                  </Text>
                  <Text style={styles.paymentMeta}>
                    Fecha{" "}
                    <Text style={styles.paymentMetaBold}>
                      {pago.fechaTexto}
                    </Text>
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.payNowButton}
                activeOpacity={0.8}
                onPress={() => handlePagarAhora(pago)}
              >
                <Text style={styles.payNowText}>Pagar ahora</Text>
              </TouchableOpacity>
            </View>
          ))}

          <TouchableOpacity
            style={styles.payAllButton}
            activeOpacity={0.85}
            onPress={handlePagarTodo}
          >
            <Text style={styles.payAllText}>Pagar Todo el Tratamento</Text>
          </TouchableOpacity>
        </ScrollView>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  // Fondo gris + tarjeta curva igual que AgendarCita
  container: {
    flex: 1,
    backgroundColor: "#EFEFEF",
  },
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
  },
  title: {
    fontSize: 24,
    fontFamily: "PoppinsSemiBold",
    marginBottom: 15,
    color: "#000",
    textAlign: "left",
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },

  // Tarjeta de pago tipo “card suave”
  paymentCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 20,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  paymentInfo: {
    flex: 1,
    marginRight: 12,
  },
  paymentTitle: {
    fontSize: 14,
    fontFamily: "PoppinsSemiBold",
    color: "#000",
  },
  paymentMeta: {
    fontSize: 12,
    fontFamily: "PoppinsRegular",
    color: "#555555",
  },
  paymentMetaBold: {
    fontFamily: "PoppinsSemiBold",
    color: "#000",
  },

  // Botón azul “Pagar ahora”
  payNowButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "#1E88E5",
    minWidth: 100,
    alignItems: "center",
    justifyContent: "center",
  },
  payNowText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontFamily: "PoppinsSemiBold",
  },

  // Botón azul grande “Pagar Todo el Tratamento”
  payAllButton: {
    marginTop: 12,
    borderRadius: 999,
    backgroundColor: "#1E88E5",
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  payAllText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontFamily: "PoppinsSemiBold",
  },
});
