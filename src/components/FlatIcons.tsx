import React from 'react';

interface IconProps {
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}

// ─── FLATICON-STYLE COLORFUL MULTI-TONE ICONS ───

// 1. Spot the Error (Magnifying Glass + Warning Badge)
export const FlatIconSpotError: React.FC<IconProps> = ({ size = 32, style }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" style={style}>
    <circle cx="22" cy="22" r="14" fill="#FEE2E2" stroke="#EF4444" strokeWidth="3" />
    <path d="M32 32L42 42" stroke="#EF4444" strokeWidth="4" strokeLinecap="round" />
    <circle cx="22" cy="18" r="2" fill="#DC2626" />
    <path d="M22 23V27" stroke="#DC2626" strokeWidth="2.5" strokeLinecap="round" />
    <circle cx="34" cy="14" r="7" fill="#EF4444" />
    <path d="M34 11V14M34 16.5V17" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);

// 2. Sentence Improvement (Magic Wand / Pen + Stars)
export const FlatIconSentenceImprovement: React.FC<IconProps> = ({ size = 32, style }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" style={style}>
    <rect x="8" y="10" width="26" height="32" rx="4" fill="#DBEAFE" stroke="#3B82F6" strokeWidth="3" />
    <path d="M14 18H26M14 24H24M14 30H20" stroke="#3B82F6" strokeWidth="2.5" strokeLinecap="round" />
    <path d="M28 8L40 20L36 24L24 12L28 8Z" fill="#60A5FA" stroke="#2563EB" strokeWidth="2" />
    <path d="M24 12L21 21L30 18L24 12Z" fill="#1D4ED8" />
    <circle cx="38" cy="10" r="1.5" fill="#F59E0B" />
    <path d="M40 4L41 7L44 8L41 9L40 12L39 9L36 8L39 7L40 4Z" fill="#F59E0B" />
  </svg>
);

// 3. Fill in the Blanks (Target Pencil + Dashes)
export const FlatIconFillBlanks: React.FC<IconProps> = ({ size = 32, style }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" style={style}>
    <rect x="6" y="8" width="36" height="32" rx="6" fill="#FEF3C7" stroke="#F59E0B" strokeWidth="3" />
    <path d="M12 28H24" stroke="#F59E0B" strokeWidth="3.5" strokeLinecap="round" strokeDasharray="1 1" />
    <path d="M28 28H36" stroke="#D97706" strokeWidth="3.5" strokeLinecap="round" />
    <path d="M12 18H36" stroke="#FBBF24" strokeWidth="2.5" strokeLinecap="round" />
    <path d="M26 12L36 22L33 25L23 15L26 12Z" fill="#F59E0B" stroke="#B45309" strokeWidth="1.5" />
    <path d="M23 15L20 22L27 19L23 15Z" fill="#78350F" />
  </svg>
);

// 4. Cloze Test & Passage (Book with Flowing Text)
export const FlatIconClozeTest: React.FC<IconProps> = ({ size = 32, style }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" style={style}>
    <path d="M8 12C8 10 10 8 12 8H22C24 8 24 10 24 12V38C24 36 22 35 20 35H12C10 35 8 36 8 38V12Z" fill="#E0E7FF" stroke="#6366F1" strokeWidth="2.5" />
    <path d="M40 12C40 10 38 8 36 8H26C24 8 24 10 24 12V38C24 36 26 35 28 35H36C38 35 40 36 40 38V12Z" fill="#EEF2FF" stroke="#6366F1" strokeWidth="2.5" />
    <path d="M12 16H20M12 22H18M12 28H20" stroke="#818CF8" strokeWidth="2" strokeLinecap="round" />
    <path d="M28 16H36M28 22H34M28 28H36" stroke="#818CF8" strokeWidth="2" strokeLinecap="round" />
    <circle cx="24" cy="8" r="4" fill="#4F46E5" />
  </svg>
);

