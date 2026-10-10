import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useApp } from "../context/AppContext";
import { colors, spacing, borderRadius, typography } from "../constants/theme";

export default function QuizResultScreen() {
  const params = useLocalSearchParams();
  const { isDark } = useApp();
  const router = useRouter();
  const theme = isDark ? colors.dark : colors.light;

  const totalQuestions = parseInt(params.totalQuestions as string, 10);
  const correctCount = parseInt(params.correctCount as string, 10);
  const incorrectCount = parseInt(params.incorrectCount as string, 10);
  const accuracy = parseInt(params.accuracy as string, 10);
  const mistakes = params.mistakes ? JSON.parse(params.mistakes as string) : [];

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Confetti Icon */}
      <Text style={styles.trophy}>🏆</Text>

      <Text style={[styles.title, { color: theme.text }]}>Quiz Complete!</Text>

      {/* Score Card */}
      <View style={[styles.scoreCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <Text style={[styles.scoreLabel, { color: theme.textSecondary }]}>Your Score</Text>
        <Text style={[styles.scoreValue, { color: theme.text }]}>
          {correctCount} / {totalQuestions}
        </Text>
        <Text style={[styles.scoreSubtitle, { color: theme.textSecondary }]}>
          Correct Answers
        </Text>
      </View>

      {/* Stats Row */}
      <View style={styles.statsRow}>
        <View style={[styles.statCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.statIcon, { color: theme.accent.green }]}>✓</Text>
          <Text style={[styles.statValue, { color: theme.accent.green }]}>{correctCount}</Text>
          <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Correct</Text>
        </View>

        <View style={[styles.statCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.statIcon, { color: theme.accent.red }]}>✕</Text>
          <Text style={[styles.statValue, { color: theme.accent.red }]}>{incorrectCount}</Text>
          <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Wrong</Text>
        </View>

        <View style={[styles.statCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.statIcon, { color: theme.accent.purple }]}>%</Text>
          <Text style={[styles.statValue, { color: theme.accent.purple }]}>{accuracy}%</Text>
          <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Accuracy</Text>
        </View>
      </View>

      {/* Buttons */}
      <View style={styles.buttonsContainer}>
        {mistakes.length > 0 && (
          <TouchableOpacity
            style={[styles.button, styles.reviewButton, { backgroundColor: theme.primary }]}
            onPress={() =>
              router.push({
                pathname: "/review-mistakes",
                params: { mistakes: params.mistakes },
              })
            }
          >
            <Text style={styles.buttonText}>Review Mistakes</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[
            styles.button,
            styles.homeButton,
            { backgroundColor: theme.card, borderColor: theme.border },
          ]}
          onPress={() => router.replace("/")}
        >
          <Text style={[styles.homeButtonText, { color: theme.text }]}>Back to Home</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.lg,
    paddingTop: 80,
    alignItems: "center",
  },
  trophy: {
    fontSize: 80,
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.title,
    marginBottom: spacing.xl,
  },
  scoreCard: {
    width: "100%",
    padding: spacing.xl,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  scoreLabel: {
    ...typography.body,
    marginBottom: spacing.sm,
  },
  scoreValue: {
    fontSize: 48,
    fontWeight: "700",
    marginBottom: spacing.xs,
  },
  scoreSubtitle: {
    ...typography.body,
  },
  statsRow: {
    flexDirection: "row",
    gap: spacing.md,
    width: "100%",
    marginBottom: spacing.xl,
  },
  statCard: {
    flex: 1,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    alignItems: "center",
  },
  statIcon: {
    fontSize: 32,
    marginBottom: spacing.xs,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: spacing.xs,
  },
  statLabel: {
    ...typography.caption,
  },
  buttonsContainer: {
    width: "100%",
    gap: spacing.md,
  },
  button: {
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: "center",
  },
  reviewButton: {
    // Primary button style
  },
  homeButton: {
    borderWidth: 1,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
  },
  homeButtonText: {
    fontSize: 18,
    fontWeight: "600",
  },
});
