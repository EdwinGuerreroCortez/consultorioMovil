import React, { useRef, useEffect, useState, useMemo, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Alert,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { verificarSesion } from "@/services/authService";
import { useApi } from "@/hooks/useApi";
import { useFocusEffect } from "@react-navigation/native";

const WEEKDAY_HOURS = [
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "15:00",
  "16:00",
  "17:00",
  "18:00",
  "19:00",
];

const WEEKEND_HOURS = ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00"];

const WEEK_DAYS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
const MONTHS = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

interface Tratamiento {
  id: number;
  nombre: string;
  precio: number;
  requiere_evaluacion: boolean;
  estado: number;
  citas_requeridas?: number;
}

interface CitaOcupada {
  fecha_hora: string;
  hora_formateada: string; // "HH:MM"
  [key: string]: any;
}

export default function AgendarCita() {
  const cardSlideAnim = useRef(new Animated.Value(500)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const { fetchWithCsrf, csrfToken } = useApi();

  const [usuarioId, setUsuarioId] = useState<number | null>(null);
  const [tratamientoActivo, setTratamientoActivo] = useState(false);

  const [servicios, setServicios] = useState<Tratamiento[]>([]);
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [serviceDropdownOpen, setServiceDropdownOpen] = useState(false);

  const [currentMonth, setCurrentMonth] = useState(() => {
    const d = new Date();
    d.setDate(1);
    return d;
  });

  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedHour, setSelectedHour] = useState<string | null>(null);

  const [citasOcupadas, setCitasOcupadas] = useState<CitaOcupada[]>([]);
  const [loading, setLoading] = useState(false);

  const ultimaFechaConsultada = useRef<string | null>(null);
  const obtenerCitasOcupadas = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetchWithCsrf("/api/citas/activas", {
        method: "GET",
      });

      if (!res.ok) {
        Alert.alert(
          "Error",
          "Error al obtener las citas ocupadas. Intenta nuevamente."
        );
        return;
      }

      const citas = res.data || [];

      const formateadas: CitaOcupada[] = citas.map((c: any) => {
        const fechaUTC = new Date(c.fecha_hora);
        const horas = fechaUTC.getUTCHours();
        const minutos = fechaUTC.getUTCMinutes();
        const horaStr = `${horas.toString().padStart(2, "0")}:${minutos
          .toString()
          .padStart(2, "0")}`; // "HH:MM"

        return { ...c, hora_formateada: horaStr };
      });

      setCitasOcupadas(formateadas);
    } catch (e) {
      console.error("Error obteniendo citas ocupadas:", e);
      Alert.alert(
        "Error",
        "No fue posible obtener las citas ocupadas. Inténtalo nuevamente."
      );
    } finally {
      setLoading(false);
    }
  }, [fetchWithCsrf]);
  // Reiniciar pantalla cada vez que se enfoca el tab
  useFocusEffect(
    useCallback(() => {
      // 1) Reiniciar estados de selección
      setSelectedService(null);
      setServiceDropdownOpen(false);
      setSelectedDate(null);
      setSelectedHour(null);
      setCitasOcupadas([]);
      ultimaFechaConsultada.current = null;

      // (Opcional) Reiniciar el mes al actual
      const hoy = new Date();
      hoy.setDate(1);
      setCurrentMonth(hoy);

      // 2) Volver a consultar al backend
      verificarTratamientoActivo();
      obtenerTratamientos();

      // 3) Reiniciar animaciones
      cardSlideAnim.setValue(500);
      fadeAnim.setValue(0);

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

      return () => {
        // aquí podrías limpiar timers/listeners si algún día los agregas
      };
    }, [cardSlideAnim, fadeAnim, verificarTratamientoActivo, obtenerTratamientos])
  );


  // Obtener usuario desde token
  useEffect(() => {
    const obtenerUsuario = async () => {
      try {
        const usuario = await verificarSesion();
        if (usuario?.id) {
          setUsuarioId(usuario.id);
        } else {
          Alert.alert(
            "Sesión",
            "No se encontró la sesión del usuario. Inicia sesión nuevamente."
          );
        }
      } catch (e) {
        console.error("Error verificando sesión:", e);
        Alert.alert(
          "Error",
          "Error al verificar la sesión. Intenta nuevamente."
        );
      }
    };
    obtenerUsuario();
  }, []);

  // Cuando ya tenemos usuario + CSRF → verificar tratamiento y cargar servicios
  useEffect(() => {
    if (!usuarioId || !csrfToken) return;
    verificarTratamientoActivo();
    obtenerTratamientos();
  }, [usuarioId, csrfToken]);

  // Cuando se selecciona una fecha → obtener citas ocupadas (si no se han consultado ya)
  useEffect(() => {
    if (!selectedDate || !csrfToken) return;
    const fechaClave = selectedDate.toISOString().split("T")[0];

    if (ultimaFechaConsultada.current === fechaClave) return;

    ultimaFechaConsultada.current = fechaClave;
    obtenerCitasOcupadas();
  }, [selectedDate, csrfToken, obtenerCitasOcupadas]);

  // Matriz del calendario (6 filas x 7 columnas, lunes como inicio)
  const calendarMatrix = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const firstWeekday = (firstDay.getDay() + 6) % 7; // lunes=0
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const matrix: (Date | null)[][] = [];
    let currentDay = 1 - firstWeekday;

    for (let row = 0; row < 6; row++) {
      const week: (Date | null)[] = [];
      for (let col = 0; col < 7; col++) {
        if (currentDay < 1 || currentDay > daysInMonth) {
          week.push(null);
        } else {
          week.push(new Date(year, month, currentDay));
        }
        currentDay++;
      }
      matrix.push(week);
    }
    return matrix;
  }, [currentMonth]);

  const isSameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

  // Horas base según día (sin considerar ocupadas)
  const baseHoursForSelectedDate = useMemo(() => {
    if (!selectedDate) return [];
    const day = selectedDate.getDay(); // 0=Domingo, 6=Sábado

    // Días cerrados: domingo (0), jueves (4), viernes (5)
    if (day === 0 || day === 4 || day === 5) return [];

    // Sábado: 9 a 14
    if (day === 6) return WEEKEND_HOURS;

    // Lunes a miércoles: horario normal
    return WEEKDAY_HOURS;
  }, [selectedDate]);

  // Horas marcadas como ocupadas según citas de backend
  const hoursWithAvailability = useMemo(() => {
    if (!selectedDate) return [];

    const fechaSeleccionadaISO = selectedDate
      .toISOString()
      .split("T")[0];

    const horasOcupadas = citasOcupadas
      .filter((cita) => {
        const fechaCitaISO = new Date(cita.fecha_hora)
          .toISOString()
          .split("T")[0];
        return fechaCitaISO === fechaSeleccionadaISO;
      })
      .map((cita) => cita.hora_formateada); // "HH:MM"

    return baseHoursForSelectedDate.map((h) => ({
      value: h,
      isOccupied: horasOcupadas.includes(h),
    }));
  }, [selectedDate, baseHoursForSelectedDate, citasOcupadas]);

  // --- Llamadas a API ---

  const verificarTratamientoActivo = useCallback(async () => {
    if (!usuarioId) return;
    try {
      setLoading(true);
      const res = await fetchWithCsrf(
        `/api/tratamientos-pacientes/verificar/${usuarioId}`,
        { method: "GET" }
      );

      if (!res.ok) {
        Alert.alert(
          "Error",
          "Error al verificar si tienes un tratamiento activo."
        );
        return;
      }

      const tiene = !!res.data?.tieneTratamientoActivo;
      setTratamientoActivo(tiene);

      if (tiene) {
        Alert.alert(
          "Tratamiento activo",
          "Ya tienes un tratamiento en curso. Debes finalizarlo antes de agendar otra cita."
        );
      }
    } catch (e) {
      console.error("Error verificando tratamiento activo:", e);
      Alert.alert(
        "Error",
        "Error al verificar el tratamiento activo. Inténtalo nuevamente."
      );
    } finally {
      setLoading(false);
    }
  }, [usuarioId, fetchWithCsrf]);

  const obtenerTratamientos = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetchWithCsrf("/api/tratamientos", {
        method: "GET",
      });

      if (!res.ok) {
        Alert.alert("Error", "Error al cargar los tratamientos.");
        return;
      }

      const activos: Tratamiento[] = (res.data || []).filter(
        (t: Tratamiento) => t.estado === 1
      );

      setServicios(activos);
    } catch (e) {
      console.error("Error al obtener tratamientos:", e);
      Alert.alert("Error", "No fue posible cargar los tratamientos.");
    } finally {
      setLoading(false);
    }
  }, [fetchWithCsrf]);



  // --- Navegación de mes ---

  const handlePrevMonth = () => {
    const d = new Date(currentMonth);
    d.setMonth(d.getMonth() - 1);
    setCurrentMonth(d);
  };

  const handleNextMonth = () => {
    const d = new Date(currentMonth);
    d.setMonth(d.getMonth() + 1);
    setCurrentMonth(d);
  };

  // --- Confirmar cita (POST) ---

  const handleConfirm = async () => {
    if (tratamientoActivo) {
      Alert.alert(
        "No puedes agendar",
        "Ya tienes un tratamiento en curso. Debes finalizarlo antes de agendar otro."
      );
      return;
    }

    if (!selectedService || !selectedDate || !selectedHour) {
      Alert.alert(
        "Campos incompletos",
        "Selecciona un servicio, una fecha y una hora para continuar."
      );
      return;
    }

    const servicio = servicios.find((s) => s.nombre === selectedService);
    if (!servicio) {
      Alert.alert(
        "Error",
        "No se encontró la información del servicio seleccionado."
      );
      return;
    }

    const hourObj = hoursWithAvailability.find(
      (h) => h.value === selectedHour
    );
    if (hourObj?.isOccupied) {
      Alert.alert(
        "Hora ocupada",
        "Esta hora ya está ocupada. Por favor, selecciona otra."
      );
      return;
    }

    if (!usuarioId) {
      Alert.alert("Error", "No se encontró el usuario. Inicia sesión de nuevo.");
      return;
    }

    try {
      setLoading(true);

      const fechaISO = selectedDate.toISOString().split("T")[0]; // YYYY-MM-DD
      const [horaStr, minutoStr] = selectedHour.split(":");
      const horaNum = parseInt(horaStr, 10);
      const minutoNum = parseInt(minutoStr, 10);

      // Fecha/hora local
      const fechaHoraLocal = new Date(
        `${fechaISO}T${horaNum.toString().padStart(2, "0")}:${minutoNum
          .toString()
          .padStart(2, "0")}:00`
      );

      // Convertir a UTC como en el web
      const fechaHoraUTC = new Date(
        fechaHoraLocal.getTime() -
        fechaHoraLocal.getTimezoneOffset() * 60000
      );

      const estadoTratamiento = servicio.requiere_evaluacion
        ? "pendiente"
        : "en progreso";

      const res = await fetchWithCsrf("/api/tratamientos-pacientes/crear", {
        method: "POST",
        body: JSON.stringify({
          usuarioId,
          tratamientoId: servicio.id,
          citasTotales: servicio.citas_requeridas || 0,
          fechaInicio: fechaHoraUTC.toISOString(),
          estado: estadoTratamiento,
          precio: servicio.precio,
          requiereEvaluacion: servicio.requiere_evaluacion,
        }),
      });

      if (!res.ok) {
        console.error("Respuesta error crear tratamiento:", res);
        Alert.alert(
          "Error",
          "Error al agendar la cita. Inténtalo nuevamente."
        );
        return;
      }

      Alert.alert(
        "Cita agendada",
        servicio.requiere_evaluacion
          ? "Tratamiento creado correctamente, pendiente de valoración."
          : "Tratamiento, citas y pagos creados correctamente."
      );
      // ✅ Actualiza inmediatamente el estado para que el aviso se muestre sin reiniciar
      setTratamientoActivo(true);

      // ✅ (Opcional pero recomendable): vuelve a verificar con el backend por si cambia algo
      await verificarTratamientoActivo();

      // Reseteamos selección
      setSelectedService(null);
      setSelectedDate(null);
      setSelectedHour(null);
      ultimaFechaConsultada.current = null;
      // Podríamos volver a cargar citas ocupadas si quieres
      // obtenerCitasOcupadas();
    } catch (e) {
      console.error("Error al agendar la cita:", e);
      Alert.alert(
        "Error",
        "Error al agendar la cita. Inténtalo nuevamente."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    Alert.alert("Atrás", "Aquí podrías navegar a la pantalla anterior.");
  };

  const isNextDisabled =
    tratamientoActivo || !selectedService || !selectedDate || !selectedHour;

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.card,
          { transform: [{ translateY: cardSlideAnim }], opacity: fadeAnim },
        ]}
      >
        {loading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#003087" />
          </View>
        )}

        <Text style={styles.title}>Agendar cita</Text>

        {tratamientoActivo && (
          <View style={styles.warningBox}>
            <Icon
              name="alert-circle-outline"
              size={22}
              color="#D32F2F"
              style={{ marginRight: 8 }}
            />
            <Text style={styles.warningText}>
              Ya tienes un tratamiento en curso. Debes finalizarlo antes de
              agendar otra cita.
            </Text>
          </View>
        )}

        {/* Contenido principal */}
        <View style={styles.mainContent}>
          {/* Selección de servicio */}
          <View style={styles.section}>
            <Text style={styles.label}>Selecciona un servicio</Text>

            <View>
              <TouchableOpacity
                style={styles.select}
                onPress={() =>
                  !tratamientoActivo &&
                  setServiceDropdownOpen((prev) => !prev)
                }
                activeOpacity={0.8}
                disabled={tratamientoActivo}
              >
                <View style={styles.selectLeft}>
                  <View style={styles.iconBox}>
                    <Icon name="plus" size={20} color="#0057b7" />
                  </View>
                  <Text
                    style={[
                      styles.selectText,
                      !selectedService && { color: "#9E9E9E" },
                    ]}
                  >
                    {selectedService || "Selecciona un servicio"}
                  </Text>
                </View>
                <Icon
                  name={serviceDropdownOpen ? "chevron-up" : "chevron-down"}
                  size={22}
                  color="#003087"
                />
              </TouchableOpacity>

              {serviceDropdownOpen && !tratamientoActivo && (
                <View style={styles.dropdown}>
                  <ScrollView
                    style={styles.dropdownScroll}
                    nestedScrollEnabled
                  >
                    {servicios.map((s) => (
                      <TouchableOpacity
                        key={s.id}
                        style={styles.dropdownItem}
                        activeOpacity={0.8}
                        onPress={() => {
                          setSelectedService(s.nombre);
                          setServiceDropdownOpen(false);
                        }}
                      >
                        <Text style={styles.dropdownItemText}>{s.nombre}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}
            </View>
          </View>

          {/* Calendario + columna de horas */}
          <View style={styles.calendarAndHours}>
            {/* Calendario con borde fijo */}
            <View style={styles.calendarContainer}>
              <View style={styles.calendarHeader}>
                <TouchableOpacity
                  onPress={handlePrevMonth}
                  style={styles.monthArrow}
                  disabled={tratamientoActivo}
                >
                  <Icon name="chevron-left" size={22} color="#003087" />
                </TouchableOpacity>
                <Text style={styles.calendarHeaderText}>
                  {MONTHS[currentMonth.getMonth()]}{" "}
                  {currentMonth.getFullYear()}
                </Text>
                <TouchableOpacity
                  onPress={handleNextMonth}
                  style={styles.monthArrow}
                  disabled={tratamientoActivo}
                >
                  <Icon name="chevron-right" size={22} color="#003087" />
                </TouchableOpacity>
              </View>

              <View style={styles.weekDaysRow}>
                {WEEK_DAYS.map((d) => (
                  <Text key={d} style={styles.weekDayText}>
                    {d}
                  </Text>
                ))}
              </View>

              {calendarMatrix.map((week, rowIndex) => (
                <View key={rowIndex} style={styles.weekRow}>
                  {week.map((date, colIndex) => {
                    if (!date) {
                      return <View key={colIndex} style={styles.dayCell} />;
                    }

                    const isSelected =
                      selectedDate !== null && isSameDay(selectedDate, date);
                    const isToday = isSameDay(date, new Date());

                    return (
                      <TouchableOpacity
                        key={colIndex}
                        style={[
                          styles.dayCell,
                          isSelected && styles.daySelected,
                          !isSelected && isToday && styles.dayToday,
                        ]}
                        activeOpacity={0.8}
                        onPress={() => {
                          if (tratamientoActivo) return;
                          setSelectedDate(date);
                          setSelectedHour(null);
                        }}
                        disabled={tratamientoActivo}
                      >
                        <Text
                          style={[
                            styles.dayText,
                            isSelected && styles.dayTextSelected,
                          ]}
                        >
                          {date.getDate()}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              ))}
            </View>

            {/* Horas disponibles con scroll SOLO aquí */}
            <View style={styles.hoursContainer}>
              <Text style={styles.hoursTitle}>Horas disponibles</Text>

              <ScrollView
                style={styles.hoursScroll}
                contentContainerStyle={styles.hoursScrollContent}
                nestedScrollEnabled
              >
                {!selectedDate ? (
                  <Text style={styles.noHoursText}>
                    Selecciona una fecha para ver horarios.
                  </Text>
                ) : baseHoursForSelectedDate.length === 0 ? (
                  <Text style={styles.noHoursText}>
                    No hay citas disponibles este día.
                  </Text>
                ) : (
                  hoursWithAvailability.map((h) => (
                    <TouchableOpacity
                      key={h.value}
                      style={[
                        styles.hourButton,
                        h.isOccupied && styles.hourButtonOccupied,
                        selectedHour === h.value &&
                        !h.isOccupied &&
                        styles.hourButtonSelected,
                      ]}
                      activeOpacity={0.8}
                      onPress={() => {
                        if (h.isOccupied || tratamientoActivo) return;
                        setSelectedHour(h.value);
                      }}
                      disabled={h.isOccupied || tratamientoActivo}
                    >
                      <Text
                        style={[
                          styles.hourText,
                          h.isOccupied && styles.hourTextOccupied,
                          selectedHour === h.value &&
                          !h.isOccupied &&
                          styles.hourTextSelected,
                        ]}
                      >
                        {h.value}
                        {h.isOccupied ? " (Ocupada)" : ""}
                      </Text>
                    </TouchableOpacity>
                  ))
                )}
              </ScrollView>
            </View>
          </View>

          {/* Botones inferiores */}
          <View style={styles.buttonsRow}>
            <TouchableOpacity
              style={[styles.button, styles.buttonOutline]}
              activeOpacity={0.8}
              onPress={handleBack}
            >
              <Text style={[styles.buttonText, styles.buttonOutlineText]}>
                Atrás
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.button,
                styles.buttonPrimary,
                isNextDisabled && styles.buttonDisabled,
              ]}
              activeOpacity={0.8}
              onPress={handleConfirm}
              disabled={isNextDisabled}
            >
              <Text style={[styles.buttonText, styles.buttonPrimaryText]}>
                Siguiente
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#EFEFEF",
  },
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
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#00000040",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
  },
  title: {
    fontSize: 24,
    fontFamily: "PoppinsSemiBold",
    marginBottom: 15,
    color: "#000",
    textAlign: "left",
  },
  warningBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFEBEE",
    borderRadius: 12,
    padding: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#D32F2F",
  },
  warningText: {
    flex: 1,
    fontSize: 12,
    color: "#B71C1C",
    fontFamily: "PoppinsRegular",
  },
  mainContent: {
    flex: 1,
  },
  section: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    marginBottom: 8,
    color: "#000",
    fontFamily: "PoppinsSemiBold",
  },
  select: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#C5CAE9",
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#FDFDFD",
    justifyContent: "space-between",
  },
  selectLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  iconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "#E3F2FD",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  selectText: {
    fontSize: 14,
    color: "#000",
    fontFamily: "PoppinsRegular",
  },
  dropdown: {
    marginTop: 6,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#C5CAE9",
    overflow: "hidden",
  },
  dropdownScroll: {
    maxHeight: 200,
  },
  dropdownItem: {
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  dropdownItemText: {
    fontSize: 14,
    color: "#000",
    fontFamily: "PoppinsRegular",
  },
  calendarAndHours: {
    flexDirection: "row",
    marginTop: 12,
    flex: 1,
  },
  calendarContainer: {
    flex: 2,
    marginRight: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    paddingHorizontal: 6,
    paddingVertical: 8,
  },
  calendarHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  calendarHeaderText: {
    fontSize: 16,
    fontFamily: "PoppinsSemiBold",
    color: "#000",
  },
  monthArrow: {
    padding: 4,
  },
  weekDaysRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  weekDayText: {
    flex: 1,
    textAlign: "center",
    fontSize: 11,
    color: "#757575",
    fontFamily: "PoppinsRegular",
  },
  weekRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 2,
  },
  dayCell: {
    flex: 1,
    aspectRatio: 1,
    marginHorizontal: 1,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  dayText: {
    fontSize: 13,
    color: "#000",
    fontFamily: "PoppinsRegular",
  },
  daySelected: {
    backgroundColor: "#0D47A1",
  },
  dayToday: {
    borderWidth: 1,
    borderColor: "#0D47A1",
  },
  dayTextSelected: {
    color: "#FFF",
    fontFamily: "PoppinsSemiBold",
  },
  hoursContainer: {
    flex: 1,
    marginLeft: 12,
  },
  hoursTitle: {
    fontSize: 14,
    fontFamily: "PoppinsSemiBold",
    color: "#000",
    marginBottom: 8,
  },
  hoursScroll: {
    maxHeight: 260,
  },
  hoursScrollContent: {
    paddingBottom: 4,
  },
  noHoursText: {
    fontSize: 12,
    color: "#757575",
    fontFamily: "PoppinsRegular",
  },
  hourButton: {
    borderWidth: 1,
    borderColor: "#2196F3",
    borderRadius: 10,
    paddingVertical: 8,
    marginBottom: 8,
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  hourButtonSelected: {
    backgroundColor: "#2196F3",
  },
  hourButtonOccupied: {
    borderColor: "#d32f2f",
    backgroundColor: "#ffcdd2",
  },
  hourText: {
    fontSize: 14,
    color: "#2196F3",
    fontFamily: "PoppinsRegular",
  },
  hourTextSelected: {
    color: "#FFFFFF",
    fontFamily: "PoppinsSemiBold",
  },
  hourTextOccupied: {
    color: "#B71C1C",
    fontFamily: "PoppinsSemiBold",
  },
  buttonsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  button: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonOutline: {
    borderWidth: 1,
    borderColor: "#2196F3",
    marginRight: 8,
    backgroundColor: "#FFFFFF",
  },
  buttonPrimary: {
    marginLeft: 8,
    backgroundColor: "#2196F3",
  },
  buttonDisabled: {
    backgroundColor: "#B0BEC5",
  },
  buttonText: {
    fontSize: 14,
    fontFamily: "PoppinsSemiBold",
  },
  buttonOutlineText: {
    color: "#2196F3",
  },
  buttonPrimaryText: {
    color: "#FFFFFF",
  },
});
