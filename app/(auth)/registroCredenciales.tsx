import React, { useState, useEffect, useRef } from "react";
import {
  View,
  StyleSheet,
  Image,
  Animated,
  Text,
} from "react-native";
import { TextInput, Button, Provider, Snackbar } from "react-native-paper";
import { useRouter, useLocalSearchParams } from "expo-router";
import PasswordStrengthMeterBar from "react-native-password-strength-meter-bar";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view"; 
import { useApi } from "@/hooks/useApi";

export default function RegistroCredenciales() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { fetchWithCsrf } = useApi();

  // Animaciones
  const cardSlideAnim = useRef(new Animated.Value(500)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Estados
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isFormValid, setIsFormValid] = useState(false);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({
    visible: false,
    message: "",
    severity: "",
  });

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

  // Validaciones en tiempo real
  useEffect(() => {
    const valid =
      !!correo &&
      !!password &&
      !!confirmPassword &&
      Object.values(errors).every((err) => err === "");
    setIsFormValid(valid);
  }, [correo, password, confirmPassword, errors]);

  // Validar correo
  const validateCorreo = (text: string) => {
    setCorreo(text);
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!text)
      setErrors((p) => ({ ...p, correo: "El correo es obligatorio." }));
    else if (!regex.test(text))
      setErrors((p) => ({ ...p, correo: "Formato de correo inválido." }));
    else setErrors((p) => ({ ...p, correo: "" }));
  };

  // Validar contraseña
  const validatePassword = (text: string) => {
    setPassword(text);
    const regex =
      /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&.#_-]).{8,}$/;
    if (!text)
      setErrors((p) => ({ ...p, password: "La contraseña es obligatoria." }));
    else if (!regex.test(text))
      setErrors((p) => ({
        ...p,
        password: "Debe tener 8 caracteres, mayúscula, número y símbolo.",
      }));
    else setErrors((p) => ({ ...p, password: "" }));
  };

  // Validar confirmación
  const validateConfirmPassword = (text: string) => {
    setConfirmPassword(text);
    if (!text)
      setErrors((p) => ({
        ...p,
        confirmPassword: "Confirma tu contraseña.",
      }));
    else if (text !== password)
      setErrors((p) => ({ ...p, confirmPassword: "No coinciden." }));
    else setErrors((p) => ({ ...p, confirmPassword: "" }));
  };

  // Enviar al backend
  const handleSubmit = async () => {
    try {
      setLoading(true);

      const payload = {
        nombre: params.nombre,
        apellido_paterno: params.apellidoPaterno,
        apellido_materno: params.apellidoMaterno,
        fecha_nacimiento: params.fechaNacimiento,
        sexo: params.sexo,
        telefono: params.telefono,
        email: correo,
        password,
        repetir_password: password,
      };

      console.log("📤 Enviando datos al backend:", payload);

      const { ok, status, data } = await fetchWithCsrf(
        "/api/usuarios/registrar",
        {
          method: "POST",
          body: JSON.stringify(payload),
        }
      );

      console.log("Respuesta del backend:", { ok, status, data });

      if (ok) {
        setAlert({
          visible: true,
          message: "Registro exitoso. Revisa tu correo de verificación.",
          severity: "success",
        });

        setTimeout(() => {
          router.push({
            pathname: "/(auth)/registroVerificacion",
            params: { email: correo },
          });
        }, 2000);
      } else {
        let errorMessage = "Error al registrar. Intenta de nuevo.";

        if (status === 400 || status === 409) {
          if (data?.mensaje?.toLowerCase().includes("correo")) {
            errorMessage = "Este correo ya está registrado.";
          } else if (data?.mensaje?.toLowerCase().includes("teléfono")) {
            errorMessage = "Este número ya está registrado.";
          } else if (data?.mensaje?.toLowerCase().includes("csrf")) {
            errorMessage = "Token de seguridad inválido. Refresca la app.";
          } else if (Array.isArray(data?.errores)) {
            errorMessage = data.errores.join("\n");
          } else {
            errorMessage = data?.mensaje || errorMessage;
          }
        }

        setAlert({
          visible: true,
          message: errorMessage,
          severity: "error",
        });
      }
    } catch (err: any) {
      console.error("Error en registro:", err);
      setAlert({
        visible: true,
        message: "Error de conexión. Intenta más tarde.",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  // 🎨 Tema común
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
    paddingVertical: 10,
    color: "#000",
  };

  // 🔹 Función para color dinámico de íconos
  const getIconColor = (error: string, value: string) => {
    if (error) return "red";
    if (value !== "") return "#002BFF";
    return "#9e9e9e";
  };

  return (
    <Provider>
      <View style={styles.container}>
        {/* Logo */}
        <Animated.View
          style={[styles.logoContainer, { opacity: fadeAnim }]}
        >
          <Image
            source={require("@/assets/images/Logo.png")}
            style={styles.logo}
          />
        </Animated.View>

        {/* Card con KeyboardAwareScrollView */}
        <Animated.View
          style={[styles.card, { transform: [{ translateY: cardSlideAnim }] }]}
        >
          <KeyboardAwareScrollView
            style={{ flex: 1, width: "100%" }}
            contentContainerStyle={{ paddingBottom: 40 }}
            enableOnAndroid={true}
            extraScrollHeight={40}
            keyboardShouldPersistTaps="handled"
          >
            <Animated.Text
              style={[styles.title, { opacity: fadeAnim }]}
            >
              Registro - Cuenta
            </Animated.Text>

            {/* Correo */}
            <TextInput
              label="Correo electrónico"
              value={correo}
              onChangeText={validateCorreo}
              mode="outlined"
              keyboardType="email-address"
              autoCapitalize="none"
              outlineColor={errors.correo ? "red" : correo !== "" ? "#002BFF" : "#9e9e9e"}
              activeOutlineColor={errors.correo ? "red" : "#002BFF"}
              error={!!errors.correo}
              style={styles.input}
              contentStyle={commonContentStyle}
              theme={commonTheme(!!errors.correo)}
              left={<TextInput.Icon icon="email" color={getIconColor(errors.correo, correo)} />}
            />
            {errors.correo ? <Text style={styles.errorText}>{errors.correo}</Text> : null}

            {/* Contraseña */}
            <TextInput
              label="Contraseña"
              value={password}
              onChangeText={validatePassword}
              mode="outlined"
              secureTextEntry={!showPassword}
              outlineColor={errors.password ? "red" : password !== "" ? "#002BFF" : "#9e9e9e"}
              activeOutlineColor={errors.password ? "red" : "#002BFF"}
              error={!!errors.password}
              style={styles.input}
              contentStyle={commonContentStyle}
              theme={commonTheme(!!errors.password)}
              left={<TextInput.Icon icon="lock" color={getIconColor(errors.password, password)} />}
              right={
                <TextInput.Icon
                  icon={showPassword ? "eye-off" : "eye"}
                  onPress={() => setShowPassword(!showPassword)}
                  color={getIconColor(errors.password, password)}
                />
              }
            />
            {errors.password ? <Text style={styles.errorText}>{errors.password}</Text> : null}

            {/* Confirmar contraseña */}
            <TextInput
              label="Confirmar contraseña"
              value={confirmPassword}
              onChangeText={validateConfirmPassword}
              mode="outlined"
              secureTextEntry={!showConfirmPassword}
              outlineColor={errors.confirmPassword ? "red" : confirmPassword !== "" ? "#002BFF" : "#9e9e9e"}
              activeOutlineColor={errors.confirmPassword ? "red" : "#002BFF"}
              error={!!errors.confirmPassword}
              style={styles.input}
              contentStyle={commonContentStyle}
              theme={commonTheme(!!errors.confirmPassword)}
              left={<TextInput.Icon icon="lock-check" color={getIconColor(errors.confirmPassword, confirmPassword)} />}
              right={
                <TextInput.Icon
                  icon={showConfirmPassword ? "eye-off" : "eye"}
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  color={getIconColor(errors.confirmPassword, confirmPassword)}
                />
              }
            />
            {errors.confirmPassword ? <Text style={styles.errorText}>{errors.confirmPassword}</Text> : null}

            {/* Barra de fuerza */}
            {password ? (
              <PasswordStrengthMeterBar
                password={password}
                showLabel
                labelVisible
                barWidthPercent={90}
                levels={[
                  { label: "Débil", labelColor: "red", activeBarColor: "red" },
                  { label: "Medio", labelColor: "orange", activeBarColor: "orange" },
                  { label: "Fuerte", labelColor: "green", activeBarColor: "green" },
                ]}
              />
            ) : null}

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
                loading={loading}
                disabled={!isFormValid || loading}
                style={[
                  styles.siguienteButton,
                  (!isFormValid || loading) && { backgroundColor: "#9e9e9e" },
                ]}
                labelStyle={styles.buttonTextContained}
                icon="arrow-right"
              >
                Siguiente
              </Button>
            </View>
          </KeyboardAwareScrollView>
        </Animated.View>

        {/* Snackbar */}
        <Snackbar
          visible={alert.visible}
          onDismiss={() => setAlert({ ...alert, visible: false })}
          duration={4000}
          style={{
            backgroundColor:
              alert.severity === "success"
                ? "green"
                : alert.message.includes("registrado")
                ? "orange"
                : "red",
          }}
        >
          <Text style={{ color: "#fff", fontFamily: "PoppinsSemiBold" }}>
            {alert.message}
          </Text>
        </Snackbar>
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
  input: {
    marginBottom: 10,
    backgroundColor: "#FFFFFF",
    height: 60,
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
    marginBottom: 5,
    fontFamily: "PoppinsRegular",
    textAlign: "center",
    width: "100%",
  },
});
