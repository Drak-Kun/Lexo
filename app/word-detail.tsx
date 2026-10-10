import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useApp } from "../context/AppContext";
import { colors, spacing, borderRadius, typography } from "../constants/theme";
import { getWords, deleteWord } from "../storage";
import { Word } from "../types";
import * as Speech from "expo-speech";

export default function WordDetailScreen() {
  const { id } = useLocalSearchParams();
  const { activeLanguage, isDark, refreshData } = useApp();
  const router = useRouter();
  const theme = isDark ? colors.dark : colors.light;

  const [word, setWord] = useState<Word | null>(null);

  useEffect(() => {
    loadWord();
  }, [id]);

  const loadWord = async () => {
    const words = await getWords();
    const found = words.find((w) => w.id === id);
    setWord(found || null);
  };

  const handleDelete = () => {
    Alert.alert(
      "Delete Word",
      "Are you sure you want to delete this word?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            await deleteWord(id as string);
            await refreshData();
            router.back();
          },
        },
      ]
    );
  };

  const speak = () => {
    if (word && activeLanguage) {
      Speech.speak(word.word, {
        language: activeLanguage.code,
        rate: 0.9,
      });
    }
  };

  if (!word) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <Text style={[styles.errorText, { color: theme.text }]}>Word not found</Text>
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
        <Text style={[styles.headerTitle, { color: theme.text }]}>Word Details</Text>
        <TouchableOpacity onPress={handleDelete}>
          <Text style={[styles.deleteButton, { color: theme.accent.red }]}>🗑️</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Main Card */}
        <View style={[styles.mainCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={styles.mainCardHeader}>
            <Text style={[styles.word, { color: theme.text }]}>{word.word}</Text>
            <TouchableOpacity onPress={speak} style={styles.speakerButton}>
              <Text style={styles.speakerIcon}>🔊</Text>
            </TouchableOpacity>
          </View>

          {word.reading && (
            <Text style={[styles.reading, { color: theme.textSecondary }]}>{word.reading}</Text>
          )}

          <View style={styles.divider} />

          <Text style={[styles.sectionLabel, { color: theme.textSecondary }]}>Meaning</Text>
          <Text style={[styles.meaning, { color: theme.text }]}>{word.meaning}</Text>
        </View>

        {/* Example */}
        {word.example && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Example</Text>
            <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <Text style={[styles.cardText, { color: theme.text }]}>{word.example}</Text>
            </View>
          </View>
        )}

        {/* Notes */}
        {word.notes && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Notes</Text>
            <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <Text style={[styles.cardText, { color: theme.text }]}>{word.notes}</Text>
            </View>
          </View>
        )}

        {/* Tags */}
        {word.tags.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Tags</Text>
            <View style={styles.tagsContainer}>
              {word.tags.map((tag, index) => (
                <View
                  key={index}
                  style={[
                    styles.tag,
                    { backgroundColor: theme.accent.cyan + "20", borderColor: theme.accent.cyan },
                  ]}
                >
                  <Text style={[styles.tagText, { color: theme.accent.cyan }]}>{tag}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Learning Status */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Learning Status</Text>
          <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <View style={styles.statRow}>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Status</Text>
              <Text style={[styles.statValue, { color: theme.accent.purple }]}>
                {word.status.charAt(0).toUpperCase() + word.status.slice(1)}
              </Text>
            </View>
            <View style={styles.statRow}>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Review Count</Text>
              <Text style={[styles.statValue, { color: theme.text }]}>{word.reviewCount}</Text>
            </View>
            <View style={styles.statRow}>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Correct</Text>
              <Text style={[styles.statValue, { color: theme.accent.green }]}>
                {word.correctCount}
              </Text>
            </View>
            <View style={styles.statRow}>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Incorrect</Text>
              <Text style={[styles.statValue, { color: theme.accent.red }]}>
                {word.incorrectCount}
              </Text>
            </View>
            <View style={styles.statRow}>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Streak</Text>
              <Text style={[styles.statValue, { color: theme.accent.yellow }]}>{word.streak}</Text>
            </View>
          </View>
        </View>
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
  headerTitle: {
    ...typography.heading,
  },
  deleteButton: {
    fontSize: 24,
    width: 60,
    textAlign: "right",
  },
  scrollContent: {
    padding: spacing.lg,
  },
  mainCard: {
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    marginBottom: spacing.lg,
  },
  mainCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  word: {
    fontSize: 32,
    fontWeight: "700",
    marginBottom: spacing.xs,
    flex: 1,
  },
  speakerButton: {
    padding: spacing.sm,
  },
  speakerIcon: {
    fontSize: 28,
  },
  reading: {
    fontSize: 20,
    marginBottom: spacing.md,
  },
  divider: {
    height: 1,
    backgroundColor: "#2D2D2D",
    marginVertical: spacing.md,
  },
  sectionLabel: {
    ...typography.caption,
    textTransform: "uppercase",
    marginBottom: spacing.xs,
  },
  meaning: {
    fontSize: 18,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.heading,
    marginBottom: spacing.sm,
  },
  card: {
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
  },
  cardText: {
    ...typography.body,
    lineHeight: 24,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  tag: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
  },
  tagText: {
    fontSize: 14,
    fontWeight: "500",
  },
  statRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.sm,
  },
  statLabel: {
    ...typography.body,
  },
  statValue: {
    ...typography.body,
    fontWeight: "600",
  },
  errorText: {
    ...typography.body,
    textAlign: "center",
    marginTop: 100,
  },
});
