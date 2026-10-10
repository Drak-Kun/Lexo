import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  Pressable,
} from "react-native";
import { useRouter } from "expo-router";
import { useApp } from "../../context/AppContext";
import { colors, spacing, borderRadius, typography } from "../../constants/theme";

export default function HomeScreen() {
  const { activeLanguage, words, grammar, isDark, isLoading, languages, setActiveLanguage } =
    useApp();
  const router = useRouter();
  const theme = isDark ? colors.dark : colors.light;
  const [showLanguageModal, setShowLanguageModal] = useState(false);

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  if (!activeLanguage) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <Text style={[styles.title, { color: theme.text }]}>No language available</Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
          Please add a language to get started
        </Text>
      </View>
    );
  }

  // Calculate statistics
  const totalWords = words.length;
  const totalGrammar = grammar.length;
  const wordsToReview = words.filter((w) => w.reviewCount > 0 && w.correctCount < 3).length;
  const grammarToReview = grammar.filter((g) => g.reviewCount > 0 && g.correctCount < 3).length;

  // Today's progress (simplified - words/grammar added today)
  const today = new Date().toDateString();
  const wordsToday = words.filter((w) => new Date(w.createdAt).toDateString() === today).length;
  const grammarToday = grammar.filter(
    (g) => new Date(g.createdAt).toDateString() === today
  ).length;

  // Weekly progress (last 7 days)
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);

  const dailyProgress = [];
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toDateString();
    const count =
      words.filter((w) => new Date(w.createdAt).toDateString() === dateStr).length +
      grammar.filter((g) => new Date(g.createdAt).toDateString() === dateStr).length;

    dailyProgress.push({
      day: days[date.getDay() === 0 ? 6 : date.getDay() - 1],
      count,
    });
  }

  const maxProgress = Math.max(...dailyProgress.map((d) => d.count), 1);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.logo, { color: theme.text }]}>LEXO</Text>
          <TouchableOpacity
            style={[styles.languageSelector, { backgroundColor: theme.card, borderColor: theme.border }]}
            onPress={() => setShowLanguageModal(true)}
          >
            <Text style={[styles.languageName, { color: theme.text }]}>{activeLanguage.name}</Text>
            <Text style={[styles.languageIcon, { color: theme.textSecondary }]}>▾</Text>
          </TouchableOpacity>
        </View>

        {/* Streak */}
        <View style={[styles.streakCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={styles.streakEmoji}>🔥</Text>
          <Text style={[styles.streakNumber, { color: theme.text }]}>12</Text>
          <Text style={[styles.streakText, { color: theme.textSecondary }]}>Keep going!</Text>
        </View>

        {/* Today's Progress */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Today's Progress</Text>

          <View style={styles.statsRow}>
            <View style={[styles.statCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <Text style={[styles.statValue, { color: theme.accent.cyan }]}>{wordsToday}</Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Words learned</Text>
            </View>

            <View style={[styles.statCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <Text style={[styles.statValue, { color: theme.accent.purple }]}>{grammarToday}</Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Grammar learned</Text>
            </View>
          </View>

          <View style={styles.statsRow}>
            <View style={[styles.statCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <Text style={[styles.statValue, { color: theme.accent.green }]}>{wordsToReview}</Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Words to review</Text>
            </View>

            <View style={[styles.statCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <Text style={[styles.statValue, { color: theme.accent.yellow }]}>{grammarToReview}</Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Grammar to review</Text>
            </View>
          </View>
        </View>

        {/* All Words and To Review Stats */}
        <View style={styles.section}>
          <View style={styles.statsRow}>
            <View style={[styles.bigStatCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <Text style={[styles.bigStatIcon, { color: theme.accent.cyan }]}>📚</Text>
              <View>
                <Text style={[styles.bigStatLabel, { color: theme.textSecondary }]}>All Words</Text>
                <Text style={[styles.bigStatValue, { color: theme.text }]}>{totalWords}</Text>
              </View>
            </View>

            <View style={[styles.bigStatCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <Text style={[styles.bigStatIcon, { color: theme.accent.red }]}>🔄</Text>
              <View>
                <Text style={[styles.bigStatLabel, { color: theme.textSecondary }]}>To Review</Text>
                <Text style={[styles.bigStatValue, { color: theme.text }]}>
                  {wordsToReview + grammarToReview}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Start Quiz Button */}
        <TouchableOpacity
          style={[styles.quizButton, { backgroundColor: theme.primary }]}
          onPress={() => router.push("/quiz-setup")}
        >
          <Text style={styles.quizButtonText}>Start Quiz →</Text>
        </TouchableOpacity>

        {/* Weekly Progress */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Weekly Progress</Text>

          <View style={styles.progressChart}>
            {dailyProgress.map((item, index) => {
              const height = (item.count / maxProgress) * 100;
              return (
                <View key={index} style={styles.progressBar}>
                  <View style={styles.progressBarContainer}>
                    <View
                      style={[
                        styles.progressBarFill,
                        {
                          height: `${height}%`,
                          backgroundColor:
                            item.count > 0 ? theme.accent.green : theme.border,
                        },
                      ]}
                    />
                  </View>
                  <Text style={[styles.progressDay, { color: theme.textSecondary }]}>
                    {item.day}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>
      </ScrollView>

      {/* Language Selector Modal */}
      <Modal
        visible={showLanguageModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowLanguageModal(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setShowLanguageModal(false)}>
          <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>Select Language</Text>
            {languages.map((lang) => (
              <TouchableOpacity
                key={lang.id}
                style={[
                  styles.languageOption,
                  lang.id === activeLanguage.id && {
                    backgroundColor: isDark ? "#2D2D2D" : "#F0F0F0",
                  },
                ]}
                onPress={() => {
                  setActiveLanguage(lang.id);
                  setShowLanguageModal(false);
                }}
              >
                <Text style={[styles.languageOptionText, { color: theme.text }]}>
                  {lang.name}
                </Text>
                {lang.id === activeLanguage.id && (
                  <Text style={[styles.checkmark, { color: theme.primary }]}>✓</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingTop: 60,
  },
  header: {
    marginBottom: spacing.lg,
  },
  logo: {
    ...typography.title,
    marginBottom: spacing.md,
  },
  languageSelector: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
  },
  languageName: {
    ...typography.heading,
  },
  languageIcon: {
    fontSize: 18,
  },
  streakCard: {
    alignItems: "center",
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    marginBottom: spacing.lg,
  },
  streakEmoji: {
    fontSize: 40,
    marginBottom: spacing.sm,
  },
  streakNumber: {
    fontSize: 32,
    fontWeight: "700",
    marginBottom: spacing.xs,
  },
  streakText: {
    ...typography.body,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.heading,
    marginBottom: spacing.md,
  },
  statsRow: {
    flexDirection: "row",
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  statCard: {
    flex: 1,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    alignItems: "center",
  },
  statValue: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: spacing.xs,
  },
  statLabel: {
    ...typography.caption,
    textAlign: "center",
  },
  bigStatCard: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    gap: spacing.md,
  },
  bigStatIcon: {
    fontSize: 32,
  },
  bigStatLabel: {
    ...typography.caption,
  },
  bigStatValue: {
    fontSize: 24,
    fontWeight: "700",
  },
  quizButton: {
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  quizButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
  },
  progressChart: {
    flexDirection: "row",
    justifyContent: "space-between",
    height: 120,
    alignItems: "flex-end",
  },
  progressBar: {
    flex: 1,
    alignItems: "center",
    gap: spacing.sm,
  },
  progressBarContainer: {
    width: "70%",
    height: 100,
    justifyContent: "flex-end",
  },
  progressBarFill: {
    width: "100%",
    borderRadius: 4,
    minHeight: 4,
  },
  progressDay: {
    ...typography.small,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "80%",
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
  },
  modalTitle: {
    ...typography.heading,
    marginBottom: spacing.md,
  },
  languageOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: spacing.md,
    borderRadius: borderRadius.sm,
  },
  languageOptionText: {
    ...typography.body,
  },
  checkmark: {
    fontSize: 20,
  },
});
