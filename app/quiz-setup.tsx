import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { useApp } from "../context/AppContext";
import { colors, spacing, borderRadius, typography } from "../constants/theme";
import { ContentType } from "../types";
import { getAllTags, getAvailableQuestionCount } from "../utils/quiz";

export default function QuizSetupScreen() {
  const { words, grammar, isDark } = useApp();
  const router = useRouter();
  const theme = isDark ? colors.dark : colors.light;

  const [contentType, setContentType] = useState<ContentType>("words");
  const [selectedTags, setSelectedTags] = useState<string[]>(["All Tags"]);
  const [questionCount, setQuestionCount] = useState(10);

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

  const questionOptions = [5, 10, 20, availableCounts.total].filter(
    (n, i, arr) => n <= availableCounts.total && arr.indexOf(n) === i
  );

  const handleStartQuiz = () => {
    if (availableCounts.total === 0) {
      Alert.alert("No Content", "Please add some words or grammar points first.");
      return;
    }

    const actualQuestionCount = Math.min(questionCount, availableCounts.total);

    router.push({
      pathname: "/quiz",
      params: {
        contentType,
        tags: selectedTags.join(","),
        questionCount: actualQuestionCount.toString(),
      },
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={[styles.backButton, { color: theme.text }]}>← Back</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.text }]}>Quiz Setup</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Step 1: Content Type */}
        <View style={styles.section}>
          <Text style={[styles.stepNumber, { color: theme.textSecondary }]}>Step 1</Text>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Choose Content Type</Text>

          <View style={styles.optionsRow}>
            <TouchableOpacity
              style={[
                styles.option,
                {
                  backgroundColor: contentType === "words" ? theme.primary : theme.card,
                  borderColor: contentType === "words" ? theme.primary : theme.border,
                },
              ]}
              onPress={() => setContentType("words")}
            >
              <Text
                style={[
                  styles.optionText,
                  { color: contentType === "words" ? "#FFFFFF" : theme.text },
                ]}
              >
                Words
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.option,
                {
                  backgroundColor: contentType === "grammar" ? theme.primary : theme.card,
                  borderColor: contentType === "grammar" ? theme.primary : theme.border,
                },
              ]}
              onPress={() => setContentType("grammar")}
            >
              <Text
                style={[
                  styles.optionText,
                  { color: contentType === "grammar" ? "#FFFFFF" : theme.text },
                ]}
              >
                Grammar
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.option,
                {
                  backgroundColor: contentType === "mixed" ? theme.primary : theme.card,
                  borderColor: contentType === "mixed" ? theme.primary : theme.border,
                },
              ]}
              onPress={() => setContentType("mixed")}
            >
              <Text
                style={[
                  styles.optionText,
                  { color: contentType === "mixed" ? "#FFFFFF" : theme.text },
                ]}
              >
                Mixed
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Step 2: Tags */}
        <View style={styles.section}>
          <Text style={[styles.stepNumber, { color: theme.textSecondary }]}>Step 2</Text>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Choose Tags</Text>

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

          {/* Available Count */}
          <View style={[styles.availableCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            {contentType === "words" && (
              <Text style={[styles.availableText, { color: theme.text }]}>
                {availableCounts.words} words available
              </Text>
            )}
            {contentType === "grammar" && (
              <Text style={[styles.availableText, { color: theme.text }]}>
                {availableCounts.grammar} grammar points available
              </Text>
            )}
            {contentType === "mixed" && (
              <View>
                <Text style={[styles.availableText, { color: theme.text }]}>
                  {availableCounts.words} words available
                </Text>
                <Text style={[styles.availableText, { color: theme.text }]}>
                  {availableCounts.grammar} grammar points available
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Step 3: Question Count */}
        <View style={styles.section}>
          <Text style={[styles.stepNumber, { color: theme.textSecondary }]}>Step 3</Text>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Choose Number of Questions
          </Text>

          <View style={styles.optionsRow}>
            {questionOptions.map((count) => {
              const isSelected = questionCount === count;
              const label = count === availableCounts.total ? "All" : count.toString();
              return (
                <TouchableOpacity
                  key={count}
                  style={[
                    styles.countOption,
                    {
                      backgroundColor: isSelected ? theme.primary : theme.card,
                      borderColor: isSelected ? theme.primary : theme.border,
                    },
                  ]}
                  onPress={() => setQuestionCount(count)}
                >
                  <Text
                    style={[
                      styles.countOptionText,
                      { color: isSelected ? "#FFFFFF" : theme.text },
                    ]}
                  >
                    {label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Start Quiz Button */}
        <TouchableOpacity
          style={[
            styles.startButton,
            {
              backgroundColor: availableCounts.total > 0 ? theme.primary : theme.border,
            },
          ]}
          onPress={handleStartQuiz}
          disabled={availableCounts.total === 0}
        >
          <Text style={styles.startButtonText}>Start Quiz</Text>
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
  section: {
    marginBottom: spacing.xl,
  },
  stepNumber: {
    ...typography.caption,
    textTransform: "uppercase",
    marginBottom: spacing.xs,
  },
  sectionTitle: {
    ...typography.heading,
    marginBottom: spacing.md,
  },
  optionsRow: {
    flexDirection: "row",
    gap: spacing.md,
  },
  option: {
    flex: 1,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    alignItems: "center",
  },
  optionText: {
    fontSize: 16,
    fontWeight: "600",
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  tag: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
  },
  tagText: {
    fontSize: 14,
    fontWeight: "500",
  },
  availableCard: {
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    marginTop: spacing.md,
  },
  availableText: {
    ...typography.body,
    textAlign: "center",
  },
  countOption: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    alignItems: "center",
  },
  countOptionText: {
    fontSize: 18,
    fontWeight: "600",
  },
  startButton: {
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: "center",
    marginTop: spacing.lg,
  },
  startButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
  },
});
