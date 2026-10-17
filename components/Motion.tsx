import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  AccessibilityInfo,
  Animated,
  Easing,
  StyleProp,
  StyleSheet,
  TextStyle,
  TouchableOpacity,
  TouchableOpacityProps,
  View,
  ViewStyle,
} from "react-native";
import { useIsFocused } from "expo-router";
import { colors } from "../constants/theme";

const ReducedMotionContext = createContext(false);
const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

export function useReducedMotion() {
  return useContext(ReducedMotionContext);
}

export function MotionProvider({ children }: React.PropsWithChildren) {
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    let isMounted = true;
    AccessibilityInfo.isReduceMotionEnabled()
      .then((enabled) => {
        if (isMounted) setReduceMotion(enabled);
      })
      .catch((error: unknown) => {
        console.warn("Unable to read reduced-motion preference:", error);
      });

    const subscription = AccessibilityInfo.addEventListener(
      "reduceMotionChanged",
      setReduceMotion
    );
    return () => {
      isMounted = false;
      subscription.remove();
    };
  }, []);

  return (
    <ReducedMotionContext.Provider value={reduceMotion}>
      {children}
    </ReducedMotionContext.Provider>
  );
}

export function MotionTouchableOpacity({
  onPressIn,
  onPressOut,
  style,
  disabled,
  ...props
}: TouchableOpacityProps) {
  const reduceMotion = useContext(ReducedMotionContext);
  const scale = useRef(new Animated.Value(1)).current;

  const animateTo = (value: number) => {
    Animated.spring(scale, {
      toValue: value,
      speed: 28,
      bounciness: 7,
      useNativeDriver: true,
    }).start();
  };

  return (
    <AnimatedTouchableOpacity
      {...props}
      disabled={disabled}
      activeOpacity={1}
      onPressIn={(event) => {
        if (!reduceMotion && !disabled) animateTo(0.96);
        onPressIn?.(event);
      }}
      onPressOut={(event) => {
        if (!reduceMotion) animateTo(1);
        onPressOut?.(event);
      }}
      style={[
        style,
        !reduceMotion && { transform: [{ scale }] },
      ]}
    />
  );
}

type MotionEntranceProps = React.PropsWithChildren<{
  style?: StyleProp<ViewStyle>;
  delay?: number;
  distance?: number;
  scale?: number;
  animate?: boolean;
}>;

