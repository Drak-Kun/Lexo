import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useApp } from "../context/AppContext";
import { colors, spacing, borderRadius, typography } from "../constants/theme";
import { QuizQuestion } from "../types";

export default function ReviewMistakesScreen() {
  const params = useLocalSearchParams();
  const { isDark } = useApp();
  const router = useRouter();
  const theme = isDark ? colors.dark : colors.light;

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
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <Text style={[styles.errorText, { color: theme.text }]}>No mistakes to review</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={[styles.backButton, { color: theme.text }]}>← Back</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.text }]}>Review Mistakes</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingTop: 60,
    paddingBottom: spacing.md,
  },
  backButton: {
    fontSize: 16,
    fontWeight: "500",
    width: 60,
  },
  title: {
    ...typography.title,
  },
  scrollContent: {
    padding: spacing.lg,
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
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: "center",
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
