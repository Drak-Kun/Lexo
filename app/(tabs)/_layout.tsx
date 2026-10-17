import { Tabs } from "expo-router";
import { colors } from "../../constants/theme";
import { Brain, BookOpen, House, NotebookText, type LucideIcon } from "lucide-react-native";

const TabIcon = ({ focused, icon: Icon }: { focused: boolean; icon: LucideIcon }) => {
  const theme = colors.dark;

  return (
    <Icon
      size={22}
      strokeWidth={2}
      color={focused ? theme.primary : theme.textSecondary}
    />
  );
};

export default function TabLayout() {
  const theme = colors.dark;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: theme.background },
        tabBarStyle: {
          backgroundColor: theme.background,
          borderTopColor: theme.border,
          borderTopWidth: 0,
          elevation: 0,
          shadowOpacity: 0,
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
          tabBarIcon: ({ focused }) => <TabIcon focused={focused} icon={House} />,
        }}
      />
      <Tabs.Screen
        name="words"
        options={{
          title: "Words",
          tabBarIcon: ({ focused }) => <TabIcon focused={focused} icon={BookOpen} />,
        }}
      />
      <Tabs.Screen
        name="grammar"
        options={{
          title: "Grammar",
          tabBarIcon: ({ focused }) => <TabIcon focused={focused} icon={NotebookText} />,
        }}
      />
      <Tabs.Screen
        name="quiz-tab"
        options={{
          title: "Quiz",
          tabBarIcon: ({ focused }) => <TabIcon focused={focused} icon={Brain} />,
        }}
      />
    </Tabs>
  );
}
