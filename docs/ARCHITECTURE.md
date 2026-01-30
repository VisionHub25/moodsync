# 🏗️ MoodSync Architecture

## Overview

```
┌─────────────────────────────────────────────────────────────┐
│                      Mobile App                              │
│                   (React Native + Expo)                      │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │   Check-in  │  │   Insights  │  │    Social Layer     │  │
│  │    Screen   │  │   Screen    │  │  (Groups/Buddies)   │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
│         │                │                    │              │
│  ┌──────┴────────────────┴────────────────────┴───────────┐ │
│  │              TensorFlow Lite (On-Device AI)            │ │
│  │         Sentiment Analysis · Pattern Detection          │ │
│  └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
                              │
                              │ HTTPS
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                        Supabase                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │    Auth     │  │  PostgreSQL │  │     Realtime        │  │
│  │   (Magic    │  │  (RLS für   │  │   (Live Group       │  │
│  │   Link)     │  │   Privacy)  │  │    Updates)         │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
│                          │                                   │
│  ┌───────────────────────┴───────────────────────────────┐  │
│  │                   Edge Functions                       │  │
│  │        (Optional Cloud AI · Aggregation)               │  │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## Data Flow

### 1. Check-in Flow

```
User Input (Emoji + Text + Tags)
         │
         ▼
┌─────────────────────┐
│  On-Device AI       │
│  - Sentiment Score  │
│  - No text leaves   │
│    device           │
└─────────────────────┘
         │
         ▼
┌─────────────────────┐
│  Supabase Insert    │
│  - user_id          │
│  - emoji            │
│  - sentiment_score  │
│  - tags[]           │
│  - timestamp        │
│  (NO raw text!)     │
└─────────────────────┘
```

### 2. Group Vibe Flow

```
User A: Score 8 ──┐
User B: Score 6 ──┼──► Supabase RLS ──► Aggregation ──► "Team Vibe: 7.0"
User C: Score 7 ──┘         │
                            │
                    Individual scores
                    visible ONLY to
                    that user
```

## Database Schema

### `profiles`
```sql
id          UUID PRIMARY KEY (= auth.uid())
username    TEXT UNIQUE
avatar_url  TEXT
created_at  TIMESTAMP
```

### `checkins`
```sql
id              UUID PRIMARY KEY
user_id         UUID REFERENCES profiles(id)
emoji           TEXT NOT NULL
sentiment_score FLOAT (0.0 - 1.0)
tags            TEXT[]
note_hash       TEXT (optional, for dedup)
created_at      TIMESTAMP
```

### `groups`
```sql
id          UUID PRIMARY KEY
name        TEXT
invite_code TEXT UNIQUE
created_by  UUID REFERENCES profiles(id)
created_at  TIMESTAMP
```

### `group_members`
```sql
group_id    UUID REFERENCES groups(id)
user_id     UUID REFERENCES profiles(id)
role        TEXT ('admin' | 'member')
joined_at   TIMESTAMP
PRIMARY KEY (group_id, user_id)
```

### `buddies`
```sql
user_a      UUID REFERENCES profiles(id)
user_b      UUID REFERENCES profiles(id)
status      TEXT ('pending' | 'accepted')
created_at  TIMESTAMP
PRIMARY KEY (user_a, user_b)
```

### `streaks`
```sql
user_id         UUID PRIMARY KEY REFERENCES profiles(id)
current_streak  INT DEFAULT 0
longest_streak  INT DEFAULT 0
last_checkin    DATE
```

## Row Level Security (RLS)

```sql
-- Users can only see their own checkins
CREATE POLICY "Users see own checkins" ON checkins
  FOR SELECT USING (auth.uid() = user_id);

-- Group members can see aggregated scores (via function)
-- Individual checkins remain private
```

## AI Architecture

### On-Device (TensorFlow Lite)
- **Model:** Distilled sentiment classifier (~2MB)
- **Input:** Short text (< 280 chars)
- **Output:** Score 0.0 - 1.0
- **Latency:** < 100ms

### Cloud (Optional, Post-MVP)
- **Trigger:** Weekly insight generation
- **Input:** Aggregated scores + tags (no text)
- **Output:** Pattern insights ("You're usually happier on weekends")

## Security Considerations

1. **No raw text on server** – Only processed scores
2. **RLS everywhere** – Database enforces access control
3. **Magic Link auth** – No passwords to leak
4. **E2E Encryption (Post-MVP)** – For group/buddy messages

## Folder Structure

```
moodsync/
├── app/                    # Expo Router screens
│   ├── (tabs)/
│   │   ├── index.tsx       # Check-in
│   │   ├── insights.tsx    # Personal trends
│   │   └── social.tsx      # Groups & Buddies
│   ├── _layout.tsx
│   └── auth.tsx
├── components/
│   ├── EmojiPicker.tsx
│   ├── TagSelector.tsx
│   ├── MoodChart.tsx
│   └── StreakFlame.tsx
├── lib/
│   ├── supabase.ts
│   ├── ai/
│   │   └── sentiment.ts    # TFLite wrapper
│   └── hooks/
│       ├── useCheckin.ts
│       └── useStreak.ts
├── assets/
│   └── models/
│       └── sentiment.tflite
└── supabase/
    └── migrations/
```
