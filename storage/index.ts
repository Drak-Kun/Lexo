import AsyncStorage from "@react-native-async-storage/async-storage";
import { Language, Word, Grammar } from "../types";

const LANGUAGES_KEY = "@lexo_languages";
const WORDS_KEY = "@lexo_words";
const GRAMMAR_KEY = "@lexo_grammar";
const ACTIVE_LANGUAGE_KEY = "@lexo_active_language";
const DAILY_GOAL_TARGET_KEY = "@lexo_daily_goal_target";
export const DEFAULT_DAILY_GOAL_TARGET = 10;

// Language Storage
export const getLanguages = async (): Promise<Language[]> => {
  try {
    const data = await AsyncStorage.getItem(LANGUAGES_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Error loading languages:", error);
    return [];
  }
};

export const saveLanguages = async (languages: Language[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(LANGUAGES_KEY, JSON.stringify(languages));
  } catch (error) {
    console.error("Error saving languages:", error);
    throw error;
  }
};

export const addLanguage = async (language: Language): Promise<void> => {
  const languages = await getLanguages();
  languages.push(language);
  await saveLanguages(languages);
};

export const getActiveLanguageId = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(ACTIVE_LANGUAGE_KEY);
  } catch (error) {
    console.error("Error loading active language:", error);
    return null;
  }
};

export const setActiveLanguageId = async (languageId: string): Promise<void> => {
  try {
    await AsyncStorage.setItem(ACTIVE_LANGUAGE_KEY, languageId);
  } catch (error) {
    console.error("Error saving active language:", error);
  }
};

export const getDailyGoalTarget = async (): Promise<number> => {
  try {
    const data = await AsyncStorage.getItem(DAILY_GOAL_TARGET_KEY);
    if (data === null) {
      return DEFAULT_DAILY_GOAL_TARGET;
    }

    const target = Number(data);
    if (!Number.isInteger(target) || target < 1) {
      throw new Error("Stored daily goal target is invalid");
    }
    return target;
  } catch (error) {
    console.error("Error loading daily goal target:", error);
    throw error;
  }
};

export const setDailyGoalTarget = async (target: number): Promise<void> => {
  if (!Number.isInteger(target) || target < 1) {
    throw new Error("Daily goal target must be a positive integer");
  }

  try {
    await AsyncStorage.setItem(DAILY_GOAL_TARGET_KEY, target.toString());
  } catch (error) {
    console.error("Error saving daily goal target:", error);
    throw error;
  }
};

// Word Storage
const normalizeTags = (value: unknown): string[] => {
  const tags = Array.isArray(value)
    ? value
    : typeof value === "string"
      ? [value]
      : [];

  return tags
    .filter((tag): tag is string => typeof tag === "string")
    .map((tag) => tag.trim())
    .filter((tag) => tag.length > 0);
};

export const getWords = async (): Promise<Word[]> => {
  try {
    const data = await AsyncStorage.getItem(WORDS_KEY);
    if (!data) return [];

    const storedWords: unknown = JSON.parse(data);
    if (!Array.isArray(storedWords)) {
      throw new Error("Stored words must be an array");
    }

    return storedWords.map((value): Word => {
      if (!value || typeof value !== "object" || Array.isArray(value)) {
        throw new Error("Stored word is invalid");
      }
      const storedWord = value as Record<string, unknown>;
      return { ...storedWord, tags: normalizeTags(storedWord.tags) } as Word;
    });
  } catch (error) {
    console.error("Error loading words:", error);
    throw error;
  }
};

export const saveWords = async (words: Word[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(WORDS_KEY, JSON.stringify(words));
  } catch (error) {
    console.error("Error saving words:", error);
    throw error;
  }
};

export const addWord = async (word: Word): Promise<void> => {
  const words = await getWords();
  if (words.some((existingWord) => existingWord.id === word.id)) {
    throw new Error(`Word with id "${word.id}" already exists`);
  }
  words.push(word);
  await saveWords(words);
};

