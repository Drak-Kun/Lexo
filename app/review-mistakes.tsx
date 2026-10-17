import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { colors, spacing, borderRadius, typography } from "../constants/theme";
import { QuizQuestion } from "../types";
import { ArrowLeft } from "lucide-react-native";

export default function ReviewMistakesScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const theme = colors.dark;

  const mistakes: QuizQuestion[] = params.mistakes
    ? JSON.parse(params.mistakes as string)
    : [];

  const handlePracticeAgain = () => {
    // Create a quiz with only the mistakes
    const contentIds = mistakes.map((m) => m.contentId);
    router.replace({
      pathname: "/quiz",
      params: {
        contentType: "mixed",
        tags: "All Tags",
        questionCount: mistakes.length.toString(),
      },
    });
  };

  if (mistakes.length === 0) {
    return (
      <SafeAreaView
        edges={["top", "bottom"]}
        style={[styles.container, { backgroundColor: theme.background }]}
      >
        <Text style={[styles.errorText, { color: theme.text }]}>No mistakes to review</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      edges={["top", "bottom"]}
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerSide}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButtonWrap}
            accessibilityRole="button"
            accessibilityLabel="Back"
          >
            <ArrowLeft size={18} color={theme.text} strokeWidth={2} />
            <Text style={[styles.backButton, { color: theme.text }]}>Back</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.headerCenter}>
          <Text style={[styles.title, { color: theme.text }]}>Review Mistakes</Text>
        </View>

        <View style={styles.headerSide} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
          Review the questions you got wrong and learn from your mistakes.
        </Text>

        {mistakes.map((mistake, index) => (
          <View
            key={index}
            style={[
              styles.mistakeCard,
              { backgroundColor: theme.card, borderColor: theme.border },
            ]}
          >
            {/* Question */}
            <View style={styles.mistakeHeader}>
              <Text style={[styles.mistakeNumber, { color: theme.textSecondary }]}>
                Mistake {index + 1}
              </Text>
            </View>

            <Text style={[styles.question, { color: theme.text }]}>
              {mistake.question}
            </Text>

            {/* User's Answer */}
            <View
              style={[
                styles.answerCard,
                styles.wrongAnswer,
                {
                  backgroundColor: theme.accent.red + "20",
                  borderColor: theme.accent.red,
                },
              ]}
            >
              <Text style={[styles.answerLabel, { color: theme.accent.red }]}>
                Your answer:
              </Text>
              <Text style={[styles.answerText, { color: theme.accent.red }]}>
                {mistake.userAnswer}
              </Text>
            </View>

            {/* Correct Answer */}
            <View
              style={[
                styles.answerCard,
                styles.correctAnswer,
                {
                  backgroundColor: theme.accent.green + "20",
                  borderColor: theme.accent.green,
                },
              ]}
            >
              <Text style={[styles.answerLabel, { color: theme.accent.green }]}>
                Correct answer:
              </Text>
              <Text style={[styles.answerText, { color: theme.accent.green }]}>
                {mistake.correctAnswer}
              </Text>
            </View>
          </View>
        ))}

        {/* Practice Again Button */}
        <TouchableOpacity
          style={[styles.practiceButton, { backgroundColor: theme.primary }]}
          onPress={handlePracticeAgain}
        >
          <Text style={styles.practiceButtonText}>Practice Again ({mistakes.length})</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
  },
  headerSide: {
    flex: 1,
    justifyContent: "center",
    alignItems: "flex-start",
  },
  headerCenter: {
    flex: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  backButtonWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingVertical: spacing.xs,
  },
  backButton: {
    fontSize: 16,
    fontWeight: "500",
  },
  title: {
    ...typography.title,
    textAlign: "center",
    fontSize: 24,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
    paddingTop: spacing.xs,
  },
  subtitle: {
    ...typography.body,
    marginBottom: spacing.lg,
    lineHeight: 24,
  },
  mistakeCard: {
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    marginBottom: spacing.lg,
  },
  mistakeHeader: {
    marginBottom: spacing.sm,
  },
  mistakeNumber: {
    ...typography.caption,
    textTransform: "uppercase",
    fontWeight: "600",
  },
  question: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: spacing.md,
    lineHeight: 28,
  },
  answerCard: {
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 2,
    marginBottom: spacing.sm,
  },
  wrongAnswer: {
    // Styling applied via inline styles
  },
  correctAnswer: {
    // Styling applied via inline styles
  },
  answerLabel: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
    marginBottom: spacing.xs,
  },
  answerText: {
    fontSize: 18,
    fontWeight: "600",
  },
  practiceButton: {
    minHeight: 52,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    marginTop: spacing.lg,
  },
  practiceButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
  },
  errorText: {
    ...typography.body,
    textAlign: "center",
    marginTop: 100,
  },
});
