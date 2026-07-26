# MindSpark Trivia World ⚡

MindSpark is a cross-generational, AI-powered trivia application designed to provide an engaging and accessible experience for kids, adults, and seniors. It features real-time multiplayer, an advanced achievement system, and an hourly refreshing Pro trivia database powered by Gemini AI.

## 🌟 Key Features

- **Hourly Pro AI Trivia**: Lifetime Pro members get access to a dynamically updating database that refreshes with new, non-repeating trivia every hour.
- **Cross-Generational Difficulty**: Tailored trivia pools for Kids, Adults, and Seniors with difficulty-aware question generation.
- **Multiplayer Hub**: Compete locally or simulate matches with AI bots in a polished multiplayer interface.
- **Achievement System**: Earn visual badges like 'Trivia Novice', 'Picture Master', and 'Century Scholar' for reaching score and category milestones.
- **Haptic Feedback**: Professional tactile responses for mobile users, with distinct patterns for correct and incorrect answers.
- **Accessibility First**: Senior-friendly font scaling, high-contrast modes, and hands-free voice command support.
- **Cloud Sync & SSO**: Persistent progress tracking with support for Google and Apple SSO.
- **Offline Mode**: Continue playing even when the connection is lost with local state persistence.

## 🚀 Technical Stack

- **Frontend**: React 18+ with TypeScript & Vite
- **Styling**: Tailwind CSS
- **Backend**: Express.js (Node.js)
- **AI Engine**: Google Gemini (via `@google/genai`)
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Persistence**: LocalStorage with Cloud Sync hooks

## 🛠️ Project Structure

- `/src/components`: UI components (Multiplayer, Trivia Engine, Achievements, Modals)
- `/src/hooks`: Custom hooks for cloud sync, voice commands, and trivia management
- `/src/lib`: Core utilities (Haptics, Confetti, Achievements logic)
- `/src/data`: Initial trivia database and static assets
- `/server.ts`: Express backend handling AI trivia generation and API routes

## 🚦 Getting Started

### Prerequisites

- Node.js (v18+)
- npm or bun

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up your environment variables (see `.env.example`):
   ```bash
   cp .env.example .env
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

## 📜 License

This project is built for the AI Studio build platform.
