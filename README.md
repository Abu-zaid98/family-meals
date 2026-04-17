# 🍳 Mise en Place — Recipe Sharing Platform

A full-stack recipe sharing app with voice input, image upload, and audio playback.

**Stack:** React + TypeScript · Node.js + Express · Firebase (Firestore + Storage) · Tailwind CSS v4

---

## Project Structure

```
recipe-app/
├── backend/
│   ├── src/
│   │   ├── config/firebase.js        # Firebase Admin SDK init
│   │   ├── controllers/recipeController.js
│   │   ├── middleware/upload.js       # Multer file handling
│   │   ├── routes/recipes.js
│   │   ├── services/storageService.js # Firebase Storage upload
│   │   └── server.js
│   ├── .env.example
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── RecipeCard.tsx
    │   │   ├── RecipeDetailModal.tsx
    │   │   ├── AddRecipeModal.tsx
    │   │   ├── AudioPlayer.tsx
    │   │   └── VoiceButton.tsx
    │   ├── hooks/
    │   │   ├── useRecipes.ts
    │   │   └── useVoiceInput.ts
    │   ├── pages/HomePage.tsx
    │   ├── services/recipeService.ts
    │   ├── types/index.ts
    │   ├── App.tsx
    │   ├── main.tsx
    │   └── index.css
    ├── index.html
    ├── vite.config.ts
    └── package.json
```

---

## 🔥 Firebase Setup

### 1. Create Firebase Project

1. Go to [https://console.firebase.google.com](https://console.firebase.google.com)
2. Click **"Add project"** → name it (e.g. `mise-en-place`)
3. Disable Google Analytics (optional) → **Create project**

### 2. Enable Firestore

1. Sidebar → **Firestore Database** → **Create database**
2. Choose **Production mode** → select a region → **Enable**
3. Go to **Rules** tab and paste:
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /recipes/{recipeId} {
      allow read, write: if true; // for dev — tighten in production
    }
  }
}
```
4. Click **Publish**

### 3. Enable Firebase Storage

1. Sidebar → **Storage** → **Get started**
2. Choose **Production mode** → pick same region → **Done**
3. Go to **Rules** tab and paste:
```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write: if true; // for dev
    }
  }
}
```
4. Click **Publish**

### 4. Get Admin SDK Credentials (for Backend)

1. Sidebar → ⚙️ **Project Settings** → **Service accounts** tab
2. Click **"Generate new private key"** → **Generate key**
3. A JSON file downloads — open it and copy the values below

### 5. Get Storage Bucket Name

1. Sidebar → **Storage** → your bucket URL shows as `your-project.appspot.com`

---

## 🚀 Running Locally

### Backend

```bash
cd backend

# Install dependencies
npm install

# Create .env from example
cp .env.example .env
```

Edit `.env` with your Firebase credentials from the downloaded JSON:
```env
PORT=5000
FRONTEND_URL=http://localhost:5173

FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY_ID=xxxx
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_KEY\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxx@your-project.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=xxxxxxxxx
FIREBASE_STORAGE_BUCKET=your-project.appspot.com
```

> ⚠️ The `FIREBASE_PRIVATE_KEY` must keep `\n` as literal `\n` in the `.env` file (the code replaces them)

```bash
# Start dev server
npm run dev
# → Server running on http://localhost:5000
```

### Frontend

```bash
cd frontend

# Install dependencies
npm install

# Create .env
cp .env.example .env
# VITE_API_URL=http://localhost:5000 (default, no change needed)

# Start dev server
npm run dev
# → http://localhost:5173
```

---

## 🧪 API Endpoints

| Method | Endpoint         | Description             |
|--------|-----------------|-------------------------|
| GET    | `/recipes`       | Get all recipes          |
| GET    | `/recipes/:id`   | Get single recipe        |
| POST   | `/recipes`       | Create recipe (multipart)|
| GET    | `/health`        | Server health check      |

### POST /recipes (multipart/form-data)

| Field         | Type   | Required |
|--------------|--------|----------|
| `title`       | string | ✅        |
| `description` | string | ✅        |
| `ingredients` | string | ✅        |
| `steps`       | string | ✅        |
| `image`       | file   | ❌        |
| `audio`       | file   | ❌        |

---

## 🎙️ Voice Input Feature

1. Open the **Add Recipe** modal
2. Click inside any text area (Description, Ingredients, or Steps)
3. Click **🎙️ Voice Input**
4. Speak — your words appear in the focused field in real-time
5. Click **⏹ Stop Recording**
6. The audio is saved and attached to the recipe (playable later)

> Voice input uses the **Web Speech API** — works best in Chrome/Edge. Firefox has limited support.

---

## Firestore Data Model

```
recipes (collection)
  └── {recipeId} (document)
        ├── title:       string
        ├── description: string
        ├── ingredients: string   (newline-separated)
        ├── steps:       string   (newline-separated)
        ├── imageUrl:    string | null
        ├── audioUrl:    string | null
        └── createdAt:   ISO timestamp string
```

---

## Production Notes

- Tighten Firebase security rules before deploying
- Add authentication (Firebase Auth) to protect write operations
- Set `FRONTEND_URL` in backend env to your deployed frontend URL
- Use environment variables in your hosting provider (Vercel, Railway, etc.)
