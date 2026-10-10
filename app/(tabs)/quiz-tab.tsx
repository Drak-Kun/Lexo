import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { useApp } from "../../context/AppContext";
import { colors, spacing, borderRadius, typography } from "../../constants/theme";

export default function QuizTabScreen() {
  const { isDark } = useApp();
  const router = useRouter();
  const theme = isDark ? colors.dark : colors.light;

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.content}>
        <Text style={[styles.icon, { color: theme.textSecondary }]}>🎯</Text>
        <Text style={[styles.title, { color: theme.text }]}>Ready to Quiz?</Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
          Test your knowledge with custom quizzes
        </Text>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: theme.primary }]}
          onPress={() => router.push("/quiz-setup")}
        >
          <Text style={styles.buttonText}>Start Quiz →</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    alignItems: "center",
    padding: spacing.xl,
  },
  icon: {
    fontSize: 80,
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.title,
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.body,
    textAlign: "center",
    marginBottom: spacing.xl,
  },
  button: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
  },
});
