import React from "react";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { withLayoutContext } from "expo-router";
import { Text } from "react-native";

const { Navigator } = createMaterialTopTabNavigator();
const TopTabs = withLayoutContext(Navigator);

export default function PagosLayout() {
  return (
    <TopTabs
      screenOptions={{
        tabBarActiveTintColor: "#fff",
        tabBarInactiveTintColor: "#0901F5",
        tabBarStyle: {
          backgroundColor: "#fff",
          elevation: 0,
          shadowOpacity: 0,
          borderRadius: 30,
          marginHorizontal: 40,
          marginVertical: 10,
          height: 48,
        },
        tabBarLabel: ({ focused, color, children }) => (
          <Text
            style={{
              fontFamily: "PoppinsSemiBold",
              fontSize: 13,
              color,
            }}
            numberOfLines={1}
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
      <TopTabs.Screen name="pendientes" options={{ title: "Pendientes" }} />
      <TopTabs.Screen name="historial" options={{ title: "Historial" }} />
    </TopTabs>
  );
}
