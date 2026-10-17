import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Easing,
  StyleProp,
  TextStyle,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useApp } from "../context/AppContext";
import { colors, spacing, borderRadius, typography } from "../constants/theme";
import { generateQuizQuestions } from "../utils/quiz";
import { QuizQuestion, ContentType } from "../types";
import * as Haptics from "expo-haptics";
import { updateWord, updateGrammar } from "../storage";
import { ArrowRight, CircleCheck, CircleX, X } from "lucide-react-native";

export default function QuizScreen() {
  const params = useLocalSearchParams();
  const { words, grammar, refreshData } = useApp();
  const router = useRouter();
  const theme = colors.dark;

  const [countdown, setCountdown] = useState(3);
  const [showCountdown, setShowCountdown] = useState(true);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [scaleAnim] = useState(new Animated.Value(1));

  useEffect(() => {
    // Countdown
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setShowCountdown(false);
      generateQuiz();
    }
  }, [countdown]);

  const generateQuiz = () => {
    const contentType = params.contentType as ContentType;
    const tags = params.tags ? (params.tags as string).split(",") : ["All Tags"];
    const questionCount = parseInt(params.questionCount as string, 10);

    const quizQuestions = generateQuizQuestions(
      contentType,
      words,
      grammar,
      tags,
      questionCount
    );

    setQuestions(quizQuestions);
  };

  const handleAnswer = async (answer: string) => {
    if (showFeedback) return;

    const currentQuestion = questions[currentIndex];
    const isCorrect = answer === currentQuestion.correctAnswer;

    currentQuestion.userAnswer = answer;
    currentQuestion.isCorrect = isCorrect;

    setSelectedAnswer(answer);
    setShowFeedback(true);

    // Haptic feedback
    if (isCorrect) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }

    // Update statistics
    if (currentQuestion.type === "words") {
      const word = words.find((w) => w.id === currentQuestion.contentId);
      if (word) {
        word.reviewCount++;
        if (isCorrect) {
          word.correctCount++;
          word.streak++;
        } else {
          word.incorrectCount++;
          word.streak = 0;
        }
        word.lastReviewedAt = new Date().toISOString();
        await updateWord(word);
      }
    } else {
      const grammarItem = grammar.find((g) => g.id === currentQuestion.contentId);
      if (grammarItem) {
        grammarItem.reviewCount++;
        if (isCorrect) {
          grammarItem.correctCount++;
          grammarItem.streak++;
        } else {
          grammarItem.incorrectCount++;
          grammarItem.streak = 0;
        }
        grammarItem.lastReviewedAt = new Date().toISOString();
        await updateGrammar(grammarItem);
      }
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedAnswer(null);
      setShowFeedback(false);

      // Animate
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 0.95,
          duration: 100,
          useNativeDriver: true,
          easing: Easing.ease,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
          easing: Easing.ease,
        }),
      ]).start();
    } else {
      // Quiz complete
      finishQuiz();
    }
  };

  const finishQuiz = async () => {
    await refreshData();

    const correctCount = questions.filter((q) => q.isCorrect).length;
    const incorrectCount = questions.length - correctCount;
    const accuracy = Math.round((correctCount / questions.length) * 100);
    const mistakes = questions.filter((q) => !q.isCorrect);

    router.replace({
      pathname: "/quiz-result",
      params: {
        totalQuestions: questions.length.toString(),
        correctCount: correctCount.toString(),
        incorrectCount: incorrectCount.toString(),
        accuracy: accuracy.toString(),
        mistakes: JSON.stringify(mistakes),
      },
    });
  };

  if (showCountdown) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.countdownContainer}>
          <Text style={[styles.countdownText, { color: theme.primary }]}>
            {countdown === 0 ? "START" : countdown}
          </Text>
        </View>
      </View>
    );
  }

  if (questions.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <Text style={[styles.errorText, { color: theme.text }]}>
          No questions available
        </Text>
      </View>
    );
  }

  const currentQuestion = questions[currentIndex];
  const progress = ((currentIndex + 1) / questions.length) * 100;

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.closeButton}
          accessibilityRole="button"
          accessibilityLabel="Exit quiz"
        >
          <X size={22} color={theme.text} strokeWidth={2} />
        </TouchableOpacity>
        <Text style={[styles.questionCounter, { color: theme.text }]}>
          {currentIndex + 1} / {questions.length}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Progress Bar */}
      <View style={[styles.progressBarContainer, { backgroundColor: theme.card }]}>
        <View
          style={[
            styles.progressBarFill,
            { width: `${progress}%`, backgroundColor: theme.primary },
          ]}
        />
      </View>

      <Animated.View style={[styles.content, { transform: [{ scale: scaleAnim }] }]}>
        <ScrollView
          style={styles.contentScroll}
          contentContainerStyle={styles.contentScrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.questionContainer}>
            <Text style={[styles.questionLabel, { color: theme.textSecondary }]}>
              What does this mean?
            </Text>
            <Text style={[styles.question, { color: theme.text }]}>
              {currentQuestion.question}
            </Text>
          </View>

          <View style={styles.optionsContainer}>
            {currentQuestion.options?.map((option, index) => {
              let optionStyle = [
                styles.option,
                { backgroundColor: theme.card, borderColor: theme.border },
              ];
              let optionTextStyle: StyleProp<TextStyle> = [
                styles.optionText,
                { color: theme.text },
              ];

              if (showFeedback) {
                if (option === currentQuestion.correctAnswer) {
                  optionStyle = [
                    styles.option,
                    {
                      backgroundColor: theme.accent.green + "20",
                      borderColor: theme.accent.green,
                    },
                  ];
                  optionTextStyle = [
                    styles.optionText,
                    { color: theme.accent.green, fontWeight: "600" },
                  ];
                } else if (option === selectedAnswer && !currentQuestion.isCorrect) {
                  optionStyle = [
                    styles.option,
                    {
                      backgroundColor: theme.accent.red + "20",
                      borderColor: theme.accent.red,
                    },
                  ];
                  optionTextStyle = [
                    styles.optionText,
                    { color: theme.accent.red, fontWeight: "600" },
                  ];
                }
              } else if (option === selectedAnswer) {
                optionStyle = [
                  styles.option,
                  { backgroundColor: theme.primary + "20", borderColor: theme.primary },
                ];
              }

              return (
                <TouchableOpacity
                  key={index}
                  style={optionStyle}
                  onPress={() => handleAnswer(option)}
                  disabled={showFeedback}
                >
                  <Text style={optionTextStyle}>{option}</Text>
                  {showFeedback && option === currentQuestion.correctAnswer && (
                    <CircleCheck size={20} color={theme.accent.green} strokeWidth={2} />
                  )}
                  {showFeedback &&
                    option === selectedAnswer &&
                    !currentQuestion.isCorrect && (
                      <CircleX size={20} color={theme.accent.red} strokeWidth={2} />
                    )}
                </TouchableOpacity>
              );
            })}
          </View>

          {showFeedback && (
            <TouchableOpacity
              style={[styles.nextButton, { backgroundColor: theme.primary }]}
              onPress={handleNext}
            >
              <View style={styles.nextButtonContent}>
                <Text style={styles.nextButtonText}>
                  {currentIndex < questions.length - 1 ? "Next" : "Finish"}
                </Text>
                {currentIndex < questions.length - 1 && (
                  <ArrowRight size={20} color={theme.onPrimary} strokeWidth={2} />
                )}
              </View>
            </TouchableOpacity>
          )}
        </ScrollView>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  countdownContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  countdownText: {
    fontSize: 80,
    fontWeight: "700",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingTop: 60,
    paddingBottom: spacing.md,
  },
  closeButton: {
    width: 40,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  questionCounter: {
    ...typography.body,
    fontWeight: "600",
  },
  progressBarContainer: {
    height: 6,
    marginHorizontal: spacing.lg,
    borderRadius: 3,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 3,
  },
  content: {
    flex: 1,
  },
  contentScroll: {
    flex: 1,
  },
  contentScrollContent: {
    flexGrow: 1,
    padding: spacing.lg,
  },
  questionContainer: {
    marginTop: spacing.xl,
    marginBottom: spacing.xl,
  },
  questionLabel: {
    ...typography.body,
    marginBottom: spacing.md,
  },
  question: {
    fontSize: 28,
    fontWeight: "700",
    lineHeight: 36,
  },
  optionsContainer: {
    gap: spacing.md,
  },
  option: {
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  optionText: {
    fontSize: 18,
    flex: 1,
  },
  nextButton: {
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: "center",
    marginTop: spacing.lg,
  },
  nextButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
  },
  nextButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
  },
  errorText: {
    ...typography.body,
    textAlign: "center",
    marginTop: 100,
  },
});
