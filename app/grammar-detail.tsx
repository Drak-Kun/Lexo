import React, { useCallback, useState } from "react";
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
import { getGrammar, deleteGrammar } from "../storage";
import { Grammar } from "../types";
import * as Speech from "expo-speech";
import {
  ArrowLeft,
  CircleCheck,
  CircleX,
  Clock3,
  Flame,
  GraduationCap,
  Pencil,
  Trash2,
  Volume2,
} from "lucide-react-native";
import {
  MotionEntrance,
  MotionTouchableOpacity as TouchableOpacity,
} from "../components/Motion";

export default function GrammarDetailScreen() {
  const { id } = useLocalSearchParams<{ id?: string | string[] }>();
  const { activeLanguage, refreshData } = useApp();
  const router = useRouter();
  const theme = colors.dark;

  const [grammar, setGrammar] = useState<Grammar | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let isCurrent = true;
      const loadGrammar = async () => {
        setIsLoading(true);
        try {
          const grammarList = await getGrammar();
          const grammarId = Array.isArray(id) ? id[0] : id;
          const found = grammarList.find((item) => item.id === grammarId);
          if (isCurrent) setGrammar(found || null);
        } catch (error) {
          console.error("Error loading grammar details:", error);
          if (isCurrent) {
            setGrammar(null);
            Alert.alert("Error", "Unable to load this grammar point.");
          }
        } finally {
          if (isCurrent) setIsLoading(false);
        }
      };

      loadGrammar();
      return () => {
        isCurrent = false;
      };
    }, [id])
  );

  const handleDelete = () => {
    if (!grammar) return;
    Alert.alert(
      "Delete Grammar",
      "Are you sure you want to delete this grammar point?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            void (async () => {
              try {
                await deleteGrammar(grammar.id);
                await refreshData();
                router.back();
              } catch (error) {
                console.error("Error deleting grammar:", error);
                Alert.alert("Error", "Unable to delete this grammar point.");
              }
            })();
          },
        },
      ]
    );
  };

  const speak = () => {
    if (grammar?.exampleSentence && activeLanguage) {
      Speech.speak(grammar.exampleSentence, {
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

  if (!grammar) {
    return (
      <SafeAreaView edges={["top"]} style={[styles.container, { backgroundColor: theme.background }]}>
        <MotionEntrance>
          <Text style={[styles.errorText, { color: theme.text }]}>Grammar not found</Text>
        </MotionEntrance>
      </SafeAreaView>
    );
  }

  const learningStats = [
    {
      label: "Current status",
      value: grammar.status,
      color: theme.accent.purple,
      icon: GraduationCap,
    },
    {
      label: "Reviews",
      value: String(grammar.reviewCount),
      color: theme.text,
      icon: Clock3,
    },
    {
      label: "Correct answers",
      value: String(grammar.correctCount),
      color: theme.accent.green,
      icon: CircleCheck,
    },
    {
      label: "Incorrect answers",
      value: String(grammar.incorrectCount),
      color: theme.accent.red,
      icon: CircleX,
    },
    {
      label: "Streak",
      value: String(grammar.streak),
      color: theme.accent.yellow,
      icon: Flame,
    },
  ] as const;

  return (
    <SafeAreaView edges={["top"]} style={[styles.container, { backgroundColor: theme.background }]}>
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
            Grammar Details
          </Text>
        </View>
        <View style={[styles.headerColumn, styles.headerRight]}>
          <TouchableOpacity
            onPress={handleDelete}
            style={[styles.deleteButton, { borderColor: theme.border }]}
            accessibilityRole="button"
            accessibilityLabel="Delete grammar"
          >
            <Trash2 size={20} color={theme.accent.red} strokeWidth={1.9} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <MotionEntrance style={[styles.mainCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.grammarPoint, { color: theme.text }]}>{grammar.grammarPoint}</Text>
          <View style={styles.divider} />
          <Text style={[styles.sectionLabel, { color: theme.textSecondary }]}>Meaning / Use</Text>
          <Text style={[styles.meaning, { color: theme.text }]}>{grammar.meaning}</Text>

          {grammar.tags.length > 0 && (
            <View style={styles.mainCardTags}>
              {grammar.tags.map((tag, index) => (
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
            onPress={() => router.push({ pathname: "/add-grammar", params: { id: grammar.id } })}
            accessibilityRole="button"
          >
            <View style={styles.editButtonContent}>
              <Pencil size={17} color={theme.onPrimary} strokeWidth={2} />
              <Text style={styles.editButtonText}>Edit Grammar</Text>
            </View>
          </TouchableOpacity>
        </MotionEntrance>

        {grammar.formation && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Formation / Pattern</Text>
            <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <Text style={[styles.cardText, { color: theme.text }]}>{grammar.formation}</Text>
            </View>
          </View>
        )}

        {grammar.exampleSentence && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Example Sentence</Text>
            <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <View style={styles.exampleHeader}>
                <Text style={[styles.cardText, styles.exampleText, { color: theme.text }]}>
                  {grammar.exampleSentence}
                </Text>
                {activeLanguage && (
                  <TouchableOpacity
                    onPress={speak}
                    style={styles.speakerButton}
                    accessibilityRole="button"
                    accessibilityLabel="Speak example sentence"
                  >
                    <Volume2 size={19} color={theme.textSecondary} strokeWidth={2} />
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

        {grammar.notes && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Notes</Text>
            <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <Text style={[styles.cardText, { color: theme.text }]}>{grammar.notes}</Text>
            </View>
          </View>
        )}

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Learning Status</Text>
          <View style={[styles.card, styles.learningCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            {learningStats.map((stat, index) => (
              <View
                key={stat.label}
                style={[
                  styles.statRow,
                  { borderColor: theme.border },
                  index === learningStats.length - 1 && styles.lastStatRow,
                ]}
              >
                <View style={styles.statDetails}>
                  <stat.icon size={18} color={stat.color} strokeWidth={1.9} />
                  <Text style={[styles.statLabel, { color: theme.textSecondary }]}>{stat.label}</Text>
                </View>
                <Text style={[styles.statValue, { color: stat.color }]}>
                  {stat.label === "Current status"
                    ? stat.value.charAt(0).toUpperCase() + stat.value.slice(1)
                    : stat.value}
                </Text>
              </View>
            ))}
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
  headerTitle: {
    ...typography.heading,
    width: "100%",
    textAlign: "center",
    fontSize: 17,
  },
  deleteButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.dark.elevated,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
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
  grammarPoint: {
    fontSize: 32,
    fontWeight: "700",
    lineHeight: 40,
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
    minHeight: 48,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 999,
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
  exampleHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
  },
  exampleText: {
    flex: 1,
  },
  speakerButton: {
    minWidth: 32,
    minHeight: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  translation: {
    ...typography.body,
    marginTop: spacing.sm,
    fontStyle: "italic",
  },
  tag: {
    minHeight: 26,
    justifyContent: "center",
    paddingHorizontal: spacing.sm,
    borderRadius: 999,
    borderWidth: 1,
  },
  tagText: {
    fontSize: 12,
    fontWeight: "500",
  },
  statRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    minHeight: 44,
    paddingVertical: spacing.xs,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  lastStatRow: {
    borderBottomWidth: 0,
  },
  statDetails: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  statLabel: {
    fontSize: 13,
  },
  statValue: {
    fontSize: 16,
    fontWeight: "600",
    textTransform: "capitalize",
  },
  errorText: {
    ...typography.body,
    textAlign: "center",
    marginTop: spacing.xl,
  },
});
