import React, { useRef, useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  Animated,
  FlatList,
  ListRenderItem,
  ScrollView,
  Platform,
} from "react-native";
import { Text, Chip } from "react-native-paper";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import DateTimePicker from "@react-native-community/datetimepicker";

interface Cita {
  id: string;
  fecha: string; // formato DD/MM/YYYY
  hora: string;
  tratamiento: string;
  estado: "Pendiente" | "Completada" | "Cancelada";
}

export default function HistorialCitas() {
  const cardSlideAnim = useRef(new Animated.Value(500)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const [filtro, setFiltro] = useState<
    "Todas" | "Pendiente" | "Completada" | "Cancelada"
  >("Todas");

  const [fechaFiltro, setFechaFiltro] = useState<Date | null>(null);
  const [mostrarPicker, setMostrarPicker] = useState(false);

  const citas: Cita[] = [
    { id: "1", fecha: "21/02/2024", hora: "15:00", tratamiento: "Limpieza", estado: "Completada" },
    { id: "2", fecha: "28/02/2024", hora: "10:00", tratamiento: "Limpieza", estado: "Completada" },
    { id: "3", fecha: "18/03/2024", hora: "12:00", tratamiento: "Ortodoncia", estado: "Pendiente" },
    { id: "4", fecha: "10/01/2024", hora: "09:00", tratamiento: "Extracción", estado: "Cancelada" },
  ];

  // Convierte "DD/MM/YYYY" a Date
  const parseFecha = (fecha: string) => {
    const [dia, mes, anio] = fecha.split("/").map(Number);
    return new Date(anio, mes - 1, dia);
  };

  // 🔹 Filtrado por estado + fecha
  const citasFiltradas = citas.filter((c) => {
    const cumpleEstado = filtro === "Todas" || c.estado === filtro;
    const cumpleFecha =
      !fechaFiltro || parseFecha(c.fecha) >= fechaFiltro;
    return cumpleEstado && cumpleFecha;
  });

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

  const renderItem: ListRenderItem<Cita> = ({ item }) => (
    <View style={styles.row}>
      <Text style={[styles.cell, styles.fechaCell]}>{item.fecha}</Text>
      <Text style={[styles.cell, styles.horaCell]}>{item.hora}</Text>
      <Text style={[styles.cell, styles.tratamientoCell]}>{item.tratamiento}</Text>
      <View style={styles.estadoCell}>
        <Chip
          style={[
            styles.estadoChip,
            item.estado === "Completada" && { backgroundColor: "#4CAF50" },
            item.estado === "Pendiente" && { backgroundColor: "#2196F3" },
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
        <Text style={styles.estado}>Estado</Text>

        {/* 🔹 Filtros por estado */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtros}>
          {["Todas", "Pendiente", "Completada", "Cancelada"].map((estado) => (
            <Chip
              key={estado}
              style={[styles.filtroChip, filtro === estado && styles.chipActivo]}
              textStyle={[styles.filtroTexto, filtro === estado && { color: "#fff" }]}
              onPress={() =>
                setFiltro(estado as "Todas" | "Pendiente" | "Completada" | "Cancelada")
              }
            >
              {estado}
            </Chip>
          ))}
        </ScrollView>

        {/* 🔹 Filtro de fechas con opción de quitar */}
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
              if (fechaFiltro) {
                setFechaFiltro(null); // 🔹 Limpia el filtro
              } else {
                setMostrarPicker(true); // 🔹 Abre el selector
              }
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
              if (selectedDate) {
                setFechaFiltro(selectedDate);
              }
            }}
          />
        )}

        {/* 🔹 Tabla con scroll horizontal */}
        <ScrollView horizontal showsHorizontalScrollIndicator={true}>
          <View>
            <View style={styles.tableHeader}>
              <Text style={[styles.cell, styles.header, styles.fechaCell]}>Fecha</Text>
              <Text style={[styles.cell, styles.header, styles.horaCell]}>Hora</Text>
              <Text style={[styles.cell, styles.header, styles.tratamientoCell]}>Tratamiento</Text>
              <Text style={[styles.cell, styles.header, styles.estadoCell]}>Estado</Text>
            </View>

            <FlatList
              data={citasFiltradas}
              renderItem={renderItem}
              keyExtractor={(item) => item.id}
            />
          </View>
        </ScrollView>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#EFEFEF" },
  card: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "95%",
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
  title: {
    fontSize: 24,
    fontFamily: "PoppinsSemiBold",
    marginBottom: 15,
    color: "#000",
    textAlign: "center",
  },
  estado: {
    fontSize: 16,
    fontFamily: "PoppinsSemiBold",
    marginBottom: 10,
    color: "#000",
    textAlign: "left",
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
    justifyContent: "space-between", // título izq, chip der
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