export const updateWord = async (updatedWord: Word): Promise<void> => {
  const words = await getWords();
  const index = words.findIndex((w) => w.id === updatedWord.id);
  if (index !== -1) {
    words[index] = updatedWord;
    await saveWords(words);
    return;
  }
  throw new Error(`Word with id "${updatedWord.id}" was not found`);
};

export const deleteWord = async (wordId: string): Promise<void> => {
  const words = await getWords();
  const filtered = words.filter((w) => w.id !== wordId);
  await saveWords(filtered);
};

export const getWordsByLanguage = async (languageId: string): Promise<Word[]> => {
  const words = await getWords();
  return words.filter((w) => w.languageId === languageId);
};

// Grammar Storage
export const getGrammar = async (): Promise<Grammar[]> => {
  try {
    const data = await AsyncStorage.getItem(GRAMMAR_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Error loading grammar:", error);
    return [];
  }
};

export const saveGrammar = async (grammar: Grammar[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(GRAMMAR_KEY, JSON.stringify(grammar));
  } catch (error) {
    console.error("Error saving grammar:", error);
  }
};

export const addGrammar = async (grammarItem: Grammar): Promise<void> => {
  const grammar = await getGrammar();
  grammar.push(grammarItem);
  await saveGrammar(grammar);
};

export const updateGrammar = async (updatedGrammar: Grammar): Promise<void> => {
  const grammar = await getGrammar();
  const index = grammar.findIndex((g) => g.id === updatedGrammar.id);
  if (index !== -1) {
    grammar[index] = updatedGrammar;
    await saveGrammar(grammar);
  }
};

export const deleteGrammar = async (grammarId: string): Promise<void> => {
  const grammar = await getGrammar();
  const filtered = grammar.filter((g) => g.id !== grammarId);
  await saveGrammar(filtered);
};

export const getGrammarByLanguage = async (languageId: string): Promise<Grammar[]> => {
  const grammar = await getGrammar();
  return grammar.filter((g) => g.languageId === languageId);
};

// Initialize with demo data
export const initializeApp = async (): Promise<void> => {
  const languages = await getLanguages();

  if (languages.length === 0) {
    // Create Japanese as demo language
    const japanese: Language = {
      id: "lang-japanese",
      name: "Japanese",
      code: "ja-JP",
      createdAt: new Date().toISOString(),
    };

    await addLanguage(japanese);
    await setActiveLanguageId(japanese.id);

    // Add demo words
    const demoWords: Word[] = [
      {
        id: "word-1",
        languageId: japanese.id,
        word: "食べる",
        meaning: "to eat",
        reading: "たべる",
        example: "ご飯を食べる",
        notes: "Verb (dictionary form)",
        tags: ["Food", "N5", "Verb"],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: "new",
        reviewCount: 0,
        correctCount: 0,
        incorrectCount: 0,
        streak: 0,
      },
      {
        id: "word-2",
        languageId: japanese.id,
        word: "飲む",
        meaning: "to drink",
        reading: "のむ",
        example: "水を飲む",
        notes: "Verb (dictionary form)",
        tags: ["Food", "N5", "Verb"],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: "new",
        reviewCount: 0,
        correctCount: 0,
        incorrectCount: 0,
        streak: 0,
      },
      {
        id: "word-3",
        languageId: japanese.id,
        word: "行く",
        meaning: "to go",
        reading: "いく",
        example: "学校に行く",
        notes: "Verb (dictionary form)",
        tags: ["Travel", "N5", "Verb"],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: "new",
        reviewCount: 0,
        correctCount: 0,
        incorrectCount: 0,
        streak: 0,
      },
      {
        id: "word-4",
        languageId: japanese.id,
        word: "見る",
        meaning: "to see",
        reading: "みる",
        example: "映画を見る",
        notes: "Verb (dictionary form)",
        tags: ["General", "N5", "Verb"],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: "new",
        reviewCount: 0,
        correctCount: 0,
        incorrectCount: 0,
        streak: 0,
      },
      {
        id: "word-5",
        languageId: japanese.id,
        word: "買う",
        meaning: "to buy",
        reading: "かう",
        example: "本を買う",
        notes: "Verb (dictionary form)",
        tags: ["Travel", "N5", "Verb"],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: "new",
        reviewCount: 0,
        correctCount: 0,
        incorrectCount: 0,
        streak: 0,
      },
      {
        id: "word-6",
        languageId: japanese.id,
        word: "友達",
        meaning: "friend",
        reading: "ともだち",
        example: "友達と話す",
        notes: "Noun",
        tags: ["General", "N5"],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: "new",
        reviewCount: 0,
        correctCount: 0,
        incorrectCount: 0,
        streak: 0,
      },
      {
        id: "word-7",
        languageId: japanese.id,
        word: "勉強する",
        meaning: "to study",
        reading: "べんきょうする",
        example: "日本語を勉強する",
        notes: "Verb (dictionary form)",
        tags: ["General", "N5", "Verb"],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: "new",
        reviewCount: 0,
        correctCount: 0,
        incorrectCount: 0,
        streak: 0,
      },
    ];

    await saveWords(demoWords);

    // Add demo grammar
    const demoGrammar: Grammar[] = [
      {
        id: "grammar-1",
        languageId: japanese.id,
        grammarPoint: "〜ている",
        meaning: "Ongoing action or state",
        formation: "Verb (て-form) + いる",
        exampleSentence: "食べている",
        translation: "eating (now)",
        notes: "Often used for actions happening now. Can also describe a state.",
        tags: ["Basic", "N5"],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: "new",
        reviewCount: 0,
        correctCount: 0,
        incorrectCount: 0,
        streak: 0,
      },
      {
        id: "grammar-2",
        languageId: japanese.id,
        grammarPoint: "〜たい",
        meaning: "Want to do something",
        formation: "Verb (stem) + たい",
        exampleSentence: "食べたい",
        translation: "I want to eat",
        notes: "Expresses the speaker's desire to do something.",
        tags: ["Basic", "N5"],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: "new",
        reviewCount: 0,
        correctCount: 0,
        incorrectCount: 0,
        streak: 0,
      },
      {
        id: "grammar-3",
        languageId: japanese.id,
        grammarPoint: "〜から",
        meaning: "Because",
        formation: "Sentence + から",
        exampleSentence: "暑いから、窓を開ける",
        translation: "Because it's hot, I'll open the window",
        notes: "Used to give a reason or cause.",
        tags: ["Basic", "N5"],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: "new",
        reviewCount: 0,
        correctCount: 0,
        incorrectCount: 0,
        streak: 0,
      },
      {
        id: "grammar-4",
        languageId: japanese.id,
        grammarPoint: "〜けど",
        meaning: "But / however",
        formation: "Sentence + けど",
        exampleSentence: "忙しいけど、手伝います",
        translation: "I'm busy, but I'll help",
        notes: "Used to contrast two statements.",
        tags: ["Basic", "N5"],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: "new",
        reviewCount: 0,
        correctCount: 0,
        incorrectCount: 0,
        streak: 0,
      },
      {
        id: "grammar-5",
        languageId: japanese.id,
        grammarPoint: "〜てもいい",
        meaning: "It's okay to / may",
        formation: "Verb (て-form) + もいい",
        exampleSentence: "食べてもいいです",
        translation: "You may eat / It's okay to eat",
        notes: "Used to give permission or ask for permission.",
        tags: ["Basic", "N4"],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: "new",
        reviewCount: 0,
        correctCount: 0,
        incorrectCount: 0,
        streak: 0,
      },
    ];

    await saveGrammar(demoGrammar);
  }
};
