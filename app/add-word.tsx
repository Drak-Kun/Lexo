import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useApp } from "../context/AppContext";
import { colors, spacing, borderRadius, typography } from "../constants/theme";
import { addWord, deleteWord, getWords, updateWord } from "../storage";
import { Word } from "../types";
import { MotionTouchableOpacity as TouchableOpacity } from "../components/Motion";
import { ArrowLeft, Trash2 } from "lucide-react-native";
import { getLanguagePlaceholders } from "../utils/language-placeholders";

export default function AddWordScreen() {
  const { activeLanguage, words, refreshData } = useApp();
  const router = useRouter();
  const { id: editId } = useLocalSearchParams<{ id?: string }>();
  const theme = colors.dark;
  const isEditScreen = Boolean(editId);
  const placeholders = getLanguagePlaceholders(activeLanguage?.code);

  const [existingWord, setExistingWord] = useState<Word | null>(null);
  const [isLoading, setIsLoading] = useState(Boolean(editId));
  const [word, setWord] = useState("");
  const [meaning, setMeaning] = useState("");
  const [reading, setReading] = useState("");
  const [example, setExample] = useState("");
  const [notes, setNotes] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [customTags, setCustomTags] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const availableTags = useMemo(
    () =>
      [
        ...new Set([
          ...words
            .filter((item) => item.languageId === activeLanguage?.id)
            .flatMap((item) => item.tags),
          ...(existingWord?.tags ?? []),
          ...customTags,
        ]),
      ].sort((left, right) => left.localeCompare(right)),
    [activeLanguage?.id, customTags, existingWord?.tags, words]
  );

  useEffect(() => {
    if (!editId) return;

    let isCurrent = true;
    const loadWord = async () => {
      try {
        const words = await getWords();
        const found = words.find((item) => item.id === editId);
        if (!found) {
          Alert.alert("Word not found", "This word may have been deleted.");
          router.back();
          return;
        }

        if (isCurrent) {
          setExistingWord(found);
          setWord(found.word);
          setMeaning(found.meaning);
          setReading(found.reading ?? "");
          setExample(found.example ?? "");
          setNotes(found.notes ?? "");
          setTags([...new Set(found.tags)]);
        }
      } catch (error) {
        console.error("Error loading word for editing:", error);
        Alert.alert("Error", "Unable to load this word for editing.");
        router.back();
      } finally {
        if (isCurrent) setIsLoading(false);
      }
    };

    loadWord();
    return () => {
      isCurrent = false;
    };
  }, [editId, router]);

  const addTag = () => {
    const trimmed = tagInput.trim();
    if (!trimmed) return;
    setCustomTags((currentTags) =>
      currentTags.includes(trimmed) ? currentTags : [...currentTags, trimmed]
    );
    setTags((currentTags) =>
      currentTags.includes(trimmed) ? currentTags : [...currentTags, trimmed]
    );
    setTagInput("");
  };

  const toggleTag = (tag: string) => {
    setTags((currentTags) =>
      currentTags.includes(tag)
        ? currentTags.filter((currentTag) => currentTag !== tag)
        : [...currentTags, tag]
    );
  };

  const handleDelete = () => {
    if (!existingWord || isSaving) return;

    Alert.alert("Delete Word", "Are you sure you want to delete this word?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          void (async () => {
            try {
              await deleteWord(existingWord.id);
              await refreshData();
              router.replace("/(tabs)/words");
            } catch (error) {
              console.error("Error deleting word:", error);
              Alert.alert("Error", "Unable to delete this word.");
            }
          })();
        },
      },
    ]);
  };

  const handleSave = async () => {
    if (isSaving || (editId && !existingWord)) return;
    if (!word.trim() || !meaning.trim()) {
      Alert.alert("Required Fields", "Please enter both word and meaning.");
      return;
    }

    const trimmedTag = tagInput.trim();
    if (trimmedTag) {
      setCustomTags((currentTags) =>
        currentTags.includes(trimmedTag) ? currentTags : [...currentTags, trimmedTag]
      );
    }
    const savedTags =
      trimmedTag && !tags.includes(trimmedTag) ? [...tags, trimmedTag] : tags;
    const now = new Date().toISOString();

    setIsSaving(true);
    try {
      if (existingWord) {
        await updateWord({
          ...existingWord,
          word: word.trim(),
          meaning: meaning.trim(),
          reading: reading.trim() || undefined,
          example: example.trim() || undefined,
          notes: notes.trim() || undefined,
          tags: savedTags,
          updatedAt: now,
        });
      } else {
        if (!activeLanguage) {
          Alert.alert("Error", "No active language selected.");
          return;
        }
        const newWord: Word = {
          id: `word-${Date.now()}`,
          languageId: activeLanguage.id,
          word: word.trim(),
          meaning: meaning.trim(),
          reading: reading.trim() || undefined,
          example: example.trim() || undefined,
          notes: notes.trim() || undefined,
          tags: savedTags,
          createdAt: now,
          updatedAt: now,
          status: "new",
          reviewCount: 0,
          correctCount: 0,
          incorrectCount: 0,
          streak: 0,
        };
        await addWord(newWord);
      }
      await refreshData();
      router.back();
    } catch (error) {
      console.error("Error saving word:", error);
      Alert.alert("Error", "Unable to save this word. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView edges={["top", "bottom"]} style={[styles.container, styles.loading, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={["top", "bottom"]} style={[styles.container, { backgroundColor: theme.background }]}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={0}
      >
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
              style={[styles.title, { color: theme.text }]}
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.8}
            >
              {existingWord ? "Edit Word" : "Add Word"}
            </Text>
          </View>
          <View style={[styles.headerColumn, styles.headerRight]}>
            {existingWord ? (
              <TouchableOpacity
                onPress={handleDelete}
                style={styles.deleteButton}
                accessibilityRole="button"
                accessibilityLabel="Delete word"
              >
                <Trash2 size={20} color={theme.accent.red} strokeWidth={1.9} />
              </TouchableOpacity>
            ) : (
              <View style={styles.deleteButtonPlaceholder} />
            )}
          </View>
        </View>

        <ScrollView
          style={styles.formScroll}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode={Platform.OS === "ios" ? "interactive" : "on-drag"}
        >
        {/* Word/Phrase */}
        <View style={styles.field}>
          <Text style={[styles.label, { color: theme.text }]}>Word / Phrase *</Text>
          <TextInput
            style={[styles.input, isEditScreen && styles.capsuleInput, { backgroundColor: theme.card, borderColor: theme.border, color: theme.text }]}
            placeholder={placeholders.word}
            placeholderTextColor={theme.textSecondary}
            value={word}
            onChangeText={setWord}
          />
        </View>

        {/* Meaning */}
        <View style={styles.field}>
          <Text style={[styles.label, { color: theme.text }]}>Meaning *</Text>
          <TextInput
            style={[styles.input, isEditScreen && styles.capsuleInput, { backgroundColor: theme.card, borderColor: theme.border, color: theme.text }]}
            placeholder={placeholders.meaning}
            placeholderTextColor={theme.textSecondary}
            value={meaning}
            onChangeText={setMeaning}
          />
        </View>

        {/* Reading */}
        <View style={styles.field}>
          <Text style={[styles.label, { color: theme.text }]}>Reading (optional)</Text>
          <TextInput
            style={[styles.input, isEditScreen && styles.capsuleInput, { backgroundColor: theme.card, borderColor: theme.border, color: theme.text }]}
            placeholder={placeholders.reading}
            placeholderTextColor={theme.textSecondary}
            value={reading}
            onChangeText={setReading}
          />
        </View>

        {/* Example */}
        <View style={styles.field}>
          <Text style={[styles.label, { color: theme.text }]}>Example (optional)</Text>
          <TextInput
            style={[
              styles.input,
              styles.textArea,
              isEditScreen && styles.editTextArea,
              { backgroundColor: theme.card, borderColor: theme.border, color: theme.text },
            ]}
            placeholder={placeholders.wordExample}
            placeholderTextColor={theme.textSecondary}
            value={example}
            onChangeText={setExample}
            multiline
            numberOfLines={3}
          />
        </View>

        {/* Notes */}
        <View style={styles.field}>
          <Text style={[styles.label, { color: theme.text }]}>Notes (optional)</Text>
          <TextInput
            style={[
              styles.input,
              styles.textArea,
              isEditScreen && styles.editTextArea,
              { backgroundColor: theme.card, borderColor: theme.border, color: theme.text },
            ]}
            placeholder={placeholders.wordNotes}
            placeholderTextColor={theme.textSecondary}
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={3}
          />
        </View>

        {/* Tags */}
        <View style={styles.field}>
          <Text style={[styles.label, { color: theme.text }]}>Tags</Text>

          {availableTags.length > 0 && (
            <View style={styles.tagsContainer}>
              {availableTags.map((tag) => {
                const isSelected = tags.includes(tag);
                return (
                  <TouchableOpacity
                    key={tag}
                    style={[
                      styles.tag,
                      {
                        backgroundColor: isSelected ? theme.primary : theme.tagSurface,
                        borderColor: isSelected ? theme.primary : theme.tagBorder,
                      },
                    ]}
                    onPress={() => toggleTag(tag)}
                    accessibilityRole="button"
                    accessibilityLabel={`${isSelected ? "Deselect" : "Select"} tag ${tag}`}
                    accessibilityState={{ selected: isSelected }}
                  >
                    <Text
                      style={[
                        styles.tagText,
                        { color: isSelected ? theme.onPrimary : theme.accent.purple },
                      ]}
                    >
                      {tag}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          <View style={styles.tagInputRow}>
            <TextInput
              style={[
                styles.input,
                isEditScreen && styles.capsuleInput,
                styles.tagInput,
                { backgroundColor: theme.card, borderColor: theme.border, color: theme.text },
              ]}
              placeholder="Add a tag..."
              placeholderTextColor={theme.textSecondary}
              value={tagInput}
              onChangeText={setTagInput}
              onSubmitEditing={addTag}
              returnKeyType="done"
            />
            <TouchableOpacity
              style={[
                styles.addTagButton,
                isEditScreen && styles.capsuleButton,
                { backgroundColor: theme.primary },
              ]}
              onPress={addTag}
              accessibilityRole="button"
              accessibilityLabel="Add tag"
            >
              <Text style={styles.addTagButtonText}>Add</Text>
            </TouchableOpacity>
          </View>
        </View>
        </ScrollView>

        <View style={[styles.footer, { borderColor: theme.border }]}>
          <TouchableOpacity
            style={[
              styles.cancelButton,
              isEditScreen && styles.capsuleButton,
              isEditScreen && styles.editCancelButton,
              { borderColor: theme.border },
            ]}
            onPress={() => router.back()}
            disabled={isSaving}
            accessibilityRole="button"
          >
            <Text style={[styles.cancelButtonText, { color: theme.text }]}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.saveButton,
              isEditScreen && styles.capsuleButton,
              { backgroundColor: theme.primary },
            ]}
            onPress={handleSave}
            disabled={isSaving}
            accessibilityRole="button"
          >
            <Text style={styles.saveButtonText}>
              {isSaving ? "Saving..." : existingWord ? "Save Changes" : "Save Word"}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
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
  title: {
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
    alignItems: "center",
    justifyContent: "center",
  },
  deleteButtonPlaceholder: {
    width: 44,
    height: 44,
  },
  formScroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
  },
  field: {
    marginBottom: spacing.md,
  },
  label: {
    ...typography.caption,
    fontWeight: "600",
    marginBottom: spacing.xs,
  },
  input: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    minHeight: 48,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    ...typography.body,
  },
  capsuleInput: {
    height: 52,
    minHeight: 52,
    paddingVertical: 0,
    borderRadius: 999,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  editTextArea: {
    minHeight: 112,
    borderRadius: borderRadius.xl,
    paddingVertical: spacing.md,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  tag: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 32,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 999,
    borderWidth: 1,
    gap: spacing.sm,
    maxWidth: "100%",
  },
  tagText: {
    fontSize: 13,
    fontWeight: "500",
    flexShrink: 1,
  },
  tagInputRow: {
    flexDirection: "row",
    gap: spacing.sm,
    alignItems: "center",
  },
  tagInput: {
    flex: 1,
  },
  addTagButton: {
    minWidth: 68,
    height: 48,
    borderRadius: borderRadius.md,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: spacing.md,
  },
  capsuleButton: {
    height: 52,
    minHeight: 52,
    borderRadius: 999,
  },
  editCancelButton: {
    backgroundColor: colors.dark.elevated,
  },
  addTagButtonText: {
    color: colors.dark.onPrimary,
    fontSize: 14,
    fontWeight: "600",
  },
  footer: {
    flexDirection: "row",
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    backgroundColor: colors.dark.background,
  },
  cancelButton: {
    minHeight: 48,
    minWidth: 100,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: borderRadius.md,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: "600",
  },
  saveButton: {
    flex: 1,
    minHeight: 48,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
  },
  saveButtonText: {
    color: colors.dark.onPrimary,
    fontSize: 15,
    fontWeight: "600",
  },
});
