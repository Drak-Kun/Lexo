import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useColorScheme } from "react-native";
import { Language, Word, Grammar } from "../types";
import {
  getLanguages,
  addLanguage as addStoredLanguage,
  getActiveLanguageId,
  setActiveLanguageId,
  getWordsByLanguage,
  getGrammarByLanguage,
  initializeApp,
} from "../storage";

interface AppContextType {
  languages: Language[];
  activeLanguage: Language | null;
  words: Word[];
  grammar: Grammar[];
  isDark: boolean;
  isLoading: boolean;
  setActiveLanguage: (languageId: string) => Promise<void>;
  createLanguage: (language: Language) => Promise<void>;
  refreshData: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const [languages, setLanguages] = useState<Language[]>([]);
  const [activeLanguage, setActiveLanguageState] = useState<Language | null>(null);
  const [words, setWords] = useState<Word[]>([]);
  const [grammar, setGrammar] = useState<Grammar[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    try {
      setIsLoading(true);
      await initializeApp();

      const langs = await getLanguages();
      setLanguages(langs);

      const activeId = await getActiveLanguageId();
      const activeLang = langs.find((l) => l.id === activeId) || langs[0] || null;
      setActiveLanguageState(activeLang);

      if (activeLang) {
        const wordsData = await getWordsByLanguage(activeLang.id);
        const grammarData = await getGrammarByLanguage(activeLang.id);
        setWords(wordsData);
        setGrammar(grammarData);
      }
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const setActiveLanguage = async (languageId: string) => {
    const lang = languages.find((l) => l.id === languageId);
    if (!lang) {
      throw new Error(`Language not found: ${languageId}`);
    }

    const [wordsData, grammarData] = await Promise.all([
      getWordsByLanguage(lang.id),
      getGrammarByLanguage(lang.id),
    ]);
    await setActiveLanguageId(languageId);
    setWords(wordsData);
    setGrammar(grammarData);
    setActiveLanguageState(lang);
  };

  const createLanguage = async (language: Language) => {
    await addStoredLanguage(language);
    const updatedLanguages = await getLanguages();
    const [wordsData, grammarData] = await Promise.all([
      getWordsByLanguage(language.id),
      getGrammarByLanguage(language.id),
    ]);
    await setActiveLanguageId(language.id);
    setLanguages(updatedLanguages);
    setWords(wordsData);
    setGrammar(grammarData);
    setActiveLanguageState(language);
  };

  const refreshData = async () => {
    if (activeLanguage) {
      const wordsData = await getWordsByLanguage(activeLanguage.id);
      const grammarData = await getGrammarByLanguage(activeLanguage.id);
      setWords(wordsData);
      setGrammar(grammarData);
    }
  };

  return (
    <AppContext.Provider
      value={{
        languages,
        activeLanguage,
        words,
        grammar,
        isDark,
        isLoading,
        setActiveLanguage,
        createLanguage,
        refreshData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within AppProvider");
  }
  return context;
};
