import React, { useEffect, useRef, useState } from "react";
import { View, StyleSheet, Image, Animated, Text } from "react-native";
import { TextInput, Button, Snackbar, Provider } from "react-native-paper";
import { useRouter } from "expo-router";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import PasswordStrengthMeterBar from "@/components/PasswordStrengthBar";
import { useApi } from "@/hooks/useApi";

export default function CambiarPassword() {
  const router = useRouter();
  const { fetchWithCsrf } = useApi();

  // Animaciones
  const cardSlideAnim = useRef(new Animated.Value(500)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Estados
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Errores
  const [tokenError, setTokenError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");

  // Snackbar
  const [alert, setAlert] = useState({
    visible: false,
    message: "",
    severity: "" as "success" | "error" | "",
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

  // Validaciones
  const validateToken = (text: string) => {
    setToken(text);
    if (!text) setTokenError("El token es obligatorio.");
    else setTokenError("");
  };

  const validatePassword = (text: string) => {
    setPassword(text);
    const regex =
      /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&.#_-]).{8,}$/;
    if (!text) setPasswordError("La contraseña es obligatoria.");
    else if (!regex.test(text))
      setPasswordError(
        "Debe tener 8 caracteres, mayúscula, número y símbolo."
      );
    else setPasswordError("");
  };

  const validateConfirmPassword = (text: string) => {
    setConfirmPassword(text);
    if (!text) setConfirmPasswordError("Confirma tu contraseña.");
    else if (text !== password)
      setConfirmPasswordError("Las contraseñas no coinciden.");
    else setConfirmPasswordError("");
  };

  // Guardar contraseña con CSRF
  const handleSubmit = async () => {
    if (!token || tokenError || passwordError || confirmPasswordError) {
      setAlert({
        visible: true,
        message: "Corrige los errores antes de continuar.",
        severity: "error",
      });
      return;
    }

    try {
      setLoading(true);

      const payload = { token, nuevaPassword: password };

      const { ok, status, data } = await fetchWithCsrf(
        "/api/usuarios/cambiar-password",
        {
          method: "POST",
          body: JSON.stringify(payload),
        }
      );

      console.log("Respuesta cambiar:", { ok, status, data });

      if (ok) {
        setAlert({
          visible: true,
          message: data?.mensaje || "Contraseña cambiada con éxito",
          severity: "success",
        });
        setTimeout(() => router.replace("/(auth)/login"), 2000);
      } else {
        let msg = "Error al cambiar la contraseña.";
        if (status === 400) msg = data?.mensaje || "Token inválido o expirado.";
        else if (status === 409)
          msg = data?.mensaje || "Esta contraseña ya fue usada.";
        else if (status === 500)
          msg = "Error del servidor. Intenta más tarde.";

        setAlert({
          visible: true,
          message: msg,
          severity: "error",
        });
      }
    } catch (err) {
      console.error(" Error en cambio:", err);
      setAlert({
        visible: true,
        message: "Error de conexión. Intenta más tarde.",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Provider>
      <View style={styles.container}>
        {/* Logo */}
        <Animated.View style={[styles.logoContainer, { opacity: fadeAnim }]}>
          <Image
            source={require("@/assets/images/Logo.png")}
            style={styles.logo}
          />
        </Animated.View>

        {/* Card */}
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
            <Animated.Text style={[styles.title, { opacity: fadeAnim }]}>
              Cambiar Contraseña
            </Animated.Text>

            <Text style={styles.subtitle}>
              Ingresa el token recibido por correo y tu nueva contraseña
            </Text>

            {/* Token */}
            <TextInput
              label="Token"
              value={token}
              onChangeText={validateToken}
              mode="outlined"
              outlineColor={tokenError ? "red" : "#002BFF"}
              activeOutlineColor={tokenError ? "red" : "#002BFF"}
              style={styles.input}
              error={!!tokenError}
              textColor="#000"
              left={<TextInput.Icon icon="key" color="#002BFF" />}
              theme={{
                roundness: 12,
                fonts: { regular: { fontFamily: "PoppinsRegular" } },
                colors: { primary: "#002BFF", error: "red", placeholder: "#555" },
              }}
            />
            {tokenError ? (
              <Text style={styles.errorText}>{tokenError}</Text>
            ) : null}

            {/* Nueva contraseña */}
            <TextInput
              label="Nueva contraseña"
              value={password}
              onChangeText={validatePassword}
              secureTextEntry={!showPassword}
              mode="outlined"
              outlineColor={passwordError ? "red" : "#002BFF"}
              activeOutlineColor={passwordError ? "red" : "#002BFF"}
              style={styles.input}
              error={!!passwordError}
              textColor="#000"
              left={<TextInput.Icon icon="lock" color="#002BFF" />}
              right={
                <TextInput.Icon
                  icon={showPassword ? "eye-off" : "eye"}
                  onPress={() => setShowPassword(!showPassword)}
                  forceTextInputFocus={false}

                />
              }
              theme={{
                roundness: 12,
                fonts: { regular: { fontFamily: "PoppinsRegular" } },
                colors: { primary: "#002BFF", error: "red", placeholder: "#555" },
              }}
            />
            {passwordError ? (
              <Text style={styles.errorText}>{passwordError}</Text>
            ) : null}

            {/* Confirmar contraseña */}
            <TextInput
              label="Confirmar contraseña"
              value={confirmPassword}
              onChangeText={validateConfirmPassword}
              secureTextEntry={!showPassword}
              mode="outlined"
              outlineColor={confirmPasswordError ? "red" : "#002BFF"}
              activeOutlineColor={confirmPasswordError ? "red" : "#002BFF"}
              style={styles.input}
              error={!!confirmPasswordError}
              textColor="#000"
              left={<TextInput.Icon icon="lock-check" color="#002BFF" />}
              right={
                <TextInput.Icon
                  icon={showPassword ? "eye-off" : "eye"}
                  onPress={() => setShowPassword(!showPassword)}
                  forceTextInputFocus={false}

                />
              }
              theme={{
                roundness: 12,
                fonts: { regular: { fontFamily: "PoppinsRegular" } },
                colors: { primary: "#002BFF", error: "red", placeholder: "#555" },
              }}
            />
            {confirmPasswordError ? (
              <Text style={styles.errorText}>{confirmPasswordError}</Text>
            ) : null}

            {/* Barra fuerza de contraseña */}
            {password ? (
              <PasswordStrengthMeterBar
                password={password}
                showLabel
                labelVisible
                barWidthPercent={90}
                levels={[
                  { label: "Débil", labelColor: "red", activeBarColor: "red" },
                  {
                    label: "Medio",
                    labelColor: "orange",
                    activeBarColor: "orange",
                  },
                  {
                    label: "Fuerte",
                    labelColor: "green",
                    activeBarColor: "green",
                  },
                ]}
              />
            ) : null}

            {/* Botón */}
            <Button
              mode="contained"
              style={styles.button}
              labelStyle={styles.buttonText}
              onPress={handleSubmit}
              loading={loading}
              disabled={loading}
            >
              {loading ? "Guardando..." : "Guardar Contraseña"}
            </Button>
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
                ? "#4CAF50"
                : alert.severity === "error"
                  ? "#F44336"
                  : "#333",
          }}
          action={{
            label: "OK",
            textColor: "#fff",
            onPress: () => setAlert({ ...alert, visible: false }),
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
    backgroundColor: "#0901F5",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
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
    padding: 25,
    paddingTop: 70,
    elevation: 3,
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
  title: {
    fontSize: 24,
    fontFamily: "PoppinsSemiBold",
    marginBottom: 15,
    textAlign: "center",
    color: "#000",
  },
  subtitle: {
    fontSize: 14,
    textAlign: "left",
    marginBottom: 20,
    fontFamily: "PoppinsRegular",
    color: "#333",
  },
  input: {
    marginBottom: 10,
    backgroundColor: "#FFFFFF",
    width: "100%",
    height: 60,
  },
  button: {
    marginVertical: 20,
    borderRadius: 12,
    backgroundColor: "#002BFF",
    height: 55,
    justifyContent: "center",
    width: "100%",
  },
  buttonText: {
    fontFamily: "PoppinsSemiBold",
    fontSize: 16,
    color: "#fff",
  },
  errorText: {
    color: "red",
    fontSize: 13,
    marginBottom: 5,
    fontFamily: "PoppinsRegular",
    textAlign: "left",
    width: "100%",
  },
});
