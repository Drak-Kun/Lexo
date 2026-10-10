import { Tabs } from "expo-router";
import { View, Text, StyleSheet } from "react-native";
import { useApp } from "../../context/AppContext";
import { colors } from "../../constants/theme";

const TabIcon = ({ focused, icon }: { focused: boolean; icon: string }) => {
  const { isDark } = useApp();
  const theme = isDark ? colors.dark : colors.light;

  return (
    <Text style={[styles.tabIcon, { color: focused ? theme.primary : theme.textSecondary }]}>
      {icon}
    </Text>
  );
};

export default function TabLayout() {
  const { isDark } = useApp();
  const theme = isDark ? colors.dark : colors.light;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.background,
          borderTopColor: theme.border,
          borderTopWidth: 1,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.textSecondary,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "500",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ focused }) => <TabIcon focused={focused} icon="🏠" />,
        }}
      />
      <Tabs.Screen
        name="words"
        options={{
          title: "Words",
          tabBarIcon: ({ focused }) => <TabIcon focused={focused} icon="📚" />,
        }}
      />
      <Tabs.Screen
        name="grammar"
        options={{
          title: "Grammar",
          tabBarIcon: ({ focused }) => <TabIcon focused={focused} icon="📝" />,
        }}
      />
      <Tabs.Screen
        name="quiz-tab"
        options={{
          title: "Quiz",
          tabBarIcon: ({ focused }) => <TabIcon focused={focused} icon="🎯" />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabIcon: {
    fontSize: 24,
  },
});
