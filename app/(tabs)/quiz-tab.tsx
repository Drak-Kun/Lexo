import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { colors, spacing, borderRadius, typography } from "../../constants/theme";
import { ArrowRight, Target } from "lucide-react-native";

export default function QuizTabScreen() {
  const router = useRouter();
  const theme = colors.dark;

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.content}>
        <Target
          size={72}
          color={theme.accent.purple}
          strokeWidth={1.75}
          style={styles.icon}
        />
        <Text style={[styles.title, { color: theme.text }]}>Ready to Quiz?</Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
          Test your knowledge with custom quizzes
        </Text>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: theme.primary }]}
          onPress={() => router.push("/quiz-setup")}
        >
          <View style={styles.buttonContent}>
            <Text style={styles.buttonText}>Start Quiz</Text>
            <ArrowRight size={20} color={theme.onPrimary} strokeWidth={2} />
          </View>
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
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
  },
});
