# 🍳 Recipe Sharing Platform — Family Meals

A serverless recipe sharing application built with **React** and **Firebase Realtime Database**. This app allows family members to share recipes easily using text or **Voice Input (Speech-to-Text)**.

## ✨ Features
- **Real-time Sync**: All recipes are synced instantly across all users.
- **Voice Input**: Dictate your recipes directly using the built-in microphone button.
- **User Authentication**: Secure login and registration via Firebase Auth.
- **Family Dashboard**: View all family recipes in a clean, modern interface.
- **Mobile Friendly**: Fully responsive design for use in the kitchen.

## 🛠️ Stack
- **Frontend**: React + TypeScript + Vite
- **Database**: Firebase Realtime Database
- **Auth**: Firebase Authentication
- **Styling**: Tailwind CSS v4
- **Deployment**: Vercel

---

## 🚀 Getting Started

### 1. Firebase Setup
1. Create a project at [Firebase Console](https://console.firebase.google.com/).
2. Enable **Authentication** (Email/Password provider).
3. Enable **Realtime Database**.
4. Set the following **Database Rules**:
   ```json
   {
     "rules": {
       "users": {
         "$uid": {
           ".read": "$uid === auth.uid",
           ".write": "$uid === auth.uid"
         }
       },
       "recipes": {
         ".read": "auth !== null",
         "$uid": {
           ".write": "$uid === auth.uid"
         }
       }
     }
   }
   ```

### 2. Local Configuration
1. Clone the repository.
2. Navigate to the `frontend` folder:
   ```bash
   cd frontend
   ```
3. Create a `.env` file from the example:
   ```bash
   cp .env.example .env
   ```
4. Add your Firebase credentials to `.env`.

### 3. Run the App
From the root directory:
```bash
npm install
npm run dev
```

---

## 📁 Project Structure
- `frontend/`: The core React application.
- `frontend/src/context/AuthContext.tsx`: Manages user sessions.
- `frontend/src/services/recipeService.ts`: Handles real-time database operations.
- `frontend/src/hooks/useVoiceInput.ts`: Logic for Speech-to-Text.

---

## 🌐 Deployment
The project is optimized for deployment on **Vercel**. 
- Connect your GitHub repository to Vercel.
- Set the **Root Directory** to `frontend` or use the monorepo scripts.
- Add your Firebase Environment Variables in the Vercel Dashboard.
