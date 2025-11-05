import React, { useRef, useEffect, useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Alert,
  ScrollView,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

const SERVICES = [
  { id: 1, name: "Limpieza dental" },
  { id: 2, name: "Ortodoncia" },
  { id: 3, name: "Extracción" },
  { id: 4, name: "Revisión general" },
  // aquí luego puedes agregar muchos más, el dropdown será scrollable
];

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

const WEEKEND_HOURS = [
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
];

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

export default function AgendarCita() {
  const cardSlideAnim = useRef(new Animated.Value(500)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [serviceDropdownOpen, setServiceDropdownOpen] = useState(false);

  const [currentMonth, setCurrentMonth] = useState(() => {
    const d = new Date();
    d.setDate(1);
    return d;
  });

  // ⬇ ahora empieza en null
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedHour, setSelectedHour] = useState<string | null>(null);

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

  // matriz del calendario (6 filas x 7 columnas, lunes como inicio)
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

  // horas según día (simulado)
  const hoursForSelectedDate = useMemo(() => {
    if (!selectedDate) return [];
    const day = selectedDate.getDay(); // 0=Domingo, 6=Sábado

    // Días cerrados: domingo (0), jueves (4), viernes (5)
    if (day === 0 || day === 4 || day === 5) return [];

    // Sábado: 9 a 14
    if (day === 6) return WEEKEND_HOURS;

    // Lunes a miércoles: horario normal
    return WEEKDAY_HOURS;
  }, [selectedDate]);

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

  const handleConfirm = () => {
    if (!selectedService || !selectedDate || !selectedHour) {
      Alert.alert(
        "Campos incompletos",
        "Selecciona un servicio, una fecha y una hora para continuar."
      );
      return;
    }

    const fechaTexto = `${selectedDate
      .getDate()
      .toString()
      .padStart(2, "0")}/${(selectedDate.getMonth() + 1)
        .toString()
        .padStart(2, "0")}/${selectedDate.getFullYear()}`;

    Alert.alert(
      "Cita simulada",
      `Servicio: ${selectedService}\nFecha: ${fechaTexto}\nHora: ${selectedHour}`
    );
  };

  const handleBack = () => {
    Alert.alert("Atrás", "Aquí podrías navegar a la pantalla anterior.");
  };

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.card,
          { transform: [{ translateY: cardSlideAnim }], opacity: fadeAnim },
        ]}
      >
        <Text style={styles.title}>Agendar cita</Text>

        {/* Contenido principal */}
        <View style={styles.mainContent}>
          {/* Selección de servicio */}
          <View style={styles.section}>
            <Text style={styles.label}>Selecciona un servicio</Text>

            <View>
              <TouchableOpacity
                style={styles.select}
                onPress={() => setServiceDropdownOpen((prev) => !prev)}
                activeOpacity={0.8}
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

              {serviceDropdownOpen && (
                <View style={styles.dropdown}>
                  {/* Scroll SOLO dentro del desplegable si hay muchos servicios */}
                  <ScrollView
                    style={styles.dropdownScroll}
                    nestedScrollEnabled
                  >
                    {SERVICES.map((s) => (
                      <TouchableOpacity
                        key={s.id}
                        style={styles.dropdownItem}
                        activeOpacity={0.8}
                        onPress={() => {
                          setSelectedService(s.name);
                          setServiceDropdownOpen(false);
                        }}
                      >
                        <Text style={styles.dropdownItemText}>{s.name}</Text>
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
                >
                  <Icon name="chevron-left" size={22} color="#003087" />
                </TouchableOpacity>
                <Text style={styles.calendarHeaderText}>
                  {MONTHS[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                </Text>
                <TouchableOpacity
                  onPress={handleNextMonth}
                  style={styles.monthArrow}
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
                          setSelectedDate(date);
                          setSelectedHour(null);
                        }}
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
                {/* ⬇ Lógica actualizada */}
                {!selectedDate ? (
                  <Text style={styles.noHoursText}>
                    Selecciona una fecha para ver horarios.
                  </Text>
                ) : hoursForSelectedDate.length === 0 ? (
                  <Text style={styles.noHoursText}>
                    No hay citas disponibles este día.
                  </Text>
                ) : (
                  hoursForSelectedDate.map((h) => (
                    <TouchableOpacity
                      key={h}
                      style={[
                        styles.hourButton,
                        selectedHour === h && styles.hourButtonSelected,
                      ]}
                      activeOpacity={0.8}
                      onPress={() => setSelectedHour(h)}
                    >
                      <Text
                        style={[
                          styles.hourText,
                          selectedHour === h && styles.hourTextSelected,
                        ]}
                      >
                        {h}
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
                (!selectedService || !selectedDate || !selectedHour) &&
                styles.buttonDisabled,
              ]}
              activeOpacity={0.8}
              onPress={handleConfirm}
              disabled={!selectedService || !selectedDate || !selectedHour}
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
  title: {
    fontSize: 24,
    fontFamily: "PoppinsSemiBold",
    marginBottom: 15,
    color: "#000",
    textAlign: "left",
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
    maxHeight: 200, // scroll si hay muchos servicios
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
    maxHeight: 260, // solo la columna de horas tiene scroll
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
  hourText: {
    fontSize: 14,
    color: "#2196F3",
    fontFamily: "PoppinsRegular",
  },
  hourTextSelected: {
    color: "#FFFFFF",
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
