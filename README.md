# Lexo - Multi-Language Learning App

A polished mobile language-learning app built with React Native and Expo.

## Features

✅ **Multi-Language Support**
- Learn any language (Japanese, Spanish, French, German, etc.)
- Easy language switching
- Language-aware pronunciation

✅ **Personal Learning Library**
- Add custom words with meanings, readings, examples, and notes
- Add grammar points with formations, examples, and translations
- Tag-based organization
- Powerful search across all content

✅ **Smart Quiz System**
- Choose content type (Words, Grammar, Mixed)
- Filter by tags
- Multiple question types
- Immediate feedback with haptics
- Progress tracking

✅ **Learning Analytics**
- Daily and weekly progress
- Streak tracking
- Review statistics
- Learning status (New, Learning, Familiar, Mastered)

✅ **Beautiful UI**
- Premium minimal design
- Automatic dark/light theme
- AMOLED dark mode
- Smooth animations

## Getting Started

### Prerequisites
- Node.js installed
- Expo Go app on your mobile device (or Android/iOS emulator)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm start
```

3. Scan the QR code with Expo Go (Android) or Camera app (iOS)

## Project Structure

```
lexo/
├── app/                    # Screens and navigation
│   ├── (tabs)/            # Bottom tab screens
│   │   ├── index.tsx      # Home/Dashboard
│   │   ├── words.tsx      # Words library
│   │   ├── grammar.tsx    # Grammar library
│   │   └── quiz-tab.tsx   # Quiz launcher
│   ├── add-word.tsx       # Add word screen
│   ├── add-grammar.tsx    # Add grammar screen
│   ├── word-detail.tsx    # Word details
│   ├── grammar-detail.tsx # Grammar details
│   ├── quiz-setup.tsx     # Quiz configuration
│   ├── quiz.tsx           # Quiz screen
│   ├── quiz-result.tsx    # Results screen
│   └── review-mistakes.tsx # Mistake review
├── context/               # React Context (App state)
├── storage/               # AsyncStorage functions
├── types/                 # TypeScript types
├── utils/                 # Utility functions (quiz logic)
├── constants/             # Theme and styling
└── package.json

```

## Key Technologies

- **React Native** - Cross-platform mobile framework
- **Expo** - Development platform
- **TypeScript** - Type safety
- **Expo Router** - File-based routing
- **AsyncStorage** - Local data persistence
- **Expo Speech** - Text-to-speech
- **Expo Haptics** - Touch feedback

## Demo Data

The app includes demo Japanese content to showcase functionality. All demo content can be edited or deleted, and users can add content in any language.

## Architecture Highlights

- **Language-independent**: No hard-coded language logic
- **Modular data layer**: Ready for backend integration
- **Type-safe**: Full TypeScript coverage
- **Persistent**: Data survives app restarts
- **Scalable**: Clean component structure

## License

MIT
