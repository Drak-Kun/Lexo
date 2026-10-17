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
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useApp } from "../../context/AppContext";
import { colors, spacing, borderRadius, typography } from "../../constants/theme";
import { NotebookText, Plus, Search, X } from "lucide-react-native";
import {
  FocusMotion,
  MotionEntrance,
  MotionTouchableOpacity as TouchableOpacity,
} from "../../components/Motion";

export default function GrammarScreen() {
  const { grammar, activeLanguage, isLoading } = useApp();
  const router = useRouter();
  const theme = colors.dark;

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const animatedGrammarIds = useRef(new Set<string>());

  useEffect(() => {
    setSelectedTags([]);
  }, [activeLanguage?.id]);

  // Get all unique tags
  const allTags = useMemo(() => {
    const tags = grammar.flatMap((g) => g.tags);
    return [...new Set(tags)].sort();
  }, [grammar]);

  // Filter grammar
  const filteredGrammar = useMemo(() => {
    let filtered = grammar;

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (g) =>
          g.grammarPoint.toLowerCase().includes(query) ||
          g.meaning.toLowerCase().includes(query) ||
          g.formation?.toLowerCase().includes(query) ||
          g.exampleSentence?.toLowerCase().includes(query) ||
          g.translation?.toLowerCase().includes(query) ||
          g.notes?.toLowerCase().includes(query) ||
          g.tags.some((tag) => tag.toLowerCase().includes(query))
      );
    }

    // Filter by tags
    if (selectedTags.length > 0) {
      filtered = filtered.filter((g) => g.tags.some((tag) => selectedTags.includes(tag)));
    }

    return filtered;
  }, [grammar, searchQuery, selectedTags]);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView edges={["top"]} style={[styles.container, styles.loading, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </SafeAreaView>
    );
  }

  return (
    <FocusMotion style={styles.container}>
    <SafeAreaView edges={["top"]} style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>Grammar</Text>
      </View>

      {/* Search */}
      <View style={[styles.searchContainer, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <Search size={18} color={theme.textSecondary} strokeWidth={2} style={styles.searchIcon} />
        <TextInput
          style={[styles.searchInput, { color: theme.text }]}
          placeholder="Search grammar..."
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

      {/* Grammar List */}
      {filteredGrammar.length === 0 ? (
        <MotionEntrance style={styles.emptyState}>
          <NotebookText size={56} color={theme.textSecondary} strokeWidth={1.75} style={styles.emptyIcon} />
          <Text style={[styles.emptyTitle, { color: theme.text }]}>
            {grammar.length === 0 ? "No grammar points yet" : "No grammar found"}
          </Text>
          <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
            {grammar.length === 0
              ? "Add grammar points as you learn."
              : "Try a different search or tag."}
          </Text>
          {grammar.length === 0 && (
            <TouchableOpacity
              style={[styles.emptyButton, { backgroundColor: theme.primary }]}
              onPress={() => router.push("/add-grammar")}
            >
              <View style={styles.emptyButtonContent}>
                <Plus size={18} color={theme.onPrimary} strokeWidth={2.5} />
                <Text style={styles.emptyButtonText}>Add Grammar</Text>
              </View>
            </TouchableOpacity>
          )}
        </MotionEntrance>
      ) : (
        <FlatList
          data={filteredGrammar}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          contentInsetAdjustmentBehavior="never"
          renderItem={({ item, index }) => {
            const animateEntrance = !animatedGrammarIds.current.has(item.id);
            animatedGrammarIds.current.add(item.id);
            return (
            <MotionEntrance animate={animateEntrance} delay={Math.min(index, 4) * 35}>
              <TouchableOpacity
                style={[styles.grammarCard, { backgroundColor: theme.card, borderColor: theme.border }]}
                onPress={() => router.push(`/grammar-detail?id=${item.id}`)}
              >
              <Text style={[styles.grammarPoint, { color: theme.text }]}>
                {item.grammarPoint}
              </Text>
              <Text style={[styles.meaning, { color: theme.textSecondary }]}>
                {item.meaning}
              </Text>

              {item.tags.length > 0 && (
                <View style={styles.grammarTags}>
                  {item.tags.map((tag, index) => (
                    <View
                      key={index}
                      style={[
                        styles.grammarTag,
                        {
                          backgroundColor: theme.accent.purple + "20",
                          borderColor: theme.accent.purple,
                        },
                      ]}
                    >
                      <Text style={[styles.grammarTagText, { color: theme.accent.purple }]}>
                        {tag}
                      </Text>
                    </View>
                  ))}
                </View>
              )}

              </TouchableOpacity>
            </MotionEntrance>
            );
          }}
        />
      )}
      <TouchableOpacity
        style={[styles.addFab, { backgroundColor: theme.primary }]}
        onPress={() => router.push("/add-grammar")}
        accessibilityRole="button"
        accessibilityLabel="Add grammar"
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
  loading: {
    justifyContent: "center",
    alignItems: "center",
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
  grammarCard: {
    padding: 12,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    marginBottom: spacing.sm,
  },
  grammarPoint: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: spacing.xs,
    lineHeight: 26,
  },
  meaning: {
    fontSize: 14,
    lineHeight: 20,
  },
  grammarTags: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  grammarTag: {
    paddingHorizontal: spacing.sm,
    height: 24,
    justifyContent: "center",
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    maxWidth: "100%",
  },
  grammarTagText: {
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
    marginBottom: spacing.lg,
  },
  emptyButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: 999,
  },
  emptyButtonText: {
    color: colors.dark.onPrimary,
    fontSize: 16,
    fontWeight: "600",
  },
  emptyButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
  },
});
