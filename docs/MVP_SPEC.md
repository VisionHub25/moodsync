# 📋 MoodSync MVP Specification

## Timeline: 6 Wochen

---

## Week 1-2: Foundation

### Goals
- [ ] Projekt Setup (Expo + TypeScript)
- [ ] Supabase Integration
- [ ] Auth Flow (Magic Link)
- [ ] Basic Check-in Screen

### Deliverables

#### 1.1 Project Setup
```bash
npx create-expo-app moodsync --template expo-template-blank-typescript
```

- Expo SDK 50+
- TypeScript strict mode
- ESLint + Prettier
- Expo Router für Navigation

#### 1.2 Supabase Setup
- Projekt erstellen
- Auth aktivieren (Magic Link)
- Database Schema deployen
- RLS Policies aktivieren
- Environment Variables konfigurieren

#### 1.3 Auth Flow
- Email Input Screen
- Magic Link Handler
- Session Persistence
- Logout Funktion

#### 1.4 Check-in Screen (Basic)
- Emoji Grid (6 Optionen: 😊 😐 😢 😤 😰 🤩)
- Optional Text Input (max 280 chars)
- Submit Button
- Success Animation

---

## Week 3-4: AI & Insights

### Goals
- [ ] TensorFlow Lite Integration
- [ ] Sentiment Analysis (On-Device)
- [ ] Context Tags
- [ ] Streak System
- [ ] Personal Insights View

### Deliverables

#### 3.1 On-Device AI
- TFLite Model einbinden
- Sentiment Score berechnen
- Score mit Checkin speichern

#### 3.2 Context Tags
Predefinierte Tags:
- #arbeit
- #beziehung
- #gesundheit
- #schlaf
- #sport
- #sozial
- #stress
- #erfolg

UI: Horizontal scrollable Chips

#### 3.3 Streak System
- Täglichen Streak tracken
- Streak Flame Animation 🔥
- "Du verlierst deinen Streak!" Push Notification (20:00)
- Longest Streak Anzeige

#### 3.4 Personal Insights
- Mood Trend Chart (letzte 7 Tage)
- Mood Trend Chart (letzte 30 Tage)
- Tag Correlation ("Wenn #schlaf, dann oft 😊")
- Best/Worst Day der Woche

---

## Week 5-6: Social Layer

### Goals
- [ ] Gruppen erstellen/beitreten
- [ ] Anonyme Gruppen-Stimmung
- [ ] Buddy System (1:1)
- [ ] Polish & Testing

### Deliverables

#### 5.1 Groups
- Gruppe erstellen (Name)
- Invite Code generieren
- Via Code beitreten
- Gruppen-Liste anzeigen

#### 5.2 Group Vibe
- Aggregierte Tagesstimmung (Durchschnitt)
- Vibe History (7 Tage)
- Anonymität: Keine individuellen Scores sichtbar
- Nur wenn min. 3 Mitglieder eingecheckt haben

#### 5.3 Buddy System
- Buddy anfragen (via Username)
- Anfrage annehmen/ablehnen
- Buddy's Mood sehen (wenn beide eingecheckt)
- Max 3 Buddies (MVP)

#### 5.4 Polish
- Loading States
- Error Handling
- Empty States
- Onboarding Flow (3 Screens)
- App Icon & Splash Screen

---

## Non-Goals (Post-MVP)

- ❌ E2E Encryption
- ❌ Push Notifications (außer Streak Reminder)
- ❌ Dark Mode (kommt später)
- ❌ Export Funktion
- ❌ Web Version
- ❌ Advanced AI Insights

---

## Success Metrics

| Metric | Target |
|--------|--------|
| Tägliche Checkins | 80% der aktiven User |
| Streak > 7 Tage | 30% der User |
| Gruppe beigetreten | 50% der User |
| App Crashes | < 0.1% |

---

## Tech Debt Accepted

1. Keine Test Coverage (kommt Post-MVP)
2. Hardcoded Emoji Set
3. Basic Error Messages
4. Keine Offline-Unterstützung

---

## Open Questions

1. ❓ Welche Emojis genau? (UX entscheidet)
2. ❓ Streak Reminder Time? (Default: 20:00)
3. ❓ Minimum Group Size für Vibe? (Vorschlag: 3)
