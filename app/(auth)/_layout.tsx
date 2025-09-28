import { Stack } from "expo-router";

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="registroCuenta" />
      <Stack.Screen name="recuperar" />
      <Stack.Screen name="cambiarPassword" />
    </Stack>
  );
}
