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
import { getGrammar, deleteGrammar } from "../storage";
import { Grammar } from "../types";
import * as Speech from "expo-speech";

export default function GrammarDetailScreen() {
  const { id } = useLocalSearchParams();
  const { activeLanguage, isDark, refreshData } = useApp();
  const router = useRouter();
  const theme = isDark ? colors.dark : colors.light;

  const [grammar, setGrammar] = useState<Grammar | null>(null);

  useEffect(() => {
    loadGrammar();
  }, [id]);

  const loadGrammar = async () => {
    const grammarList = await getGrammar();
    const found = grammarList.find((g) => g.id === id);
    setGrammar(found || null);
  };

  const handleDelete = () => {
    Alert.alert(
      "Delete Grammar",
      "Are you sure you want to delete this grammar point?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            await deleteGrammar(id as string);
            await refreshData();
            router.back();
          },
        },
      ]
    );
  };

  const speak = () => {
    if (grammar && activeLanguage && grammar.exampleSentence) {
      Speech.speak(grammar.exampleSentence, {
        language: activeLanguage.code,
        rate: 0.9,
      });
    }
  };

  if (!grammar) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <Text style={[styles.errorText, { color: theme.text }]}>Grammar not found</Text>
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
        <Text style={[styles.headerTitle, { color: theme.text }]}>Grammar Details</Text>
        <TouchableOpacity onPress={handleDelete}>
          <Text style={[styles.deleteButton, { color: theme.accent.red }]}>🗑️</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Main Card */}
        <View style={[styles.mainCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.grammarPoint, { color: theme.text }]}>
            {grammar.grammarPoint}
          </Text>

          <View style={styles.divider} />

          <Text style={[styles.sectionLabel, { color: theme.textSecondary }]}>
            Meaning / Use
          </Text>
          <Text style={[styles.meaning, { color: theme.text }]}>{grammar.meaning}</Text>
        </View>

        {/* Formation */}
        {grammar.formation && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Formation / Pattern
            </Text>
            <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <Text style={[styles.cardText, { color: theme.text }]}>{grammar.formation}</Text>
            </View>
          </View>
        )}

        {/* Example */}
        {grammar.exampleSentence && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Example Sentence</Text>
            <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <View style={styles.exampleHeader}>
                <Text style={[styles.cardText, { color: theme.text, flex: 1 }]}>
                  {grammar.exampleSentence}
                </Text>
                {activeLanguage && (
                  <TouchableOpacity onPress={speak}>
                    <Text style={styles.speakerIcon}>🔊</Text>
                  </TouchableOpacity>
                )}
              </View>
              {grammar.translation && (
                <Text style={[styles.translation, { color: theme.textSecondary }]}>
                  {grammar.translation}
                </Text>
              )}
            </View>
          </View>
        )}

        {/* Notes */}
        {grammar.notes && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Notes</Text>
            <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <Text style={[styles.cardText, { color: theme.text }]}>{grammar.notes}</Text>
            </View>
          </View>
        )}

        {/* Tags */}
        {grammar.tags.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Tags</Text>
            <View style={styles.tagsContainer}>
              {grammar.tags.map((tag, index) => (
                <View
                  key={index}
                  style={[
                    styles.tag,
                    { backgroundColor: theme.accent.purple + "20", borderColor: theme.accent.purple },
                  ]}
                >
                  <Text style={[styles.tagText, { color: theme.accent.purple }]}>{tag}</Text>
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
                {grammar.status.charAt(0).toUpperCase() + grammar.status.slice(1)}
              </Text>
            </View>
            <View style={styles.statRow}>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Review Count</Text>
              <Text style={[styles.statValue, { color: theme.text }]}>{grammar.reviewCount}</Text>
            </View>
            <View style={styles.statRow}>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Correct</Text>
              <Text style={[styles.statValue, { color: theme.accent.green }]}>
                {grammar.correctCount}
              </Text>
            </View>
            <View style={styles.statRow}>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Incorrect</Text>
              <Text style={[styles.statValue, { color: theme.accent.red }]}>
                {grammar.incorrectCount}
              </Text>
            </View>
            <View style={styles.statRow}>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Streak</Text>
              <Text style={[styles.statValue, { color: theme.accent.yellow }]}>
                {grammar.streak}
              </Text>
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
  grammarPoint: {
    fontSize: 32,
    fontWeight: "700",
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
  exampleHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
  },
  speakerIcon: {
    fontSize: 20,
  },
  translation: {
    ...typography.body,
    marginTop: spacing.sm,
    fontStyle: "italic",
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
