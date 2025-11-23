import React, { useRef, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  ScrollView,
  TouchableOpacity,
  Linking,
  ActivityIndicator,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import axios from "axios";
import { useRouter } from "expo-router";
import { verificarSesion } from "@/services/authService";

interface Servicio {
  id: number;
  nombre: string;
  descripcion: string;
  estado: number;
}

export default function HomePaciente() {
  const router = useRouter();

  const cardSlide = useRef(new Animated.Value(500)).current;
  const fade = useRef(new Animated.Value(0)).current;

  const [nombreUsuario, setNombreUsuario] = useState<string | null>(null);
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [loadingServicios, setLoadingServicios] = useState(false);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(cardSlide, { toValue: 0, duration: 800, useNativeDriver: true }),
      Animated.timing(fade, { toValue: 1, duration: 1000, useNativeDriver: true }),
    ]).start();
  }, []);

  useEffect(() => {
    const cargarUsuario = async () => {
      try {
        const usuario = await verificarSesion();
        if (usuario?.nombre) setNombreUsuario(usuario.nombre);
      } catch (e) {
        console.log("Error al obtener usuario:", e);
      }
    };
    cargarUsuario();
  }, []);

  useEffect(() => {
    const fetchTratamientos = async () => {
      try {
        setLoadingServicios(true);
        const resp = await axios.get("https://backenddent.onrender.com/api/tratamientos");
        const data: Servicio[] = resp.data || [];
        const activos = data.filter((t) => t.estado === 1);
        setServicios(activos.slice(0, 3));
      } catch (e) {
        console.error("Error al obtener tratamientos:", e);
      } finally {
        setLoadingServicios(false);
      }
    };
    fetchTratamientos();
  }, []);

  const abrirWhatsApp = () => {
    const phone = "521234567890"; // ← Cambia por tu número real
    const mensaje = encodeURIComponent("Hola, me gustaría agendar una cita en el consultorio dental.");
    Linking.openURL(`https://wa.me/${phone}?text=${mensaje}`).catch(() => console.log("Error WhatsApp"));
  };

  // TU ENLACE EXACTO DE STREET VIEW
  const abrirUbicacion = () => {
    Linking.openURL(
      "https://www.google.com/maps/@21.1416111,-98.4205599,3a,75y,71.71h,60.47t/data=!3m7!1e1!3m5!1sifyy5F22SsozTJynU_sHmw!2e0!6shttps:%2F%2Fstreetviewpixels-pa.googleapis.com%2Fv1%2Fthumbnail%3Fcb_client%3Dmaps_sv.tactile%26w%3D900%26h%3D600%26pitch%3D29.53%26panoid%3Difyy5F22SsozTJynU_sHmw%26yaw%3D71.71!7i16384!8i8192?entry=ttu"
    );
  };

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.card,
          { transform: [{ translateY: cardSlide }], opacity: fade },
        ]}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40 }}
        >
          {/* Header */}
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.saludoText}>
                {nombreUsuario ? `Hola, ${nombreUsuario}` : "Hola"}
              </Text>
              <Text style={styles.subtitleText}>
                Bienvenido a tu consultorio dental
              </Text>
            </View>
            <View style={styles.badgeConsultorio}>
              <Icon name="tooth-outline" size={28} color="#0901F5" />
            </View>
          </View>

          {/* Banner */}
          <View style={styles.bannerBox}>
            <View style={styles.bannerIconCircle}>
              <Icon name="shield-check" size={28} color="#FFFFFF" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.bannerTitle}>Atención odontológica</Text>
              <Text style={styles.bannerText}>
                Cuidamos tu sonrisa con tratamientos seguros y personalizados.
              </Text>
            </View>
          </View>

          {/* Acciones rápidas */}
          <Text style={styles.sectionTitle}>Acciones rápidas</Text>
          <View style={styles.quickActionsRow}>
            <TouchableOpacity
              style={[styles.quickCard, styles.quickCardPrimary]}
              onPress={() => router.push("/citas")}
              activeOpacity={0.85}
            >
              <Icon name="calendar-plus" size={26} color="#FFF" />
              <Text style={styles.quickCardTextPrimary}>Agendar cita</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickCard}
              onPress={() => router.push("/pagos")}
              activeOpacity={0.85}
            >
              <Icon name="credit-card-check" size={26} color="#0901F5" />
              <Text style={styles.quickCardText}>Pagos pendientes</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickCard}
              onPress={abrirWhatsApp}
              activeOpacity={0.85}
            >
              <Icon name="whatsapp" size={26} color="#00a884" />
              <Text style={styles.quickCardText}>WhatsApp</Text>
            </TouchableOpacity>
          </View>

          {/* Servicios destacados */}
          <Text style={styles.sectionTitle}>Servicios destacados</Text>

          {loadingServicios ? (
            <View style={styles.loadingRow}>
              <ActivityIndicator size="small" color="#0901F5" />
              <Text style={styles.loadingText}>Cargando servicios...</Text>
            </View>
          ) : servicios.length === 0 ? (
            <Text style={styles.emptyText}>
              No hay servicios disponibles por el momento.
            </Text>
          ) : (
            servicios.map((s) => (
              <View key={s.id} style={styles.servicioRow}>
                <View style={styles.servicioIconBox}>
                  <Icon name="tooth" size={22} color="#0901F5" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.servicioNombre}>{s.nombre}</Text>
                  <Text style={styles.servicioDescripcion}>
                    {s.descripcion.length > 90
                      ? `${s.descripcion.substring(0, 90)}...`
                      : s.descripcion}
                  </Text>
                </View>
              </View>
            ))
          )}

          {/* HORARIOS + UBICACIÓN */}
          <View style={styles.infoRow}>

            {/* Horarios */}
            <View style={styles.infoCardImproved}>
              <View style={styles.infoHeaderImproved}>
                <View style={styles.iconCircle}>
                  <Icon name="clock-outline" size={30} color="#0901F5" />
                </View>
                <Text style={styles.infoTitleImproved}>Horarios de atención</Text>
              </View>

              <View style={styles.scheduleList}>
                <View style={styles.scheduleRow}>
                  <Text style={styles.dayLabel}>Lunes</Text>
                  <Text style={styles.timeLabel}>9:00 - 14:00 • 16:00 - 19:00</Text>
                </View>
                <View style={styles.divider} />
                <View style={styles.scheduleRow}>
                  <Text style={styles.dayLabel}>Martes</Text>
                  <Text style={styles.timeLabel}>9:00 - 14:00 • 16:00 - 19:00</Text>
                </View>
                <View style={styles.divider} />
                <View style={styles.scheduleRow}>
                  <Text style={styles.dayLabel}>Miércoles</Text>
                  <Text style={styles.timeLabel}>9:00 - 14:00 • 16:00 - 19:00</Text>
                </View>
                <View style={styles.divider} />
                <View style={styles.scheduleRow}>
                  <Text style={styles.dayLabel}>Jueves</Text>
                  <Text style={styles.timeLabelClosed}>Cerrado</Text>
                </View>
                <View style={styles.divider} />
                <View style={styles.scheduleRow}>
                  <Text style={styles.dayLabel}>Viernes</Text>
                  <Text style={styles.timeLabelClosed}>Cerrado</Text>
                </View>
                <View style={styles.divider} />
                <View style={styles.scheduleRow}>
                  <Text style={styles.dayLabel}>Sábado</Text>
                  <Text style={styles.timeLabel}>9:00 - 14:00</Text>
                </View>
                <View style={styles.divider} />
                <View style={styles.scheduleRow}>
                  <Text style={styles.dayLabel}>Domingo</Text>
                  <Text style={styles.timeLabelClosed}>Cerrado</Text>
                </View>
              </View>
            </View>

            {/* Ubicación */}
            <View style={styles.infoCardImproved}>
              <View style={styles.infoHeaderImproved}>
                <View style={styles.iconCircle}>
                  <Icon name="map-marker-radius" size={32} color="#0901F5" />
                </View>
                <Text style={styles.infoTitleImproved}>Nuestra ubicación</Text>
              </View>

              <Text style={styles.addressText}>
                Calle Zacatecas 4, Centro{'\n'}
                43000 Huejutla de Cristo, Hgo., México
              </Text>

              <View style={{ marginTop: 16 }}>
                <TouchableOpacity style={styles.mapsButtonImproved} onPress={abrirUbicacion}>
                  <Icon name="google-maps" size={24} color="#FFF" />
                  <Text style={styles.mapsButtonTextImproved}>Abrir ubicación exacta</Text>
                </TouchableOpacity>
              </View>
            </View>

          </View>
        </ScrollView>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F5F5" },
  card: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
    paddingHorizontal: 20,
    paddingTop: 30,
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -5 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
  },

  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  saludoText: { fontSize: 24, color: "#000", fontWeight: "bold" },
  subtitleText: { fontSize: 14, color: "#666" },
  badgeConsultorio: { width: 56, height: 56, borderRadius: 18, backgroundColor: "#E6E0FF", justifyContent: "center", alignItems: "center" },

  bannerBox: { flexDirection: "row", backgroundColor: "#0901F5", borderRadius: 20, padding: 20, marginBottom: 24, alignItems: "center" },
  bannerIconCircle: { width: 56, height: 56, borderRadius: 28, backgroundColor: "#3F1CFF", justifyContent: "center", alignItems: "center", marginRight: 16 },
  bannerTitle: { fontSize: 18, color: "#FFF", fontWeight: "bold" },
  bannerText: { fontSize: 13.5, color: "#E0E7FF", marginTop: 4 },

  sectionTitle: { fontSize: 19, color: "#000", fontWeight: "bold", marginBottom: 14, marginTop: 10 },

  quickActionsRow: { flexDirection: "row", gap: 14, marginBottom: 30 },
  quickCard: { flex: 1, backgroundColor: "#F3F0FF", borderRadius: 20, paddingVertical: 20, alignItems: "center", justifyContent: "center", borderWidth: 1.5, borderColor: "#E6E0FF" },
  quickCardPrimary: { backgroundColor: "#0901F5", borderWidth: 0 },
  quickCardText: { marginTop: 10, fontSize: 13.5, color: "#0901F5", fontWeight: "bold" },
  quickCardTextPrimary: { marginTop: 10, fontSize: 13.5, color: "#FFF", fontWeight: "bold" },

  loadingRow: { flexDirection: "row", alignItems: "center", marginVertical: 14 },
  loadingText: { marginLeft: 12, color: "#555", fontSize: 14 },
  emptyText: { textAlign: "center", color: "#888", fontSize: 15, marginVertical: 25 },

  servicioRow: { flexDirection: "row", backgroundColor: "#FAFAFF", borderRadius: 20, padding: 18, marginBottom: 14, borderWidth: 1.5, borderColor: "#E6E0FF" },
  servicioIconBox: { width: 48, height: 48, borderRadius: 16, backgroundColor: "#E6E0FF", justifyContent: "center", alignItems: "center", marginRight: 16 },
  servicioNombre: { fontSize: 16, color: "#0901F5", fontWeight: "bold" },
  servicioDescripcion: { fontSize: 13.5, color: "#555", marginTop: 6, lineHeight: 20 },

  infoRow: { marginTop: 32, gap: 22 },
  infoCardImproved: {
    backgroundColor: "#FFFFFF",
    borderRadius: 28,
    padding: 24,
    borderWidth: 2.5,
    borderColor: "#E6E0FF",
    elevation: 12,
    shadowColor: "#0901F5",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
  },
  infoHeaderImproved: { flexDirection: "row", alignItems: "center", marginBottom: 20 },
  iconCircle: { width: 64, height: 64, borderRadius: 32, backgroundColor: "#E6E0FF", justifyContent: "center", alignItems: "center", marginRight: 18 },
  infoTitleImproved: { fontSize: 20, color: "#0901F5", fontWeight: "bold" },

  scheduleList: { backgroundColor: "#FAFAFF", borderRadius: 22, overflow: "hidden", borderWidth: 2, borderColor: "#E6E0FF" },
  scheduleRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 22, paddingVertical: 18 },
  divider: { height: 1.5, backgroundColor: "#E6E0FF", marginHorizontal: 22 },
  dayLabel: { fontSize: 16.5, color: "#333", fontWeight: "bold" },
  timeLabel: { fontSize: 16, color: "#0901F5", fontWeight: "600" },
  timeLabelClosed: { fontSize: 16, color: "#D32F2F", fontWeight: "600" },

  addressText: { fontSize: 16, color: "#444", lineHeight: 28, marginBottom: 10 },

  mapsButtonImproved: {
    flexDirection: "row",
    backgroundColor: "#0901F5",
    paddingVertical: 18,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    gap: 14,
    elevation: 8,
    shadowColor: "#0901F5",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  mapsButtonTextImproved: { color: "#FFF", fontSize: 16.5, fontWeight: "bold" },
});