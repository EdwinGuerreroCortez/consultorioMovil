import React from "react";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { withLayoutContext } from "expo-router";
import { Text } from "react-native";

const { Navigator } = createMaterialTopTabNavigator();
const TopTabs = withLayoutContext(Navigator);

export default function CitasLayout() {
  return (
    <TopTabs
      screenOptions={{
        tabBarActiveTintColor: "#FFFFFF",
        tabBarInactiveTintColor: "#0901F5",
        tabBarStyle: {
          backgroundColor: "#FFFFFF",
          elevation: 0,
          shadowOpacity: 0,
          borderRadius: 30,
          marginHorizontal: 20,
          marginVertical: 10,
          height: 48, // un poco más bajo
        },
        tabBarLabel: ({ focused, color, children }) => (
          <Text
            style={{
              fontFamily: "PoppinsSemiBold",
              fontSize: 13, // más pequeño para que no salte de línea
              color,
            }}
            numberOfLines={1} // 👈 evita salto de línea
            ellipsizeMode="clip"
          >
            {children}
          </Text>
        ),
        tabBarIndicatorStyle: {
          backgroundColor: "#0901F5",
          borderRadius: 30,
          height: "100%",
        },
        tabBarIndicatorContainerStyle: {
          borderRadius: 30,
        },
        tabBarItemStyle: {
          justifyContent: "center",
          alignItems: "center",
        },
      }}
    >
      <TopTabs.Screen name="agendar" options={{ title: "Agendar cita" }} />
      <TopTabs.Screen name="proximas" options={{ title: "Próximas" }} />
      <TopTabs.Screen name="historial" options={{ title: "Historial" }} />
    </TopTabs>
  );
}
