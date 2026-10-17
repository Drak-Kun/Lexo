export interface LanguagePlaceholders {
  word: string;
  meaning: string;
  reading: string;
  wordExample: string;
  wordNotes: string;
  grammarPoint: string;
  grammarMeaning: string;
  formation: string;
  grammarExample: string;
  translation: string;
  grammarNotes: string;
}

const fallbackPlaceholders: LanguagePlaceholders = {
  word: "Enter a word",
  meaning: "Enter a translation",
  reading: "Optional pronunciation or reading",
  wordExample: "Enter an example sentence",
  wordNotes: "Add a note about this word",
  grammarPoint: "Enter a grammar point",
  grammarMeaning: "Enter a translation or usage",
  formation: "Enter a formation or pattern",
  grammarExample: "Enter an example sentence",
  translation: "Enter a translation",
  grammarNotes: "Add a note about this grammar point",
};

const placeholdersByLanguage: Record<string, LanguagePlaceholders> = {
  ja: {
    ...fallbackPlaceholders,
    word: "食べる",
    reading: "たべる",
    wordExample: "ご飯を食べる",
    grammarPoint: "〜ている",
    formation: "Verb (て-form) + いる",
    grammarExample: "日本語を勉強している",
    translation: "I am studying Japanese",
  },
  es: {
    ...fallbackPlaceholders,
    word: "comer",
    wordExample: "Estoy aprendiendo español",
    grammarPoint: "estar + gerundio",
    formation: "estar + gerundio",
    grammarExample: "Estoy estudiando español",
    translation: "I am studying Spanish",
  },
  ko: {
    ...fallbackPlaceholders,
    word: "먹다",
    wordExample: "한국어를 공부하고 있어요",
    grammarPoint: "-고 있다",
    formation: "Verb stem + -고 있다",
    grammarExample: "한국어를 공부하고 있어요",
    translation: "I am studying Korean",
  },
  fr: {
    ...fallbackPlaceholders,
    word: "manger",
    wordExample: "J'apprends le français",
    grammarPoint: "être en train de + infinitif",
    formation: "être en train de + infinitif",
    grammarExample: "J'étudie le français",
    translation: "I am studying French",
  },
};

export const getLanguagePlaceholders = (
  languageCode?: string
): LanguagePlaceholders => {
  const language = languageCode?.toLowerCase().split(/[-_]/)[0];
  return (language && placeholdersByLanguage[language]) || fallbackPlaceholders;
};
