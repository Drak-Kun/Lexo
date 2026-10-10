import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { useApp } from "../../context/AppContext";
import { colors, spacing, borderRadius, typography } from "../../constants/theme";
import * as Speech from "expo-speech";

export default function WordsScreen() {
  const { words, activeLanguage, isDark, isLoading } = useApp();
  const router = useRouter();
  const theme = isDark ? colors.dark : colors.light;

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // Get all unique tags
  const allTags = useMemo(() => {
    const tags = words.flatMap((w) => w.tags);
    return [...new Set(tags)].sort();
  }, [words]);

  // Filter words
  const filteredWords = useMemo(() => {
    let filtered = words;

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (w) =>
          w.word.toLowerCase().includes(query) ||
          w.meaning.toLowerCase().includes(query) ||
          w.reading?.toLowerCase().includes(query) ||
          w.example?.toLowerCase().includes(query) ||
          w.notes?.toLowerCase().includes(query) ||
          w.tags.some((tag) => tag.toLowerCase().includes(query))
      );
    }

    // Filter by tags
    if (selectedTags.length > 0) {
      filtered = filtered.filter((w) => w.tags.some((tag) => selectedTags.includes(tag)));
    }

    return filtered;
  }, [words, searchQuery, selectedTags]);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const speak = (text: string) => {
    if (activeLanguage) {
      Speech.speak(text, {
        language: activeLanguage.code,
        rate: 0.9,
      });
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>Words</Text>
        <TouchableOpacity onPress={() => router.push("/add-word")}>
          <Text style={[styles.addButton, { color: theme.primary }]}>+ Add</Text>
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={[styles.searchContainer, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={[styles.searchInput, { color: theme.text }]}
          placeholder="Search words..."
          placeholderTextColor={theme.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery("")}>
            <Text style={[styles.clearButton, { color: theme.textSecondary }]}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Tags */}
      {allTags.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.tagsContainer}
          contentContainerStyle={styles.tagsContent}
        >
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
        </ScrollView>
      )}

      {/* Words List */}
      {filteredWords.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={[styles.emptyIcon, { color: theme.textSecondary }]}>📚</Text>
          <Text style={[styles.emptyTitle, { color: theme.text }]}>
            {words.length === 0 ? "No words yet" : "No words found"}
          </Text>
          <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
            {words.length === 0
              ? "Add your first word to start building your vocabulary."
              : "Try a different search or tag."}
          </Text>
          {words.length === 0 && (
            <TouchableOpacity
              style={[styles.emptyButton, { backgroundColor: theme.primary }]}
              onPress={() => router.push("/add-word")}
            >
              <Text style={styles.emptyButtonText}>+ Add Word</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <FlatList
          data={filteredWords}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.wordCard, { backgroundColor: theme.card, borderColor: theme.border }]}
              onPress={() => router.push(`/word-detail?id=${item.id}`)}
            >
              <View style={styles.wordContent}>
                <View style={styles.wordMain}>
                  <Text style={[styles.word, { color: theme.text }]}>{item.word}</Text>
                  {item.reading && (
                    <Text style={[styles.reading, { color: theme.textSecondary }]}>
                      {item.reading}
                    </Text>
                  )}
                  <Text style={[styles.meaning, { color: theme.textSecondary }]}>
                    {item.meaning}
                  </Text>
                </View>

                <TouchableOpacity
                  style={styles.speakerButton}
                  onPress={() => speak(item.word)}
                >
                  <Text style={styles.speakerIcon}>🔊</Text>
                </TouchableOpacity>
              </View>

              {item.tags.length > 0 && (
                <View style={styles.wordTags}>
                  {item.tags.map((tag, index) => (
                    <View
                      key={index}
                      style={[styles.wordTag, { backgroundColor: theme.accent.cyan + "20", borderColor: theme.accent.cyan }]}
                    >
                      <Text style={[styles.wordTagText, { color: theme.accent.cyan }]}>
                        {tag}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
            </TouchableOpacity>
          )}
        />
      )}
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
  title: {
    ...typography.title,
  },
  addButton: {
    fontSize: 18,
    fontWeight: "600",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
  },
  searchIcon: {
    fontSize: 18,
    marginRight: spacing.sm,
  },
  searchInput: {
    flex: 1,
    paddingVertical: spacing.md,
    ...typography.body,
  },
  clearButton: {
    fontSize: 18,
    padding: spacing.sm,
  },
  tagsContainer: {
    marginBottom: spacing.md,
  },
  tagsContent: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  tag: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
  },
  tagText: {
    ...typography.caption,
    fontWeight: "500",
  },
  listContent: {
    padding: spacing.lg,
  },
  wordCard: {
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    marginBottom: spacing.md,
  },
  wordContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  wordMain: {
    flex: 1,
  },
  word: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: spacing.xs,
  },
  reading: {
    ...typography.body,
    marginBottom: spacing.xs,
  },
  meaning: {
    ...typography.body,
  },
  speakerButton: {
    padding: spacing.sm,
  },
  speakerIcon: {
    fontSize: 20,
  },
  wordTags: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  wordTag: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
  },
  wordTagText: {
    fontSize: 12,
    fontWeight: "500",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.xl,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: spacing.md,
  },
  emptyTitle: {
    ...typography.heading,
    marginBottom: spacing.sm,
  },
  emptySubtitle: {
    ...typography.body,
    textAlign: "center",
    marginBottom: spacing.lg,
  },
  emptyButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
  },
  emptyButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
