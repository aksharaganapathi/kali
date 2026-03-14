# Kali (ಕಲಿ)

Kali is a specialized web application for learning the Kannada script using a scaffolded decoding methodology. The application focuses on mapping visual glyphs to their respective sounds through a sequence of interactive exercises.

## Core Methodology

The learning process is structured into several progressive exercise types:

- **Recognition**: Visual mapping of Kannada characters to phonetic sounds.
- **Audio Integration**: Auditory matching using text-to-speech synthesis.
- **Phonetic Transcription**: Direct typing to reinforce character-sound associations.
- **Structural Construction**: Syllable rearrangement to form complete words.
- **Semantic Mapping**: Word-to-meaning matching for vocabulary acquisition.

## Technical Implementation

- **Framework**: Next.js (App Router)
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Persistence**: browser-based localStorage
- **Audio Output**: ElevenLabs API with custom voice design for authentic Indian/Kannada accents.

## Design Principles

The interface follows a premium, minimalist aesthetic using glassmorphism and subtle animations. The typography is optimized for both Kannada script and English phonetic guides. Recent UI improvements include:
- A custom mesh gradient background replacing flat color fills.
- Fixed-height layout structures in exercise components to prevent content jumping.
- Enhanced card styling with multi-layer shadows and inner borders.

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure environment variables in `.env.local`:
   ```env
   NEXT_PUBLIC_ELEVENLABS_API_KEY=your_api_key
   NEXT_PUBLIC_ELEVENLABS_VOICE_ID=designed_voice_id
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

## Project Organization

- `src/app`: Application routes and global configurations.
- `src/components`: UI components, including the modular exercise system.
- `src/lib`: Core logic for the curriculum, exercise engine, and speech synthesis.
- `src/types`: TypeScript definitions for application state and data structures.

## Recent Improvements

- **Visual Overhaul**: Replaced vector logo with a typographic hero header and introduced a radial mesh gradient for depth.
- **Layout Stability**: Resolved layout shifts occurring when answer feedback or the continue button appeared in exercises.
- **Audio Enhancement**: Integrated ElevenLabs for higher quality, authentic Kannada pedagogy.
- **State Management**: Added persistent progress tracking and a centralized reset mechanism.
