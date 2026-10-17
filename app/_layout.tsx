import { Stack } from "expo-router";
import { AppProvider } from "../context/AppContext";
import { StatusBar } from "expo-status-bar";
import { MotionProvider } from "../components/Motion";
import { colors } from "../constants/theme";

export default function RootLayout() {
  return (
    <MotionProvider>
      <AppProvider>
        <StatusBar style="light" />
        <Stack
          screenOptions={{
            headerShown: false,
            animation: "fade_from_bottom",
            animationDuration: 220,
            contentStyle: { backgroundColor: colors.dark.background },
          }}
        >
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="add-word" />
          <Stack.Screen name="add-grammar" />
          <Stack.Screen name="word-detail" />
          <Stack.Screen name="grammar-detail" />
          <Stack.Screen name="quiz-setup" />
          <Stack.Screen name="quiz" />
          <Stack.Screen name="quiz-result" />
          <Stack.Screen name="review-mistakes" />
        </Stack>
      </AppProvider>
    </MotionProvider>
  );
}
