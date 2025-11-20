// app/(tabs)/pagos/exito.tsx
import { useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, View, Text } from "react-native";
import { useLocalSearchParams, useRouter, type Href } from "expo-router";
import { useApi } from "@/hooks/useApi";

const DELAY_MS = 4000; // espera visible antes de redirigir

export default function PagosExito() {
    const router = useRouter();
    const { ids, session_id } = useLocalSearchParams<{ ids?: string; session_id?: string }>();
    const { fetchWithCsrf } = useApi();

    const [estado, setEstado] = useState<"cargando" | "confirmando" | "ok" | "sinDatos">("cargando");
    const [mensaje, setMensaje] = useState("Procesando pago...");
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null); // ✅

    const pagosIds = useMemo(
        () => (ids ? ids.split(",").map((x) => Number(x)).filter(Boolean) : []),
        [ids]
    );

    useEffect(() => {
        const confirmar = async () => {
            try {
                if (!pagosIds.length) {
                    setEstado("sinDatos");
                    setMensaje("No se recibieron IDs de pago, verificando...");
                    // redirige después para no dejar colgada la UI
                    timeoutRef.current = setTimeout(() => router.replace("/pagos/pendientes" as Href), DELAY_MS);
                    return;
                }

                setEstado("confirmando");
                setMensaje("Confirmando con el servidor...");

                const resp = await fetchWithCsrf(`/api/pagos/pagar-por-ids?session_id=${encodeURIComponent(session_id || "")}`, {
                    method: "POST",
                    body: JSON.stringify({ pagosIds }),
                });

                setEstado("ok");
                setMensaje(resp.ok ? "Pago confirmado." : "Pago registrado, pero no fue posible confirmar.");
            } catch (e) {
                setEstado("ok");
                setMensaje("Listo. Regresando a tus pagos…");
            } finally {
                timeoutRef.current = setTimeout(() => router.replace("/pagos/pendientes" as Href), DELAY_MS);
            }
        };

        confirmar();

        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, [pagosIds, session_id, fetchWithCsrf, router]);

    return (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 16 }}>
            <ActivityIndicator />
            <Text style={{ marginTop: 8 }}>{mensaje}</Text>
        </View>
    );
}
