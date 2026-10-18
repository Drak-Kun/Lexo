Lexo

A modern, mobile-first language learning app.

Lexo helps you learn vocabulary and grammar, test your knowledge with quizzes, and track your learning progress. Built for learners who want a simple, organized way to practice a language on their phone.

✨ Features

- Home — View your selected language, learning streak, word and grammar shortcuts, progress, and quiz entry point.
- Words — Browse and manage vocabulary, search words, and organize learning material with tags.
- Grammar — Keep grammar topics organized for focused study.
- Quizzes — Test your knowledge with multiple-choice and other supported quiz flows.
- Progress tracking — Monitor your learning activity and performance.
- Multiple languages — Support for language-specific content, including Japanese and Spanish.
- Dark interface — A black-themed UI with restrained accent colors.
- Language-specific visuals — Dedicated hero imagery for supported languages.

🛠️ Tech Stack

- React Native
- Expo
- TypeScript
- Expo Router
- Android

📱 Project Structure

The main application is organized around Expo Router.

.
├── app/              # Application screens and navigation
├── assets/           # Images, icons, and other static assets
├── components/       # Reusable UI components
├── constants/        # Shared constants and configuration
├── hooks/            # Custom React hooks
├── app.json          # Expo application configuration
├── eas.json          # EAS Build configuration
└── package.json      # Dependencies and scripts

The exact folders may vary as development continues.

🚀 Getting Started

Requirements

- Node.js
- npm
- Expo-compatible development environment

Install dependencies

npm install

Start the development server

npx expo start

To clear the Metro cache:

npx expo start --clear

Follow the Expo CLI instructions to open the app in a supported development environment.

📦 Android Build

Lexo uses EAS Build for Android packaging.

To create an APK using the configured preview profile:

npx eas-cli build --platform android --profile preview

The build profile must be configured for APK output.

🗺️ Project Direction

Lexo aims to become a mobile-friendly alternative to traditional flashcard apps, combining spaced-repetition review with flexible quizzes and a straightforward content library.

Potential areas of future development include:

- More flexible quiz configuration
- Dedicated spaced-repetition scheduling
- Targeted practice for incorrect answers
- Improved learning analytics
- Import and export capabilities
- Reliable synchronization and backups

These are roadmap goals and should not be considered implemented unless verified in the current codebase.

🤝 Contributing

Lexo is under active development. Changes should preserve existing learning data, navigation, quiz behavior, and language-specific content.

📄 License

No license has been specified yet. All rights remain with the respective copyright holder unless a license is added to this repository.