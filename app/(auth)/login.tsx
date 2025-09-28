import React, { useEffect, useRef } from "react";
import { View, StyleSheet, Image, Animated, Text } from "react-native";
import { Link, useRouter } from "expo-router";
import { TextInput, Button } from "react-native-paper";

export default function LoginScreen() {
  const router = useRouter();

  // Animaciones
  const cardSlideAnim = useRef(new Animated.Value(500)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Estados
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);

  // Errores
  const [emailError, setEmailError] = React.useState("");
  const [passwordError, setPasswordError] = React.useState("");

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

  // Validación de correo
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

  // Validación de contraseña
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
          {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}

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

        {/* Botón */}
        <Animated.View style={{ opacity: fadeAnim, width: "100%" }}>
          <Button
            mode="contained"
            onPress={() => {
              if (!emailError && !passwordError && email && password) {
                router.replace("/(tabs)");
              } else {
                validateEmail(email);
                validatePassword(password);
              }
            }}
            style={styles.button}
            labelStyle={styles.buttonText}
          >
            Iniciar Sesión
          </Button>
        </Animated.View>

        {/* Links centrados */}
        <Animated.View style={[{ opacity: fadeAnim }, styles.linksContainer]}>
          <Link href="/(auth)/recuperar" style={styles.link}>
            ¿Olvidaste tu contraseña?
          </Link>
          <Link href="/(auth)/registroCuenta" style={styles.link}>
            Crear una cuenta
          </Link>
        </Animated.View>
      </Animated.View>
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
    marginVertical: 15,
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
