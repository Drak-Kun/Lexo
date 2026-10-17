import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useApp } from "../context/AppContext";
import { colors, spacing, borderRadius, typography } from "../constants/theme";
import { ContentType } from "../types";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  ChartNoAxesColumnIncreasing,
  Layers,
  NotebookText,
} from "lucide-react-native";
import {
  getAllTags,
  getAvailableQuestionCount,
  getQuestionCountValidationError,
} from "../utils/quiz";

export default function QuizSetupScreen() {
  const { words, grammar } = useApp();
  const router = useRouter();
  const theme = colors.dark;

  const [contentType, setContentType] = useState<ContentType>("words");
  const [selectedTags, setSelectedTags] = useState<string[]>(["All Tags"]);
  const [questionCount, setQuestionCount] = useState(10);
  const [isCustomCount, setIsCustomCount] = useState(false);
  const [customCount, setCustomCount] = useState("");

  const allTags = useMemo(() => getAllTags(words, grammar), [words, grammar]);

  const availableCounts = useMemo(
    () => getAvailableQuestionCount(contentType, words, grammar, selectedTags),
    [contentType, words, grammar, selectedTags]
  );

  const toggleTag = (tag: string) => {
    if (tag === "All Tags") {
      setSelectedTags(["All Tags"]);
    } else {
      setSelectedTags((prev) => {
        const filtered = prev.filter((t) => t !== "All Tags");
        if (filtered.includes(tag)) {
          const newTags = filtered.filter((t) => t !== tag);
          return newTags.length === 0 ? ["All Tags"] : newTags;
        } else {
          return [...filtered, tag];
        }
      });
    }
  };

  const customCountError = !isCustomCount
    ? null
    : getQuestionCountValidationError(customCount);
  const requestedQuestionCount = isCustomCount
    ? Number(customCount)
    : questionCount;
  const canStartQuiz = availableCounts.total > 0 && customCountError === null;

  const contentTypes = [
    { value: "words" as const, label: "Words", Icon: BookOpen },
    { value: "grammar" as const, label: "Grammar", Icon: NotebookText },
    { value: "mixed" as const, label: "Mixed", Icon: Layers },
  ];
  const availableLabel =
    contentType === "words"
      ? "WORDS AVAILABLE"
      : contentType === "grammar"
        ? "GRAMMAR POINTS AVAILABLE"
        : "QUESTIONS AVAILABLE";

  const handleStartQuiz = () => {
    if (availableCounts.total === 0) {
      Alert.alert("No Questions", "Add eligible content or choose different tags.");
      return;
    }

    if (customCountError !== null) return;

    router.push({
      pathname: "/quiz",
      params: {
        contentType,
        tags: selectedTags.join(","),
        questionCount: requestedQuestionCount.toString(),
      },
    });
  };

  return (
    <SafeAreaView
      edges={["top", "bottom"]}
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.headerSide}
          accessibilityRole="button"
          accessibilityLabel="Back"
        >
          <ArrowLeft size={18} color={theme.text} strokeWidth={2} />
          <Text style={[styles.backButton, { color: theme.text }]}>Back</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter} pointerEvents="none">
          <Text
            style={[styles.title, { color: theme.text }]}
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.85}
          >
            Quiz Setup
          </Text>
        </View>
        <View style={[styles.headerSide, styles.headerRight]} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.section}>
          <View style={styles.stepLabel}>
            <View style={[styles.stepBadge, { borderColor: theme.primary }]}>
              <Text style={[styles.stepNumber, { color: theme.primary }]}>01</Text>
            </View>
            <Text style={[styles.stepName, { color: theme.primary }]}>CONTENT</Text>
          </View>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Choose Content Type
          </Text>
          <Text style={[styles.sectionSubtitle, { color: theme.textSecondary }]}>
            What do you want to be quizzed on?
          </Text>

          <View style={styles.optionsRow}>
            {contentTypes.map(({ value, label, Icon }) => {
              const isSelected = contentType === value;
              return (
                <TouchableOpacity
                  key={value}
                  style={[
                    styles.option,
                    {
                      backgroundColor: isSelected ? theme.accentSurface : theme.card,
                      borderColor: isSelected ? theme.primary : theme.border,
                    },
                  ]}
                  onPress={() => setContentType(value)}
                  accessibilityRole="button"
                  accessibilityState={{ selected: isSelected }}
                >
                  <Icon
                    size={22}
                    color={isSelected ? theme.primary : theme.textSecondary}
                    strokeWidth={1.8}
                  />
                  <Text
                    style={[
                      styles.optionText,
                      { color: isSelected ? theme.primary : theme.text },
                    ]}
                    numberOfLines={1}
                  >
                    {label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.stepLabel}>
            <View style={[styles.stepBadge, { borderColor: theme.primary }]}>
              <Text style={[styles.stepNumber, { color: theme.primary }]}>02</Text>
            </View>
            <Text style={[styles.stepName, { color: theme.primary }]}>TAGS</Text>
          </View>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Choose Tags</Text>
          <Text style={[styles.sectionSubtitle, { color: theme.textSecondary }]}>
            Select the topics you want to include.
          </Text>

          <View style={styles.tagsContainer}>
            <TouchableOpacity
              style={[
                styles.tag,
                {
                  backgroundColor: selectedTags.includes("All Tags")
                    ? theme.primary
                    : theme.card,
                  borderColor: selectedTags.includes("All Tags")
                    ? theme.primary
                    : theme.border,
                },
              ]}
              onPress={() => toggleTag("All Tags")}
            >
              <Text
                style={[
                  styles.tagText,
                  { color: selectedTags.includes("All Tags") ? "#FFFFFF" : theme.text },
                ]}
              >
                All Tags
              </Text>
            </TouchableOpacity>

            {allTags.map((tag) => {
              const isSelected = selectedTags.includes(tag);
              return (
                <TouchableOpacity
                  key={tag}
                  style={[
                    styles.tag,
                    {
                      backgroundColor: isSelected ? theme.primary : theme.card,
                      borderColor: isSelected ? theme.primary : theme.border,
                    },
                  ]}
                  onPress={() => toggleTag(tag)}
                >
                  <Text
                    style={[
                      styles.tagText,
                      { color: isSelected ? "#FFFFFF" : theme.text },
                    ]}
                  >
                    {tag}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <View
            style={[
              styles.availableCard,
              { backgroundColor: theme.card, borderColor: theme.border },
            ]}
          >
            <ChartNoAxesColumnIncreasing
              size={20}
              color={theme.primary}
              strokeWidth={1.8}
            />
            <View style={[styles.availableDivider, { backgroundColor: theme.border }]} />
            <View style={styles.availableInfo}>
              <Text style={[styles.availableCount, { color: theme.primary }]}>
                {availableCounts.total}
              </Text>
              <Text style={[styles.availableText, { color: theme.textSecondary }]}>
                {availableLabel}
              </Text>
            </View>
          </View>
          {availableCounts.total === 0 && (
            <Text style={[styles.emptyAvailableText, { color: theme.textSecondary }]}>
              No eligible questions. Add content or choose different tags.
            </Text>
          )}
        </View>

        <View style={[styles.section, styles.lastSection]}>
          <View style={styles.stepLabel}>
            <View style={[styles.stepBadge, { borderColor: theme.primary }]}>
              <Text style={[styles.stepNumber, { color: theme.primary }]}>03</Text>
            </View>
            <Text style={[styles.stepName, { color: theme.primary }]}>QUESTIONS</Text>
          </View>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Choose Number of Questions
          </Text>
          <Text style={[styles.sectionSubtitle, { color: theme.textSecondary }]}>
            How many questions do you want in this quiz?
          </Text>

          <View style={styles.optionsRow}>
            {[5, 10, 20].map((count) => {
              const isSelected = questionCount === count;
              return (
                <TouchableOpacity
                  key={count}
                  style={[
                    styles.countOption,
                    {
                      backgroundColor: isSelected ? theme.accentSurface : theme.card,
                      borderColor: isSelected ? theme.primary : theme.border,
                    },
                  ]}
                  onPress={() => {
                    setQuestionCount(count);
                    setIsCustomCount(false);
                  }}
                >
                  <Text
                    style={[
                      styles.countOptionText,
                      { color: isSelected ? theme.primary : theme.text },
                    ]}
                  >
                    {count}
                  </Text>
                </TouchableOpacity>
              );
            })}
            <TouchableOpacity
              style={[
                styles.countOption,
                {
                  backgroundColor: isCustomCount ? theme.accentSurface : theme.card,
                  borderColor: isCustomCount ? theme.primary : theme.border,
                },
              ]}
              onPress={() => setIsCustomCount(true)}
            >
              <Text
                style={[
                  styles.customCountOptionText,
                  { color: isCustomCount ? theme.primary : theme.text },
                ]}
              >
                Custom
              </Text>
            </TouchableOpacity>
          </View>
          {isCustomCount && (
            <View>
              <TextInput
                style={[
                  styles.customCountInput,
                  { backgroundColor: theme.card, borderColor: customCountError ? theme.accent.red : theme.border, color: theme.text },
                ]}
                value={customCount}
                onChangeText={setCustomCount}
                keyboardType="number-pad"
                placeholder="Enter number of questions"
                placeholderTextColor={theme.textSecondary}
                accessibilityLabel="Custom question count"
                maxLength={6}
              />
              {customCountError !== null && (
                <Text style={[styles.validationText, { color: theme.accent.red }]}>
                  {customCountError}
                </Text>
              )}
            </View>
          )}
        </View>

        <TouchableOpacity
          style={[
            styles.startButton,
            {
              backgroundColor: canStartQuiz ? theme.primary : theme.border,
            },
          ]}
          onPress={handleStartQuiz}
          disabled={!canStartQuiz}
          accessibilityRole="button"
        >
          <Text style={[styles.startButtonText, { color: theme.onPrimary }]}>
            Start Quiz
          </Text>
          <ArrowRight size={20} color={theme.onPrimary} strokeWidth={2} />
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
    paddingHorizontal: spacing.sm,
    paddingTop: spacing.xs,
    paddingBottom: spacing.sm,
  },
  headerSide: {
    flex: 1,
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    minHeight: 44,
  },
  headerCenter: {
    flex: 1,
    minWidth: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  headerRight: {
    justifyContent: "flex-end",
  },
  backButton: {
    fontSize: 15,
    fontWeight: "500",
  },
  title: {
    ...typography.heading,
    textAlign: "center",
    flexShrink: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xs,
    paddingBottom: spacing.lg,
  },
  section: {
    marginBottom: spacing.lg,
  },
  lastSection: {
    marginBottom: spacing.md,
  },
  stepLabel: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  stepBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  stepNumber: {
    fontSize: 11,
    fontWeight: "700",
    includeFontPadding: false,
  },
  stepName: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1.2,
  },
  sectionTitle: {
    ...typography.heading,
    marginBottom: spacing.xs,
  },
  sectionSubtitle: {
    ...typography.caption,
    marginBottom: spacing.md,
  },
  optionsRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  option: {
    flex: 1,
    minWidth: 0,
    minHeight: 104,
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: spacing.sm,
  },
  optionText: {
    fontSize: 14,
    fontWeight: "600",
    includeFontPadding: false,
    textAlign: "center",
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  tag: {
    paddingHorizontal: spacing.md,
    height: 36,
    minHeight: 36,
    borderRadius: 999,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  tagText: {
    fontSize: 14,
    fontWeight: "500",
    includeFontPadding: false,
    textAlign: "center",
  },
  availableCard: {
    minHeight: 56,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    gap: spacing.md,
  },
  availableDivider: {
    width: 1,
    alignSelf: "stretch",
    marginVertical: spacing.xs,
  },
  availableInfo: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  availableText: {
    flexShrink: 1,
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  availableCount: {
    fontSize: 20,
    fontWeight: "700",
  },
  emptyAvailableText: {
    ...typography.caption,
    marginTop: spacing.xs,
  },
  countOption: {
    flex: 1,
    minWidth: 0,
    minHeight: 46,
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  countOptionText: {
    fontSize: 17,
    fontWeight: "600",
    includeFontPadding: false,
  },
  customCountOptionText: {
    fontSize: 13,
    fontWeight: "600",
    includeFontPadding: false,
    textAlign: "center",
  },
  customCountInput: {
    borderWidth: 1,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    marginTop: spacing.md,
    fontSize: 16,
  },
  validationText: {
    ...typography.caption,
    marginTop: spacing.xs,
  },
  startButton: {
    minHeight: 52,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: 999,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
  },
  startButtonText: {
    fontSize: 18,
    fontWeight: "600",
  },
});
