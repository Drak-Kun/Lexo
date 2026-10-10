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

export default function GrammarScreen() {
  const { grammar, isDark, isLoading } = useApp();
  const router = useRouter();
  const theme = isDark ? colors.dark : colors.light;

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

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
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>Grammar</Text>
        <TouchableOpacity onPress={() => router.push("/add-grammar")}>
          <Text style={[styles.addButton, { color: theme.primary }]}>+ Add</Text>
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={[styles.searchContainer, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={[styles.searchInput, { color: theme.text }]}
          placeholder="Search grammar..."
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

      {/* Grammar List */}
      {filteredGrammar.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={[styles.emptyIcon, { color: theme.textSecondary }]}>📝</Text>
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
              <Text style={styles.emptyButtonText}>+ Add Grammar</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <FlatList
          data={filteredGrammar}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
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

              <Text style={[styles.arrow, { color: theme.textSecondary }]}>→</Text>
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
  grammarCard: {
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    marginBottom: spacing.md,
    position: "relative",
  },
  grammarPoint: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: spacing.xs,
  },
  meaning: {
    ...typography.body,
    marginBottom: spacing.sm,
  },
  grammarTags: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  grammarTag: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
  },
  grammarTagText: {
    fontSize: 12,
    fontWeight: "500",
  },
  arrow: {
    position: "absolute",
    right: spacing.md,
    top: spacing.md,
    fontSize: 20,
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
