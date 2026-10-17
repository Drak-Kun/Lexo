import React, { useEffect, useRef, useState } from "react";
import {
  Pressable,
  View,
  Text,
  StyleSheet,
  ScrollView,
  Animated,
  Image,
  Easing,
  ActivityIndicator,
  useWindowDimensions,
  Alert,
  TextInput,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { BlurTargetView, BlurView } from "expo-blur";
import Svg, { Defs, LinearGradient, Rect, Stop } from "react-native-svg";
import { useApp } from "../../context/AppContext";
import { colors, spacing, borderRadius, typography } from "../../constants/theme";
import {
  DEFAULT_DAILY_GOAL_TARGET,
  getDailyGoalTarget,
  setDailyGoalTarget,
} from "../../storage";
import { Language } from "../../types";
import {
  ArrowRight,
  BookOpen,
  Check,
  ChevronDown,
  ChevronUp,
  Flame,
  Minus,
  NotebookText,
  Plus,
} from "lucide-react-native";
import {
  FocusMotion,
  MotionEntrance,
  MotionProgress,
  MotionTouchableOpacity,
  useReducedMotion,
} from "../../components/Motion";

const TouchableOpacity = MotionTouchableOpacity;

const localDateKey = (date: Date) =>
  `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;

const languageCodeByName: Record<string, string> = {
  arabic: "ar-SA",
  chinese: "zh-CN",
  english: "en-US",
  french: "fr-FR",
  german: "de-DE",
  hindi: "hi-IN",
  italian: "it-IT",
  japanese: "ja-JP",
  korean: "ko-KR",
  portuguese: "pt-BR",
  russian: "ru-RU",
  spanish: "es-ES",
};

type LanguageDropdownPosition = {
  top: number;
  left: number;
  width: number;
  maxHeight: number;
};

export default function HomeScreen() {
  const { activeLanguage, words, grammar, isLoading, languages, setActiveLanguage, createLanguage } =
    useApp();
  const router = useRouter();
  const theme = colors.dark;
  const reduceMotion = useReducedMotion();
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const [showGoalSettings, setShowGoalSettings] = useState(false);
  const [dailyGoalTarget, setDailyGoalTargetState] = useState(DEFAULT_DAILY_GOAL_TARGET);
  const [isGoalTargetLoading, setIsGoalTargetLoading] = useState(true);
  const [isGoalTargetSaving, setIsGoalTargetSaving] = useState(false);
  const [newLanguageName, setNewLanguageName] = useState("");
  const [isCreatingLanguage, setIsCreatingLanguage] = useState(false);
  const rootRef = useRef<View>(null);
  const languageSelectorRef = useRef<View>(null);
  const blurTargetRef = useRef<View>(null);
  const rootHeightRef = useRef(0);
  const [languageDropdownPosition, setLanguageDropdownPosition] =
    useState<LanguageDropdownPosition | null>(null);
  const languageTransition = useRef(new Animated.Value(1)).current;
  const previousLanguageId = useRef<string | undefined>(undefined);
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const activeLanguageCode = activeLanguage?.code.trim().toLowerCase();
  const activeLanguageName = activeLanguage?.name.trim().toLocaleLowerCase();
  const activeLanguageId = activeLanguage?.id.trim().toLowerCase();
  const isSpanishLearningLanguage =
    activeLanguageCode === "es-es" ||
    activeLanguageCode?.split(/[-_]/)[0] === "es" ||
    activeLanguageName === "spanish" ||
    activeLanguageName === "español";
  const isJapaneseLearningLanguage =
    activeLanguageId === "lang-japanese" ||
    activeLanguageId === "japanese" ||
    activeLanguageId?.startsWith("lang-japanese-") ||
    activeLanguageCode?.split(/[-_]/)[0] === "ja" ||
    activeLanguageName?.includes("japanese") ||
    activeLanguageName?.includes("日本語");

  useEffect(() => {
    if (!activeLanguage) return;
    if (previousLanguageId.current === undefined) {
      previousLanguageId.current = activeLanguage.id;
      return;
    }

    if (previousLanguageId.current === activeLanguage.id) return;
    previousLanguageId.current = activeLanguage.id;
    languageTransition.stopAnimation();
    languageTransition.setValue(0);
    if (reduceMotion) {
      languageTransition.setValue(1);
    } else {
      Animated.timing(languageTransition, {
        toValue: 1,
        duration: 210,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    }
  }, [activeLanguage?.id, languageTransition, reduceMotion]);

  const languageTransitionStyle = {
    opacity: languageTransition.interpolate({
      inputRange: [0, 1],
      outputRange: [0.2, 1],
    }),
    transform: [
      {
        translateX: languageTransition.interpolate({
          inputRange: [0, 1],
          outputRange: [-4, 0],
        }),
      },
    ],
  };

  useEffect(() => {
    let isMounted = true;
    getDailyGoalTarget()
      .then((target) => {
        if (isMounted) {
          setDailyGoalTargetState(target);
        }
      })
      .catch(() => {
        if (isMounted) {
          Alert.alert("Couldn't load daily goal", "Your saved goal target could not be loaded.");
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsGoalTargetLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  if (isLoading) {
    return (
      <FocusMotion style={[styles.container, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </FocusMotion>
    );
  }

  if (!activeLanguage) {
    return (
      <FocusMotion style={[styles.container, { backgroundColor: theme.background }]}>
        <Text style={[styles.title, { color: theme.text }]}>No language available</Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
          Please add a language to get started
        </Text>
      </FocusMotion>
    );
  }

  const today = new Date();
  const todayKey = localDateKey(today);
  const content = [...words, ...grammar];
  const hasBeenReviewedOn = (lastReviewedAt: string | undefined, dateKey: string) => {
    if (!lastReviewedAt) return false;
    const reviewedAt = new Date(lastReviewedAt);
    return !Number.isNaN(reviewedAt.getTime()) && localDateKey(reviewedAt) === dateKey;
  };
  const reviewedWords = words.filter((word) => hasBeenReviewedOn(word.lastReviewedAt, todayKey));
  const reviewDates = new Set<string>();
  content.forEach((item) => {
    if (item.lastReviewedAt) {
      const reviewedAt = new Date(item.lastReviewedAt);
      if (!Number.isNaN(reviewedAt.getTime())) {
        reviewDates.add(localDateKey(reviewedAt));
      }
    }
  });

  const streakStart = new Date(today);
  if (!reviewDates.has(todayKey)) {
    streakStart.setDate(streakStart.getDate() - 1);
  }
  let streak = 0;
  const streakDate = new Date(streakStart);
  while (reviewDates.has(localDateKey(streakDate)) && streak < reviewDates.size) {
    streak++;
    streakDate.setDate(streakDate.getDate() - 1);
  }

  const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const dailyProgress: { day: string; count: number }[] = [];
  for (let daysAgo = 6; daysAgo >= 0; daysAgo--) {
    const date = new Date(today);
    date.setDate(date.getDate() - daysAgo);
    const dateKey = localDateKey(date);
    const count = content.filter((item) => hasBeenReviewedOn(item.lastReviewedAt, dateKey)).length;
    dailyProgress.push({ day: weekdays[date.getDay()], count });
  }
  const maxProgress = Math.max(...dailyProgress.map((item) => item.count), 1);
  const goalProgress = Math.min(reviewedWords.length / dailyGoalTarget, 1);
  const goalPercentage = Math.round(goalProgress * 100);
  const horizontalPadding = width < 360 ? spacing.md : spacing.lg;
  const availableHeight = height - insets.top - insets.bottom - 60;
  const heroMinHeight = Math.min(280, Math.max(240, availableHeight * 0.37));
  const spanishHeroImageHeight = width * (900 / 1600);
  const japaneseHeroImageHeight = width * (1062 / 1600);
  const heroImageHeight = isSpanishLearningLanguage
    ? spanishHeroImageHeight
    : japaneseHeroImageHeight;
  const heroImageSource = isSpanishLearningLanguage
    ? require("../../assets/spanish-home-hero.jpg")
    : isJapaneseLearningLanguage
      ? require("../../assets/home-hero.jpg")
      : null;

  const toggleLanguageDropdown = () => {
    if (showLanguageDropdown) {
      setShowLanguageDropdown(false);
      return;
    }

    rootRef.current?.measureInWindow((rootX, rootY) => {
      languageSelectorRef.current?.measureInWindow((x, y, _width, selectorHeight) => {
        const dropdownWidth = Math.min(320, width - spacing.md * 2);
        const left = Math.max(
          spacing.sm,
          Math.min(x - rootX, width - dropdownWidth - spacing.sm)
        );
        const top = y - rootY + selectorHeight + spacing.xs;
        const maxHeight = Math.max(0, rootHeightRef.current - top - spacing.md);
        setLanguageDropdownPosition({ top, left, width: dropdownWidth, maxHeight });
        setShowLanguageDropdown(true);
      });
    });
  };

  const updateDailyGoal = async (target: number) => {
    setIsGoalTargetSaving(true);
    try {
      await setDailyGoalTarget(target);
      setDailyGoalTargetState(target);
    } catch {
      Alert.alert("Couldn't save daily goal", "Please try choosing a target again.");
    } finally {
      setIsGoalTargetSaving(false);
    }
  };

  const handleCreateLanguage = async () => {
    const name = newLanguageName.trim();
    if (!name) {
      Alert.alert("Language name needed", "Enter a language name to continue.");
      return;
    }
    if (languages.some((language) => language.name.trim().toLocaleLowerCase() === name.toLocaleLowerCase())) {
      Alert.alert("Language already exists", "Choose a name that isn't already in your language list.");
      return;
    }

    const normalizedName = name.toLocaleLowerCase();
    const language: Language = {
      id: `lang-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      name,
      code: languageCodeByName[normalizedName] ?? "und",
      createdAt: new Date().toISOString(),
    };

    setIsCreatingLanguage(true);
    try {
      await createLanguage(language);
      setNewLanguageName("");
      setShowLanguageDropdown(false);
    } catch {
      Alert.alert("Couldn't add language", "The language could not be saved. Please try again.");
    } finally {
      setIsCreatingLanguage(false);
    }
  };

  return (
    <FocusMotion style={[styles.container, { backgroundColor: theme.background }]}>
      <SafeAreaView edges={["top"]} style={styles.safeArea}>
        <View
          ref={rootRef}
          style={styles.homeContentRoot}
          onLayout={(event) => {
            rootHeightRef.current = event.nativeEvent.layout.height;
          }}
        >
          <BlurTargetView ref={blurTargetRef} style={styles.homeScroll}>
            <ScrollView
              contentContainerStyle={[styles.scrollContent, { paddingHorizontal: horizontalPadding }]}
              showsVerticalScrollIndicator={false}
            >
        <View
          style={[
            styles.hero,
            {
              minHeight: heroImageSource
                ? Math.max(heroMinHeight, heroImageHeight)
                : heroMinHeight,
              marginHorizontal: -horizontalPadding,
            },
          ]}
        >
          {heroImageSource !== null && (
            <Image
              source={heroImageSource}
              style={[
                styles.spanishHeroImage,
                { width, height: heroImageHeight },
              ]}
              resizeMode="contain"
              fadeDuration={0}
            />
          )}
          <View
            style={[
              styles.header,
              { paddingHorizontal: horizontalPadding, paddingTop: spacing.sm },
            ]}
          >
            <View
              ref={languageSelectorRef}
              collapsable={false}
              style={styles.languageSelectorSlot}
            >
              <TouchableOpacity
                style={styles.languageSelector}
                onPress={toggleLanguageDropdown}
                accessibilityRole="button"
                accessibilityLabel={`Selected language: ${activeLanguage.name}. ${
                  showLanguageDropdown ? "Hide" : "Show"
                } language options`}
                accessibilityState={{ expanded: showLanguageDropdown }}
              >
                <View style={styles.languageSelectorContent}>
                  <Animated.Text
                    style={[
                      styles.languageName,
                      { color: theme.text },
                      languageTransitionStyle,
                    ]}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    {activeLanguage.name}
                  </Animated.Text>
                  <View
                    style={styles.languageChevron}
                    accessibilityElementsHidden
                    importantForAccessibility="no-hide-descendants"
                  >
                    {showLanguageDropdown ? (
                      <ChevronUp size={18} color={theme.textSecondary} strokeWidth={2} />
                    ) : (
                      <ChevronDown size={18} color={theme.textSecondary} strokeWidth={2} />
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            </View>
            <View style={styles.streakBadge}>
              <Flame size={18} color={theme.accent.yellow} strokeWidth={2} />
              <Text style={[styles.streakCount, { color: theme.text }]}>{streak}</Text>
              <Text style={[styles.streakText, { color: theme.textSecondary }]}>day streak</Text>
            </View>
          </View>

          <Svg
            pointerEvents="none"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            style={[
              styles.heroTopFade,
              heroImageSource !== null && {
                height: heroImageHeight * 0.48,
              },
            ]}
          >
            <Defs>
              <LinearGradient id="hero-top-fade" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0" stopColor={theme.background} stopOpacity="1" />
                <Stop offset="0.18" stopColor={theme.background} stopOpacity="0.78" />
                <Stop offset="0.42" stopColor={theme.background} stopOpacity="0.42" />
                <Stop offset="0.72" stopColor={theme.background} stopOpacity="0.12" />
                <Stop offset="1" stopColor={theme.background} stopOpacity="0" />
              </LinearGradient>
            </Defs>
            <Rect x="0" y="0" width="100" height="100" fill="url(#hero-top-fade)" />
          </Svg>
          <Svg
            pointerEvents="none"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            style={[
              styles.heroBottomFade,
              heroImageSource !== null && {
                top: heroImageHeight * 0.52,
                bottom: undefined,
                height: heroImageHeight * 0.48,
              },
            ]}
          >
            <Defs>
              <LinearGradient id="hero-bottom-fade" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0" stopColor={theme.background} stopOpacity="0" />
                <Stop offset="0.3" stopColor={theme.background} stopOpacity="0.14" />
                <Stop offset="0.58" stopColor={theme.background} stopOpacity="0.48" />
                <Stop offset="0.82" stopColor={theme.background} stopOpacity="0.82" />
                <Stop offset="1" stopColor={theme.background} stopOpacity="1" />
              </LinearGradient>
            </Defs>
            <Rect x="0" y="0" width="100" height="100" fill="url(#hero-bottom-fade)" />
          </Svg>
          <View style={styles.heroSpacer} />
          <View style={styles.heroOverlay}>
            <Text style={styles.heroTitle}>Keep going!</Text>
            <Text style={styles.heroDescription}>
              Review today's words and grammar to build long-term memory.
            </Text>
          </View>
        </View>

        <Animated.View style={languageTransitionStyle}>
        <TouchableOpacity
          style={[styles.goalCard, { backgroundColor: theme.card, borderColor: theme.border }]}
          onPress={() => setShowGoalSettings((isOpen) => !isOpen)}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel={`Today's word goal. ${reviewedWords.length} of ${dailyGoalTarget} words reviewed today, ${goalPercentage} percent complete. ${
            showGoalSettings ? "Hide" : "Show"
          } goal settings.`}
          accessibilityState={{ expanded: showGoalSettings }}
        >
          <View style={styles.goalRing}>
            <Text style={styles.goalRingCount}>{goalPercentage}%</Text>
          </View>
          <View style={styles.goalCopy}>
            <Text style={[styles.goalTitle, { color: theme.text }]}>Today's Goal</Text>
            <Text style={[styles.goalCount, { color: theme.textSecondary }]}>
              {reviewedWords.length} <Text style={styles.goalDivider}>/</Text> {dailyGoalTarget}
            </Text>
            <Text style={[styles.goalHint, { color: theme.textSecondary }]}>
              Words reviewed today
            </Text>
          </View>
          {showGoalSettings ? (
            <ChevronUp size={22} color={theme.textSecondary} strokeWidth={2} />
          ) : (
            <ChevronDown size={22} color={theme.textSecondary} strokeWidth={2} />
          )}
        </TouchableOpacity>

        {showGoalSettings && (
          <MotionEntrance
            style={[styles.goalSettingsPanel, { backgroundColor: theme.card, borderColor: theme.border }]}
            scale={0.99}
            distance={4}
          >
            <View style={styles.goalSettingsHeader}>
              <Text style={[styles.goalSettingsTitle, { color: theme.text }]}>
                Daily word target
              </Text>
              <Text style={[styles.goalSettingsProgress, { color: theme.primary }]}>
                {reviewedWords.length} / {dailyGoalTarget} · {goalPercentage}%
              </Text>
            </View>
            <View style={styles.goalProgressTrack}>
              <MotionProgress progress={goalPercentage / 100} color={theme.primary} />
            </View>
            <View style={styles.goalTargetControls}>
              <TouchableOpacity
                style={[styles.goalTargetButton, { borderColor: theme.border }]}
                onPress={() => updateDailyGoal(Math.max(1, dailyGoalTarget - 1))}
                disabled={isGoalTargetLoading || isGoalTargetSaving || dailyGoalTarget <= 1}
                accessibilityRole="button"
                accessibilityLabel="Decrease daily word target"
              >
                <Minus size={18} color={theme.text} strokeWidth={2} />
              </TouchableOpacity>
              <Text style={[styles.goalTargetValue, { color: theme.text }]}>
                {dailyGoalTarget} words
              </Text>
              <TouchableOpacity
                style={[styles.goalTargetButton, { borderColor: theme.border }]}
                onPress={() => updateDailyGoal(dailyGoalTarget + 1)}
                disabled={isGoalTargetLoading || isGoalTargetSaving}
                accessibilityRole="button"
                accessibilityLabel="Increase daily word target"
              >
                <Plus size={18} color={theme.text} strokeWidth={2} />
              </TouchableOpacity>
            </View>
          </MotionEntrance>
        )}

        <MotionEntrance style={styles.statsRow} delay={80}>
          <View
            style={[
              styles.statCard,
              { backgroundColor: theme.card, borderColor: theme.border },
            ]}
          >
            <View style={styles.statIconContainer}>
              <BookOpen size={20} color={theme.primary} strokeWidth={1.8} />
            </View>
            <View style={styles.statText}>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Words</Text>
              <Text style={[styles.statValue, { color: theme.text }]}>{words.length}</Text>
            </View>
          </View>
          <View
            style={[
              styles.statCard,
              { backgroundColor: theme.card, borderColor: theme.border },
            ]}
          >
            <View style={styles.statIconContainer}>
              <NotebookText size={20} color={theme.primary} strokeWidth={1.8} />
            </View>
            <View style={styles.statText}>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Grammar</Text>
              <Text style={[styles.statValue, { color: theme.text }]}>{grammar.length}</Text>
            </View>
          </View>
        </MotionEntrance>

        <TouchableOpacity
          style={[styles.quizButton, { backgroundColor: theme.primary }]}
          onPress={() => router.push("/quiz-setup")}
          activeOpacity={0.85}
          accessibilityRole="button"
        >
          <Text style={styles.quizButtonText}>Start Quiz</Text>
          <ArrowRight size={20} color={theme.onPrimary} strokeWidth={2} style={styles.quizButtonArrow} />
        </TouchableOpacity>

        <View style={styles.section}>
          <View style={styles.sectionHeading}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Today's Progress</Text>
            <Text style={[styles.activityCaption, { color: theme.textSecondary }]}>
              Reviews · 7 days
            </Text>
          </View>

          <MotionEntrance
            style={[
              styles.chartCard,
              { backgroundColor: theme.card, borderColor: theme.border },
            ]}
            delay={120}
          >
            <View style={styles.progressChart}>
              {dailyProgress.map((item) => {
                const height = Math.max(
                  (item.count / maxProgress) * 76,
                  item.count > 0 ? 4 : 0
                );
                return (
                  <View key={item.day} style={styles.progressBar}>
                    <View style={styles.progressBarContainer}>
                      <View
                        style={[
                          styles.progressBarFill,
                          {
                            height: `${height}%`,
                            backgroundColor: theme.accent.purple,
                          },
                        ]}
                      />
                    </View>
                    <Text style={[styles.progressDay, { color: theme.textSecondary }]}>
                      {item.day}
                    </Text>
                  </View>
                );
              })}
            </View>
          </MotionEntrance>
        </View>
        </Animated.View>
            </ScrollView>
          </BlurTargetView>
          {showLanguageDropdown && languageDropdownPosition && (
            <>
              <Pressable
                style={styles.dropdownDismissArea}
                onPress={() => setShowLanguageDropdown(false)}
                accessibilityRole="button"
                accessibilityLabel="Close language selector"
              />
              <MotionEntrance
                style={[
                  styles.dropdownPanel,
                  {
                    top: languageDropdownPosition.top,
                    left: languageDropdownPosition.left,
                    width: languageDropdownPosition.width,
                    maxHeight: languageDropdownPosition.maxHeight,
                    borderColor: theme.glassBorder,
                  },
                ]}
                scale={0.99}
                distance={4}
              >
                <BlurView
                  blurTarget={blurTargetRef}
                  blurMethod="dimezisBlurViewSdk31Plus"
                  intensity={58}
                  tint="dark"
                  style={StyleSheet.absoluteFill}
                  pointerEvents="none"
                />
                <View
                  pointerEvents="none"
                  style={[StyleSheet.absoluteFill, { backgroundColor: theme.glassDropdownTint }]}
                />
                <ScrollView
                  style={styles.dropdownForeground}
                  nestedScrollEnabled
                  keyboardShouldPersistTaps="handled"
                  showsVerticalScrollIndicator
                >
                  <Text style={[styles.inlinePanelTitle, { color: theme.text }]}>Your languages</Text>
                  {languages.map((language) => (
                    <TouchableOpacity
                      key={language.id}
                      style={styles.inlineLanguageOption}
                      onPress={async () => {
                        try {
                          await setActiveLanguage(language.id);
                          setShowLanguageDropdown(false);
                        } catch {
                          Alert.alert("Couldn't switch language", "Please try again.");
                        }
                      }}
                      accessibilityRole="button"
                      accessibilityState={{ selected: language.id === activeLanguage.id }}
                    >
                      <Text style={[styles.inlineLanguageName, { color: theme.text }]}>
                        {language.name}
                      </Text>
                      {language.id === activeLanguage.id && (
                        <Check size={18} color={theme.primary} strokeWidth={2.5} />
                      )}
                    </TouchableOpacity>
                  ))}
                  <View style={[styles.inlinePanelDivider, { backgroundColor: theme.border }]} />
                  <Text style={[styles.inlinePanelLabel, { color: theme.textSecondary }]}>
                    Add a language
                  </Text>
                  <TextInput
                    value={newLanguageName}
                    onChangeText={setNewLanguageName}
                    placeholder="Language name"
                    placeholderTextColor={theme.textSecondary}
                    style={[styles.languageInput, { color: theme.text, borderColor: theme.border }]}
                    accessibilityLabel="New language name"
                  />
                  <TouchableOpacity
                    style={[styles.addLanguageButton, { backgroundColor: theme.primary }]}
                    onPress={handleCreateLanguage}
                    disabled={isCreatingLanguage}
                    accessibilityRole="button"
                  >
                    <Text style={styles.addLanguageButtonText}>
                      {isCreatingLanguage ? "Adding…" : "Add language"}
                    </Text>
                  </TouchableOpacity>
                </ScrollView>
              </MotionEntrance>
            </>
          )}
        </View>
      </SafeAreaView>

    </FocusMotion>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.dark.background,
  },
  safeArea: {
    flex: 1,
    backgroundColor: colors.dark.background,
  },
  homeScroll: {
    flex: 1,
  },
  homeContentRoot: {
    flex: 1,
    position: "relative",
  },
  title: {
    ...typography.title,
  },
  subtitle: {
    ...typography.body,
  },
  scrollContent: {
    paddingTop: spacing.sm,
    paddingBottom: spacing.lg,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
    minHeight: 40,
    marginBottom: spacing.sm,
    zIndex: 3,
  },
  languageSelectorSlot: {
    flex: 1,
    minWidth: 0,
    alignItems: "flex-start",
  },
  languageSelector: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    minWidth: 0,
    maxWidth: "100%",
    minHeight: 40,
    paddingHorizontal: spacing.sm,
  },
  languageName: {
    flexShrink: 1,
    fontSize: 16,
    fontWeight: "600",
  },
  languageSelectorContent: {
    flex: 1,
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  languageChevron: {
    width: 18,
    height: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  dropdownDismissArea: {
    ...StyleSheet.absoluteFill,
    zIndex: 10,
  },
  dropdownPanel: {
    position: "absolute",
    overflow: "hidden",
    borderWidth: 1,
    borderRadius: borderRadius.lg,
    zIndex: 11,
    elevation: 12,
  },
  dropdownForeground: {
    padding: spacing.sm + 4,
    zIndex: 1,
  },
  inlinePanelTitle: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: spacing.xs,
  },
  inlineLanguageOption: {
    minHeight: 44,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: spacing.xs,
  },
  inlineLanguageName: {
    fontSize: 14,
  },
  inlinePanelDivider: {
    height: 1,
    marginVertical: spacing.xs,
  },
  inlinePanelLabel: {
    fontSize: 13,
    fontWeight: "500",
    marginBottom: spacing.xs,
  },
  languageInput: {
    minHeight: 42,
    borderWidth: 1,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.xs,
    fontSize: 14,
  },
  addLanguageButton: {
    minHeight: 44,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: borderRadius.md,
    marginTop: spacing.xs,
  },
  addLanguageButtonText: {
    color: colors.dark.onPrimary,
    fontSize: 14,
    fontWeight: "600",
  },
  streakBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    flexShrink: 0,
    minHeight: 40,
    paddingHorizontal: spacing.sm,
  },
  streakCount: {
    fontSize: 15,
    fontWeight: "700",
  },
  streakText: {
    fontSize: 12,
    flexShrink: 1,
  },
  section: {
    marginTop: 0,
  },
  sectionHeading: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  activityCaption: {
    fontSize: 12,
  },
  statsRow: {
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  hero: {
    marginBottom: spacing.md,
    backgroundColor: colors.dark.background,
  },
  spanishHeroImage: {
    position: "absolute",
    top: 0,
    left: 0,
    zIndex: 0,
  },
  heroSpacer: {
    flexGrow: 1,
  },
  heroOverlay: {
    justifyContent: "flex-end",
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    width: "78%",
    zIndex: 3,
  },
  heroTopFade: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    height: "48%",
    zIndex: 1,
  },
  heroBottomFade: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: "48%",
    zIndex: 1,
  },
  heroTitle: {
    color: colors.dark.text,
    fontSize: 24,
    fontWeight: "700",
    letterSpacing: -0.6,
    marginBottom: spacing.md,
  },
  heroDescription: {
    color: colors.dark.textSecondary,
    fontSize: 13,
    lineHeight: 20,
    maxWidth: 290,
  },
  statCard: {
    flex: 1,
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    minHeight: 72,
  },
  statIconContainer: {
    width: 34,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 11,
    backgroundColor: colors.dark.accentSurface,
  },
  statText: {
    flex: 1,
    minWidth: 0,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "700",
    marginTop: 2,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: "500",
    flexShrink: 1,
  },
  goalCard: {
    minHeight: 88,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
  },
  goalRing: {
    width: 54,
    height: 54,
    borderWidth: 3,
    borderColor: colors.dark.primary,
    borderRadius: 27,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.dark.accentSurface,
  },
  goalRingCount: {
    color: colors.dark.text,
    fontSize: 17,
    fontWeight: "700",
  },
  goalCopy: {
    flex: 1,
    minWidth: 0,
  },
  goalTitle: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 2,
  },
  goalCount: {
    fontSize: 13,
    fontWeight: "600",
  },
  goalDivider: {
    color: colors.dark.textSecondary,
    fontWeight: "400",
  },
  goalHint: {
    fontSize: 11,
    marginTop: 2,
  },
  goalSettingsPanel: {
    borderWidth: 1,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginTop: -spacing.sm,
    marginBottom: spacing.md,
  },
  goalSettingsHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  goalSettingsTitle: {
    fontSize: 14,
    fontWeight: "600",
  },
  goalSettingsProgress: {
    fontSize: 12,
    fontWeight: "600",
  },
  goalProgressTrack: {
    height: 6,
    overflow: "hidden",
    borderRadius: 3,
    backgroundColor: colors.dark.progressTrack,
  },
  goalProgressFill: {
    height: "100%",
    borderRadius: 3,
  },
  goalTargetControls: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: spacing.md,
  },
  goalTargetButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderRadius: borderRadius.md,
  },
  goalTargetValue: {
    fontSize: 14,
    fontWeight: "600",
  },
  quizButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 32,
    marginBottom: spacing.md,
    minHeight: 52,
    position: "relative",
  },
  quizButtonText: {
    color: colors.dark.onPrimary,
    fontSize: 16,
    fontWeight: "700",
  },
  quizButtonArrow: {
    position: "absolute",
    right: spacing.lg,
  },
  chartCard: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
  },
  progressChart: {
    flexDirection: "row",
    justifyContent: "space-between",
    height: 96,
    alignItems: "flex-end",
  },
  progressBar: {
    flex: 1,
    alignItems: "center",
    gap: 6,
  },
  progressBarContainer: {
    width: "55%",
    height: 64,
    justifyContent: "flex-end",
    overflow: "hidden",
    borderRadius: 5,
    backgroundColor: colors.dark.elevated,
  },
  progressBarFill: {
    width: "100%",
    borderRadius: 5,
  },
  progressDay: {
    ...typography.small,
    fontSize: 11,
  },
});
