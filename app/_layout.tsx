import { Stack } from "expo-router";
import { AppProvider } from "../context/AppContext";
import { StatusBar } from "expo-status-bar";

export default function RootLayout() {
  return (
    <AppProvider>
      <StatusBar style="auto" />
      <Stack screenOptions={{ headerShown: false }}>
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
  );
}
