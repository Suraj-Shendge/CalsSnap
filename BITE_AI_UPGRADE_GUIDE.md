# Bite AI Upgrade Guide

This document outlines the transformation of CalsSnap into Bite AI (premium AI calorie tracker).

## Key Upgrades
- AI-based calorie parsing (OpenAI integration)
- Modular backend (routes + services)
- iOS-style frontend structure
- Navigation system (Home → Add → Result)

## Branding Changes
- App Name: Bite AI
- Clean, minimal UI inspired by iOS

## Next Steps
- Add camera-based food recognition
- Add user authentication
- Add cloud database (Firebase / Supabase)

## Run Instructions

### Backend
```
npm install
node server.js
```

### Mobile
```
npm install
npx react-native run-android
```

---

This is now a scalable base for a production-grade AI fitness app.
