import React, { useEffect, useRef, useState } from "react";
import { View, StyleSheet, Image, Animated, Text } from "react-native";
import { TextInput, Button, Snackbar } from "react-native-paper";
import { Link, useRouter } from "expo-router";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

export default function Recuperar() {
  const router = useRouter();

  // Animaciones
  const cardSlideAnim = useRef(new Animated.Value(500)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Estados
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
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

  // 🔹 Validación en tiempo real
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

  // 🔹 Mostrar alerta
  const showSnackbar = (message: string, color: string = "#333") => {
    setSnackbarMessage(message);
    setSnackbarColor(color);
    setSnackbarVisible(true);
  };

  // 🔹 Acción al presionar "Enviar instrucciones"
  const handleSend = () => {
    if (!email || emailError) {
      setEmailError("Ingresa un correo válido.");
      showSnackbar("Correo inválido, revisa el formato.", "#D32F2F"); //  error
      return;
    }

    // 🔹 Aquí en el futuro irá la llamada al backend
    // por ahora simulamos éxito:
    showSnackbar("Se enviaron las instrucciones a tu correo.", "#2E7D32"); //  éxito

    // Ejemplo: luego podrías navegar
    setTimeout(() => {
      router.push("/(auth)/cambiarPassword");
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
          contentContainerStyle={{ flexGrow: 1 }}
          enableOnAndroid={true}
          extraScrollHeight={40}
          keyboardShouldPersistTaps="handled"
        >
          {/* Título */}
          <Animated.Text style={[styles.title, { opacity: fadeAnim }]}>
            Recuperar Contraseña
          </Animated.Text>

          {/* Subtítulo */}
          <Text style={styles.subtitle}>
            Introduce el correo electrónico de la cuenta que deseas recuperar
          </Text>

          {/* Input con validación */}
          <TextInput
            label="Correo electrónico"
            value={email}
            onChangeText={validateEmail}
            mode="outlined"
            outlineColor={emailError ? "red" : "#002BFF"}
            activeOutlineColor={emailError ? "red" : "#002BFF"}
            style={styles.input}
            left={<TextInput.Icon icon="email" color="#002BFF" />}
            error={!!emailError}
            textColor="#000"
            theme={{
              roundness: 12,
              fonts: { regular: { fontFamily: "PoppinsRegular" } },
              colors: {
                primary: "#002BFF",
                placeholder: "#555",
                error: "red",
              },
            }}
            contentStyle={{
              fontSize: 18,
              fontFamily: "PoppinsRegular",
              color: "#000",
            }}
          />

          {/* Error debajo del input */}
          {emailError ? (
            <Text style={styles.errorText}>{emailError}</Text>
          ) : null}

          {/* Botón */}
          <Button
            mode="contained"
            style={styles.button}
            labelStyle={styles.buttonText}
            onPress={handleSend}
          >
            Enviar instrucciones
          </Button>

          {/* Link */}
          <Link href="/(auth)/login" style={styles.link}>
            ¿Ya tienes una cuenta?
          </Link>
        </KeyboardAwareScrollView>
      </Animated.View>

      {/* Snackbar */}
      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={2500}
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
    width: "100%",
  },
  input: {
    marginBottom: 10,
    backgroundColor: "#FFFFFF",
    width: "100%",
    height: 60,
  },
  button: {
    marginVertical: 15,
    borderRadius: 12,
    backgroundColor: "#002BFF",
    height: 60,
    justifyContent: "center",
    width: "100%",
  },
  buttonText: {
    fontFamily: "PoppinsSemiBold",
    fontSize: 16,
    color: "#fff",
  },
  link: {
    color: "#002BFF",
    fontSize: 14,
    marginTop: 10,
    fontFamily: "PoppinsRegular",
    textAlign: "center",
  },
  errorText: {
    color: "red",
    fontSize: 13,
    marginBottom: 10,
    fontFamily: "PoppinsRegular",
  },
});
