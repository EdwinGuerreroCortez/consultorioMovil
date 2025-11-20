import { useEffect } from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";

export default function PagosCancelado() {
    const router = useRouter();

    useEffect(() => {
        // Simplemente vuelve a la lista de pagos pendientes
        router.replace({ pathname: "/pagos/pendientes" }); // ✅ ruta visible real
    }, [router]);

    return (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
            <ActivityIndicator />
            <Text style={{ marginTop: 8 }}>Pago cancelado</Text>
        </View>
    );
}
