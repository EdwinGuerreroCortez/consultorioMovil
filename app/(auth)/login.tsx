// app/(auth)/login.tsx  (o donde tengas tu pantalla de login)

import React, { useEffect, useRef, useState } from "react";
import { View, StyleSheet, Image, Animated, Text } from "react-native";
import { Link, useRouter } from "expo-router";
import { TextInput, Button, Snackbar } from "react-native-paper";
import { guardarToken, verificarSesion } from "@/services/authService";

import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  const router = useRouter();

  // Animaciones
  const cardSlideAnim = useRef(new Animated.Value(500)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Estados
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Errores
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  // Snackbar
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarColor, setSnackbarColor] = useState("#333");

  // Google
  const [loadingGoogle, setLoadingGoogle] = useState(false);

  // ⚠️ IMPORTANTE: expoClientId para Expo Go, androidClientId para APK
  const [request, response, promptAsync] = Google.useAuthRequest({
    expoClientId:
      "1031243738046-j91te9093iehmlamfm4sipghk2dn80qt.apps.googleusercontent.com",
    androidClientId:
      "1031243738046-kud901kc7d15ilcnqopvrm0mfq7fkv3r.apps.googleusercontent.com",
    scopes: ["profile", "email"],
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

  // Validación email
  const validateEmail = (text: string) => {
    setEmail(text);
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!text) {
      setEmailError("El correo es obligatorio.");
    } else if (!regex.test(text)) {
      setEmailError("Ingresa un correo válido.");
    } else {
      setEmailError("");
    }
  };

  // Validación contraseña
  const validatePassword = (text: string) => {
    setPassword(text);
    if (!text) {
      setPasswordError("La contraseña es obligatoria.");
    } else if (text.length < 3) {
      setPasswordError("Debe tener al menos 3 caracteres.");
    } else {
      setPasswordError("");
    }
  };

  const showSnackbar = (message: string, color: string = "#333") => {
    setSnackbarMessage(message);
    setSnackbarColor(color);
    setSnackbarVisible(true);
  };

  // Login normal (correo / contraseña)
  const handleLogin = async () => {
    if (!email) setEmailError("El correo es obligatorio.");
    if (!password) setPasswordError("La contraseña es obligatoria.");
    if (emailError || passwordError || !email || !password) return;

    try {
      const resp = await fetch(
        "https://backenddent.onrender.com/api/usuarios/login-movil",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        }
      );

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        showSnackbar(err.mensaje || "Credenciales inválidas", "#D32F2F");
        return;
      }

      const data = await resp.json();

      if (!data.token) {
        showSnackbar("El servidor no devolvió token", "#D32F2F");
        return;
      }

      await guardarToken(data.token);

      const usuario = await verificarSesion();
      if (usuario) {
        showSnackbar("Inicio de sesión exitoso", "#2E7D32");
        setTimeout(() => {
          router.replace("/(tabs)");
        }, 1200);
      } else {
        showSnackbar("No se pudo verificar la sesión", "#D32F2F");
      }
    } catch (e) {
      console.error("Error login:", e);
      showSnackbar("No se pudo conectar con el servidor", "#D32F2F");
    }
  };

  // Login con Google
  useEffect(() => {
    const manejarRespuestaGoogle = async () => {
      if (!response || response.type !== "success") return;

      try {
        setLoadingGoogle(true);

        const accessToken = response.authentication?.accessToken;
        if (!accessToken) {
          showSnackbar("No se obtuvo el token de Google", "#D32F2F");
          return;
        }

        // Obtener datos básicos del usuario desde Google
        const userInfoResp = await fetch(
          "https://www.googleapis.com/userinfo/v2/me",
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        if (!userInfoResp.ok) {
          showSnackbar(
            "No se pudo obtener la información de Google",
            "#D32F2F"
          );
          return;
        }

        const userInfo = await userInfoResp.json();

        // Llamar a tu backend
        const resp = await fetch(
          "https://backenddent.onrender.com/api/usuarios/login-google-movil",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: userInfo.email,
              nombreCompleto: userInfo.name,
            }),
          }
        );

        const data = await resp.json().catch(() => ({}));

        if (!resp.ok) {
          showSnackbar(
            data.mensaje || "No se pudo iniciar sesión con Google",
            "#D32F2F"
          );
          return;
        }

        if (!data.token) {
          showSnackbar("El servidor no devolvió token", "#D32F2F");
          return;
        }

        await guardarToken(data.token);

        const usuario = await verificarSesion();
        if (usuario) {
          showSnackbar("Inicio de sesión con Google exitoso", "#2E7D32");
          setTimeout(() => {
            router.replace("/(tabs)");
          }, 1200);
        } else {
          showSnackbar("No se pudo verificar la sesión", "#D32F2F");
        }
      } catch (error) {
        console.error("Error Google login:", error);
        showSnackbar(
          "Ocurrió un error al iniciar sesión con Google",
          "#D32F2F"
        );
      } finally {
        setLoadingGoogle(false);
      }
    };

    manejarRespuestaGoogle();
  }, [response]);

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
        <Animated.Text style={[styles.title, { opacity: fadeAnim }]}>
          Iniciar Sesión
        </Animated.Text>

        {/* Inputs */}
        <Animated.View style={{ opacity: fadeAnim, width: "100%" }}>
          <TextInput
            label="Correo electrónico"
            value={email}
            onChangeText={validateEmail}
            mode="outlined"
            outlineColor={emailError ? "red" : "#002BFF"}
            activeOutlineColor={emailError ? "red" : "#002BFF"}
            error={!!emailError}
            style={[styles.input, { height: 60 }]}
            contentStyle={{
              fontSize: 18,
              paddingVertical: 10,
              color: "#000",
            }}
            theme={{
              roundness: 12,
              fonts: { regular: { fontFamily: "PoppinsRegular" } },
              colors: {
                error: "red",
                primary: emailError ? "red" : "#002BFF",
              },
            }}
          />
          {emailError ? (
            <Text style={styles.errorText}>{emailError}</Text>
          ) : null}

          <TextInput
            label="Contraseña"
            value={password}
            onChangeText={validatePassword}
            secureTextEntry={!showPassword}
            mode="outlined"
            outlineColor={passwordError ? "red" : "#0901F5"}
            activeOutlineColor={passwordError ? "red" : "#0901F5"}
            error={!!passwordError}
            style={[styles.input, { height: 60 }]}
            contentStyle={{
              fontSize: 18,
              paddingVertical: 10,
              color: "#000",
            }}
            theme={{
              roundness: 12,
              fonts: { regular: { fontFamily: "PoppinsRegular" } },
              colors: {
                error: "red",
                primary: passwordError ? "red" : "#0901F5",
              },
            }}
            right={
              <TextInput.Icon
                icon={showPassword ? "eye-off" : "eye"}
                onPress={() => setShowPassword(!showPassword)}
                forceTextInputFocus={false}
              />
            }
          />
          {passwordError ? (
            <Text style={styles.errorText}>{passwordError}</Text>
          ) : null}
        </Animated.View>

        {/* Botón correo/contraseña */}
        <Animated.View style={{ opacity: fadeAnim, width: "100%" }}>
          <Button
            mode="contained"
            onPress={handleLogin}
            style={styles.button}
            labelStyle={styles.buttonText}
          >
            The Iniciar Sesión
          </Button>
        </Animated.View>

        {/* Botón Google */}
        <Animated.View style={{ opacity: fadeAnim, width: "100%" }}>
          <Button
            mode="outlined"
            onPress={() => {
              if (!request) {
                showSnackbar(
                  "Google aún no está listo, intenta de nuevo.",
                  "#D32F2F"
                );
                return;
              }
              promptAsync();
            }}
            style={[
              styles.button,
              { backgroundColor: "#fff", borderColor: "#4285F4" },
            ]}
            labelStyle={[styles.buttonText, { color: "#4285F4" }]}
            disabled={loadingGoogle}
          >
            {loadingGoogle
              ? "Conectando con Google..."
              : "Continuar con Google"}
          </Button>
        </Animated.View>

        {/* Links */}
        <Animated.View style={[{ opacity: fadeAnim }, styles.linksContainer]}>
          <Link href="/(auth)/recuperar" style={styles.link}>
            ¿Olvidaste tu contraseña?
          </Link>
          <Link href="/(auth)/registroCuenta" style={styles.link}>
            Crear una cuenta
          </Link>
        </Animated.View>
      </Animated.View>

      {/* Snackbar */}
      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={2000}
        style={{ backgroundColor: snackbarColor }}
        action={{
          label: "OK",
          textColor: "#fff",
          onPress: () => setSnackbarVisible(false),
        }}
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
    padding: 20,
    paddingTop: 70,
    alignItems: "center",
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
    marginBottom: 25,
    textAlign: "center",
  },
  input: {
    marginBottom: 10,
    backgroundColor: "#FFFFFF",
  },
  button: {
    marginVertical: 8,
    borderRadius: 12,
    backgroundColor: "#002BFF",
    height: 60,
    justifyContent: "center",
  },
  buttonText: {
    fontFamily: "PoppinsSemiBold",
    fontSize: 16,
    color: "#fff",
  },
  linksContainer: {
    marginTop: 5,
    alignItems: "center",
  },
  link: {
    color: "#002BFF",
    fontSize: 14,
    padding: 5,
    fontFamily: "PoppinsRegular",
    textAlign: "center",
  },
  errorText: {
    color: "red",
    fontSize: 13,
    marginBottom: 5,
    fontFamily: "PoppinsRegular",
  },
});
