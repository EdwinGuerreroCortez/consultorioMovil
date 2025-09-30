import React, { useState, useEffect, useRef } from "react";
import {
  View,
  StyleSheet,
  Image,
  Animated,
  Text,
  TextInput,
  NativeSyntheticEvent,
  TextInputKeyPressEventData,
} from "react-native";
import { Button, Provider, Snackbar } from "react-native-paper";
import { useRouter, useLocalSearchParams } from "expo-router";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useApi } from "@/hooks/useApi";

export default function RegistroVerificacion() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { fetchWithCsrf } = useApi();

  const cardSlideAnim = useRef(new Animated.Value(500)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const [codigo, setCodigo] = useState(Array(8).fill(""));
  const [isFormValid, setIsFormValid] = useState(false);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ visible: false, message: "", severity: "" });
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);

  const inputsRef = useRef<TextInput[]>([]);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(cardSlideAnim, { toValue: 0, duration: 800, useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
    ]).start();
  }, []);
useEffect(() => {
  console.log(" Params recibidos en RegistroVerificacion:", params);
}, [params]);

  useEffect(() => {
    setIsFormValid(codigo.every((c) => c !== ""));
  }, [codigo]);

  const handleChange = (text: string, index: number) => {
    const newCode = [...codigo];
    newCode[index] = text.slice(-1);
    setCodigo(newCode);

    if (text && index < codigo.length - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (
    e: NativeSyntheticEvent<TextInputKeyPressEventData>,
    index: number
  ) => {
    if (e.nativeEvent.key === "Backspace" && codigo[index] === "" && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

const handleSubmit = async () => {
  if (!isFormValid) return;

  const payload = { email: params.email, codigo: codigo.join("") };

  try {
    setLoading(true);

    console.log("Enviando datos al backend:", {
      url: "http://localhost:4000/api/usuarios/verificar",
      payload,
    });

    const { ok, status, data } = await fetchWithCsrf("/api/usuarios/verificar", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    console.log("Respuesta del backend:", { ok, status, data });

    if (ok) {
      setAlert({
        visible: true,
        message: " Verificación exitosa. Ya puedes iniciar sesión.",
        severity: "success",
      });
      setTimeout(() => router.push("/(auth)/login"), 2000);
    } else if (status === 400 || status === 401) {
      setAlert({
        visible: true,
        message: data?.message || "Código incorrecto, revisa tu correo.",
        severity: "error",
      });
    } else {
      setAlert({
        visible: true,
        message: "Error al verificar el código. Intenta de nuevo.",
        severity: "error",
      });
    }
  } catch (err) {
    console.error("Error inesperado:", err);
    setAlert({
      visible: true,
      message: "Error de conexión. Intenta de nuevo.",
      severity: "error",
    });
  } finally {
    setLoading(false);
  }
};



  return (
    <Provider>
      <View style={styles.container}>
        {focusedIndex !== null && <View style={styles.overlay} />}

        <Animated.View style={[styles.logoContainer, { opacity: fadeAnim }]}>
          <Image source={require("@/assets/images/Logo.png")} style={styles.logo} />
        </Animated.View>

        <Animated.View style={[styles.card, { transform: [{ translateY: cardSlideAnim }] }]}>
          <KeyboardAwareScrollView
            contentContainerStyle={{ flexGrow: 1, alignItems: "center" }}
            enableOnAndroid={true}
            extraScrollHeight={40}
            keyboardShouldPersistTaps="handled"
          >
            <Text style={styles.title}>Registro - Verificación</Text>
            <Text style={styles.subtitle}>Verifica tu correo electrónico</Text>
            <Text style={styles.text}>
              Introduce el código de 8 dígitos que enviamos a tu correo
            </Text>

            <View style={styles.otpWrapper}>
              {[0, 1].map((row) => (
                <View style={styles.otpRow} key={row}>
                  {codigo.slice(row * 4, row * 4 + 4).map((c, i) => {
                    const realIndex = row * 4 + i;
                    return (
                      <TextInput
                        key={realIndex}
                        ref={(ref) => {
                          if (ref) inputsRef.current[realIndex] = ref;
                        }}
                        value={c}
                        onChangeText={(t) => handleChange(t, realIndex)}
                        onKeyPress={(e) => handleKeyPress(e, realIndex)}
                        style={[styles.otpBox, focusedIndex === realIndex && styles.focusedBox]}
                        maxLength={1}
                        autoCapitalize="characters"
                        keyboardType="default"
                        textAlign="center"
                        autoFocus={realIndex === 0}
                        onFocus={() => setFocusedIndex(realIndex)}
                        onBlur={() => setFocusedIndex(null)}
                      />
                    );
                  })}
                </View>
              ))}
            </View>

            <View style={styles.buttonContainer}>
              <Button
                mode="outlined"
                onPress={() => router.back()}
                style={styles.atrasButton}
                labelStyle={styles.buttonText}
                icon="arrow-left"
                disabled={loading}
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
                icon="check"
              >
                Finalizar
              </Button>
            </View>
          </KeyboardAwareScrollView>
        </Animated.View>

        <Snackbar
          visible={alert.visible}
          onDismiss={() => setAlert({ ...alert, visible: false })}
          duration={4000}
          style={[
            styles.snackbar,
            { backgroundColor: alert.severity === "success" ? "#4CAF50" : "#F44336" },
          ]}
          action={
            alert.severity === "error"
              ? {
                  label: "Reintentar",
                  textColor: "#fff",
                  onPress: () => handleSubmit(),
                }
              : undefined
          }
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
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.4)",
    zIndex: 5,
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
    padding: 30,
    elevation: 3,
    zIndex: 10,
  },
  title: {
    fontSize: 20,
    fontFamily: "PoppinsSemiBold",
    marginBottom: 10,
    textAlign: "center",
    color: "#000",
  },
  subtitle: {
    fontSize: 30,
    fontFamily: "PoppinsSemiBold",
    marginBottom: 5,
    textAlign: "left",
    color: "#000",
    alignSelf: "flex-start",
  },
  text: {
    fontSize: 14,
    fontFamily: "PoppinsRegular",
    marginBottom: 20,
    textAlign: "left",
    color: "#555",
    alignSelf: "flex-start",
  },
  otpWrapper: {
    marginVertical: 20,
    alignItems: "center",
    justifyContent: "center",
    gap: 15,
    width: "100%",
    zIndex: 10,
  },
  otpRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
    width: "100%",
  },
  otpBox: {
    borderColor: "#002BFF",
    borderWidth: 2,
    borderRadius: 8,
    width: 50,
    height: 55,
    fontSize: 20,
    fontFamily: "PoppinsSemiBold",
    color: "#000",
    backgroundColor: "#fff",
  },
  focusedBox: {
    borderColor: "#ff9800",
    borderWidth: 3,
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
  snackbar: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    borderRadius: 8,
    elevation: 10,
    zIndex: 9999,
  },
});
