import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { colors, spacing, borderRadius, typography } from "../constants/theme";
import { Award, ChartNoAxesColumnIncreasing, CircleCheck, CircleX } from "lucide-react-native";

export default function QuizResultScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const theme = colors.dark;

  const totalQuestions = parseInt(params.totalQuestions as string, 10);
  const correctCount = parseInt(params.correctCount as string, 10);
  const incorrectCount = parseInt(params.incorrectCount as string, 10);
  const accuracy = parseInt(params.accuracy as string, 10);
  const mistakes = params.mistakes ? JSON.parse(params.mistakes as string) : [];

  return (
    <SafeAreaView
      edges={["top", "bottom"]}
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Award size={52} color={theme.accent.purple} strokeWidth={1.75} style={styles.trophy} />

        <Text style={[styles.title, { color: theme.text }]}>Quiz Complete!</Text>

        <View style={[styles.scoreCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.scoreLabel, { color: theme.textSecondary }]}>Your Score</Text>
          <Text style={[styles.scoreValue, { color: theme.text }]}>
            {correctCount} / {totalQuestions}
          </Text>
          <Text style={[styles.scoreSubtitle, { color: theme.textSecondary }]}>
            Correct Answers
          </Text>
        </View>

        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <CircleCheck size={18} color={theme.accent.green} strokeWidth={2} style={styles.statIcon} />
            <Text style={[styles.statValue, { color: theme.accent.green }]}>{correctCount}</Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Correct</Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <CircleX size={18} color={theme.accent.red} strokeWidth={2} style={styles.statIcon} />
            <Text style={[styles.statValue, { color: theme.accent.red }]}>{incorrectCount}</Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Wrong</Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <ChartNoAxesColumnIncreasing
              size={18}
              color={theme.accent.purple}
              strokeWidth={2}
              style={styles.statIcon}
            />
            <Text style={[styles.statValue, { color: theme.accent.purple }]}>{accuracy}%</Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Accuracy</Text>
          </View>
        </View>

        <View style={[styles.progressTrack, { backgroundColor: theme.card }]}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${totalQuestions > 0 ? (correctCount / totalQuestions) * 100 : 0}%`,
                backgroundColor: theme.accent.green,
              },
            ]}
          />
        </View>

        <View style={styles.buttonsContainer}>
          {mistakes.length > 0 && (
            <TouchableOpacity
              style={[styles.button, { backgroundColor: theme.primary }]}
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
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xl + 12,
  },
  trophy: {
    marginBottom: spacing.md,
  },
  title: {
    ...typography.title,
    marginBottom: spacing.lg,
  },
  scoreCard: {
    width: "100%",
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    alignItems: "center",
    marginBottom: spacing.md,
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
    gap: spacing.sm,
    width: "100%",
    marginBottom: spacing.lg,
  },
  statCard: {
    flex: 1,
    minWidth: 0,
    minHeight: 88,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  statIcon: {
    marginBottom: spacing.xs,
  },
  statValue: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: "500",
    textAlign: "center",
  },
  progressTrack: {
    width: "100%",
    height: 6,
    overflow: "hidden",
    borderRadius: 999,
    marginBottom: spacing.lg,
  },
  progressFill: {
    height: "100%",
    borderRadius: 999,
  },
  buttonsContainer: {
    width: "100%",
    gap: spacing.md,
    marginTop: spacing.xl,
    paddingBottom: spacing.xs,
  },
  button: {
    minHeight: 52,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
  homeButton: {
    borderWidth: 1,
  },
  buttonText: {
    color: colors.dark.onPrimary,
    fontSize: 18,
    fontWeight: "600",
  },
  homeButtonText: {
    fontSize: 18,
    fontWeight: "600",
  },
});
