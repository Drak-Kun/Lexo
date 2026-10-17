import React, { useState, useMemo, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useApp } from "../../context/AppContext";
import { colors, spacing, borderRadius, typography } from "../../constants/theme";
import { BookOpen, Plus, Search, Volume2, X } from "lucide-react-native";
import * as Speech from "expo-speech";
import {
  FocusMotion,
  MotionEntrance,
  MotionTouchableOpacity as TouchableOpacity,
} from "../../components/Motion";

export default function WordsScreen() {
  const { words, activeLanguage, isLoading } = useApp();
  const router = useRouter();
  const theme = colors.dark;

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const animatedWordIds = useRef(new Set<string>());

  const languageWords = useMemo(
    () =>
      activeLanguage
        ? words.filter((word) => word.languageId === activeLanguage.id)
        : [],
    [words, activeLanguage]
  );

  useEffect(() => {
    setSelectedTags([]);
  }, [activeLanguage?.id]);

  // Get all unique tags
  const allTags = useMemo(() => {
    const tags = languageWords.flatMap((word) => word.tags);
    return [...new Set(tags)].sort();
  }, [languageWords]);

  // Filter words
  const filteredWords = useMemo(() => {
    let filtered = languageWords;

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
  }, [languageWords, searchQuery, selectedTags]);

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
      <SafeAreaView edges={["top"]} style={[styles.container, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </SafeAreaView>
    );
  }

  return (
    <FocusMotion style={styles.container}>
    <SafeAreaView edges={["top"]} style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>Words</Text>
      </View>

      {/* Search */}
      <View style={[styles.searchContainer, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <Search size={18} color={theme.textSecondary} strokeWidth={2} style={styles.searchIcon} />
        <TextInput
          style={[styles.searchInput, { color: theme.text }]}
          placeholder="Search words..."
          placeholderTextColor={theme.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity style={styles.clearButton} onPress={() => setSearchQuery("")}>
            <X size={18} color={theme.textSecondary} strokeWidth={2} />
          </TouchableOpacity>
        )}
      </View>

      {/* Tags */}
      {allTags.length > 0 && (
        <View style={styles.tagsRow}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.tagsScroll}
            contentContainerStyle={styles.tagsContent}
            contentInsetAdjustmentBehavior="never"
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
                      { color: isSelected ? theme.onPrimary : theme.text },
                    ]}
                  >
                    {tag}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      )}

      {/* Words List */}
      {filteredWords.length === 0 ? (
        <MotionEntrance style={styles.emptyState}>
          <BookOpen size={56} color={theme.textSecondary} strokeWidth={1.75} style={styles.emptyIcon} />
          <Text style={[styles.emptyTitle, { color: theme.text }]}>
            {languageWords.length === 0 ? "No words yet" : "No words found"}
          </Text>
          <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
            {languageWords.length === 0
              ? "Add your first word to start building your vocabulary."
              : "Try a different search or tag."}
          </Text>
        </MotionEntrance>
      ) : (
        <FlatList
          data={filteredWords}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          contentInsetAdjustmentBehavior="never"
          renderItem={({ item, index }) => {
            const animateEntrance = !animatedWordIds.current.has(item.id);
            animatedWordIds.current.add(item.id);
            return (
            <MotionEntrance animate={animateEntrance} delay={Math.min(index, 4) * 35}>
              <TouchableOpacity
                style={[styles.wordCard, { backgroundColor: theme.card, borderColor: theme.border }]}
                onPress={() => router.push(`/word-detail?id=${item.id}`)}
              >
              <View style={styles.wordContent}>
                <View style={styles.wordMain}>
                  <Text style={[styles.word, { color: theme.text }]} numberOfLines={2} ellipsizeMode="tail">
                    {item.word}
                  </Text>
                  <Text style={[styles.meaning, { color: theme.textSecondary }]} numberOfLines={2} ellipsizeMode="tail">
                    {item.reading ? `${item.reading} · ` : ""}
                    {item.meaning}
                  </Text>
                </View>

                <TouchableOpacity
                  style={styles.speakerButton}
                  onPress={() => speak(item.word)}
                  accessibilityRole="button"
                  accessibilityLabel={`Pronounce ${item.word}`}
                >
                  <Volume2 size={20} color={theme.textSecondary} strokeWidth={2} />
                </TouchableOpacity>
              </View>

              <View style={styles.wordTags}>
                {item.tags.map((tag, index) => (
                  <View
                    key={`${tag}-${index}`}
                    style={[styles.wordTag, { backgroundColor: theme.tagSurface, borderColor: theme.tagBorder }]}
                  >
                    <Text style={[styles.wordTagText, { color: theme.accent.purple }]} numberOfLines={1}>
                      {tag}
                    </Text>
                  </View>
                ))}
              </View>
              </TouchableOpacity>
            </MotionEntrance>
            );
          }}
        />
      )}

      <TouchableOpacity
        style={[styles.addFab, { backgroundColor: theme.primary }]}
        onPress={() => router.push("/add-word")}
        accessibilityRole="button"
        accessibilityLabel="Add word"
      >
        <Plus size={28} color={theme.onPrimary} strokeWidth={2.5} />
      </TouchableOpacity>
    </SafeAreaView>
    </FocusMotion>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
  },
  title: {
    ...typography.title,
    alignSelf: "flex-start",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: spacing.lg,
    marginBottom: 12,
    paddingHorizontal: spacing.md,
    borderRadius: 999,
    borderWidth: 1,
    minHeight: 48,
  },
  searchIcon: {
    marginRight: spacing.sm,
  },
  searchInput: {
    flex: 1,
    paddingVertical: spacing.sm,
    ...typography.body,
  },
  clearButton: {
    padding: spacing.sm,
  },
  tagsRow: {
    height: 52,
    marginBottom: 20,
    overflow: "visible",
    justifyContent: "center",
  },
  tagsScroll: {
    height: 52,
  },
  tagsContent: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
    alignItems: "center",
    height: 52,
  },
  tag: {
    paddingHorizontal: spacing.md,
    height: 36,
    minHeight: 36,
    paddingVertical: 0,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 999,
    borderWidth: 1,
  },
  tagText: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "500",
    includeFontPadding: false,
    textAlignVertical: "center",
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: 0,
    paddingBottom: 112,
  },
  wordCard: {
    padding: 12,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    marginBottom: spacing.sm,
  },
  wordContent: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  wordMain: {
    flex: 1,
    minWidth: 0,
  },
  word: {
    fontSize: 20,
    fontWeight: "600",
    lineHeight: 26,
    marginBottom: 2,
  },
  meaning: {
    fontSize: 14,
    lineHeight: 20,
  },
  speakerButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: spacing.sm,
    marginTop: -4,
  },
  wordTags: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: spacing.sm,
  },
  wordTag: {
    paddingHorizontal: spacing.sm,
    height: 24,
    justifyContent: "center",
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    maxWidth: "100%",
  },
  wordTagText: {
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "500",
    flexShrink: 1,
  },
  addFab: {
    position: "absolute",
    right: spacing.lg,
    bottom: spacing.md,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    elevation: 5,
    zIndex: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.xl,
  },
  emptyIcon: {
    marginBottom: spacing.md,
  },
  emptyTitle: {
    ...typography.heading,
    marginBottom: spacing.sm,
  },
  emptySubtitle: {
    ...typography.body,
    textAlign: "center",
    marginBottom: spacing.md,
  },
});
