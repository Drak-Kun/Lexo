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
import { addWord } from "../storage";
import { Word } from "../types";

export default function AddWordScreen() {
  const { activeLanguage, isDark, refreshData } = useApp();
  const router = useRouter();
  const theme = isDark ? colors.dark : colors.light;

  const [word, setWord] = useState("");
  const [meaning, setMeaning] = useState("");
  const [reading, setReading] = useState("");
  const [example, setExample] = useState("");
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
    if (!word.trim() || !meaning.trim()) {
      Alert.alert("Required Fields", "Please enter both word and meaning.");
      return;
    }

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
      tags,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: "new",
      reviewCount: 0,
      correctCount: 0,
      incorrectCount: 0,
      streak: 0,
    };

    await addWord(newWord);
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
        <Text style={[styles.title, { color: theme.text }]}>Add New Word</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Word/Phrase */}
        <View style={styles.field}>
          <Text style={[styles.label, { color: theme.text }]}>Word / Phrase *</Text>
          <TextInput
            style={[styles.input, { backgroundColor: theme.card, borderColor: theme.border, color: theme.text }]}
            placeholder="e.g., 食べる"
            placeholderTextColor={theme.textSecondary}
            value={word}
            onChangeText={setWord}
          />
        </View>

        {/* Meaning */}
        <View style={styles.field}>
          <Text style={[styles.label, { color: theme.text }]}>Meaning *</Text>
          <TextInput
            style={[styles.input, { backgroundColor: theme.card, borderColor: theme.border, color: theme.text }]}
            placeholder="e.g., to eat"
            placeholderTextColor={theme.textSecondary}
            value={meaning}
            onChangeText={setMeaning}
          />
        </View>

        {/* Reading */}
        <View style={styles.field}>
          <Text style={[styles.label, { color: theme.text }]}>Reading (optional)</Text>
          <TextInput
            style={[styles.input, { backgroundColor: theme.card, borderColor: theme.border, color: theme.text }]}
            placeholder="e.g., たべる"
            placeholderTextColor={theme.textSecondary}
            value={reading}
            onChangeText={setReading}
          />
        </View>

        {/* Example */}
        <View style={styles.field}>
          <Text style={[styles.label, { color: theme.text }]}>Example (optional)</Text>
          <TextInput
            style={[styles.input, styles.textArea, { backgroundColor: theme.card, borderColor: theme.border, color: theme.text }]}
            placeholder="e.g., ご飯を食べる"
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
            style={[styles.input, styles.textArea, { backgroundColor: theme.card, borderColor: theme.border, color: theme.text }]}
            placeholder="e.g., Verb (dictionary form)"
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
                  style={[styles.tag, { backgroundColor: theme.accent.cyan + "20", borderColor: theme.accent.cyan }]}
                >
                  <Text style={[styles.tagText, { color: theme.accent.cyan }]}>{tag}</Text>
                  <TouchableOpacity onPress={() => removeTag(tag)}>
                    <Text style={[styles.tagRemove, { color: theme.accent.cyan }]}>✕</Text>
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
          <Text style={styles.saveButtonText}>Save Word</Text>
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
