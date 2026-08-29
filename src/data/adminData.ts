import type { Question, CustomTopic } from '../types/quiz';

export const TOPIC_DETAILS: Record<string, { title: string; desc: string; icon: string; badge: string; color?: string }> = {
  spot_error: {
    title: 'Spot the Error',
    desc: 'Identify grammatical errors in sentence segments.',
    icon: 'AlertCircle',
    badge: 'OFFICIAL PYQ',
    color: '#ef4444'
  },
  sentence_improvement: {
    title: 'Sentence Improvement',
    desc: 'Replace underlined parts with grammatically accurate phrases.',
    icon: 'Sparkles',
    badge: 'OFFICIAL PYQ',
    color: '#3b82f6'
  },
  fill_blanks: {
    title: 'Fill in the Blanks',
    desc: 'Select the most appropriate preposition, verb, or vocabulary word.',
    icon: 'Edit3',
    badge: 'OFFICIAL PYQ',
    color: '#f59e0b'
  },
  one_word: {
    title: 'One Word Substitution',
    desc: 'Master single-word descriptions for complex phrases.',
    icon: 'BookOpen',
    badge: 'OFFICIAL PYQ',
    color: '#8b5cf6'
  },
  idioms_phrases: {
    title: 'Idioms & Phrases',
    desc: 'Learn figurative meanings of essential SSC idioms.',
    icon: 'MessageSquare',
    badge: 'OFFICIAL PYQ',
    color: '#ec4899'
  },
  synonyms: {
    title: 'Synonyms',
    desc: 'Find words with similar meanings and nuances.',
    icon: 'Layers',
    badge: 'OFFICIAL PYQ',
    color: '#10b981'
  },
  antonyms: {
    title: 'Antonyms',
    desc: 'Identify words with opposite meanings.',
    icon: 'Repeat',
    badge: 'OFFICIAL PYQ',
    color: '#f43f5e'
  },
  misspelled: {
    title: 'Spelling Errors',
    desc: 'Spot correctly or incorrectly spelled words.',
    icon: 'CheckSquare',
    badge: 'OFFICIAL PYQ',
    color: '#06b6d4'
  },
  cloze_test: {
    title: 'Cloze Test & Passage',
    desc: 'Fill gaps in continuous passages maintaining context.',
    icon: 'FileText',
    badge: 'OFFICIAL PYQ',
    color: '#6366f1'
  }
};

export const BASE_QUESTION_COUNTS: Record<string, number> = {
  spot_error: 2450,
  sentence_improvement: 2300,
  fill_blanks: 1850,
  one_word: 2100,
  idioms_phrases: 2200,
  synonyms: 2050,
  antonyms: 1950,
  misspelled: 1650,
  cloze_test: 1900
};

export const TOTAL_BASE_QUESTIONS = 18450;

// ══════════════════════════════════════════════════════════════════
// CUSTOM TOPICS & QUESTIONS STORAGE HELPERS
// ══════════════════════════════════════════════════════════════════

export const getCustomTopics = (): CustomTopic[] => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem('ssc_custom_topics');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const saveCustomTopic = (topic: CustomTopic): void => {
  if (typeof window === 'undefined') return;
  const existing = getCustomTopics();
  const filtered = existing.filter(t => t.id !== topic.id);
  filtered.push(topic);
  localStorage.setItem('ssc_custom_topics', JSON.stringify(filtered));
};

export const deleteCustomTopic = (topicId: string): void => {
  if (typeof window === 'undefined') return;
  const existing = getCustomTopics();
  const filtered = existing.filter(t => t.id !== topicId);
  localStorage.setItem('ssc_custom_topics', JSON.stringify(filtered));
};

export const getAllTopics = (): Record<string, { title: string; desc: string; icon: string; badge: string; color?: string }> => {
  const custom = getCustomTopics();
  const merged = { ...TOPIC_DETAILS };
  custom.forEach(ct => {
    merged[ct.id] = {
      title: ct.title,
      desc: ct.desc || 'Custom practice topic created via Admin Console.',
      icon: ct.icon || 'BookOpen',
      badge: ct.badge || 'CUSTOM TOPIC',
      color: ct.color || '#8b5cf6'
    };
  });
  return merged;
};

export const getCustomQuestions = (): Question[] => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem('ssc_custom_questions');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const saveCustomQuestions = (questions: Question[]): void => {
  if (typeof window === 'undefined') return;
  const existing = getCustomQuestions();
  const idMap = new Map<string, Question>();
  existing.forEach(q => idMap.set(q.id, q));
  questions.forEach(q => idMap.set(q.id, q));
  localStorage.setItem('ssc_custom_questions', JSON.stringify(Array.from(idMap.values())));
};

export const deleteCustomQuestion = (questionId: string): void => {
  if (typeof window === 'undefined') return;
  const existing = getCustomQuestions();
  const filtered = existing.filter(q => q.id !== questionId);
  localStorage.setItem('ssc_custom_questions', JSON.stringify(filtered));
};

