import React, { useEffect, useState } from "react";
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
import { addGrammar, deleteGrammar, getGrammar, updateGrammar } from "../storage";
import { Grammar } from "../types";
import { MotionTouchableOpacity as TouchableOpacity } from "../components/Motion";
import { ArrowLeft, Trash2, X } from "lucide-react-native";
import { getLanguagePlaceholders } from "../utils/language-placeholders";

export default function AddGrammarScreen() {
  const { activeLanguage, refreshData } = useApp();
  const router = useRouter();
  const { id: editId } = useLocalSearchParams<{ id?: string | string[] }>();
  const grammarId = Array.isArray(editId) ? editId[0] : editId;
  const isEditScreen = Boolean(grammarId);
  const theme = colors.dark;
  const placeholders = getLanguagePlaceholders(activeLanguage?.code);

  const [existingGrammar, setExistingGrammar] = useState<Grammar | null>(null);
  const [isLoading, setIsLoading] = useState(isEditScreen);
  const [isSaving, setIsSaving] = useState(false);
  const [grammarPoint, setGrammarPoint] = useState("");
  const [meaning, setMeaning] = useState("");
  const [formation, setFormation] = useState("");
  const [exampleSentence, setExampleSentence] = useState("");
  const [translation, setTranslation] = useState("");
  const [notes, setNotes] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);

  useEffect(() => {
    if (!grammarId) return;

    let isCurrent = true;
    const loadGrammar = async () => {
      try {
        const entries = await getGrammar();
        const found = entries.find((item) => item.id === grammarId);
        if (!found) {
          Alert.alert("Grammar not found", "This grammar point may have been deleted.");
          router.back();
          return;
        }

        if (isCurrent) {
          setExistingGrammar(found);
          setGrammarPoint(found.grammarPoint);
          setMeaning(found.meaning);
          setFormation(found.formation ?? "");
          setExampleSentence(found.exampleSentence ?? "");
          setTranslation(found.translation ?? "");
          setNotes(found.notes ?? "");
          setTags(found.tags);
        }
      } catch (error) {
        console.error("Error loading grammar for editing:", error);
        Alert.alert("Error", "Unable to load this grammar point for editing.");
        router.back();
      } finally {
        if (isCurrent) setIsLoading(false);
      }
    };

    loadGrammar();
    return () => {
      isCurrent = false;
    };
  }, [grammarId, router]);

  const addTag = () => {
    const trimmed = tagInput.trim();
    if (!trimmed) return;
    setTags((currentTags) =>
      currentTags.includes(trimmed) ? currentTags : [...currentTags, trimmed]
    );
    setTagInput("");
  };

  const removeTag = (tag: string) => {
    setTags((currentTags) => currentTags.filter((currentTag) => currentTag !== tag));
  };

  const handleDelete = () => {
    if (!existingGrammar || isSaving) return;
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
                await deleteGrammar(existingGrammar.id);
                await refreshData();
                router.replace("/(tabs)/grammar");
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

  const handleSave = async () => {
    if (isSaving || (isEditScreen && !existingGrammar)) return;
    if (!grammarPoint.trim() || !meaning.trim()) {
      Alert.alert("Required Fields", "Please enter both grammar point and meaning.");
      return;
    }

    const trimmedTag = tagInput.trim();
    const savedTags =
      trimmedTag && !tags.includes(trimmedTag) ? [...tags, trimmedTag] : tags;
    const now = new Date().toISOString();

    setIsSaving(true);
    try {
      if (existingGrammar) {
        await updateGrammar({
          ...existingGrammar,
          grammarPoint: grammarPoint.trim(),
          meaning: meaning.trim(),
          formation: formation.trim() || undefined,
          exampleSentence: exampleSentence.trim() || undefined,
          translation: translation.trim() || undefined,
          notes: notes.trim() || undefined,
          tags: savedTags,
          updatedAt: now,
        });
      } else {
        if (!activeLanguage) {
          Alert.alert("Error", "No active language selected.");
          return;
        }
        const newGrammar: Grammar = {
          id: `grammar-${Date.now()}`,
          languageId: activeLanguage.id,
          grammarPoint: grammarPoint.trim(),
          meaning: meaning.trim(),
          formation: formation.trim() || undefined,
          exampleSentence: exampleSentence.trim() || undefined,
          translation: translation.trim() || undefined,
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
        await addGrammar(newGrammar);
      }

      await refreshData();
      router.back();
    } catch (error) {
      console.error("Error saving grammar:", error);
      Alert.alert("Error", "Unable to save this grammar point. Please try again.");
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
            <Text style={[styles.title, { color: theme.text }]} numberOfLines={1}>
              {isEditScreen ? "Edit Grammar" : "Add Grammar"}
            </Text>
          </View>
          <View style={[styles.headerColumn, styles.headerRight]}>
            {existingGrammar ? (
              <TouchableOpacity
                onPress={handleDelete}
                style={[styles.deleteButton, { borderColor: theme.border }]}
                accessibilityRole="button"
                accessibilityLabel="Delete grammar"
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
          <View style={styles.field}>
            <Text style={[styles.label, { color: theme.text }]}>Grammar Point *</Text>
            <TextInput
              style={[styles.input, styles.capsuleInput, { backgroundColor: theme.card, borderColor: theme.border, color: theme.text }]}
              placeholder={placeholders.grammarPoint}
              placeholderTextColor={theme.textSecondary}
              value={grammarPoint}
              onChangeText={setGrammarPoint}
            />
          </View>

          <View style={styles.field}>
            <Text style={[styles.label, { color: theme.text }]}>Meaning / Use *</Text>
            <TextInput
              style={[styles.input, styles.capsuleInput, { backgroundColor: theme.card, borderColor: theme.border, color: theme.text }]}
              placeholder={placeholders.grammarMeaning}
              placeholderTextColor={theme.textSecondary}
              value={meaning}
              onChangeText={setMeaning}
            />
          </View>

          <View style={styles.field}>
            <Text style={[styles.label, { color: theme.text }]}>Formation / Pattern (optional)</Text>
            <TextInput
              style={[styles.input, styles.textArea, { backgroundColor: theme.card, borderColor: theme.border, color: theme.text }]}
              placeholder={placeholders.formation}
              placeholderTextColor={theme.textSecondary}
              value={formation}
              onChangeText={setFormation}
              multiline
              numberOfLines={3}
            />
          </View>

          <View style={styles.field}>
            <Text style={[styles.label, { color: theme.text }]}>Example Sentence (optional)</Text>
            <TextInput
              style={[styles.input, styles.textArea, { backgroundColor: theme.card, borderColor: theme.border, color: theme.text }]}
              placeholder={placeholders.grammarExample}
              placeholderTextColor={theme.textSecondary}
              value={exampleSentence}
              onChangeText={setExampleSentence}
              multiline
              numberOfLines={3}
            />
          </View>

          <View style={styles.field}>
            <Text style={[styles.label, { color: theme.text }]}>Translation (optional)</Text>
            <TextInput
              style={[styles.input, styles.capsuleInput, { backgroundColor: theme.card, borderColor: theme.border, color: theme.text }]}
              placeholder={placeholders.translation}
              placeholderTextColor={theme.textSecondary}
              value={translation}
              onChangeText={setTranslation}
            />
          </View>

          <View style={styles.field}>
            <Text style={[styles.label, { color: theme.text }]}>Notes (optional)</Text>
            <TextInput
              style={[styles.input, styles.textArea, { backgroundColor: theme.card, borderColor: theme.border, color: theme.text }]}
              placeholder={placeholders.grammarNotes}
              placeholderTextColor={theme.textSecondary}
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={3}
            />
          </View>

          <View style={styles.field}>
            <Text style={[styles.label, { color: theme.text }]}>Tags</Text>
            {tags.length > 0 && (
              <View style={styles.tagsContainer}>
                {tags.map((tag, index) => (
                  <View
                    key={`${tag}-${index}`}
                    style={[styles.tag, { backgroundColor: theme.tagSurface, borderColor: theme.tagBorder }]}
                  >
                    <Text style={[styles.tagText, { color: theme.accent.purple }]}>{tag}</Text>
                    <TouchableOpacity
                      onPress={() => removeTag(tag)}
                      style={styles.tagRemoveControl}
                      accessibilityRole="button"
                      accessibilityLabel={`Remove tag ${tag}`}
                      hitSlop={6}
                    >
                      <X size={14} color={theme.accent.purple} strokeWidth={2} />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}

            <View style={styles.tagInputRow}>
              <TextInput
                style={[styles.input, styles.capsuleInput, styles.tagInput, { backgroundColor: theme.card, borderColor: theme.border, color: theme.text }]}
                placeholder="Add a tag..."
                placeholderTextColor={theme.textSecondary}
                value={tagInput}
                onChangeText={setTagInput}
                onSubmitEditing={addTag}
                returnKeyType="done"
              />
              <TouchableOpacity
                style={[styles.addTagButton, { backgroundColor: theme.primary }]}
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
            style={[styles.cancelButton, { borderColor: theme.border }]}
            onPress={() => router.back()}
            disabled={isSaving}
            accessibilityRole="button"
          >
            <Text style={[styles.cancelButtonText, { color: theme.text }]}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.saveButton, { backgroundColor: theme.primary }]}
            onPress={handleSave}
            disabled={isSaving}
            accessibilityRole="button"
          >
            <Text style={styles.saveButtonText}>
              {isSaving ? "Saving..." : existingGrammar ? "Save Changes" : "Save Grammar"}
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
    borderWidth: 1,
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
    minHeight: 112,
    borderRadius: borderRadius.xl,
    paddingVertical: spacing.md,
    textAlignVertical: "top",
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
  tagRemoveControl: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.dark.accentSurface,
    alignItems: "center",
    justifyContent: "center",
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
    height: 52,
    borderRadius: 999,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: spacing.md,
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
    height: 52,
    minHeight: 52,
    minWidth: 100,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 999,
    borderWidth: 1,
    backgroundColor: colors.dark.elevated,
    paddingHorizontal: spacing.md,
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: "600",
  },
  saveButton: {
    flex: 1,
    height: 52,
    minHeight: 52,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 999,
    paddingHorizontal: spacing.md,
  },
  saveButtonText: {
    color: colors.dark.onPrimary,
    fontSize: 15,
    fontWeight: "600",
  },
});
