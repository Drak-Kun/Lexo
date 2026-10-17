import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useRouter, useLocalSearchParams, useFocusEffect } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useApp } from "../context/AppContext";
import { colors, spacing, borderRadius, typography } from "../constants/theme";
import { getWords, deleteWord } from "../storage";
import { Word } from "../types";
import * as Speech from "expo-speech";
import { ArrowLeft, Pencil, Trash2, Volume2 } from "lucide-react-native";
import {
  MotionEntrance,
  MotionTouchableOpacity as TouchableOpacity,
} from "../components/Motion";

export default function WordDetailScreen() {
  const { id } = useLocalSearchParams<{ id?: string | string[] }>();
  const { activeLanguage, refreshData } = useApp();
  const router = useRouter();
  const theme = colors.dark;

  const [word, setWord] = useState<Word | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let isCurrent = true;
      const loadWord = async () => {
        setIsLoading(true);
        try {
          const words = await getWords();
          const wordId = Array.isArray(id) ? id[0] : id;
          const found = words.find((item) => item.id === wordId);
          if (isCurrent) setWord(found || null);
        } catch (error) {
          console.error("Error loading word details:", error);
          if (isCurrent) {
            setWord(null);
            Alert.alert("Error", "Unable to load this word.");
          }
        } finally {
          if (isCurrent) setIsLoading(false);
        }
      };

      loadWord();
      return () => {
        isCurrent = false;
      };
    }, [id])
  );

  const handleDelete = () => {
    if (!word) return;
    Alert.alert(
      "Delete Word",
      "Are you sure you want to delete this word?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            void (async () => {
              try {
                await deleteWord(word.id);
                await refreshData();
                router.back();
              } catch (error) {
                console.error("Error deleting word:", error);
                Alert.alert("Error", "Unable to delete this word.");
              }
            })();
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

  if (isLoading) {
    return (
      <SafeAreaView edges={["top"]} style={[styles.container, styles.loading, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </SafeAreaView>
    );
  }

  if (!word) {
    return (
      <SafeAreaView edges={["top"]} style={[styles.container, { backgroundColor: theme.background }]}>
        <MotionEntrance>
          <Text style={[styles.errorText, { color: theme.text }]}>Word not found</Text>
        </MotionEntrance>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={["top"]} style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerColumn}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
            accessibilityRole="button"
            accessibilityLabel="Back"
          >
            <ArrowLeft size={22} color={theme.text} strokeWidth={2} />
          </TouchableOpacity>
        </View>
        <View style={[styles.headerColumn, styles.headerCenter]}>
          <Text
            style={[styles.headerTitle, { color: theme.text }]}
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.8}
          >
            Word Details
          </Text>
        </View>
        <View style={[styles.headerColumn, styles.headerRight]}>
          <TouchableOpacity
            onPress={handleDelete}
            style={styles.deleteButton}
            accessibilityRole="button"
            accessibilityLabel="Delete word"
          >
            <Trash2 size={20} color={theme.accent.red} strokeWidth={1.9} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Main Card */}
        <MotionEntrance style={[styles.mainCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={styles.mainCardHeader}>
            <Text style={[styles.word, { color: theme.text }]}>{word.word}</Text>
            <TouchableOpacity
              onPress={speak}
              style={styles.speakerButton}
              accessibilityRole="button"
              accessibilityLabel={`Pronounce ${word.word}`}
            >
              <Volume2 size={20} color={theme.textSecondary} strokeWidth={2} />
            </TouchableOpacity>
          </View>
          {word.reading && (
            <View style={styles.readingBlock}>
              <Text style={[styles.sectionLabel, { color: theme.textSecondary }]}>Reading</Text>
              <Text style={[styles.reading, { color: theme.text }]}>{word.reading}</Text>
            </View>
          )}

          <View style={styles.divider} />

          <Text style={[styles.sectionLabel, { color: theme.textSecondary }]}>Meaning</Text>
          <Text style={[styles.meaning, { color: theme.text }]}>{word.meaning}</Text>

          {word.tags.length > 0 && (
            <View style={styles.mainCardTags}>
              {word.tags.map((tag, index) => (
                <View
                  key={`${tag}-${index}`}
                  style={[styles.tag, { backgroundColor: theme.tagSurface, borderColor: theme.tagBorder }]}
                >
                  <Text style={[styles.tagText, { color: theme.accent.purple }]}>{tag}</Text>
                </View>
              ))}
            </View>
          )}

          <TouchableOpacity
            style={[styles.editButton, { backgroundColor: theme.primary }]}
            onPress={() => router.push({ pathname: "/add-word", params: { id: word.id } })}
            accessibilityRole="button"
          >
            <View style={styles.editButtonContent}>
              <Pencil size={17} color={theme.onPrimary} strokeWidth={2} />
              <Text style={styles.editButtonText}>Edit Word</Text>
            </View>
          </TouchableOpacity>
        </MotionEntrance>

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

        {/* Learning Status */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Learning Status</Text>
          <View style={[styles.card, styles.learningCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <View style={styles.statusRow}>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Current status</Text>
              <Text style={[styles.statValue, styles.statusValue, { color: theme.accent.purple }]}>
                {word.status.charAt(0).toUpperCase() + word.status.slice(1)}
              </Text>
            </View>
            <View style={[styles.statRow, { borderColor: theme.border }]}>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Reviews</Text>
              <Text style={[styles.statValue, { color: theme.text }]}>{word.reviewCount}</Text>
            </View>
            <View style={[styles.statRow, { borderColor: theme.border }]}>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Correct answers</Text>
              <Text style={[styles.statValue, { color: theme.accent.green }]}>{word.correctCount}</Text>
            </View>
            <View style={[styles.statRow, { borderColor: theme.border }]}>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Incorrect answers</Text>
              <Text style={[styles.statValue, { color: theme.accent.red }]}>{word.incorrectCount}</Text>
            </View>
            <View style={[styles.statRow, styles.lastStatRow]}>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Streak</Text>
              <Text style={[styles.statValue, { color: theme.accent.yellow }]}>{word.streak}</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loading: {
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    minHeight: 56,
  },
  headerColumn: {
    flex: 1,
    minWidth: 0,
    justifyContent: "center",
  },
  headerCenter: {
    alignItems: "center",
  },
  headerRight: {
    alignItems: "flex-end",
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: "flex-start",
    justifyContent: "center",
  },
  deleteButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.dark.elevated,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    ...typography.heading,
    width: "100%",
    textAlign: "center",
    fontSize: 17,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xs,
    paddingBottom: spacing.xl,
  },
  mainCard: {
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    marginBottom: spacing.md,
  },
  mainCardHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  word: {
    fontSize: 32,
    fontWeight: "700",
    flex: 1,
    flexShrink: 1,
    lineHeight: 40,
  },
  speakerButton: {
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: spacing.sm,
  },
  reading: {
    ...typography.body,
    lineHeight: 22,
  },
  readingBlock: {
    marginTop: spacing.sm,
  },
  divider: {
    height: 1,
    backgroundColor: colors.dark.divider,
    marginVertical: spacing.sm,
  },
  sectionLabel: {
    ...typography.small,
    textTransform: "uppercase",
    marginBottom: 2,
  },
  meaning: {
    fontSize: 16,
    lineHeight: 23,
  },
  mainCardTags: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginTop: spacing.md,
    marginBottom: spacing.md,
  },
  editButton: {
    minHeight: 46,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: borderRadius.md,
  },
  editButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
  },
  editButtonText: {
    color: colors.dark.onPrimary,
    fontSize: 16,
    fontWeight: "700",
  },
  section: {
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: spacing.xs,
  },
  card: {
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
  },
  learningCard: {
    paddingVertical: spacing.xs,
  },
  cardText: {
    ...typography.body,
    lineHeight: 24,
  },
  tag: {
    minHeight: 26,
    justifyContent: "center",
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
  },
  tagText: {
    fontSize: 12,
    fontWeight: "500",
  },
  statusRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    minHeight: 42,
    paddingVertical: spacing.xs,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: colors.dark.divider,
  },
  lastStatRow: {
    borderBottomWidth: 0,
  },
  statRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    minHeight: 42,
    paddingVertical: spacing.xs,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: colors.dark.divider,
  },
  statusValue: { textTransform: "capitalize" },
  statLabel: {
    fontSize: 12,
  },
  statValue: {
    fontSize: 16,
    fontWeight: "600",
  },
  errorText: {
    ...typography.body,
    textAlign: "center",
    marginTop: spacing.xl,
  },
});