export function MotionEntrance({
  children,
  style,
  delay = 0,
  distance = 10,
  scale = 0.98,
  animate = true,
}: MotionEntranceProps) {
  const reduceMotion = useContext(ReducedMotionContext);
  const opacity = useRef(new Animated.Value(animate && !reduceMotion ? 0 : 1)).current;
  const offset = useRef(new Animated.Value(animate && !reduceMotion ? distance : 0)).current;
  const scaleValue = useRef(new Animated.Value(animate && !reduceMotion ? scale : 1)).current;

  useEffect(() => {
    if (!animate || reduceMotion) {
      opacity.setValue(1);
      offset.setValue(0);
      scaleValue.setValue(1);
      return;
    }
    const animation = Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 220,
        delay,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.spring(offset, {
        toValue: 0,
        delay,
        speed: 20,
        bounciness: 4,
        useNativeDriver: true,
      }),
      Animated.spring(scaleValue, {
        toValue: 1,
        delay,
        speed: 20,
        bounciness: 4,
        useNativeDriver: true,
      }),
    ]);
    animation.start();
    return () => animation.stop();
  }, [animate, delay, offset, opacity, reduceMotion, scaleValue]);

  return (
    <Animated.View
      style={[
        style,
        {
          opacity,
          transform: [{ translateY: offset }, { scale: scaleValue }],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
}

export function FocusMotion({
  children,
  style,
}: React.PropsWithChildren<{ style?: StyleProp<ViewStyle> }>) {
  const reduceMotion = useContext(ReducedMotionContext);
  const isFocused = useIsFocused();
  const offset = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!isFocused || reduceMotion) return;
    offset.setValue(6);
    Animated.timing(offset, {
      toValue: 0,
      duration: 180,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [isFocused, offset, reduceMotion]);

  return (
    <Animated.View
      style={[
        style,
        { backgroundColor: colors.dark.background },
        !reduceMotion && {
          transform: [{ translateY: offset }],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
}

export function CountUpText({
  value,
  format = (count) => Math.round(count).toString(),
  style,
}: {
  value: number;
  format?: (value: number) => string;
  style?: StyleProp<TextStyle>;
}) {
  const reduceMotion = useContext(ReducedMotionContext);
  const [displayValue, setDisplayValue] = useState(reduceMotion ? value : 0);
  const animatedValue = useRef(new Animated.Value(reduceMotion ? value : 0)).current;

  useEffect(() => {
    if (reduceMotion) {
      animatedValue.stopAnimation();
      animatedValue.setValue(value);
      setDisplayValue(value);
      return;
    }

    const listener = animatedValue.addListener(({ value: nextValue }) => {
      setDisplayValue(nextValue);
    });
    const animation = Animated.timing(animatedValue, {
      toValue: value,
      duration: 650,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    });
    animation.start();

    return () => {
      animation.stop();
      animatedValue.removeListener(listener);
    };
  }, [animatedValue, reduceMotion, value]);

  return (
    <Animated.Text style={style}>
      {format(displayValue)}
    </Animated.Text>
  );
}

export function MotionProgress({ progress, color }: { progress: number; color: string }) {
  const reduceMotion = useContext(ReducedMotionContext);
  const scale = useRef(new Animated.Value(reduceMotion ? progress : 0)).current;

  useEffect(() => {
    Animated.timing(scale, {
      toValue: progress,
      duration: reduceMotion ? 0 : 700,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [progress, reduceMotion, scale]);

  return (
    <View style={{ alignSelf: "stretch", width: "100%", height: 6, overflow: "hidden" }}>
      <Animated.View
        style={{
          height: "100%",
          width: scale.interpolate({
            inputRange: [0, 1],
            outputRange: ["0%", "100%"],
          }),
          borderRadius: 999,
          backgroundColor: color,
        }}
      />
    </View>
  );
}

export function AnimatedSelection({
  selected,
  selectedColor,
  unselectedColor,
  radius = 12,
}: {
  selected: boolean;
  selectedColor: string;
  unselectedColor: string;
  radius?: number;
}) {
  const reduceMotion = useReducedMotion();
  const value = useRef(new Animated.Value(selected ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(value, {
      toValue: selected ? 1 : 0,
      duration: reduceMotion ? 0 : 180,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [reduceMotion, selected, value]);

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        StyleSheet.absoluteFill,
        {
          margin: 1,
          borderRadius: radius,
          backgroundColor: value.interpolate({
            inputRange: [0, 1],
            outputRange: [unselectedColor, selectedColor],
          }),
        },
      ]}
    />
  );
}

export function SlideTransition({
  children,
  transitionKey,
  distance = 12,
}: React.PropsWithChildren<{ transitionKey: string | number; distance?: number }>) {
  return (
    <MotionEntrance key={transitionKey} distance={distance} scale={1}>
      {children}
    </MotionEntrance>
  );
}

export function StaggeredList({
  children,
  staggerMs = 40,
  maxItems = 6,
}: React.PropsWithChildren<{ staggerMs?: number; maxItems?: number }>) {
  return (
    <>
      {React.Children.map(children, (child, index) => (
        <MotionEntrance
          key={index}
          delay={Math.min(index, maxItems - 1) * staggerMs}
        >
          {child}
        </MotionEntrance>
      ))}
    </>
  );
}

export function AnswerFeedback({
  children,
  feedback,
}: React.PropsWithChildren<{ feedback: "correct" | "incorrect" | null }>) {
  const reduceMotion = useReducedMotion();
  const scale = useRef(new Animated.Value(1)).current;
  const offset = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    scale.stopAnimation();
    offset.stopAnimation();
    scale.setValue(1);
    offset.setValue(0);
    if (reduceMotion || !feedback) return;

    if (feedback === "correct") {
      Animated.sequence([
        Animated.spring(scale, {
          toValue: 1.035,
          speed: 26,
          bounciness: 6,
          useNativeDriver: true,
        }),
        Animated.spring(scale, {
          toValue: 1,
          speed: 24,
          bounciness: 5,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.sequence([
        Animated.timing(offset, { toValue: 3, duration: 35, useNativeDriver: true }),
        Animated.timing(offset, { toValue: -3, duration: 45, useNativeDriver: true }),
        Animated.timing(offset, { toValue: 0, duration: 45, useNativeDriver: true }),
      ]).start();
    }
  }, [feedback, offset, reduceMotion, scale]);

  return (
    <Animated.View style={{ transform: [{ scale }, { translateX: offset }] }}>
      {children}
    </Animated.View>
  );
}

export const FadeIn = MotionEntrance;
export const ScalePress = MotionTouchableOpacity;
export const AnimatedCounter = CountUpText;
export const ProgressAnimation = MotionProgress;
