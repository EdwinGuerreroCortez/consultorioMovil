import React, { useState, useEffect, useRef } from "react";
import {
  View,
  StyleSheet,
  Image,
  Animated,
  Text,
  Platform,
  TouchableOpacity,
} from "react-native";
import { TextInput, Button, Menu, Provider } from "react-native-paper";
import { useRouter } from "expo-router";
import DateTimePicker from "@react-native-community/datetimepicker";
import Icon from "react-native-vector-icons/MaterialIcons";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

export default function RegistroCuenta() {
  const router = useRouter();

  // Animaciones
  const cardSlideAnim = useRef(new Animated.Value(500)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Estados
  const [nombre, setNombre] = useState("");
  const [apellidoPaterno, setApellidoPaterno] = useState("");
  const [apellidoMaterno, setApellidoMaterno] = useState("");
  const [fechaNacimiento, setFechaNacimiento] = useState("");
  const [sexo, setSexo] = useState("");
  const [telefono, setTelefono] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [visibleSexo, setVisibleSexo] = useState(false);
  const [menuKey, setMenuKey] = useState(0);
  const [isFormValid, setIsFormValid] = useState(false);

  // Validar si el formulario es válido
  useEffect(() => {
    const valid =
      !!nombre &&
      !!apellidoPaterno &&
      !!apellidoMaterno &&
      !!fechaNacimiento &&
      !!sexo &&
      /^\d{10}$/.test(telefono) &&
      Object.values(errors).every((err) => err === "");
    setIsFormValid(valid);
  }, [nombre, apellidoPaterno, apellidoMaterno, fechaNacimiento, sexo, telefono, errors]);

  // Animación inicial
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

  // Validaciones
  const validateNombre = (text: string) => {
    const lettersOnly = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]*$/.test(text);
    setNombre(text);
    if (!text) setErrors((p) => ({ ...p, nombre: "El nombre es obligatorio." }));
    else if (text.length < 3) setErrors((p) => ({ ...p, nombre: "Mínimo 3 caracteres." }));
    else if (!lettersOnly) setErrors((p) => ({ ...p, nombre: "Solo letras permitidas." }));
    else setErrors((p) => ({ ...p, nombre: "" }));
  };

  const validateApellidoPaterno = (text: string) => {
    const lettersOnly = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]*$/.test(text);
    setApellidoPaterno(text);
    if (!text) setErrors((p) => ({ ...p, apellidoPaterno: "El apellido paterno es obligatorio." }));
    else if (text.length < 3) setErrors((p) => ({ ...p, apellidoPaterno: "Mínimo 3 caracteres." }));
    else if (!lettersOnly) setErrors((p) => ({ ...p, apellidoPaterno: "Solo letras permitidas." }));
    else setErrors((p) => ({ ...p, apellidoPaterno: "" }));
  };

  const validateApellidoMaterno = (text: string) => {
    const lettersOnly = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]*$/.test(text);
    setApellidoMaterno(text);
    if (!text) setErrors((p) => ({ ...p, apellidoMaterno: "El apellido materno es obligatorio." }));
    else if (text.length < 3) setErrors((p) => ({ ...p, apellidoMaterno: "Mínimo 3 caracteres." }));
    else if (!lettersOnly) setErrors((p) => ({ ...p, apellidoMaterno: "Solo letras permitidas." }));
    else setErrors((p) => ({ ...p, apellidoMaterno: "" }));
  };

  const validateFechaNacimiento = (dateStr: string) => {
    if (!dateStr) {
      setErrors((p) => ({ ...p, fechaNacimiento: "La fecha de nacimiento es obligatoria." }));
      return;
    }
    const birthDate = new Date(dateStr + "T00:00:00");
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) age--;

    setFechaNacimiento(dateStr);
    if (age < 18) {
      setErrors((p) => ({ ...p, fechaNacimiento: "Debes tener al menos 18 años." }));
    } else {
      setErrors((p) => ({ ...p, fechaNacimiento: "" }));
    }
  };

  const validateTelefono = (text: string) => {
    const numbersOnly = /^\d*$/.test(text);
    setTelefono(text);
    if (!text) setErrors((p) => ({ ...p, telefono: "El teléfono es obligatorio." }));
    else if (!numbersOnly) setErrors((p) => ({ ...p, telefono: "Solo números permitidos." }));
    else if (text.length !== 10) setErrors((p) => ({ ...p, telefono: "Debe tener 10 dígitos." }));
    else setErrors((p) => ({ ...p, telefono: "" }));
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      const year = selectedDate.getFullYear();
      const month = String(selectedDate.getMonth() + 1).padStart(2, "0");
      const day = String(selectedDate.getDate()).padStart(2, "0");
      const formatted = `${year}-${month}-${day}`;
      validateFechaNacimiento(formatted);
    }
  };

  const handleSubmit = () => {
    if (validateForm()) {
      router.push({
        pathname: "/(auth)/registroCredenciales",
        params: {
          nombre,
          apellidoPaterno,
          apellidoMaterno,
          fechaNacimiento,
          sexo,
          telefono,
        },
      });
    }
  };

  const validateForm = () => {
    let tempErrors: { [key: string]: string } = {};
    if (!nombre) tempErrors.nombre = "El nombre es obligatorio.";
    if (!apellidoPaterno) tempErrors.apellidoPaterno = "El apellido paterno es obligatorio.";
    if (!apellidoMaterno) tempErrors.apellidoMaterno = "El apellido materno es obligatorio.";
    if (!fechaNacimiento) tempErrors.fechaNacimiento = "La fecha de nacimiento es obligatoria.";
    if (!sexo) tempErrors.sexo = "El sexo es obligatorio.";
    if (!telefono) tempErrors.telefono = "El teléfono es obligatorio.";
    else if (!/^\d{10}$/.test(telefono)) tempErrors.telefono = "Debe tener 10 dígitos.";
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleMenuToggle = () => {
    setVisibleSexo((prev) => {
      const newValue = !prev;
      if (newValue) setMenuKey((prevKey) => prevKey + 1);
      return newValue;
    });
  };

  const commonTheme = (hasError: boolean) => ({
    roundness: 12,
    fonts: { regular: { fontFamily: "PoppinsRegular" } },
    colors: {
      error: "red",
      primary: hasError ? "red" : "#002BFF",
    },
  });

  const commonContentStyle = {
    fontSize: 18,
    paddingVertical: 8,
    color: "#000",
  };

  return (
    <Provider>
      <View style={styles.container}>
        {/* Logo */}
        <Animated.View style={[styles.logoContainer, { opacity: fadeAnim }]}>
          <Image source={require("@/assets/images/Logo.png")} style={styles.logo} />
        </Animated.View>

        {/* Card con KeyboardAwareScrollView */}
        <Animated.View style={[styles.card, { transform: [{ translateY: cardSlideAnim }] }]}>
          <KeyboardAwareScrollView
            style={{ flex: 1, width: "100%" }}
            contentContainerStyle={{ paddingBottom: 40 }}
            enableOnAndroid={true}
            extraScrollHeight={40}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <Animated.Text style={[styles.title, { opacity: fadeAnim, marginBottom: 15 }]}>
              Registro - datos personales
            </Animated.Text>

            {/* Nombre */}
            <View style={styles.inputContainer}>
              <TextInput
                label="Nombre"
                value={nombre}
                onChangeText={validateNombre}
                mode="outlined"
                outlineColor={errors.nombre ? "red" : "#002BFF"}
                activeOutlineColor={errors.nombre ? "red" : "#002BFF"}
                error={!!errors.nombre}
                style={[styles.input, { height: 60 }]}
                contentStyle={commonContentStyle}
                theme={commonTheme(!!errors.nombre)}
                left={<TextInput.Icon icon="account" color="#002BFF" />}
              />
              {errors.nombre ? <Text style={styles.errorText}>{errors.nombre}</Text> : null}
            </View>

            {/* Apellidos */}
            <View style={[styles.doubleInput, styles.inputContainer]}>
              <TextInput
                label="Apellido Pat."
                value={apellidoPaterno}
                onChangeText={validateApellidoPaterno}
                mode="outlined"
                outlineColor={errors.apellidoPaterno ? "red" : "#002BFF"}
                activeOutlineColor={errors.apellidoPaterno ? "red" : "#002BFF"}
                error={!!errors.apellidoPaterno}
                style={[styles.input, styles.halfInput, { height: 60 }]}
                contentStyle={commonContentStyle}
                theme={commonTheme(!!errors.apellidoPaterno)}
                left={<TextInput.Icon icon="account" color="#002BFF" />}
              />
              <TextInput
                label="Apellido Mat."
                value={apellidoMaterno}
                onChangeText={validateApellidoMaterno}
                mode="outlined"
                outlineColor={errors.apellidoMaterno ? "red" : "#002BFF"}
                activeOutlineColor={errors.apellidoMaterno ? "red" : "#002BFF"}
                error={!!errors.apellidoMaterno}
                style={[styles.input, styles.halfInput, { height: 60 }]}
                contentStyle={commonContentStyle}
                theme={commonTheme(!!errors.apellidoMaterno)}
                left={<TextInput.Icon icon="account" color="#002BFF" />}
              />
            </View>
            {errors.apellidoPaterno ? <Text style={styles.errorText}>{errors.apellidoPaterno}</Text> : null}
            {errors.apellidoMaterno ? <Text style={styles.errorText}>{errors.apellidoMaterno}</Text> : null}

            {/* Fecha */}
            <View style={styles.inputContainer}>
              <TextInput
                label="Fecha de Nacimiento"
                value={
                  fechaNacimiento
                    ? new Date(fechaNacimiento + "T00:00:00").toLocaleDateString("es-MX")
                    : ""
                }
                mode="outlined"
                outlineColor={errors.fechaNacimiento ? "red" : "#002BFF"}
                activeOutlineColor={errors.fechaNacimiento ? "red" : "#002BFF"}
                error={!!errors.fechaNacimiento}
                style={[styles.input, { height: 60 }]} // Ajustado para consistencia
                contentStyle={commonContentStyle}
                theme={{
                  ...commonTheme(!!errors.fechaNacimiento),
                  colors: {
                    ...commonTheme(!!errors.fechaNacimiento).colors,
                    text: "#000",
                    placeholder: "#002BFF",
                  },
                }}
                right={
                  <TextInput.Icon
                    icon="calendar"
                    color="#002BFF"
                    onPress={() => setShowDatePicker(true)}
                  />
                }
                editable={false}
              />
              {errors.fechaNacimiento ? <Text style={styles.errorText}>{errors.fechaNacimiento}</Text> : null}
            </View>

            {/* Sexo */}
            <View style={styles.inputContainer}>
              <Menu
                key={`menu-${menuKey}`}
                visible={visibleSexo}
                onDismiss={() => setVisibleSexo(false)}
                anchor={
                  <TouchableOpacity
                    onPress={handleMenuToggle}
                    style={[styles.sexoContainer, { borderColor: errors.sexo ? "red" : "#002BFF" }]}
                    activeOpacity={0.7}
                    accessibilityLabel="Seleccionar sexo"
                  >
                    <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
                      <Icon name="person" size={24} color="#002BFF" />
                      <Text style={styles.sexoText}>{sexo ? sexo : "Selecciona sexo"}</Text>
                    </View>
                    <Icon name="arrow-drop-down" size={24} color="#002BFF" />
                  </TouchableOpacity>
                }
                anchorPosition="bottom"
                contentStyle={{
                  backgroundColor: "#ffffffff",
                  elevation: 4,
                  borderRadius: 8,
                  maxHeight: 200,
                }}
              >
                <Menu.Item
                  onPress={() => {
                    setSexo("femenino");
                    setErrors((p) => ({ ...p, sexo: "" }));
                    setVisibleSexo(false);
                  }}
                  title="Femenino"
                  titleStyle={{ color: "#002BFF" }}
                />
                <Menu.Item
                  onPress={() => {
                    setSexo("masculino");
                    setErrors((p) => ({ ...p, sexo: "" }));
                    setVisibleSexo(false);
                  }}
                  title="Masculino"
                  titleStyle={{ color: "#002BFF" }}
                />
                <Menu.Item
                  onPress={() => {
                    setSexo("Otro");
                    setErrors((p) => ({ ...p, sexo: "" }));
                    setVisibleSexo(false);
                  }}
                  title="No prefiero decir"
                  titleStyle={{ color: "#002BFF" }}
                />
              </Menu>
              {errors.sexo ? <Text style={styles.errorText}>{errors.sexo}</Text> : null}
            </View>

            {/* Teléfono */}
            <View style={styles.inputContainer}>
              <TextInput
                label="Teléfono"
                value={telefono}
                onChangeText={validateTelefono}
                mode="outlined"
                outlineColor={errors.telefono ? "red" : "#002BFF"}
                activeOutlineColor={errors.telefono ? "red" : "#002BFF"}
                error={!!errors.telefono}
                style={[styles.input, { height: 60 }]}
                contentStyle={commonContentStyle}
                theme={commonTheme(!!errors.telefono)}
                keyboardType="numeric"
                left={<TextInput.Icon icon="phone" color="#002BFF" />}
              />
              {errors.telefono ? <Text style={styles.errorText}>{errors.telefono}</Text> : null}
            </View>

            {/* Botones */}
            <View style={styles.buttonContainer}>
              <Button
                mode="outlined"
                onPress={() => router.back()}
                style={styles.atrasButton}
                labelStyle={styles.buttonText}
                icon="arrow-left"
              >
                Atrás
              </Button>
              <Button
                mode="contained"
                onPress={handleSubmit}
                style={[styles.siguienteButton, !isFormValid && { backgroundColor: "#9e9e9e" }]}
                labelStyle={styles.buttonTextContained}
                icon="arrow-right"
                disabled={!isFormValid}
              >
                Siguiente
              </Button>
            </View>
          </KeyboardAwareScrollView>
        </Animated.View>

        {/* DatePicker */}
        {showDatePicker && (
          <DateTimePicker
            value={fechaNacimiento ? new Date(fechaNacimiento + "T00:00:00") : new Date()}
            mode="date"
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onChange={handleDateChange}
            maximumDate={new Date()}
          />
        )}
      </View>
    </Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#002BFF",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  logoContainer: {
    position: "absolute",
    top: "8%",
    alignSelf: "center",
    borderRadius: 60,
    padding: 8,
    elevation: 6,
    zIndex: 10,
  },
  logo: {
    borderRadius: 80,
    width: 120,
    height: 120,
    resizeMode: "contain",
  },
  card: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "75%",
    backgroundColor: "#fff",
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
    padding: 20,
    paddingTop: 40,
    alignItems: "center",
    elevation: 3,
  },
  title: {
    fontSize: 24,
    fontFamily: "PoppinsSemiBold",
    marginBottom: 15,
    textAlign: "center",
  },
  inputContainer: {
    width: "100%",
    marginBottom: 10, // Espaciado uniforme para todos los contenedores de inputs
  },
  input: {
    width: "100%",
    backgroundColor: "#FFFFFF",
  },
  doubleInput: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  halfInput: {
    width: "48%",
  },
  sexoContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#002BFF",
    borderRadius: 12,
    paddingHorizontal: 10,
    height: 60,
    backgroundColor: "#ffffffff",
  },
  sexoText: {
    fontSize: 16,
    color: "#000",
    fontFamily: "PoppinsRegular",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 20,
  },
  atrasButton: {
    borderRadius: 12,
    borderColor: "#002BFF",
    width: "48%",
    height: 50,
    justifyContent: "center",
  },
  siguienteButton: {
    borderRadius: 12,
    backgroundColor: "#002BFF",
    width: "48%",
    height: 50,
    justifyContent: "center",
  },
  buttonText: {
    fontFamily: "PoppinsSemiBold",
    fontSize: 16,
    color: "#002BFF",
  },
  buttonTextContained: {
    fontFamily: "PoppinsSemiBold",
    fontSize: 16,
    color: "#fff",
  },
  errorText: {
    color: "red",
    fontSize: 13,
    fontFamily: "PoppinsRegular",
    textAlign: "center",
    width: "100%",
  },
});