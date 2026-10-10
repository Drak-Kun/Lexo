// Premium color palette
export const colors = {
  light: {
    background: "#FFFFFF",
    card: "#F8F9FA",
    border: "#E1E4E8",
    text: "#1A1A1A",
    textSecondary: "#6B7280",
    primary: "#B98CFF",
    accent: {
      purple: "#B98CFF",
      cyan: "#55CFFF",
      green: "#39D99A",
      red: "#FF6B6B",
      yellow: "#F4C95D",
    },
  },
  dark: {
    background: "#000000",
    card: "#1A1A1A",
    border: "#2D2D2D",
    text: "#FFFFFF",
    textSecondary: "#9CA3AF",
    primary: "#B98CFF",
    accent: {
      purple: "#B98CFF",
      cyan: "#55CFFF",
      green: "#39D99A",
      red: "#FF6B6B",
      yellow: "#F4C95D",
    },
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
};

export const typography = {
  title: {
    fontSize: 28,
    fontWeight: "700" as const,
    letterSpacing: -0.5,
  },
  heading: {
    fontSize: 20,
    fontWeight: "600" as const,
  },
  body: {
    fontSize: 16,
    fontWeight: "400" as const,
  },
  caption: {
    fontSize: 14,
    fontWeight: "400" as const,
  },
  small: {
    fontSize: 12,
    fontWeight: "400" as const,
  },
};
