# Kali (ಕಲಿ) — Learn to Read Kannada

Kali is a simple and effective tool designed to help you learn the Kannada script. Instead of just memorizing letters, you'll learn how to "decode" the language by matching shapes to sounds and building them into real words.

## How it Works

The app guides you through four clear stages to ensure you're comfortable with every character:

1.  **See and Hear**: Match the unique shapes of Kannada characters to the sounds they make.
2.  **Interactive Practice**: Strengthen your memory through phonetic typing and matching exercises.
3.  **Build Words**: Learn how to put individual characters together to form complete syllables and words.
4.  **Connect Meaning**: Move from just reading characters to understanding what the words actually mean.

## Key Features

*   **Step-by-Step Learning**: We introduce new characters only when you've mastered the current ones, so you never feel overwhelmed.
*   **Clear Audio**: Character audio is played from local MP3 assets generated from FreeTTS voices.
*   **Pick Up Where You Left Off**: Your progress is saved automatically in your browser. Feel free to learn at your own pace.
*   **Simple, Clean Design**: A focused interface that keeps your attention on the language.

---

## Technical Quickstart

### Prerequisites
- Node.js (v18 or higher)

### Installation

1.  **Install dependencies**:
    ```bash
    npm install
    ```


2.  **Run the app**:
    ```bash
    npm run dev
    ```
## Project Overview

*   `src/lib/dictionary.ts`: The main curriculum and word list.
*   `src/lib/speech.ts`: Handles local MP3 lookup, lazy playback, and lightweight audio preloading.
*   `src/components`: The interactive screens and buttons you see in the app.

---
Built with Next.js, Framer Motion, and Tailwind CSS.

## Credits

Voice generation and API support provided by FreeTTS:

*   `GET https://freetts.org/api/voices`
*   `POST https://freetts.org/api/tts`
*   `GET https://freetts.org/api/audio/{file_id}`
