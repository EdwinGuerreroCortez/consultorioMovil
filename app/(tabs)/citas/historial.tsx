import React, { useRef, useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  Animated,
  FlatList,
  ListRenderItem,
  ScrollView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { Text, Chip } from "react-native-paper";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import DateTimePicker from "@react-native-community/datetimepicker";
import axios from "axios";
import { verificarSesion } from "@/services/authService"; //  obtiene usuario desde token

interface Cita {
  cita_id: number;
  fecha_hora: string;
  estado_cita: string;
  estado_pago: string;
  tratamiento: string;
  estado_tratamiento: string;
}

interface CitaFormateada {
  id: string;
  fecha: string;
  hora: string;
  tratamiento: string;
  estado: "Completada" | "Cancelada";
}

export default function HistorialCitas() {
  const cardSlideAnim = useRef(new Animated.Value(500)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const [usuarioId, setUsuarioId] = useState<number | null>(null);
  const [filtro, setFiltro] = useState<"Todas" | "Completada" | "Cancelada">("Todas");
  const [fechaFiltro, setFechaFiltro] = useState<Date | null>(null);
  const [mostrarPicker, setMostrarPicker] = useState(false);
  const [citas, setCitas] = useState<CitaFormateada[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  //  Animaciones
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

  //  Obtener ID del usuario desde token
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

  // 🔹 Cargar citas desde la API
  useEffect(() => {
    if (!usuarioId) return;

    const obtenerCitas = async () => {
      try {
        setLoading(true);
        const resp = await axios.get<Cita[]>(
          `https://backenddent.onrender.com/api/citas/historial/${usuarioId}`
        );

        const citasFormateadas: CitaFormateada[] = resp.data
          .filter((c) =>
            ["completada", "cancelado"].includes(c.estado_cita.toLowerCase())
          )
          .map((c) => {
            const fecha = new Date(c.fecha_hora);
            const dia = fecha.getDate().toString().padStart(2, "0");
            const mes = (fecha.getMonth() + 1).toString().padStart(2, "0");
            const anio = fecha.getFullYear();
            const hora = fecha.getHours().toString().padStart(2, "0");
            const min = fecha.getMinutes().toString().padStart(2, "0");

            return {
              id: c.cita_id.toString(),
              fecha: `${dia}/${mes}/${anio}`,
              hora: `${hora}:${min}`,
              tratamiento: c.tratamiento.trim(),
              estado:
                c.estado_cita.toLowerCase() === "completada"
                  ? "Completada"
                  : "Cancelada",
            };
          });

        setCitas(citasFormateadas);
      } catch (err) {
        console.error("Error al obtener historial:", err);
        setError("No fue posible cargar el historial de citas");
      } finally {
        setLoading(false);
      }
    };

    obtenerCitas();
  }, [usuarioId]);

  //  Filtrado por estado y fecha
  const parseFecha = (fecha: string) => {
    const [dia, mes, anio] = fecha.split("/").map(Number);
    return new Date(anio, mes - 1, dia);
  };

  const citasFiltradas = citas.filter((c) => {
    const cumpleEstado = filtro === "Todas" || c.estado === filtro;
    const cumpleFecha = !fechaFiltro || parseFecha(c.fecha) >= fechaFiltro;
    return cumpleEstado && cumpleFecha;
  });

  const renderItem: ListRenderItem<CitaFormateada> = ({ item }) => (
    <View style={styles.row}>
      <Text style={[styles.cell, styles.fechaCell]}>{item.fecha}</Text>
      <Text style={[styles.cell, styles.horaCell]}>{item.hora}</Text>
      <Text style={[styles.cell, styles.tratamientoCell]}>
        {item.tratamiento}
      </Text>
      <View style={styles.estadoCell}>
        <Chip
          style={[
            styles.estadoChip,
            item.estado === "Completada" && { backgroundColor: "#4CAF50" },
            item.estado === "Cancelada" && { backgroundColor: "#9E9E9E" },
          ]}
          textStyle={styles.estadoTexto}
        >
          {item.estado}
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
        <Text style={styles.title}>Historial de Citas</Text>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#2196F3" />
            <Text style={{ color: "#555", marginTop: 8 }}>Cargando citas...</Text>
          </View>
        ) : error ? (
          <Text style={{ color: "red", textAlign: "center" }}>{error}</Text>
        ) : (
          <>
            {/* 🔹 Filtros */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.filtros}
            >
              {["Todas", "Completada", "Cancelada"].map((estado) => (
                <Chip
                  key={estado}
                  style={[
                    styles.filtroChip,
                    filtro === estado && styles.chipActivo,
                  ]}
                  textStyle={[
                    styles.filtroTexto,
                    filtro === estado && { color: "#fff" },
                  ]}
                  onPress={() =>
                    setFiltro(estado as "Todas" | "Completada" | "Cancelada")
                  }
                >
                  {estado}
                </Chip>
              ))}
            </ScrollView>

            {/* 🔹 Filtro de fechas */}
            <View style={styles.fechaFiltroContainer}>
              <Text style={styles.fechaFiltroLabel}>Filtros</Text>
              <Chip
                icon={() =>
                  fechaFiltro ? (
                    <Icon name="close-circle" size={18} color="red" />
                  ) : (
                    <Icon name="calendar" size={18} color="#2196F3" />
                  )
                }
                style={styles.fechaFiltroChip}
                textStyle={{ fontSize: 14, color: "#000" }}
                onPress={() => {
                  if (fechaFiltro) setFechaFiltro(null);
                  else setMostrarPicker(true);
                }}
              >
                {fechaFiltro
                  ? fechaFiltro.toLocaleDateString("es-ES")
                  : "Rango de fechas"}
              </Chip>
            </View>

            {mostrarPicker && (
              <DateTimePicker
                value={fechaFiltro || new Date()}
                mode="date"
                display={Platform.OS === "ios" ? "inline" : "default"}
                onChange={(event, selectedDate) => {
                  setMostrarPicker(false);
                  if (selectedDate) setFechaFiltro(selectedDate);
                }}
              />
            )}

            {/* 🔹 Tabla */}
            <ScrollView horizontal showsHorizontalScrollIndicator={true}>
              <View>
                <View style={styles.tableHeader}>
                  <Text
                    style={[styles.cell, styles.header, styles.fechaCell]}
                  >
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
                  <Text style={[styles.cell, styles.header, styles.estadoCell]}>
                    Estado
                  </Text>
                </View>

                <FlatList
                  data={citasFiltradas}
                  renderItem={renderItem}
                  keyExtractor={(item) => item.id}
                  scrollEnabled={false}
                  style={{ maxHeight: 400 }}
                />
              </View>
            </ScrollView>
          </>
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
    padding: 20,
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
  filtros: { flexGrow: 0, marginBottom: 15 },
  filtroChip: {
    borderWidth: 1,
    backgroundColor: "#0cbdfd15",
    marginRight: 8,
    height: 38,
    paddingHorizontal: 12,
  },
  chipActivo: { backgroundColor: "#2196F3", borderColor: "#2196F3" },
  filtroTexto: { fontSize: 14, color: "#000", fontWeight: "500" },
  fechaFiltroContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  fechaFiltroLabel: {
    fontSize: 14,
    fontFamily: "PoppinsSemiBold",
    color: "#555",
  },
  fechaFiltroChip: {
    borderWidth: 1,
    borderColor: "#ccc",
    backgroundColor: "#fff",
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
  tratamientoCell: { flex: 2 },
  estadoCell: {
    flex: 1.3,
    alignItems: "center",
    justifyContent: "center",
  },
  header: {
    fontWeight: "bold",
    textAlign: "center",
  },
  estadoChip: {
    width: 100,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 20,
  },
  estadoTexto: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
    textAlign: "center",
  },
});
