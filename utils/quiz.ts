import { Word, Grammar, QuizQuestion, QuestionType, ContentType } from "../types";

export const MAX_QUIZ_QUESTIONS = 100;

export const getQuestionCountValidationError = (value: string): string | null => {
  const trimmedValue = value.trim();
  if (trimmedValue.length === 0) return "Enter a question count.";
  if (!/^\d+$/.test(value) || Number(value) <= 0) {
    return "Enter a positive whole number.";
  }
  if (Number(value) > MAX_QUIZ_QUESTIONS) {
    return `Maximum ${MAX_QUIZ_QUESTIONS} questions.`;
  }
  return null;
};

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
  if (
    !Number.isInteger(questionCount) ||
    questionCount <= 0 ||
    questionCount > MAX_QUIZ_QUESTIONS
  ) {
    return [];
  }

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

  const candidates = shuffleArray([
    ...(contentType === "grammar" ? [] : availableWords.map((content) => ({ type: "words" as const, content }))),
    ...(contentType === "words" ? [] : availableGrammar.map((content) => ({ type: "grammar" as const, content }))),
  ]);

  if (candidates.length === 0) return [];

  const questionIdTimestamp = Date.now();
  return Array.from({ length: questionCount }, (_, index) => {
    const candidate = candidates[index % candidates.length];
    const question = candidate.type === "words"
      ? generateWordQuestion(candidate.content, availableWords)
      : generateGrammarQuestion(candidate.content, availableGrammar);
    question.id = `q-${candidate.content.id}-${questionIdTimestamp + index}`;
    return question;
  });
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
