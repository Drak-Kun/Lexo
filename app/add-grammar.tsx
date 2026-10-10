import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { useApp } from "../context/AppContext";
import { colors, spacing, borderRadius, typography } from "../constants/theme";
import { addGrammar } from "../storage";
import { Grammar } from "../types";

export default function AddGrammarScreen() {
  const { activeLanguage, isDark, refreshData } = useApp();
  const router = useRouter();
  const theme = isDark ? colors.dark : colors.light;

  const [grammarPoint, setGrammarPoint] = useState("");
  const [meaning, setMeaning] = useState("");
  const [formation, setFormation] = useState("");
  const [exampleSentence, setExampleSentence] = useState("");
  const [translation, setTranslation] = useState("");
  const [notes, setNotes] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);

  const addTag = () => {
    const trimmed = tagInput.trim();
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
      setTagInput("");
    }
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const handleSave = async () => {
    if (!grammarPoint.trim() || !meaning.trim()) {
      Alert.alert("Required Fields", "Please enter both grammar point and meaning.");
      return;
    }

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
      tags,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: "new",
      reviewCount: 0,
      correctCount: 0,
      incorrectCount: 0,
      streak: 0,
    };

    await addGrammar(newGrammar);
    await refreshData();
    router.back();
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.background }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={[styles.backButton, { color: theme.text }]}>← Back</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.text }]}>Add Grammar</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Grammar Point */}
        <View style={styles.field}>
          <Text style={[styles.label, { color: theme.text }]}>Grammar Point *</Text>
          <TextInput
            style={[styles.input, { backgroundColor: theme.card, borderColor: theme.border, color: theme.text }]}
            placeholder="e.g., 〜ている"
            placeholderTextColor={theme.textSecondary}
            value={grammarPoint}
            onChangeText={setGrammarPoint}
          />
        </View>

        {/* Meaning / Use */}
        <View style={styles.field}>
          <Text style={[styles.label, { color: theme.text }]}>Meaning / Use *</Text>
          <TextInput
            style={[styles.input, { backgroundColor: theme.card, borderColor: theme.border, color: theme.text }]}
            placeholder="e.g., Ongoing action or state"
            placeholderTextColor={theme.textSecondary}
            value={meaning}
            onChangeText={setMeaning}
          />
        </View>

        {/* Formation / Pattern */}
        <View style={styles.field}>
          <Text style={[styles.label, { color: theme.text }]}>Formation / Pattern (optional)</Text>
          <TextInput
            style={[styles.input, styles.textArea, { backgroundColor: theme.card, borderColor: theme.border, color: theme.text }]}
            placeholder="e.g., Verb (て-form) + いる"
            placeholderTextColor={theme.textSecondary}
            value={formation}
            onChangeText={setFormation}
            multiline
            numberOfLines={3}
          />
        </View>

        {/* Example Sentence */}
        <View style={styles.field}>
          <Text style={[styles.label, { color: theme.text }]}>Example Sentence (optional)</Text>
          <TextInput
            style={[styles.input, styles.textArea, { backgroundColor: theme.card, borderColor: theme.border, color: theme.text }]}
            placeholder="e.g., 日本語を勉強している"
            placeholderTextColor={theme.textSecondary}
            value={exampleSentence}
            onChangeText={setExampleSentence}
            multiline
            numberOfLines={3}
          />
        </View>

        {/* Translation */}
        <View style={styles.field}>
          <Text style={[styles.label, { color: theme.text }]}>Translation (optional)</Text>
          <TextInput
            style={[styles.input, { backgroundColor: theme.card, borderColor: theme.border, color: theme.text }]}
            placeholder="e.g., I am studying Japanese"
            placeholderTextColor={theme.textSecondary}
            value={translation}
            onChangeText={setTranslation}
          />
        </View>

        {/* Notes */}
        <View style={styles.field}>
          <Text style={[styles.label, { color: theme.text }]}>Notes (optional)</Text>
          <TextInput
            style={[styles.input, styles.textArea, { backgroundColor: theme.card, borderColor: theme.border, color: theme.text }]}
            placeholder="Additional notes..."
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

          {tags.length > 0 && (
            <View style={styles.tagsContainer}>
              {tags.map((tag) => (
                <View
                  key={tag}
                  style={[styles.tag, { backgroundColor: theme.accent.purple + "20", borderColor: theme.accent.purple }]}
                >
                  <Text style={[styles.tagText, { color: theme.accent.purple }]}>{tag}</Text>
                  <TouchableOpacity onPress={() => removeTag(tag)}>
                    <Text style={[styles.tagRemove, { color: theme.accent.purple }]}>✕</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}

          <View style={styles.tagInputRow}>
            <TextInput
              style={[
                styles.input,
                styles.tagInput,
                { backgroundColor: theme.card, borderColor: theme.border, color: theme.text },
              ]}
              placeholder="Add a tag..."
              placeholderTextColor={theme.textSecondary}
              value={tagInput}
              onChangeText={setTagInput}
              onSubmitEditing={addTag}
            />
            <TouchableOpacity
              style={[styles.addTagButton, { backgroundColor: theme.primary }]}
              onPress={addTag}
            >
              <Text style={styles.addTagButtonText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Save Button */}
        <TouchableOpacity
          style={[styles.saveButton, { backgroundColor: theme.primary }]}
          onPress={handleSave}
        >
          <Text style={styles.saveButtonText}>Save Grammar</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
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
    ...typography.heading,
  },
  scrollContent: {
    padding: spacing.lg,
  },
  field: {
    marginBottom: spacing.lg,
  },
  label: {
    ...typography.body,
    fontWeight: "600",
    marginBottom: spacing.sm,
  },
  input: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    ...typography.body,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  tag: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    gap: spacing.xs,
  },
  tagText: {
    fontSize: 14,
    fontWeight: "500",
  },
  tagRemove: {
    fontSize: 16,
    fontWeight: "600",
  },
  tagInputRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  tagInput: {
    flex: 1,
  },
  addTagButton: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    justifyContent: "center",
    alignItems: "center",
  },
  addTagButtonText: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "600",
  },
  saveButton: {
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: "center",
    marginTop: spacing.lg,
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
  },
});
