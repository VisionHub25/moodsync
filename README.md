# 📱 MoodSync

AI-gestütztes Mood-Tracking mit optionalem Social Layer.

## 🎯 Vision

Eine App, die dir hilft, deine Stimmungen zu verstehen – alleine oder mit anderen.

## ✨ Features (MVP)

- **1-Tap Check-in:** Emoji + optionaler Satz
- **Context Tags:** #arbeit, #müde, #sport, etc.
- **Streak Flame 🔥:** Gamification für tägliches Tracking
- **AI-Insights:** Persönliche Muster erkennen (On-Device)
- **Gruppen-Vibe:** Anonymisierte Team-Stimmung
- **Buddy-System:** 1:1 Sharing (optional)

## 🛠️ Tech Stack

| Layer | Technologie |
|-------|-------------|
| Frontend | React Native + Expo |
| Backend | Supabase (Auth, PostgreSQL, Realtime) |
| AI (On-Device) | TensorFlow Lite |
| AI (Cloud) | OpenAI API (optional, für tiefere Insights) |

## 🔒 Privacy-First

- Keine Rohtexte auf dem Server
- Nur Scores + Tags werden gespeichert
- E2E Encryption geplant (Post-MVP)
- User kontrolliert alle Sharing-Optionen

## 📅 Timeline

**MVP: 6 Wochen**

| Woche | Focus |
|-------|-------|
| 1-2 | Core Setup, Auth, Check-in Flow |
| 3-4 | AI Integration, Trend-Visualisierung |
| 5-6 | Social Features, Gruppen, Buddy-System |

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Start Expo
npx expo start
```

## 👥 Team

- **PM:** Produktvision & Koordination
- **UX:** Design & User Experience
- **Tech:** Architektur & Entwicklung

---

Made with 💜 by the MoodSync Team
