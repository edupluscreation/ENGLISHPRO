import type { Question, QuestionTopic } from '../types/quiz';
import pinnacleQs from './pinnacleQuestions.json';

export const TOPIC_DETAILS: Record<QuestionTopic, { title: string; desc: string; icon: string; badge: string }> = {
  spot_error: {
    title: 'Spot the Error',
    desc: 'Identify grammatical errors in sentence segments.',
    icon: 'AlertCircle',
    badge: 'OFFICIAL PYQ'
  },
  sentence_improvement: {
    title: 'Sentence Improvement',
    desc: 'Replace underlined parts with grammatically accurate phrases.',
    icon: 'Sparkles',
    badge: 'OFFICIAL PYQ'
  },
  fill_blanks: {
    title: 'Fill in the Blanks',
    desc: 'Select the most appropriate preposition, verb, or vocabulary word.',
    icon: 'Edit3',
    badge: 'OFFICIAL PYQ'
  },
  one_word: {
    title: 'One Word Substitution',
    desc: 'Master single-word descriptions for complex phrases.',
    icon: 'BookOpen',
    badge: 'OFFICIAL PYQ'
  },
  idioms_phrases: {
    title: 'Idioms & Phrases',
    desc: 'Learn figurative meanings of essential SSC idioms.',
    icon: 'MessageSquare',
    badge: 'OFFICIAL PYQ'
  },
  synonyms: {
    title: 'Synonyms',
    desc: 'Find words with similar meanings and nuances.',
    icon: 'Layers',
    badge: 'OFFICIAL PYQ'
  },
  antonyms: {
    title: 'Antonyms',
    desc: 'Identify words with opposite meanings.',
    icon: 'Repeat',
    badge: 'OFFICIAL PYQ'
  },
  misspelled: {
    title: 'Spelling Errors',
    desc: 'Spot correctly or incorrectly spelled words.',
    icon: 'CheckSquare',
    badge: 'OFFICIAL PYQ'
  },
  cloze_test: {
    title: 'Cloze Test & Passage',
    desc: 'Fill gaps in continuous passages maintaining context.',
    icon: 'FileText',
    badge: 'OFFICIAL PYQ'
  }
};

export const CURATED_SAMPLE_QUESTIONS: Question[] = [
  {
    id: 'err-1',
    topic: 'spot_error',
    questionText: 'Neither the manager nor his assistants was present at the annual strategy meeting.',
    options: [
      'Neither the manager',
      'nor his assistants',
      'was present at the',
      'annual strategy meeting.'
    ],
    correctAnswer: 2,
    explanation: 'When two subjects are joined by "Neither... nor", the verb agrees with the subject closest to it. Here, "his assistants" (plural) is closer to the verb, so "was" should be replaced by "were".',
    grammarRule: 'Subject-Verb Agreement (Proximity Rule with Neither... Nor)',
    examTag: 'SSC CGL 2024 Tier-1',
    difficulty: 'Medium'
  },
  {
    id: 'err-2',
    topic: 'spot_error',
    questionText: 'Scarcely had the train arrived at the platform when the passenger rushed towards the coach.',
    options: [
      'Scarcely had the train',
      'arrived at the platform',
      'than the passenger rushed',
      'No error'
    ],
    correctAnswer: 2,
    explanation: '"Scarcely" and "Hardly" are always followed by "when" or "before", never by "than". "Than" is used with "No sooner".',
    grammarRule: 'Correlative Conjunctions (Scarcely... when)',
    examTag: 'SSC CHSL 2024',
    difficulty: 'Easy'
  }
];

export const QUESTIONS_DATA: Question[] = [
  ...CURATED_SAMPLE_QUESTIONS,
  ...(pinnacleQs as Question[])
];

export const MOCK_PAPERS = [
  {
    id: 'pyq-cgl-2025-1',
    title: 'SSC CGL Tier-1 Official Full PYQ Speed Test',
    description: '25 High-Yield Questions reflecting the latest Eduquity & TCS exam patterns (2018–2026).',
    timeMinutes: 15,
    questions: QUESTIONS_DATA.slice(0, 25)
  },
  {
    id: 'pyq-chsl-2025-1',
    title: 'SSC CHSL English Special PYP (Spot Error & Fillers)',
    description: 'Grammar rules, Vocabulary, and Spotting Errors mock speed test.',
    timeMinutes: 12,
    questions: QUESTIONS_DATA.filter(q => ['spot_error', 'sentence_improvement', 'fill_blanks'].includes(q.topic)).slice(0, 20)
  },
  {
    id: 'vocab-speed-test',
    title: 'SSC Vocab Express (Synonyms, Antonyms, OWS & Idioms)',
    description: 'Test your vocabulary speed and accuracy for SSC CGL, CHSL, MTS & CPO.',
    timeMinutes: 10,
    questions: QUESTIONS_DATA.filter(q => ['one_word', 'idioms_phrases', 'synonyms', 'antonyms', 'misspelled'].includes(q.topic)).slice(0, 20)
  }
];
