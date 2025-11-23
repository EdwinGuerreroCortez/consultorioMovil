// src/screens/PagosPendientes.tsx
import React, { useRef, useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  AppState,
  AppStateStatus,
} from "react-native";
import * as WebBrowser from "expo-web-browser";
import * as Linking from "expo-linking";
import { verificarSesion } from "@/services/authService";
import { useApi } from "@/hooks/useApi";
import { useFocusEffect } from "@react-navigation/native";

// OJO: WebBrowser.maybeCompleteAuthSession() va en el layout raíz (app/_layout.tsx), no aquí.

interface PagoApi {
  id: number;
  usuario_id: number;
  paciente_id: number | null;
  monto: string; // backend lo envía como string
  metodo: string | null;
  estado: string;
  fecha_pago: string | null;
  cita_id: number;
  fecha_hora: string | null;
  estado_cita: string;
}

export default function PagosPendientes() {
  const cardSlideAnim = useRef(new Animated.Value(500)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const { fetchWithCsrf, csrfToken } = useApi();

  const [usuarioId, setUsuarioId] = useState<number | null>(null);
  const [pagos, setPagos] = useState<PagoApi[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mensajePago, setMensajePago] = useState<string | null>(null);

  // Guarda los IDs que se intentan pagar para revalidación si el usuario cierra Stripe
  const pagosEnProcesoRef = useRef<number[]>([]);

  // Animación inicial al montar (solo una vez)
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
  }, [cardSlideAnim, fadeAnim]);

  // Cargar usuario
  useEffect(() => {
    (async () => {
      try {
        const usuario = await verificarSesion();
        if (usuario?.id) setUsuarioId(usuario.id);
        else setError("No se pudo obtener la sesión. Inicia sesión nuevamente.");
      } catch (e) {
        console.error("Error verificando sesión:", e);
        setError("Error al verificar la sesión.");
      }
    })();
  }, []);

  const formatearFecha = (iso: string | null) => {
    if (!iso) return "Sin fecha";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "Sin fecha";
    const dia = String(d.getDate()).padStart(2, "0");
    const mes = String(d.getMonth() + 1).padStart(2, "0");
    const anio = d.getFullYear();
    const h = String(d.getHours()).padStart(2, "0");
    const m = String(d.getMinutes()).padStart(2, "0");
    return `${dia}/${mes}/${anio} ${h}:${m}`;
  };

  const obtenerPagos = useCallback(
    async () => {
      if (!usuarioId || !csrfToken) return;
      try {
        setLoading(true);
        setError(null);
        const res = await fetchWithCsrf(`/api/pagos/pendientes/${usuarioId}`, {
          method: "GET",
        });
        if (!res.ok) {
          console.error("Error respuesta pagos pendientes:", res);
          setError("Error al cargar los pagos pendientes.");
          return;
        }
        const data: PagoApi[] = Array.isArray(res.data) ? res.data : [];
        setPagos(data);
      } catch (e) {
        console.error("Error obteniendo pagos pendientes:", e);
        setError("No fue posible obtener los pagos pendientes.");
      } finally {
        setLoading(false);
      }
    },
    [usuarioId, csrfToken, fetchWithCsrf]
  );

  // Carga inicial cuando ya hay usuario y CSRF
  useEffect(() => {
    if (usuarioId && csrfToken) {
      obtenerPagos();
    }
  }, [usuarioId, csrfToken, obtenerPagos]);

  // Reiniciar y recargar cada vez que se enfoca el tab
  useFocusEffect(
    useCallback(() => {
      // Reset mensajes
      setError(null);
      setMensajePago(null);
      pagosEnProcesoRef.current = [];

      // Reiniciar animaciones
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

      // Volver a consultar pagos si ya tenemos usuario y csrf
      if (usuarioId && csrfToken) {
        obtenerPagos();
      }

      return () => {
        // Aquí podrías limpiar timers si en el futuro agregas alguno
      };
    }, [cardSlideAnim, fadeAnim, usuarioId, csrfToken, obtenerPagos])
  );

  // ----------- Checkout con deep link -----------
  const iniciarCheckout = useCallback(
    async (pagosAEnviar: PagoApi[]) => {
      if (loading) return; // evita doble tap
      if (!csrfToken) {
        setError("Token CSRF inválido.");
        return;
      }
      if (!pagosAEnviar.length) {
        setError("No hay pagos para procesar.");
        return;
      }

      try {
        setLoading(true);
        setError(null);
        setMensajePago(null);

        pagosEnProcesoRef.current = pagosAEnviar.map((p) => p.id);

        // 1) URL de retorno de tu app (consultoriomovil://pagos/exito)
        const redirectUrl = Linking.createURL("/pagos/exito");

        // 2) Crear checkout en tu backend
        const res = await fetchWithCsrf("/api/pagos/crear-checkout-movil", {
          method: "POST",
          body: JSON.stringify({ pagos: pagosAEnviar, redirectUrl }),
        });
        if (!res.ok) {
          console.error("Respuesta error crear checkout (móvil):", res);
          setError("No se pudo iniciar el pago con Stripe.");
          pagosEnProcesoRef.current = [];
          return;
        }

        const payload =
          typeof res.data === "string"
            ? (() => {
              try {
                return JSON.parse(res.data);
              } catch {
                return {};
              }
            })()
            : res.data;

        const checkoutUrl = payload?.url;
        if (!checkoutUrl) {
          setError("No se recibió la URL de pago.");
          pagosEnProcesoRef.current = [];
          return;
        }

        // 3) Abrir Stripe y esperar deep link
        const result = await WebBrowser.openAuthSessionAsync(
          checkoutUrl,
          redirectUrl
        );

        if (result.type === "success" && result.url) {
          const parsed = Linking.parse(result.url);
          const idsParam = (parsed.queryParams?.ids ?? "") as string;
          const sessionId = (parsed.queryParams?.session_id ?? "") as string;

          const pagosIds = String(idsParam)
            .split(",")
            .map((s) => parseInt(s))
            .filter((n) => !Number.isNaN(n));

          if (pagosIds.length) {
            const confirm = await fetchWithCsrf(
              `/api/pagos/pagar-por-ids?session_id=${encodeURIComponent(
                sessionId
              )}`,
              {
                method: "POST",
                body: JSON.stringify({ pagosIds }),
              }
            );

            if (confirm.ok) {
              setMensajePago(
                confirm.data?.mensaje || "Pago completado con éxito."
              );
              await obtenerPagos();
            } else {
              setMensajePago(
                "El pago se procesó, pero no se pudo confirmar en el servidor."
              );
            }
          } else {
            await obtenerPagos();
            setMensajePago("Verificación realizada.");
          }
        } else {
          // cancel o dismiss: revalidar
          await obtenerPagos();
          const idsPend = new Set(pagos.map((p) => p.id));
          const aunPend = pagosEnProcesoRef.current.filter((id) =>
            idsPend.has(id)
          );
          setMensajePago(
            aunPend.length === 0
              ? "Pago completado con éxito."
              : "Operación cancelada o no finalizada."
          );
        }
      } catch (e) {
        console.error("Error al crear/confirmar checkout:", e);
        setError("Error al iniciar/confirmar el pago. Inténtalo nuevamente.");
      } finally {
        pagosEnProcesoRef.current = [];
        setLoading(false);
      }
    },
    [csrfToken, fetchWithCsrf, obtenerPagos, pagos, loading]
  );
  // ----------------------------------------------

  const handlePagarAhora = (p: PagoApi) => iniciarCheckout([p]);
  const handlePagarTodo = () => iniciarCheckout(pagos);

  // Fallback: si vuelve manualmente a la app sin redirección
  useEffect(() => {
    const onState = async (st: AppStateStatus) => {
      if (
        st === "active" &&
        usuarioId &&
        csrfToken &&
        pagosEnProcesoRef.current.length > 0
      ) {
        await obtenerPagos();
        const idsPend = new Set(pagos.map((p) => p.id));
        const aunPend = pagosEnProcesoRef.current.filter((id) =>
          idsPend.has(id)
        );
        setMensajePago(
          aunPend.length === 0
            ? "Pago completado con éxito."
            : "El pago no se completó o fue cancelado."
        );
        pagosEnProcesoRef.current = [];
      }
    };
    const sub = AppState.addEventListener("change", onState);
    return () => sub.remove();
  }, [usuarioId, csrfToken, obtenerPagos, pagos]);

  const hayPagos = pagos.length > 0;

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.card,
          { transform: [{ translateY: cardSlideAnim }], opacity: fadeAnim },
        ]}
      >
        <Text style={styles.title}>Pagos Pendientes</Text>

        {loading && (
          <View style={styles.inlineLoading}>
            <ActivityIndicator size="small" />
            <Text style={styles.inlineLoadingText}>Cargando...</Text>
          </View>
        )}
        {error && !loading && (
          <Text style={styles.errorText}>{error}</Text>
        )}
        {mensajePago && (
          <Text style={styles.mensajePagoText}>{mensajePago}</Text>
        )}

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {!hayPagos && !loading ? (
            <Text style={styles.noPagosText}>
              No tienes pagos pendientes.
            </Text>
          ) : (
            <>
              {pagos.map((p) => (
                <View key={p.id} style={styles.paymentCard}>
                  <View style={styles.paymentInfo}>
                    <Text style={styles.paymentTitle}>Pago #{p.id}</Text>
                    <View style={{ marginTop: 6 }}>
                      <Text style={styles.paymentMeta}>
                        Monto{" "}
                        <Text style={styles.paymentMetaBold}>
                          ${Number(p.monto).toFixed(2)}
                        </Text>
                      </Text>
                      <Text style={styles.paymentMeta}>
                        Fecha{" "}
                        <Text style={styles.paymentMetaBold}>
                          {formatearFecha(p.fecha_hora)}
                        </Text>
                      </Text>
                      <Text style={styles.paymentMeta}>
                        Estado{" "}
                        <Text style={styles.paymentMetaBold}>
                          {p.estado_cita || p.estado}
                        </Text>
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    style={styles.payNowButton}
                    activeOpacity={0.8}
                    onPress={() => handlePagarAhora(p)}
                    disabled={loading}
                  >
                    <Text style={styles.payNowText}>Pagar ahora</Text>
                  </TouchableOpacity>
                </View>
              ))}

              {hayPagos && (
                <TouchableOpacity
                  style={styles.payAllButton}
                  activeOpacity={0.85}
                  onPress={handlePagarTodo}
                  disabled={loading}
                >
                  <Text style={styles.payAllText}>
                    Pagar Todo el Tratamiento
                  </Text>
                </TouchableOpacity>
              )}
            </>
          )}
        </ScrollView>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#EFEFEF" },
  card: {
    flex: 1,
    backgroundColor: "#FFFFFF",
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
  inlineLoading: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  inlineLoadingText: {
    marginLeft: 8,
    fontSize: 12,
    color: "#555",
    fontFamily: "PoppinsRegular",
  },
  errorText: {
    color: "red",
    marginBottom: 8,
    fontSize: 12,
    fontFamily: "PoppinsRegular",
  },
  mensajePagoText: {
    color: "#2e7d32",
    marginBottom: 8,
    fontSize: 12,
    fontFamily: "PoppinsSemiBold",
  },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 24 },
  noPagosText: {
    textAlign: "center",
    marginTop: 16,
    color: "#555",
    fontFamily: "PoppinsRegular",
  },
  paymentCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 20,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  paymentInfo: { flex: 1, marginRight: 12 },
  paymentTitle: {
    fontSize: 14,
    fontFamily: "PoppinsSemiBold",
    color: "#000",
  },
  paymentMeta: {
    fontSize: 12,
    fontFamily: "PoppinsRegular",
    color: "#555555",
  },
  paymentMetaBold: {
    fontFamily: "PoppinsSemiBold",
    color: "#000",
  },
  payNowButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "#1E88E5",
    minWidth: 100,
    alignItems: "center",
    justifyContent: "center",
  },
  payNowText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontFamily: "PoppinsSemiBold",
  },
  payAllButton: {
    marginTop: 12,
    borderRadius: 999,
    backgroundColor: "#1E88E5",
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  payAllText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontFamily: "PoppinsSemiBold",
  },
});
