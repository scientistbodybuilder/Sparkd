## Sparkd

Sparkd is a gamified quiz app that turns your PDFs into interactive battles. Upload a PDF, let the system generate questions, and play through a quiz with health bars, sound effects, and animated enemies while your progress and achievements are tracked in your profile.

### Core features

- **PDF-powered quizzes**: Upload a PDF and generate multiple-choice questions from its content.
- **Gamified gameplay**: Answer questions in a battle-style UI with player/enemy health and sound effects.
- **Score history**: View past quiz results and track your performance over time.
- **Profile page**: See your account details, best score, and basic quiz stats.
- **Badge system**: Earn badges for milestones like first quiz, quiz count, and high scores; badges are shown on your profile.

### Tech stack

- **Framework**: Next.js App Router (React, TypeScript)
- **Auth & data**: Firebase Auth + Firestore
- **Storage**: Firebase Storage for uploaded PDFs
- **Styling**: Tailwind-style utility classes

### Getting started

1. **Install dependencies**:

   ```bash
   npm install
   ```

2. **Set up Firebase config**:

   Create a `.env.local` file with your Firebase credentials:

   ```bash
   NEXT_PUBLIC_FIREBASE_API_KEY=...
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
   NEXT_PUBLIC_FIREBASE_APP_ID=...
   ```

3. **Run the dev server**:

   ```bash
   npm run dev
   ```

4. Open `http://localhost:3000` in your browser.

### Project structure (high level)

- `src/app`: Next.js app routes and UI
  - `page.tsx`: Landing / entry screen
  - `dashboard/page.tsx`: Library of generated quizzes
  - `upload/page.tsx`: Upload PDFs and create quizzes
  - `quiz/[id]/page.tsx`: Quiz gameplay experience
  - `quiz/[id]/results/page.tsx`: Quiz results and breakdown
  - `scores/page.tsx`: Score history
  - `profile/page.tsx`: User profile and badges
  - `components/`: Shared UI like `Header`, `Footer`, modals, animations
- `src/lib/firebase.ts`: Firebase initialization and shared types
- `src/app/services`: Quiz and auth related service helpers

### Badges & profile

- Quiz completions are stored per user under `users/{uid}/scores`.
- Badges are stored under `users/{uid}/badges` and are automatically awarded when `saveQuiz` runs.
- The profile page reads these collections to show your stats and badge collection.

### Deployment

You can deploy Sparkd to any platform that supports Next.js (such as Vercel). Make sure your environment variables are configured in the hosting provider, then build and start:

```bash
npm run build
npm start
```
