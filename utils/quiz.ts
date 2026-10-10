import { Word, Grammar, QuizQuestion, QuestionType, ContentType } from "../types";

// Shuffle array
const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// Generate word questions
const generateWordQuestion = (word: Word, allWords: Word[]): QuizQuestion => {
  const questionTypes: QuestionType[] = [
    "language-to-meaning",
    "meaning-to-language",
    "multiple-choice",
  ];
  const questionType = questionTypes[Math.floor(Math.random() * questionTypes.length)];

  let question = "";
  let correctAnswer = "";
  let options: string[] | undefined;

  switch (questionType) {
    case "language-to-meaning":
      question = word.word;
      correctAnswer = word.meaning;

      // Generate options
      const wrongMeanings = allWords
        .filter((w) => w.id !== word.id && w.meaning !== word.meaning)
        .map((w) => w.meaning)
        .slice(0, 3);
      options = shuffleArray([correctAnswer, ...wrongMeanings]);
      break;

    case "meaning-to-language":
      question = word.meaning;
      correctAnswer = word.word;

      // Generate options
      const wrongWords = allWords
        .filter((w) => w.id !== word.id && w.word !== word.word)
        .map((w) => w.word)
        .slice(0, 3);
      options = shuffleArray([correctAnswer, ...wrongWords]);
      break;

    case "multiple-choice":
      question = `What does this mean?\n\n${word.word}`;
      correctAnswer = word.meaning;

      const wrongOptions = allWords
        .filter((w) => w.id !== word.id)
        .map((w) => w.meaning)
        .slice(0, 3);
      options = shuffleArray([correctAnswer, ...wrongOptions]);
      break;
  }

  return {
    id: `q-${word.id}-${Date.now()}`,
    type: "words",
    contentId: word.id,
    questionType,
    question,
    correctAnswer,
    options,
    content: word,
  };
};

// Generate grammar questions
const generateGrammarQuestion = (grammar: Grammar, allGrammar: Grammar[]): QuizQuestion => {
  const questionTypes: QuestionType[] = [
    "language-to-meaning",
    "meaning-to-language",
    "multiple-choice",
  ];
  const questionType = questionTypes[Math.floor(Math.random() * questionTypes.length)];

  let question = "";
  let correctAnswer = "";
  let options: string[] | undefined;

  switch (questionType) {
    case "language-to-meaning":
      question = `What does this grammar point mean?\n\n${grammar.grammarPoint}`;
      correctAnswer = grammar.meaning;

      const wrongMeanings = allGrammar
        .filter((g) => g.id !== grammar.id)
        .map((g) => g.meaning)
        .slice(0, 3);
      options = shuffleArray([correctAnswer, ...wrongMeanings]);
      break;

    case "meaning-to-language":
      question = `Which grammar point expresses:\n\n"${grammar.meaning}"`;
      correctAnswer = grammar.grammarPoint;

      const wrongPoints = allGrammar
        .filter((g) => g.id !== grammar.id)
        .map((g) => g.grammarPoint)
        .slice(0, 3);
      options = shuffleArray([correctAnswer, ...wrongPoints]);
      break;

    case "multiple-choice":
      if (grammar.exampleSentence) {
        question = `Choose the correct meaning for:\n\n${grammar.grammarPoint}\n\nExample: ${grammar.exampleSentence}`;
        correctAnswer = grammar.meaning;

        const wrongOptions = allGrammar
          .filter((g) => g.id !== grammar.id)
          .map((g) => g.meaning)
          .slice(0, 3);
        options = shuffleArray([correctAnswer, ...wrongOptions]);
      } else {
        question = `What does this mean?\n\n${grammar.grammarPoint}`;
        correctAnswer = grammar.meaning;

        const wrongOptions = allGrammar
          .filter((g) => g.id !== grammar.id)
          .map((g) => g.meaning)
          .slice(0, 3);
        options = shuffleArray([correctAnswer, ...wrongOptions]);
      }
      break;
  }

  return {
    id: `q-${grammar.id}-${Date.now()}`,
    type: "grammar",
    contentId: grammar.id,
    questionType,
    question,
    correctAnswer,
    options,
    content: grammar,
  };
};

// Generate quiz questions
export const generateQuizQuestions = (
  contentType: ContentType,
  words: Word[],
  grammar: Grammar[],
  selectedTags: string[],
  questionCount: number
): QuizQuestion[] => {
  let availableWords: Word[] = [];
  let availableGrammar: Grammar[] = [];

  // Filter by tags
  if (selectedTags.length > 0 && !selectedTags.includes("All Tags")) {
    availableWords = words.filter((w) =>
      w.tags.some((tag) => selectedTags.includes(tag))
    );
    availableGrammar = grammar.filter((g) =>
      g.tags.some((tag) => selectedTags.includes(tag))
    );
  } else {
    availableWords = words;
    availableGrammar = grammar;
  }

  let questions: QuizQuestion[] = [];

  if (contentType === "words") {
    const shuffled = shuffleArray(availableWords);
    const selected = shuffled.slice(0, questionCount);
    questions = selected.map((word) => generateWordQuestion(word, availableWords));
  } else if (contentType === "grammar") {
    const shuffled = shuffleArray(availableGrammar);
    const selected = shuffled.slice(0, questionCount);
    questions = selected.map((g) => generateGrammarQuestion(g, availableGrammar));
  } else if (contentType === "mixed") {
    const wordQuestions = Math.floor(questionCount / 2);
    const grammarQuestions = questionCount - wordQuestions;

    const shuffledWords = shuffleArray(availableWords).slice(0, wordQuestions);
    const shuffledGrammar = shuffleArray(availableGrammar).slice(0, grammarQuestions);

    const wordQs = shuffledWords.map((w) => generateWordQuestion(w, availableWords));
    const grammarQs = shuffledGrammar.map((g) => generateGrammarQuestion(g, availableGrammar));

    questions = shuffleArray([...wordQs, ...grammarQs]);
  }

  return questions;
};

// Get all unique tags
export const getAllTags = (words: Word[], grammar: Grammar[]): string[] => {
  const wordTags = words.flatMap((w) => w.tags);
  const grammarTags = grammar.flatMap((g) => g.tags);
  const allTags = [...new Set([...wordTags, ...grammarTags])];
  return allTags.sort();
};

// Get available question count
export const getAvailableQuestionCount = (
  contentType: ContentType,
  words: Word[],
  grammar: Grammar[],
  selectedTags: string[]
): { words: number; grammar: number; total: number } => {
  let availableWords: Word[] = [];
  let availableGrammar: Grammar[] = [];

  if (selectedTags.length > 0 && !selectedTags.includes("All Tags")) {
    availableWords = words.filter((w) =>
      w.tags.some((tag) => selectedTags.includes(tag))
    );
    availableGrammar = grammar.filter((g) =>
      g.tags.some((tag) => selectedTags.includes(tag))
    );
  } else {
    availableWords = words;
    availableGrammar = grammar;
  }

  const wordCount = availableWords.length;
  const grammarCount = availableGrammar.length;

  let total = 0;
  if (contentType === "words") {
    total = wordCount;
  } else if (contentType === "grammar") {
    total = grammarCount;
  } else {
    total = wordCount + grammarCount;
  }

  return { words: wordCount, grammar: grammarCount, total };
};
