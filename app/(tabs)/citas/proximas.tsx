import React, { useRef, useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  Animated,
  FlatList,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { Text, Chip } from "react-native-paper";
import axios from "axios";
import { verificarSesion } from "@/services/authService";

interface CitaAPI {
  cita_id: number;
  fecha_hora: string | null;
  estado_cita: string | null;
  estado_pago: string;
  tratamiento: string;
  estado_tratamiento: string;
}

type EstadoNorm = "Pendiente" | "Confirmada" | "Otra";

interface CitaPendiente {
  id: string;
  fecha: string;
  hora: string;
  tratamiento: string;
  estadoNormalizado: EstadoNorm;
}

function parseMySQLDateTime(s: string | null): Date | null {
  if (!s) return null;
  const m = s.match(
    /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})(?::(\d{2}))?$/
  );
  if (!m) return null;
  const [, y, mo, d, h, mi, se] = m;
  return new Date(
    Number(y),
    Number(mo) - 1,
    Number(d),
    Number(h),
    Number(mi),
    Number(se || "0")
  );
}

export default function ProximasCitas() {
  const cardSlideAnim = useRef(new Animated.Value(500)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const [usuarioId, setUsuarioId] = useState<number | null>(null);
  const [citas, setCitas] = useState<CitaPendiente[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  // Obtener usuario
  useEffect(() => {
    const obtenerUsuario = async () => {
      try {
        const usuario = await verificarSesion();
        if (usuario?.id) {
          setUsuarioId(usuario.id);
        } else {
          setError("No se pudo obtener el usuario.");
        }
      } catch (e) {
        console.error("Error verificando sesión:", e);
        setError("Error verificando sesión.");
      }
    };
    obtenerUsuario();
  }, []);

  // Obtener citas (con tratamiento)
  useEffect(() => {
    if (!usuarioId) return;

    const obtenerCitas = async () => {
      try {
        setLoading(true);


        const resp = await axios.get<CitaAPI[]>(
          `https://backenddent.onrender.com/api/citas/usuario/detalle/${usuarioId}`
        );

        console.log("Citas recibidas:", JSON.stringify(resp.data));

        const lista: CitaPendiente[] = resp.data
          .flatMap((c) => {
            const fechaObj = parseMySQLDateTime(c.fecha_hora);
            if (!fechaObj) return [];

            const dia = String(fechaObj.getDate()).padStart(2, "0");
            const mes = String(fechaObj.getMonth() + 1).padStart(2, "0");
            const anio = fechaObj.getFullYear();
            const hora = String(fechaObj.getHours()).padStart(2, "0");
            const min = String(fechaObj.getMinutes()).padStart(2, "0");

            const e1 = (c.estado_cita || "").toLowerCase();
            const e2 = (c.estado_tratamiento || "").toLowerCase();

            let estado: EstadoNorm = "Otra";
            if (e1.includes("pend") || e2.includes("pend")) {
              estado = "Pendiente";
            } else if (e1.includes("confirm")) {
              estado = "Confirmada";
            }

            return [
              {
                id: String(c.cita_id),
                fecha: `${dia}/${mes}/${anio}`,
                hora: `${hora}:${min}`,
                tratamiento: (c.tratamiento || "Sin nombre").trim(),
                estadoNormalizado: estado,
              },
            ];
          })
          // solo mostrar pendientes/confirmadas
          .filter(
            (c) =>
              c.estadoNormalizado === "Pendiente" ||
              c.estadoNormalizado === "Confirmada"
          )
          // ordenar por fecha + hora visual
          .sort((a, b) => {
            const [da, ma, aa] = a.fecha.split("/").map(Number);
            const [db, mb, ab] = b.fecha.split("/").map(Number);
            const fechaA = new Date(aa, ma - 1, da).getTime();
            const fechaB = new Date(ab, mb - 1, db).getTime();
            if (fechaA !== fechaB) return fechaA - fechaB;
            return a.hora.localeCompare(b.hora);
          });

        setCitas(lista);
      } catch (err) {
        console.error("Error al obtener próximas citas:", err);
        setError("No fue posible cargar las próximas citas.");
      } finally {
        setLoading(false);
      }
    };

    obtenerCitas();
  }, [usuarioId]);

  const getChipStyle = (estado: EstadoNorm) => {
    switch (estado) {
      case "Confirmada":
        return { backgroundColor: "#2196F3" };
      case "Pendiente":
        return { backgroundColor: "#4CAF50" };
      default:
        return { backgroundColor: "#9E9E9E" };
    }
  };

  const renderItem = ({ item }: { item: CitaPendiente }) => (
    <View style={styles.row}>
      <Text style={[styles.cell, styles.fechaCell]}>{item.fecha}</Text>
      <Text style={[styles.cell, styles.horaCell]}>{item.hora}</Text>
      <View style={[styles.cell, styles.tratamientoCell]}>
        <Chip
          style={[styles.tratamientoChip, getChipStyle(item.estadoNormalizado)]}
          textStyle={styles.tratamientoTexto}
        >
          {item.tratamiento}
        </Chip>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.card,
          { transform: [{ translateY: cardSlideAnim }], opacity: fadeAnim },
        ]}
      >
        <Text style={styles.title}>Citas Pendientes</Text>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#2196F3" />
            <Text style={{ color: "#555", marginTop: 8 }}>
              Cargando tus citas...
            </Text>
          </View>
        ) : error ? (
          <Text style={{ color: "red", textAlign: "center" }}>{error}</Text>
        ) : citas.length === 0 ? (
          <Text style={{ textAlign: "center", marginTop: 16, color: "#555" }}>
            No tienes citas pendientes.
          </Text>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={true}>
            <View style={styles.tableContainer}>
              <View style={styles.tableHeader}>
                <Text style={[styles.cell, styles.header, styles.fechaCell]}>
                  Fecha
                </Text>
                <Text style={[styles.cell, styles.header, styles.horaCell]}>
                  Hora
                </Text>
                <Text
                  style={[styles.cell, styles.header, styles.tratamientoCell]}
                >
                  Tratamiento
                </Text>
              </View>

              <FlatList
                data={citas}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
                style={{ maxHeight: 400 }}
              />
            </View>
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
    backgroundColor: "#fff",
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
    padding: 0,
    paddingTop: 30,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 30,
  },
  title: {
    fontSize: 24,
    fontFamily: "PoppinsSemiBold",
    marginBottom: 15,
    color: "#000",
    textAlign: "center",
  },
  tableHeader: {
    flexDirection: "row",
    borderBottomColor: "#ccc",
    borderBottomWidth: 1,
    paddingVertical: 8,
    backgroundColor: "#77777718",
  },
  row: {
    flexDirection: "row",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    alignItems: "center",
  },
  cell: {
    fontSize: 12,
    color: "#000",
    textAlign: "center",
    minWidth: 90,
  },
  fechaCell: { flex: 1.2 },
  horaCell: { flex: 1 },
  tratamientoCell: {
    flex: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  header: {
    fontWeight: "bold",
    textAlign: "center",
  },
  tratamientoChip: {
    minWidth: 90,
    height: 28,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 20,
  },
  tratamientoTexto: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
    textAlign: "center",
  },
  tableContainer: {
    width: "100%",
    marginHorizontal: 20,     // hace que la tabla use todo el ancho de la card
  },

});