// 5. One Word Substitution (Lightbulb Idea + Book)
export const FlatIconOneWord: React.FC<IconProps> = ({ size = 32, style }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" style={style}>
    <path d="M24 6C17.37 6 12 11.37 12 18C12 22.38 14.34 26.22 17.82 28.32C18.66 28.84 19.18 29.74 19.22 30.72L19.4 34H28.6L28.78 30.72C28.82 29.74 29.34 28.84 30.18 28.32C33.66 26.22 36 22.38 36 18C36 11.37 30.63 6 24 6Z" fill="#F3E8FF" stroke="#8B5CF6" strokeWidth="2.5" />
    <path d="M19 38H29" stroke="#7C3AED" strokeWidth="3" strokeLinecap="round" />
    <path d="M21 42H27" stroke="#7C3AED" strokeWidth="2.5" strokeLinecap="round" />
    <path d="M24 12V22M19 17H29" stroke="#A78BFA" strokeWidth="2" strokeLinecap="round" />
    <circle cx="37" cy="10" r="1.5" fill="#F59E0B" />
  </svg>
);

// 6. Idioms & Phrases (Speech Bubbles)
export const FlatIconIdioms: React.FC<IconProps> = ({ size = 32, style }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" style={style}>
    <path d="M8 18C8 11.37 13.37 6 20 6H28C34.63 6 40 11.37 40 18C40 24.63 34.63 30 28 30H22L14 36V30C10.5 28 8 23.5 8 18Z" fill="#FCE7F3" stroke="#EC4899" strokeWidth="2.5" />
    <circle cx="18" cy="18" r="2.5" fill="#DB2777" />
    <circle cx="24" cy="18" r="2.5" fill="#DB2777" />
    <circle cx="30" cy="18" r="2.5" fill="#DB2777" />
    <path d="M32 26C35 27 38 30 38 34C38 36 36 38 33 39V43L27 39H25C21 39 19 37 18 34" stroke="#F472B6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// 7. Synonyms (Converging Matching Arrows)
export const FlatIconSynonyms: React.FC<IconProps> = ({ size = 32, style }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" style={style}>
    <rect x="6" y="8" width="36" height="32" rx="8" fill="#D1FAE5" stroke="#10B981" strokeWidth="2.5" />
    <path d="M14 20H32M32 20L26 14M32 20L26 26" stroke="#059669" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M34 28H16M16 28L22 22M16 28L22 34" stroke="#10B981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// 8. Antonyms (Opposing Diverging Arrows)
export const FlatIconAntonyms: React.FC<IconProps> = ({ size = 32, style }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" style={style}>
    <circle cx="24" cy="24" r="18" fill="#FFE4E6" stroke="#F43F5E" strokeWidth="2.5" />
    <path d="M16 18L32 18M16 18L21 13M16 18L21 23" stroke="#E11D48" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M32 30L16 30M32 30L27 25M32 30L27 35" stroke="#F43F5E" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// 9. Misspelled Words (Dictionary Check + Red Cross)
export const FlatIconMisspelled: React.FC<IconProps> = ({ size = 32, style }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" style={style}>
    <rect x="8" y="8" width="32" height="32" rx="6" fill="#CFFAFE" stroke="#06B6D4" strokeWidth="2.5" />
    <text x="14" y="26" fontFamily="sans-serif" fontSize="16" fontWeight="900" fill="#0891B2">Abc</text>
    <path d="M14 32C16 30 18 34 20 32C22 30 24 34 26 32C28 30 30 34 32 32" stroke="#EF4444" strokeWidth="2.5" strokeLinecap="round" />
    <circle cx="34" cy="14" r="5" fill="#10B981" />
    <path d="M32 14L33.5 15.5L36.5 12.5" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// 10. 120 Golden Rules (Golden Trophy & Ribbon)
export const FlatIcon120Rules: React.FC<IconProps> = ({ size = 32, style }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" style={style}>
    <path d="M14 10H34V22C34 27.5 29.5 32 24 32C18.5 32 14 27.5 14 22V10Z" fill="#FEF3C7" stroke="#F59E0B" strokeWidth="2.5" />
    <path d="M14 14H8C6.9 14 6 14.9 6 16V18C6 22 9 24 14 24" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round" />
    <path d="M34 14H40C41.1 14 42 14.9 42 16V18C42 22 39 24 34 24" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round" />
    <path d="M24 32V38M16 38H32" stroke="#D97706" strokeWidth="3" strokeLinecap="round" />
    <circle cx="24" cy="20" r="4" fill="#F59E0B" />
  </svg>
);

// 11. AI Scanner / Checker
export const FlatIconAIChecker: React.FC<IconProps> = ({ size = 32, style }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" style={style}>
    <rect x="8" y="8" width="32" height="32" rx="8" fill="#EDE9FE" stroke="#8B5CF6" strokeWidth="2.5" />
    <path d="M24 14L26 21L33 23L26 25L24 32L22 25L15 23L22 21L24 14Z" fill="#7C3AED" />
    <circle cx="34" cy="14" r="2" fill="#F59E0B" />
    <circle cx="14" cy="34" r="1.5" fill="#3B82F6" />
  </svg>
);

// 12. Vocab Bank / Flashcards
export const FlatIconVocabBank: React.FC<IconProps> = ({ size = 32, style }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" style={style}>
    <rect x="8" y="14" width="26" height="24" rx="4" fill="#E0F2FE" stroke="#0284C7" strokeWidth="2.5" />
    <rect x="14" y="10" width="26" height="24" rx="4" fill="#BAE6FD" stroke="#0369A1" strokeWidth="2.5" />
    <text x="22" y="27" fontFamily="sans-serif" fontSize="13" fontWeight="900" fill="#0369A1">A-Z</text>
  </svg>
);

// 13. Mistake Vault / Alert
export const FlatIconMistakeVault: React.FC<IconProps> = ({ size = 32, style }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" style={style}>
    <path d="M24 6L42 38H6L24 6Z" fill="#FEE2E2" stroke="#EF4444" strokeWidth="2.5" strokeLinejoin="round" />
    <path d="M24 18V26" stroke="#DC2626" strokeWidth="3" strokeLinecap="round" />
    <circle cx="24" cy="32" r="2" fill="#DC2626" />
  </svg>
);

// 14. Saved / Bookmarks
export const FlatIconBookmarks: React.FC<IconProps> = ({ size = 32, style }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" style={style}>
    <path d="M12 8C12 6.9 12.9 6 14 6H34C35.1 6 36 6.9 36 8V42L24 34L12 42V8Z" fill="#FEF3C7" stroke="#F59E0B" strokeWidth="2.5" />
    <path d="M24 14L26 19L31 20L27 23L28 28L24 25L20 28L21 23L17 20L22 19L24 14Z" fill="#D97706" />
  </svg>
);

// 15. Daily Streak Flame
export const FlatIconStreak: React.FC<IconProps> = ({ size = 32, style }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" style={style}>
    <path d="M26 6C26 6 36 14 36 26C36 34 30.6 40 24 40C17.4 40 12 34 12 26C12 18 19 13 19 13C19 13 18 20 22 23C22 23 23 15 26 6Z" fill="#FFEDD5" stroke="#F97316" strokeWidth="2.5" />
    <path d="M24 24C24 24 28 28 28 32C28 35 26 37 24 37C22 37 20 35 20 32C20 28 24 24 24 24Z" fill="#EA580C" />
  </svg>
);

// 16. XP / Trophy Shield
export const FlatIconXP: React.FC<IconProps> = ({ size = 32, style }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" style={style}>
    <path d="M24 6L38 12V24C38 33 32 39 24 42C16 39 10 33 10 24V12L24 6Z" fill="#EEF2FF" stroke="#4F46E5" strokeWidth="2.5" />
    <circle cx="24" cy="24" r="7" fill="#6366F1" />
    <path d="M24 19V29M19 24H29" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
  </svg>
);
