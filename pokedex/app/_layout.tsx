import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

export default function RootLayout() {
  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: "#1a1a2e",
          },
          headerTintColor: "#fff",
          headerTitleStyle: {
            fontWeight: "800",
            fontSize: 20,
          },
          contentStyle: {
            backgroundColor: "#0f0f1a",
          },
          animation: "slide_from_right",
        }}
      >
        <Stack.Screen
          name="index"
          options={{
            title: "Pokédex",
            headerTitleStyle: {
              fontWeight: "900",
              fontSize: 24,
            },
          }}
        />
        <Stack.Screen
          name="details"
          options={{
            title: "",
            headerTransparent: true,
            headerBackTitle: "Back",
          }}
        />
      </Stack>
    </>
  );
}
