# 📱 SSC English Pro — Complete Architecture & Working Guide

> **Author**: SSC English Pro Engineering Team  
> **Version**: 2.5 (Enterprise Production Build)  
> **Tech Stack**: React 18, TypeScript, Vite, Tailwind/Vanilla CSS, GitHub + jsDelivr CDN, Google Apps Script, Netlify  

---

## 📑 Table of Contents
1. [Project Overview & Philosophy](#1-project-overview--philosophy)
2. [End-to-End Student App Flow](#2-end-to-end-student-app-flow)
3. [Core Feature Breakdown](#3-core-feature-breakdown)
4. [Monetization, Login & Payment Engine](#4-monetization-login--payment-engine)
5. [Cloud, Database & jsDelivr CDN Architecture](#5-cloud-database--jsdelivr-cdn-architecture)
6. [Master Admin Console (10 Powerhouse Modules)](#6-master-admin-console-10-powerhouse-modules)
7. [Directory & File Structure](#7-directory--file-structure)
8. [Data Schemas & CDN Endpoints](#8-data-schemas--cdn-endpoints)

---

## 1. Project Overview & Philosophy

**SSC English Pro** is a comprehensive, gamified, exam-preparation web & mobile application designed for aspirants targeting:
- **SSC CGL (Tier 1 & Tier 2)**
- **SSC CHSL**
- **SSC MTS / Havaldar**
- **SSC CPO (SI in Delhi Police / CAPFs)**
- **SSC Selection Posts & Steno**

### Key Pillars:
- **18,000+ Authentic Official PYQs (2018–2026)** categorized topic-wise.
- **120 Golden Grammar Rules** with formula breakdown, Hindi explanations & attached PYQs.
- **6,000+ High-Yield Vocab Bank** (Synonyms, Antonyms, One Word Substitutions, Idioms & Phrases).
- **Intelligent Mistake Vault** for auto-logging and re-testing weak areas.
- **Interactive AI Grammar Checker**.
- **Ultra-lightweight OTA delivery** via GitHub + jsDelivr CDN.

---

## 2. End-to-End Student App Flow

```
                                  ┌───────────────────────────┐
                                  │      User Opens App       │
                                  └─────────────┬─────────────┘
                                                │
                                                ▼
                                  ┌───────────────────────────┐
                                  │   Home Dashboard Hero     │
                                  │  - Daily Mock Speed Test  │
                                  │  - Streaks & XP Tracker   │
                                  │  - Live Broadcast Banner  │
                                  └─────────────┬─────────────┘
                                                │
                        ┌───────────────────────┴───────────────────────┐
                        ▼                                               ▼
          ┌───────────────────────────┐                   ┌───────────────────────────┐
          │     Topic Speed Sets      │                   │    120 Rules / Vocab      │
          │   30-Question Timed Sets  │                   │  Deep Concept Learning    │
          └─────────────┬─────────────┘                   └─────────────┬─────────────┘
                        │                                               │
                        └───────────────────────┬───────────────────────┘
                                                ▼
                                  ┌───────────────────────────┐
                                  │     Quiz Engine Screen    │
                                  │  - Countdown Timer        │
                                  │  - Instant Feedback       │
                                  │  - English & Hindi Expl.  │
                                  └─────────────┬─────────────┘
                                                │
                        ┌───────────────────────┴───────────────────────┐
                        ▼                                               ▼
          ┌───────────────────────────┐                   ┌───────────────────────────┐
          │       Correct Answer      │                   │      Wrong Answer         │
          │     +10 XP Points Gained  │                   │  Auto-sent to Mistake     │
          │                           │                   │  Vault for Re-Testing     │
          └─────────────┬─────────────┘                   └─────────────┬─────────────┘
                        │                                               │
                        └───────────────────────┬───────────────────────┘
                                                ▼
                                  ┌───────────────────────────┐
                                  │    Test Result Analysis   │
                                  │  Score, Accuracy, Review  │
                                  └─────────────┬─────────────┘
                                                │
                                    (After 2 Free Tests Limit)
                                                │
                                                ▼
                                  ┌───────────────────────────┐
                                  │   Pro Membership Modal    │
                                  │  - Mobile OTP/Auth Login  │
                                  │  - Coupon Code Engine     │
                                  │  - Razorpay ₹29 Checkout  │
                                  └─────────────┬─────────────┘
                                                │
                                                ▼
                                  ┌───────────────────────────┐
                                  │   Lifetime Pro Unlocked   │
                                  │  All 18k PYQs & Rules Open│
                                  └───────────────────────────┘
```

---

## 3. Core Feature Breakdown

### A. 🏠 Home Dashboard (`src/components/Dashboard.tsx`)
- **Daily Mock Speed Test**: Instant 1-click test launcher.
- **Streak & XP Counter**: Gamification engine rewarding daily consistency.
- **Topic Accuracy Meters**: Real-time progress bars calculating accuracy % per topic.
- **Live Announcement Banner**: Top-strip alert published via Admin Panel (e.g. Flash sales, exam dates).

### B. 📁 Topic Speed Sets (`src/components/TopicSets.tsx`)
- **9 Standard Core SSC Topics**:
  1. `spot_error` — Spot the Error (2,450+ PYQs)
  2. `sentence_improvement` — Sentence Improvement (2,300+ PYQs)
  3. `fill_blanks` — Fill in the Blanks (1,850+ PYQs)
  4. `one_word` — One Word Substitution (2,100+ PYQs)
  5. `idioms_phrases` — Idioms & Phrases (2,200+ PYQs)
  6. `synonyms` — Synonyms (2,050+ PYQs)
  7. `antonyms` — Antonyms (1,950+ PYQs)
  8. `misspelled` — Spelling Errors (1,650+ PYQs)
  9. `cloze_test` — Cloze Test & Passages (1,900+ PYQs)
- **Dynamic Custom Topics**: Any topic created in the Admin Panel automatically generates speed test sets here.
- **Bite-Sized 30-Question Sets**: Set 1, Set 2, Set 3... with set timers and completion badges.

### C. ⚡ Real-Time Quiz Engine (`src/components/QuizEngine.tsx` & `ResultScreen.tsx`)
- Live countdown timer with pause/resume support.
- Immediate option check with color-coded feedback.
- Rich explanations: Official English rule + **💡 सरल हिन्दी व्याख्या** (Hindi explanation).
- Instant bookmarking for question review.
- Auto-routing wrong attempts to **Mistake Vault**.

### D. 🛡️ Mistake Vault (`src/components/MistakeVault.tsx`)
- Centralized revision repository capturing every mistake made during tests.
- Allows students to filter mistakes by topic and re-attempt only their weak questions.
- Automatically removes items from the vault once answered correctly during re-tests.

### E. 📖 120 Golden Grammar Rules (`src/components/GrammarRules.tsx`)
- Structured collection of all 120 Nimisha Bansal & SSC Golden Grammar Rules.
- Includes rule formulas, common traps, Hindi explanation cards, and linked official PYQs for direct practice.

### F. 🔤 6,000+ Vocab Bank (`src/components/VocabBank.tsx`)
- Searchable vocabulary bank filterable by Synonyms, Antonyms, One Word Substitutions, Idioms, and Spelling Rules.
- Detailed cards containing English meanings, Hindi meanings, mnemonics, example sentences, and exam tags.

### G. 🤖 AI Grammar Checker (`src/components/GrammarChecker.tsx`)
- Interactive sentence verification playground where students can input any sentence to detect grammatical flaws, receive corrections, and understand the underlying rule.

---

## 4. Monetization, Login & Payment Engine

### Flow (`src/components/PricingModal.tsx` & `src/context/AppContext.tsx`):
1. **Free Pass Model**: New students get 2 free mock tests and limited AI grammar checks.
2. **Phone Authentication**: Student enters their 10-digit mobile number. The system verifies their account with the Google Sheets cloud database (`action=checkPhone`).
3. **Discount Promo Coupons**: Supports dynamic promo codes (e.g. `SSC50` for 50% discount, `PRO19` for flat ₹10 discount).
4. **Razorpay Payment Gateway**:
   - Offer Price: **₹29** (Original: ₹299, 90% OFF).
   - Plan Validity: **60 Days** (or customizable via Admin).
   - On successful transaction, calls Google Apps Script (`action=updatePro&days=60&paymentId=...`).
   - Local state is instantly updated to `isProUser = true`.

---

## 5. Cloud, Database & jsDelivr CDN Architecture

```
                       ┌──────────────────────────────┐
                       │      GitHub Repository       │
                       │  edupluscreation/ENGLISHPRO  │
                       └──────────────┬───────────────┘
                                      │
                 ┌────────────────────┴────────────────────┐
                 ▼                                         ▼
   ┌───────────────────────────┐             ┌───────────────────────────┐
   │       jsDelivr CDN        │             │      Netlify Deploy       │
   │  (18k Questions / Vocab)  │             │   (Master Admin Portal)   │
   └─────────────┬─────────────┘             └─────────────┬─────────────┘
                 │                                         │
                 ▼                                         ▼
   ┌───────────────────────────┐             ┌───────────────────────────┐
   │       Student App         │◄───────────►│    Google Apps Script     │
   │  (Ultra-light, Fast OTA)  │             │     (Cloud Database)      │
   └───────────────────────────┘             └───────────────────────────┘
```

### 1. GitHub + jsDelivr Global CDN
- **Repository**: `https://github.com/edupluscreation/ENGLISHPRO` (`main` branch)
- Heavy JSON files (18k PYQs = 14MB, Vocab = 680KB, 120 Rules = 1MB) reside on GitHub.
- **jsDelivr CDN** serves these files worldwide over HTTP/2 and Edge cache.
- **Advantage**: Zero server hosting costs, lightning-fast edge delivery, and Over-The-Air (OTA) instant data updates without rebuilding the app.

### 2. Google Apps Script Backend (`scripts/google_apps_script.js`)
- Serverless microservice linking Google Sheets as a relational database.
- **Endpoints**:
  - `?action=checkPhone&phone=...`: Checks if user exists and returns Pro status + expiry.
  - `?action=signup&phone=...&name=...`: Registers a new student record.
  - `?action=updatePro&phone=...&days=60`: Extends or grants Pro membership.
  - `?action=getUsers`: Returns CRM list of all registered students for Admin Panel.
  - `?action=updateConfig&proPrice=...`: Dynamically synchronizes pricing and plan validity.

---

## 6. Master Admin Console (10 Powerhouse Modules)

The Master Admin Console is deployed directly on Netlify as a standalone web application.

### Access & Security:
- **PIN Protected**: Default PIN `8899` or `1234` (customizable in settings).
- **Session Auth**: Stores session token in `sessionStorage`.

### 10 Modules:
1. **📊 Live Analytics Dashboard**: Real-time Gross Revenue tracker (₹), Paid Pro count, Free trial users count, Conversion rate %, and Total question bank counts.
2. **📤 Bulk & Single Question Importer**:
   - **Bulk Parser**: Drag-and-drop or paste `.json` / `.csv` (Excel) data.
   - **Live Validation Table**: Checks option count, bounds, answer index, and displays error warnings before import.
   - **Sample Downloads**: 📥 Download `sample_ssc_questions.json` and `sample_ssc_questions.csv`.
   - **1-Click Copy**: Fast clipboard copy buttons.
3. **📁 Topic Manager**: Create new custom subject categories with custom badges, slug IDs, and color palettes.
4. **📚 Custom Questions Library**: Live keyword search and topic-wise filtering. Delete single question or 1-Click clear all custom questions for a topic.
5. **🎟️ Discount Coupons & Promo Engine**: Generate promo codes with percentage (%) or flat (₹) discounts. Real-time active/inactive toggle.
6. **📢 Broadcast Announcement Banner CMS**: Publish top-strip alerts with 4 theme styles (Promo, Hot Deal, Urgent, Info) and customizable action button.
7. **🔤 Vocab Bank CMS**: Add high-frequency vocabulary with Hindi meanings, English definitions, categories, and example sentences.
8. **💎 Live Pricing & Subscriptions**: Modify Pro Price (₹29), Original Price (₹299), and Plan Duration (60 Days) with automatic Google Sheets sync.
9. **👥 Students CRM**: Real-time list of registered students with 1-Click Pro Grant/Revoke controls.
10. **⚙️ Platform Settings & Full Backup**:
    - WhatsApp support helpdesk number.
    - Telegram community link.
    - Free mock tests limit.
    - Change Master Admin PIN.
    - **1-Click Full Platform Backup JSON** (exports all topics, questions, vocab, coupons, and settings into a single backup file).

---

## 7. Directory & File Structure

```
d:/main app/
├── index.html                   # HTML entry point with dark mode & app loader
├── netlify.toml                 # Netlify build and redirect configuration
├── package.json                 # Project dependencies & build scripts
├── vite.config.ts               # Vite bundler configuration
│
├── src/
│   ├── App.tsx                  # Root component (Renders Admin Panel / Student App)
│   ├── main.tsx                 # React DOM root mounting
│   ├── context/
│   │   └── AppContext.tsx       # Global state (XP, streaks, history, mistakes, Pro auth)
│   ├── types/
│   │   └── quiz.ts              # TypeScript interfaces (Question, CustomTopic, Vocab, etc.)
│   ├── data/
│   │   ├── adminData.ts         # Lightweight Admin helpers, sample JSON/CSV templates
│   │   ├── questions.ts         # Topic definitions & student unified questions getter
│   │   ├── pinnacleQuestions.json # 18,000+ Official SSC PYQ questions dataset (14MB)
│   │   ├── pyqVocabData.json    # 6,000+ Vocab Bank dataset (680KB)
│   │   ├── grammarRulesData.json# 120 Golden Grammar Rules with attached PYQs (1MB)
│   │   ├── vocabData.ts         # Vocab data loader
│   │   └── grammarRules.ts      # Grammar rules loader
│   ├── components/
│   │   ├── AdminPanel.tsx       # 10-Module Master Admin Console
│   │   ├── Dashboard.tsx        # Student Dashboard with Daily Mock & Analytics
│   │   ├── TopicSets.tsx        # Topic-wise 30-question speed sets
│   │   ├── QuizEngine.tsx       # Real-time test engine with countdown & Hindi explanations
│   │   ├── ResultScreen.tsx     # Comprehensive test result score & review
│   │   ├── VocabBank.tsx        # Searchable 6,000+ Vocab dictionary
│   │   ├── GrammarRules.tsx     # 120 Golden Rules explorer
│   │   ├── MistakeVault.tsx     # Weak-area revision & re-test engine
│   │   ├── GrammarChecker.tsx   # Interactive AI sentence checker
│   │   ├── Profile.tsx          # User stats, WhatsApp helpdesk, Telegram & Admin link
│   │   ├── PricingModal.tsx     # Phone login, Razorpay ₹29 & Coupon checkout
│   │   └── Header.tsx           # Global top navigation & dark theme toggle
│   └── styles/
│       └── index.css            # Dark mode tokens, glassmorphism & responsive utilities
│
└── scripts/
    ├── google_apps_script.js    # Google Sheets cloud database & auth webhook
    └── [various curation scripts] # Python & JS data processing & enrichment scripts
```

---

## 8. Data Schemas & CDN Endpoints

### A. Live CDN Endpoints
| Dataset | jsDelivr CDN URL |
| :--- | :--- |
| **18k+ Questions** | `https://cdn.jsdelivr.net/gh/edupluscreation/ENGLISHPRO@main/src/data/pinnacleQuestions.json` |
| **6k+ Vocab Bank** | `https://cdn.jsdelivr.net/gh/edupluscreation/ENGLISHPRO@main/src/data/pyqVocabData.json` |
| **120 Grammar Rules** | `https://cdn.jsdelivr.net/gh/edupluscreation/ENGLISHPRO@main/src/data/grammarRulesData.json` |

### B. Standard Question JSON Schema
```json
{
  "id": "q_1001",
  "topic": "spot_error",
  "questionText": "Neither the teacher nor the students was present in the class.",
  "options": [
    "Neither the teacher",
    "nor the students",
    "was present in",
    "the class."
  ],
  "correctAnswer": 2,
  "explanation": "When two subjects are joined by 'Neither... nor', the verb agrees with the closer subject ('students' is plural, so use 'were').",
  "hindiExplanation": "जब दो subjects 'Neither... nor' से जुड़े हों तो क्रिया (verb) पास वाले subject के अनुसार आती है (students -> were)।",
  "difficulty": "Medium",
  "examTag": "SSC CGL 2024 Tier-1"
}
```

---
*Documented & Maintained by SSC English Pro Core Team.*
