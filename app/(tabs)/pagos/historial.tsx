import React, { useRef, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import axios from "axios";
import { verificarSesion } from "@/services/authService"; // ← ya lo usas en otras pantallas

export default function HistorialPagos() {
  const cardSlideAnim = useRef(new Animated.Value(500)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const [usuarioId, setUsuarioId] = useState<number | null>(null);
  const [historial, setHistorial] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Animación de entrada
  useEffect(() => {
    Animated.parallel([
      Animated.timing(cardSlideAnim, { toValue: 0, duration: 800, useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
    ]).start();
  }, []);

  // Obtener ID del usuario
  useEffect(() => {
    const cargarUsuario = async () => {
      try {
        const usuario = await verificarSesion();
        if (usuario?.id) setUsuarioId(usuario.id);
        else setError("No se pudo obtener el usuario.");
      } catch (e) {
        console.error("Error verificando sesión:", e);
        setError("Error verificando sesión.");
      }
    };
    cargarUsuario();
  }, []);

  // Obtener historial real del backend
  useEffect(() => {
    if (!usuarioId) return;

    const obtenerHistorial = async () => {
      try {
        setLoading(true);

        const resp = await axios.get(
          `https://backenddent.onrender.com/api/pagos/historial/${usuarioId}`
        );

        const data = Array.isArray(resp.data) ? resp.data : [];

        // Adaptación al formato visual
        const formateado = data.map((p) => {
          const fechaPago = formatoFecha(p.fecha_pago);
          const fechaCita = formatoFechaHora(p.fecha_cita);

          return {
            id: p.pago_id,
            tratamiento: p.nombre_tratamiento || "Sin tratamiento",
            monto: p.monto || "0",
            metodo: p.metodo || "Sin método",
            estado: p.estado || "Pagado",
            fechaPago,
            fechaCita,
          };
        });

        setHistorial(formateado);
      } catch (error) {
        console.error("Error cargando historial:", error);
        setError("No fue posible obtener el historial de pagos.");
      } finally {
        setLoading(false);
      }
    };

    obtenerHistorial();
  }, [usuarioId]);

  // Helpers
  const formatoFecha = (iso: string | null) => {
    if (!iso) return "Sin fecha";
    const d = new Date(iso);
    if (isNaN(d.getTime())) return "Sin fecha";
    return `${d.getDate().toString().padStart(2, "0")}/${(d.getMonth() + 1)
      .toString()
      .padStart(2, "0")}/${d.getFullYear()}`;
  };

  const formatoFechaHora = (iso: string | null) => {
    if (!iso) return "Sin fecha";
    const d = new Date(iso);
    if (isNaN(d.getTime())) return "Sin fecha";
    return `${d.getDate().toString().padStart(2, "0")}/${(d.getMonth() + 1)
      .toString()
      .padStart(2, "0")}/${d.getFullYear()} ${d
        .getHours()
        .toString()
        .padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;
  };

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.card, { transform: [{ translateY: cardSlideAnim }], opacity: fadeAnim }]}>
        <Text style={styles.title}>Historial de Pagos</Text>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#0288d1" />
            <Text style={{ marginTop: 10, color: "#555" }}>Cargando...</Text>
          </View>
        ) : error ? (
          <Text style={{ color: "red", textAlign: "center" }}>{error}</Text>
        ) : historial.length === 0 ? (
          <Text style={{ textAlign: "center", marginTop: 20, color: "#777" }}>
            No hay pagos registrados.
          </Text>
        ) : (
          <ScrollView showsVerticalScrollIndicator={false}>
            {historial.map((pago) => (
              <View key={pago.id} style={styles.itemCard}>
                <View style={styles.textContainer}>
                  <Text style={styles.tratamiento}>{pago.tratamiento}</Text>
                  <Text style={styles.subText}>Monto: ${pago.monto}</Text>
                  <Text style={styles.subText}>Método: {pago.metodo}</Text>
                  <Text style={styles.subText}>Fecha de pago: {pago.fechaPago}</Text>
                  <Text style={styles.subText}>Cita: {pago.fechaCita}</Text>
                </View>

                <Icon
                  name="check-circle"
                  size={26}
                  color={pago.estado === "pagado" ? "#1E88E5" : "#2e7d32"}
                  style={{ marginRight: 6 }}
                />

                <View
                  style={[
                    styles.estadoBadge,
                    pago.estado === "pagado" ? styles.estadoOk : styles.estadoPendiente,
                  ]}
                >
                  <Text style={styles.estadoText}>{pago.estado}</Text>
                </View>
              </View>
            ))}
          </ScrollView>
        )}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#EFEFEF" },
  card: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
    padding: 20,
    paddingTop: 30,
    marginHorizontal: 10,
    marginTop: 10,
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  title: {
    fontSize: 24,
    fontFamily: "PoppinsSemiBold",
    marginBottom: 20,
    color: "#000",
  },
  loadingContainer: { alignItems: "center", marginTop: 30 },
  itemCard: {
    backgroundColor: "#fff",
    padding: 18,
    borderRadius: 20,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  textContainer: { flex: 1, marginRight: 10 },
  tratamiento: { fontSize: 14, fontFamily: "PoppinsSemiBold", color: "#000" },
  subText: { fontSize: 12, fontFamily: "PoppinsRegular", color: "#555" },
  estadoBadge: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 999,
  },
  estadoOk: { backgroundColor: "#1E88E5" },
  estadoPendiente: { backgroundColor: "#2e7d32" },
  estadoText: { color: "#fff", fontSize: 11, fontFamily: "PoppinsSemiBold" },
});
