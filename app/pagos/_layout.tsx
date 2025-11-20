// app/pagos/_layout.tsx
import { Stack } from "expo-router";

export default function PagosLayout() {
    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="exito" />
            <Stack.Screen name="cancelado" />
        </Stack>
    );
}
