# Kali (ಕಲಿ) — Learn Kannada Script

**Kali** is a web application designed for learning the Kannada script through "Scaffolded Decoding." It focus on mapping visual shapes (glyphs) to sounds using an interactive, state-driven learning loop.

## 🌟 Features

- **Interactive Exercise Engine**: A rich variety of exercises that adapt to your progress:
  - **Identify**: Visual matching of Kannada glyphs to romanized sounds.
  - **Listen**: Audio matching exercises using high-quality speech synthesis.
  - **Decode**: Phonetic typing exercises to reinforce character-to-sound mapping.
  - **Build**: Syllable scramble exercises for forming complete words.
  - **Translate**: Word-meaning matching for vocabulary building.
- **Smart Audio System**: Intelligent multi-tier fallback for Kannada speech:
  - Uses native Kannada (`kn-IN`) voices when available.
  - Falls back to Hindi (`hi-IN`) or other Indian voices that can pronounce Kannada phonetically.
  - Includes a Google Translate TTS fallback for reliable audio on all platforms.
- **Scaffolded Learning**: A curriculum-based path across 6 levels, from basic vowels to complex conjuncts.
- **Modern UI/UX**: A bespoke, dark-themed interface built with glassmorphism, fluid animations (Framer Motion), and a curated color palette (Saffron, Sand, Onyx).
- **Progress Tracking**: Local persistence using `localStorage`. Master characters and unlock levels as you go.
- **Privacy-First**: Entirely client-side application with no trackers or backend requirements.

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

### Installation

1. Clone or download the repository.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🛠 Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Icons/UI**: Custom SVG components and vanilla CSS.
- **Speech**: Web Speech API with custom multi-tier fallback logic.

## ♻️ Project Structure

- `src/app`: Next.js pages and globals.
- `src/components`: UI components and exercise modules.
- `src/lib`: Core logic including the exercise engine, curriculum, and speech system.
- `src/hooks`: Custom React hooks for state management.
- `src/types`: TypeScript definitions for the application state and curriculum.

## 📝 Recent Updates

- **Audio System**: Fixed playback issues by adding Hindi and Google TTS fallbacks for platforms without native Kannada voices.
- **Exercise Variety**: Added character-level phonetic typing to ensure variety even in early vowel levels.
- **Data Management**: Added a "Reset Progress" feature on the Dashboard to allow users to clear their mastered characters and start fresh.

---
Built with ❤️ for Kannada learners.