export const clearCustomQuestionsForTopic = (topicId: string): void => {
  if (typeof window === 'undefined') return;
  const existing = getCustomQuestions();
  const filtered = existing.filter(q => q.topic !== topicId);
  localStorage.setItem('ssc_custom_questions', JSON.stringify(filtered));
};

// ══════════════════════════════════════════════════════════════════
// SAMPLE TEMPLATES FOR BULK UPLOAD (JSON & CSV)
// ══════════════════════════════════════════════════════════════════

export const SAMPLE_QUESTIONS_DATA: Question[] = [
  {
    id: "sample_q_1",
    topic: "spot_error",
    questionText: "Neither the principal nor the teachers was present at the morning assembly.",
    options: [
      "Neither the principal",
      "nor the teachers",
      "was present at",
      "the morning assembly."
    ],
    correctAnswer: 2,
    explanation: "When two subjects are joined by 'Neither... nor', the verb agrees with the closer subject ('teachers' is plural, so use 'were').",
    grammarRule: "Subject-Verb Agreement",
    examTag: "SSC CGL 2024",
    difficulty: "Medium"
  },
  {
    id: "sample_q_2",
    topic: "sentence_improvement",
    questionText: "He is senior than me in service.",
    options: [
      "senior to me",
      "more senior than me",
      "senior than I",
      "No improvement"
    ],
    correctAnswer: 0,
    explanation: "Comparative adjectives ending in '-ior' (senior, junior, superior, inferior) take 'to', not 'than'.",
    grammarRule: "Adjective Preposition Rules",
    examTag: "SSC CHSL 2024",
    difficulty: "Easy"
  },
  {
    id: "sample_q_3",
    topic: "synonyms",
    questionText: "Select the most appropriate SYNONYM of: 'CANDID'",
    options: [
      "Frank / Honest",
      "Secretive",
      "Deceptive",
      "Arrogant"
    ],
    correctAnswer: 0,
    explanation: "Candid means truthful and straightforward; frank.",
    examTag: "SSC CPO 2024",
    difficulty: "Easy"
  },
  {
    id: "sample_q_4",
    topic: "idioms_phrases",
    questionText: "Select the meaning of the idiom: 'Once in a blue moon'",
    options: [
      "An event that happens very rarely",
      "Something that happens every month",
      "A complete disaster",
      "An unexpected surprise"
    ],
    correctAnswer: 0,
    explanation: "'Once in a blue moon' is used to describe an event that happens very rarely.",
    examTag: "SSC MTS 2024",
    difficulty: "Easy"
  },
  {
    id: "sample_q_5",
    topic: "one_word",
    questionText: "A person who loves or collects books:",
    options: [
      "Bibliophile",
      "Philanthropist",
      "Polyglot",
      "Somnambulist"
    ],
    correctAnswer: 0,
    explanation: "Bibliophile means a person who has a great love and collection of books.",
    examTag: "SSC CGL 2023",
    difficulty: "Easy"
  }
];

export const SAMPLE_QUESTIONS_JSON_STRING = JSON.stringify(SAMPLE_QUESTIONS_DATA, null, 2);

export const SAMPLE_QUESTIONS_CSV_STRING = `topic,questionText,optionA,optionB,optionC,optionD,correctAnswer,explanation,hindiExplanation,difficulty,examTag
spot_error,"Neither the principal nor the teachers was present at the morning assembly.","Neither the principal","nor the teachers","was present at","the morning assembly.",2,"When joined by Neither...nor verb agrees with closer subject (teachers -> were).","जब दो subjects 'Neither... nor' से जुड़े हों तो verb पास वाले subject के अनुसार आती है।",Medium,"SSC CGL 2024"
sentence_improvement,"He is senior than me in service.","senior to me","more senior than me","senior than I","No improvement",0,"Adjectives ending in -ior take preposition 'to' not 'than'.","Senior, junior ke sath 'to' ka prayog hota hai, 'than' ka nahi.",Easy,"SSC CHSL 2024"
synonyms,"Select the most appropriate SYNONYM of: 'CANDID'","Frank / Honest","Secretive","Deceptive","Arrogant",0,"Candid means truthful and straightforward; frank.","Candid ka arth hota hai nishkapat aur spashtvadi (Frank/Honest).",Easy,"SSC CPO 2024"
idioms_phrases,"Select the meaning of the idiom: 'Once in a blue moon'","An event that happens very rarely","Something that happens every month","A complete disaster","An unexpected surprise",0,"'Once in a blue moon' means very rarely.","'Once in a blue moon' ka arth hota hai Eid ka chand hona ya bahut durlabh hona.",Easy,"SSC MTS 2024"
one_word,"A person who loves or collects books:","Bibliophile","Philanthropist","Polyglot","Somnambulist",0,"Bibliophile is a person who loves and collects books.","Pustakon se prem karne wale ko Bibliophile kaha jata hai.",Easy,"SSC CGL 2023"`;
