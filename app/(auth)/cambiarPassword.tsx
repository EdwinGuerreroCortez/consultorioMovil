import React, { useEffect, useRef, useState } from "react";
import { View, StyleSheet, Image, Animated, Text } from "react-native";
import { TextInput, Button, Snackbar } from "react-native-paper";
import { useRouter } from "expo-router";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import PasswordStrengthMeterBar from "react-native-password-strength-meter-bar";

export default function CambiarPassword() {
  const router = useRouter();

  // Animaciones
  const cardSlideAnim = useRef(new Animated.Value(500)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Estados
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Errores
  const [tokenError, setTokenError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");

  // Snackbar
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarColor, setSnackbarColor] = useState("#333");

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

  // 🔹 Validaciones en tiempo real
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

  // 🔹 Guardar contraseña
  const handleSubmit = () => {
    if (!token || tokenError || passwordError || confirmPasswordError) {
      setSnackbarMessage("Corrige los errores antes de continuar.");
      setSnackbarColor("#D32F2F");
      setSnackbarVisible(true);
      return;
    }

    // Aquí llamaría al backend (fetch/axios con token y contraseña)
    setSnackbarMessage("Contraseña cambiada con éxito");
    setSnackbarColor("#2E7D32");
    setSnackbarVisible(true);

    setTimeout(() => {
      router.replace("/(auth)/login");
    }, 1500);
  };

  return (
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
            theme={{
              roundness: 12,
              fonts: { regular: { fontFamily: "PoppinsRegular" } },
              colors: { primary: "#002BFF", error: "red", placeholder: "#555" },
            }}
            contentStyle={{
              fontSize: 18,
              fontFamily: "PoppinsRegular",
              color: "#000",
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
            contentStyle={{
              fontSize: 18,
              fontFamily: "PoppinsRegular",
              color: "#000",
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
            contentStyle={{
              fontSize: 18,
              fontFamily: "PoppinsRegular",
              color: "#000",
            }}
          />
          {confirmPasswordError ? (
            <Text style={styles.errorText}>{confirmPasswordError}</Text>
          ) : null}

          {/* Barra de fuerza de contraseña (ahora aquí, debajo de confirmar) */}
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
          >
            Guardar Contraseña
          </Button>
        </KeyboardAwareScrollView>
      </Animated.View>

      {/* Snackbar */}
      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={2500}
        style={{ backgroundColor: snackbarColor }}
      >
        <Text style={{ color: "#fff", fontFamily: "PoppinsSemiBold" }}>
          {snackbarMessage}
        </Text>
      </Snackbar>
    </View>
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
    textAlign: "center",
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
