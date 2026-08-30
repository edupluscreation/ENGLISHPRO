import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  RotateCcw, 
  ChevronRight, 
  Mic, 
  MicOff, 
  Volume2, 
  BookOpen, 
  Lightbulb, 
  Zap, 
  Check, 
  Award, 
  ArrowRight, 
  Layers, 
  Brain, 
  Search, 
  Tag, 
  Flame,
  Crown,
  Lock
} from 'lucide-react';
import { FlatIconAIChecker, FlatIconVocabBank } from './FlatIcons';
import { loadVocabData, getVocabItems } from '../data/vocabData';
import type { VocabItem } from '../types/quiz';

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export interface DetailedError {
  id: string;
  originalPhrase: string;
  correctedPhrase: string;
  reason: string;
  ruleTitle: string;
  matchedGoldenRuleNum?: number;
  formula?: string;
  hindiExplanation: string;
}

export interface GrammarAnalysisResult {
  hasErrors: boolean;
  correctedSentence: string;
  errorCount: number;
  errorHighlights: DetailedError[];
  primaryRuleTitle: string;
  primaryFormula: string;
  primaryHindiExplanation: string;
  primaryEnglishExplanation: string;
  examTrapTip: string;
  vocabularyUpgrade?: string;
}

const SAMPLE_SENTENCES = [
  "Neither the manager nor his assistants was present in the meeting.",
  "She have went to the market and he don't know about it.",
  "He is more taller and senior than his elder brother.",
  "Each of the student have submitted their assignments on time.",
  "Although it was raining heavily but he went out for playing."
];

const QUICK_VOCAB_WORDS = [
  "Ephemeral", "Candid", "Meticulous", "Lucid", "Paucity", "Pragmatic", "Voracious", "Abate", "Lethargic", "Ubiquitous"
];

// ══════════════════════════════════════════════════════════════════════════
// COMPREHENSIVE MULTI-ERROR SEQUENTIAL SCANNER ENGINE
// Scans the sentence for ALL errors simultaneously without early return
// ══════════════════════════════════════════════════════════════════════════
export const scanAllGrammarErrors = (text: string): GrammarAnalysisResult => {
  let workingSentence = text.trim();
  const detectedErrors: DetailedError[] = [];

  // Helper to record an error and apply its transformation
  const registerError = (
    originalRegex: RegExp,
    replacement: string | ((match: string, ...args: any[]) => string),
    errorDetails: {
      originalPhraseDesc?: string;
      correctedPhraseDesc?: string;
      reason: string;
      ruleTitle: string;
      matchedGoldenRuleNum?: number;
      formula?: string;
      hindiExplanation: string;
    }
  ) => {
    if (originalRegex.test(workingSentence)) {
      const match = workingSentence.match(originalRegex);
      const originalMatchedText = match ? match[0] : '';
      
      const newSentence = typeof replacement === 'function' 
        ? workingSentence.replace(originalRegex, replacement as any) 
        : workingSentence.replace(originalRegex, replacement);
        
      if (newSentence !== workingSentence) {
        workingSentence = newSentence;
        
        detectedErrors.push({
          id: `err-${detectedErrors.length + 1}`,
          originalPhrase: originalMatchedText || errorDetails.originalPhraseDesc || 'Faulty Phrase',
          correctedPhrase: errorDetails.correctedPhraseDesc || 'Corrected Form',
          reason: errorDetails.reason,
          ruleTitle: errorDetails.ruleTitle,
          matchedGoldenRuleNum: errorDetails.matchedGoldenRuleNum,
          formula: errorDetails.formula,
          hindiExplanation: errorDetails.hindiExplanation
        });
      }
    }
  };

  // 1. Neither...nor / Either...or proximity with plural second subject
  if (/neither.*nor.*(was|is|has)/i.test(workingSentence) && /nor\s+(the\s+)?(assistants|students|boys|girls|members|workers|people|officers|players|friends|teachers)\s+(was|is|has)/i.test(workingSentence)) {
    const match = workingSentence.match(/nor\s+(?:the\s+)?([a-z]+)\s+(was|is|has)/i);
    const noun = match ? match[1] : 'plural subject';
    const verb = match ? match[2] : 'was';
    const verbMap: Record<string, string> = { 'was': 'were', 'is': 'are', 'has': 'have' };
    const correctVerb = verbMap[verb.toLowerCase()] || 'were';

    registerError(
      new RegExp(`(nor\\s+(?:the\\s+)?${noun}\\s+)${verb}`, 'gi'),
      `$1${correctVerb}`,
      {
        originalPhraseDesc: `${verb} (Singular Verb)`,
        correctedPhraseDesc: `${correctVerb} (Plural Verb)`,
        reason: `Subject closer to the verb ('${noun}') is plural, so the verb must agree with it.`,
        ruleTitle: "Subject-Verb Agreement: Neither...Nor Proximity Rule",
        matchedGoldenRuleNum: 2,
        formula: "Neither + S1 + nor + S2 (Plural) ➔ Plural Verb",
        hindiExplanation: "जब दो subjects 'Neither...nor' से जुड़ते हैं तो verb हमेशा 'nor' के नजदीकी subject के अनुसार आती है।"
      }
    );
  }

  // 2. Double Comparatives (more taller, more better, more faster, etc.)
  registerError(
    /\bmore\s+(taller|better|faster|stronger|smarter|harder|easier|colder|hotter|richer|poorer|wiser|braver|greater|heavier|longer|smaller)\b/gi,
    (_m, comp) => `${comp}`,
    {
      originalPhraseDesc: "more + comparative adjective",
      correctedPhraseDesc: "single comparative adjective",
      reason: "Double comparatives ('more taller', 'more better') are grammatically redundant.",
      ruleTitle: "Double Comparative Redundancy",
      matchedGoldenRuleNum: 16,
      formula: "Adjective + -er (Single Comparative) — NO 'more'",
      hindiExplanation: "जिन adjectives में '-er' जोड़कर comparative degree बनती है, उनके आगे 'more' नहीं लगाते।"
    }
  );

  // 3. Double Superlatives (most tallest, most best, most fastest, etc.)
  registerError(
    /\bmost\s+(tallest|best|fastest|strongest|smartest|hardest|easiest|coldest|hottest|richest|poorest|wisest|bravest|greatest|heaviest|longest|smallest)\b/gi,
    (_m, sup) => `${sup}`,
    {
      originalPhraseDesc: "most + superlative adjective",
      correctedPhraseDesc: "single superlative adjective",
      reason: "Double superlatives ('most tallest', 'most best') are grammatically redundant.",
      ruleTitle: "Double Superlative Redundancy",
      matchedGoldenRuleNum: 16,
      formula: "Adjective + -est (Single Superlative) — NO 'most'",
      hindiExplanation: "जिन adjectives में '-est' जोड़कर superlative degree बनती है, उनके आगे 'most' नहीं लगाते।"
    }
  );

  // 4. Senior / Junior / Superior / Inferior / Preferable + than -> to
  registerError(
    /\b(senior|junior|superior|inferior|prior|anterior|posterior|preferable)\s+than\b/gi,
    (_m, word) => `${word} to`,
    {
      originalPhraseDesc: "senior / junior / preferable than",
      correctedPhraseDesc: "senior / junior / preferable to",
      reason: "Latin comparative adjectives ending in '-ior' take preposition 'to', never 'than'.",
      ruleTitle: "Latin Adjectives Taking 'To' Instead of 'Than'",
      matchedGoldenRuleNum: 8,
      formula: "Senior / Junior / Superior / Preferable + TO",
      hindiExplanation: "लैटिन भाषा के adjectives जिनके अंत में '-ior' आता है (और Preferable), उनके साथ 'than' नहीं 'to' आता है।"
    }
  );

  // 5. Perfect Tense: Have / Has / Had + V2 (have went -> have gone, has did -> has done, had saw -> had seen)
  const v2ToV3: Record<string, string> = {
    'went': 'gone', 'did': 'done', 'saw': 'seen', 'came': 'come', 'took': 'taken',
    'wrote': 'written', 'broke': 'broken', 'knew': 'known', 'stole': 'stolen',
    'began': 'begun', 'ran': 'run', 'drank': 'drunk', 'ate': 'eaten', 'chose': 'chosen',
    'drove': 'driven', 'fell': 'fallen', 'forgot': 'forgotten', 'gave': 'given', 'grew': 'grown',
    'rode': 'ridden', 'rose': 'risen', 'spoke': 'spoken', 'swam': 'swum', 'threw': 'thrown'
  };
  for (const [v2, v3] of Object.entries(v2ToV3)) {
    registerError(
      new RegExp(`\\b(have|has|had)\\s+${v2}\\b`, 'gi'),
      `$1 ${v3}`,
      {
        originalPhraseDesc: `have/has/had ${v2} (V2)`,
        correctedPhraseDesc: `have/has/had ${v3} (V3)`,
        reason: "Auxiliary verbs 'have', 'has', and 'had' strictly require the past participle (V3) form.",
        ruleTitle: "Perfect Tense: Have/Has/Had + V3",
        matchedGoldenRuleNum: 10,
        formula: "Subject + have / has / had + V₃ (Past Participle)",
        hindiExplanation: "'Has', 'Have' और 'Had' के बाद हमेशा verb की 3rd form (V3) आती है।"
      }
    );
  }

  // 6. Did / Didn't + V2 (did went -> did go, didn't saw -> didn't see)
  const v2ToV1: Record<string, string> = {
    'went': 'go', 'saw': 'see', 'came': 'come', 'took': 'take', 'wrote': 'write',
    'broke': 'break', 'knew': 'know', 'stole': 'steal', 'began': 'begin', 'ran': 'run',
    'drank': 'drink', 'ate': 'eat', 'chose': 'choose', 'drove': 'drive', 'fell': 'fall',
    'forgot': 'forget', 'gave': 'give', 'grew': 'grow', 'rode': 'ride', 'rose': 'rise',
    'spoke': 'speak', 'swam': 'swim', 'threw': 'throw'
  };
  for (const [v2, v1] of Object.entries(v2ToV1)) {
    registerError(
      new RegExp(`\\bdid(\\s+not|n't)?\\s+${v2}\\b`, 'gi'),
      `did$1 ${v1}`,
      {
        originalPhraseDesc: `did + ${v2} (V2)`,
        correctedPhraseDesc: `did + ${v1} (V1)`,
        reason: "The auxiliary verb 'did / didn't' strictly takes the base form of the verb (V1).",
        ruleTitle: "Simple Past Auxiliary: Did + V1",
        matchedGoldenRuleNum: 11,
        formula: "Subject + did + (not) + V₁ (Base Form)",
        hindiExplanation: "जब वाक्य में 'did' आ जाता है, तो verb हमेशा अपने 1st form (V1) में आती है।"
      }
    );
  }

  // 7. Auxiliary Agreement: He / She / It / Everyone / Nobody + don't -> doesn't
  registerError(
    /\b(he|she|it|everyone|everybody|someone|somebody|nobody|no\s+one|each)\s+don't\b/gi,
    (_m, subj) => `${subj} doesn't`,
    {
      originalPhraseDesc: "don't (with singular subject)",
      correctedPhraseDesc: "doesn't",
      reason: "Singular third-person subjects strictly take 'does not / doesn't', not 'don't'.",
      ruleTitle: "Auxiliary Verb Agreement: 'Doesn't' for Singular",
      matchedGoldenRuleNum: 4,
      formula: "He / She / It + DOES NOT (doesn't)",
      hindiExplanation: "एकवचन कर्ताओं (He, She, It, Everyone, Nobody) के साथ 'doesn't' आता है, 'don't' नहीं।"
    }
  );

  // 8. Plural Subject + was -> were (They/We/You/Both/Many was -> were)
  registerError(
    /\b(they|we|you|both|several|many)\s+was\b/gi,
    (_m, subj) => `${subj} were`,
    {
      originalPhraseDesc: "was (with plural subject)",
      correctedPhraseDesc: "were",
      reason: "Plural subjects ('they/we/you/both/many') take the plural auxiliary 'were'.",
      ruleTitle: "Subject-Verb Agreement: Plural Subjects with 'Were'",
      matchedGoldenRuleNum: 5,
      formula: "They / We / You + WERE",
      hindiExplanation: "बहुवचन कर्ताओं (They, We, You, Both, Many) के साथ भूतकाल में 'were' का प्रयोग होता है।"
    }
  );

  // 9. Singular Third-Person Subject + Plural Verb (He go -> He goes, She play -> She plays)
  const v1ToVs: Record<string, string> = {
    'go': 'goes', 'play': 'plays', 'work': 'works', 'come': 'comes', 'run': 'runs',
    'eat': 'eats', 'walk': 'walks', 'write': 'writes', 'know': 'knows', 'live': 'lives',
    'talk': 'talks', 'read': 'reads', 'stay': 'stays', 'look': 'looks', 'want': 'wants',
    'like': 'likes', 'love': 'loves', 'need': 'needs', 'think': 'thinks', 'speak': 'speaks'
  };
  for (const [v1, vs] of Object.entries(v1ToVs)) {
    registerError(
      new RegExp(`\\b(he|she|it)\\s+${v1}\\b`, 'gi'),
      `$1 ${vs}`,
      {
        originalPhraseDesc: `${v1} (Plural verb with singular subject)`,
        correctedPhraseDesc: `${vs} (Singular verb V1+s/es)`,
        reason: "Third-person singular subjects ('he/she/it') require a singular verb (V1 + -s/-es).",
        ruleTitle: "Subject-Verb Agreement: Third-Person Singular (V1 + -s/-es)",
        matchedGoldenRuleNum: 3,
        formula: "He / She / It + V₁(-s/-es)",
        hindiExplanation: "Simple Present Tense में कर्ता एकवचन (He/She/It) होने पर verb में '-s' या '-es' जोड़ा जाता है।"
      }
    );
  }

  // 10. Each of the + Singular Noun (each of the student -> each of the students)
  registerError(
    /\b(each of the|one of the|either of the|neither of the)\s+(student|boy|girl|member|player|officer|teacher|candidate|doctor|worker|book|city|country|car)\b/gi,
    (_m, phrase, noun) => `${phrase} ${noun}s`,
    {
      originalPhraseDesc: "singular noun after 'each of the / one of the'",
      correctedPhraseDesc: "plural noun",
      reason: "'Each of the / One of the / Either of the' requires a plural noun.",
      ruleTitle: "Distributive Pronoun: Plural Noun Requirement",
      matchedGoldenRuleNum: 8,
      formula: "Each of / One of + Plural Noun",
      hindiExplanation: "'Each of', 'One of', 'Neither of' के बाद Noun हमेशा बहुवचन (Plural) आता है।"
    }
  );

  // 11. Each of the + Plural Noun + Plural Verb (each of the students have/are/were -> has/is/was)
  registerError(
    /\b(each of the|either of the|neither of the|one of the)\s+([a-z]+s)\s+(have|are|were)\b/gi,
    (_m, phrase, noun, verb) => {
      const vMap: Record<string, string> = { 'have': 'has', 'are': 'is', 'were': 'was' };
      return `${phrase} ${noun} ${vMap[verb.toLowerCase()] || 'has'}`;
    },
    {
      originalPhraseDesc: "plural verb with 'Each of / One of'",
      correctedPhraseDesc: "singular verb (has / is / was)",
      reason: "'Each of / One of' represents individuals individually and strictly takes a singular verb.",
      ruleTitle: "Distributive Pronoun: Singular Verb Rule",
      matchedGoldenRuleNum: 8,
      formula: "Each of / One of + Plural Noun + SINGULAR VERB",
      hindiExplanation: "'Each of / One of' के बाद Noun बहुवचन होता है परंतु Verb हमेशा एकवचन (has/is/was) होती है।"
    }
  );

  // 12. Correlative: Although / Though ... but -> Although ... yet (or comma)
  registerError(
    /\b(although|though)\b(.*?)\bbut\b/gi,
    (_m, conj, middle) => `${conj}${middle}yet`,
    {
      originalPhraseDesc: "Although ... but",
      correctedPhraseDesc: "Although ... yet (or comma)",
      reason: "'Although/Though' is paired with 'yet' or a comma, never with 'but'.",
      ruleTitle: "Correlative Conjunction: Although...Yet Pair",
      matchedGoldenRuleNum: 41,
      formula: "Although / Though + Clause 1 + YET / [,] + Clause 2",
      hindiExplanation: "'Although' या 'Though' के साथ कभी भी 'but' का प्रयोग नहीं होता, हमेशा 'yet' या comma आता है।"
    }
  );

  // 13. Correlative: Hardly / Scarcely ... than -> when
  registerError(
    /\b(hardly|scarcely)\b(.*?)\bthan\b/gi,
    (_m, adv, middle) => `${adv}${middle}when`,
    {
      originalPhraseDesc: "Hardly/Scarcely ... than",
      correctedPhraseDesc: "Hardly/Scarcely ... when",
      reason: "'Hardly' and 'Scarcely' are always followed by 'when' or 'before', never by 'than'.",
      ruleTitle: "Correlative Conjunction: Hardly/Scarcely...When",
      matchedGoldenRuleNum: 21,
      formula: "Hardly / Scarcely + had + Subj + V₃ + WHEN",
      hindiExplanation: "'Hardly' और 'Scarcely' के बाद हमेशा 'when' आता है, 'than' केवल 'No sooner' के साथ आता है।"
    }
  );

  // 14. Correlative: No sooner ... when/then -> than
  registerError(
    /\bno\s+sooner\b(.*?)\b(when|then)\b/gi,
    (_m, middle) => `No sooner${middle}than`,
    {
      originalPhraseDesc: "No sooner ... when / then",
      correctedPhraseDesc: "No sooner ... than",
      reason: "'No sooner' is always paired with 'than', never with 'when' or 'then'.",
      ruleTitle: "Correlative Conjunction: No sooner...Than",
      matchedGoldenRuleNum: 22,
      formula: "No sooner + did/had + Subj + THAN",
      hindiExplanation: "'No sooner' के साथ हमेशा 'than' का जोड़ा बनता है, 'when' या 'then' नहीं।"
    }
  );

  // 15. Redundant Prepositions: Despite of -> Despite
  registerError(
    /\bdespite\s+of\b/gi,
    () => 'despite',
    {
      originalPhraseDesc: "despite of",
      correctedPhraseDesc: "despite (or in spite of)",
      reason: "'Despite' never takes the preposition 'of'. 'In spite of' is used with 'of'.",
      ruleTitle: "Superfluous Preposition with 'Despite'",
      matchedGoldenRuleNum: 33,
      formula: "DESPITE (No 'of') = IN SPITE OF",
      hindiExplanation: "'Despite' के साथ कभी भी 'of' नहीं लगाया जाता।"
    }
  );

  // 16. Redundant Prepositions: Comprise of -> Comprise
  registerError(
    /\b(comprises|comprise|comprised)\s+of\b/gi,
    (_m, comp) => `${comp}`,
    {
      originalPhraseDesc: "comprise of",
      correctedPhraseDesc: "comprise (or consist of)",
      reason: "'Comprise' in active voice never takes 'of'. 'Consist of' takes 'of'.",
      ruleTitle: "Superfluous Preposition with 'Comprise'",
      matchedGoldenRuleNum: 34,
      formula: "COMPRISE (No 'of') = CONSIST OF",
      hindiExplanation: "Active voice में 'comprise' के बाद 'of' नहीं आता।"
    }
  );

  // 17. Redundant Words: Return back / Revert back / Repeat again
  registerError(
    /\b(return|revert|repeat)\s+(back|again)\b/gi,
    (_m, verb) => `${verb}`,
    {
      originalPhraseDesc: "return back / revert back / repeat again",
      correctedPhraseDesc: "return / revert / repeat",
      reason: "'Back' or 'again' is redundant with verbs already containing the prefix 're-' (return, revert, repeat).",
      ruleTitle: "Redundant / Superfluous Expressions",
      matchedGoldenRuleNum: 55,
      formula: "Return / Revert / Repeat (NO 'back' / 'again')",
      hindiExplanation: "'Return', 'Revert' और 'Repeat' के साथ 'back' या 'again' लगाना अनावश्यक (Superfluous) होता है।"
    }
  );

  // 18. Uncountable Nouns with plural -s (furnitures -> furniture, informations -> information, sceneries -> scenery)
  const uncountables: Record<string, string> = {
    'furnitures': 'furniture',
    'informations': 'information',
    'sceneries': 'scenery',
    'advices': 'advice',
    'luggages': 'luggage',
    'baggages': 'baggage',
    'poetries': 'poetry',
    'machineries': 'machinery',
    'equipments': 'equipment',
    'mischiefs': 'mischief'
  };
  for (const [plural, singular] of Object.entries(uncountables)) {
    registerError(
      new RegExp(`\\b${plural}\\b`, 'gi'),
      () => singular,
      {
        originalPhraseDesc: `${plural} (Invalid Plural)`,
        correctedPhraseDesc: `${singular} (Uncountable Noun)`,
        reason: `'${singular}' is an uncountable noun and cannot be made plural by adding '-s/-es'.`,
        ruleTitle: "Uncountable Noun Rule",
        matchedGoldenRuleNum: 1,
        formula: "Uncountable Noun (Always Singular, NO 's/es')",
        hindiExplanation: `'${singular}' अगणनीय संज्ञा (Uncountable Noun) है, इसका बहुवचन नहीं बनाया जा सकता।`
      }
    );
  }

  // 19. Relative Pronoun / Conjunction: Between ... to -> Between ... and
  registerError(
    /\bbetween\s+([a-z0-9\:\s]+?)\s+to\s+([a-z0-9\:\s]+)\b/gi,
    (_m, p1, p2) => `between ${p1.trim()} and ${p2.trim()}`,
    {
      originalPhraseDesc: "between ... to",
      correctedPhraseDesc: "between ... and",
      reason: "'Between' is always paired with 'and', whereas 'From' is paired with 'to'.",
      ruleTitle: "Correlative Preposition: Between...And Pair",
      matchedGoldenRuleNum: 37,
      formula: "Between ... AND ... | From ... TO ...",
      hindiExplanation: "'Between' के साथ हमेशा 'and' का जोड़ा बनता है, 'to' केवल 'from' के साथ आता है।"
    }
  );

  // 20. Lest ... would/will/may/can -> Lest ... should
  registerError(
    /\blest\b(.*?)\b(would|will|may|can)\b/gi,
    (_m, middle) => `lest${middle}should`,
    {
      originalPhraseDesc: "lest ... will/would/may",
      correctedPhraseDesc: "lest ... should",
      reason: "The conjunction 'lest' (meaning 'for fear that') is strictly paired with the modal 'should'.",
      ruleTitle: "Conjunction 'Lest' + 'Should' Rule",
      matchedGoldenRuleNum: 44,
      formula: "LEST + Subject + SHOULD + V₁",
      hindiExplanation: "'Lest' (कहीं ऐसा न हो कि) के बाद हमेशा 'should' आता है।"
    }
  );

  // 21. Look forward to / With a view to + V1 -> V-ing
  registerError(
    /\b(look forward to|looking forward to|with a view to|accustomed to|addicted to|used to)\s+(meet|see|hear|get|visit|join|attend|help|learn|buy)\b/gi,
    (_m, p, verb) => `${p} ${verb}ing`,
    {
      originalPhraseDesc: "Phrasal preposition + V1",
      correctedPhraseDesc: "Phrasal preposition + V-ing (Gerund)",
      reason: "Phrasal prepositions like 'look forward to' and 'with a view to' require a Gerund (V1 + -ing).",
      ruleTitle: "Prepositional Phrases Followed by Gerund (V-ing)",
      matchedGoldenRuleNum: 29,
      formula: "Look forward to / With a view to + V-ing (Gerund)",
      hindiExplanation: "'Look forward to' और 'With a view to' के बाद हमेशा Verb में '-ing' (Gerund) आता है।"
    }
  );

  // If no errors were detected or the working sentence is identical to input, return clean verified response
  if (detectedErrors.length === 0 || workingSentence.trim().toLowerCase() === text.trim().toLowerCase()) {
    return {
      hasErrors: false,
      errorCount: 0,
      correctedSentence: text.trim(),
      errorHighlights: [],
      primaryRuleTitle: "Grammatically Flawless Sentence",
      primaryFormula: "Standard Syntactic Structure Verified",
      primaryHindiExplanation: "यह वाक्य व्याकरण की दृष्टि से पूर्णतः शुद्ध है। इसमें कर्ता-क्रिया सामंजस्य (Subject-Verb Agreement), काल (Tense), और कारक (Prepositions) का सही प्रयोग हुआ है।",
      primaryEnglishExplanation: "This sentence adheres to standard English grammar rules. Sentence structure, tenses, and agreements are syntactically sound.",
      examTrapTip: "परीक्षा में इस प्रकार के वाक्य 'No Error' (कोई त्रुटि नहीं) विकल्प के लिए उपयुक्त होते हैं।"
    };
  }

  // Compile summary results
  const primaryError = detectedErrors[0];
  return {
    hasErrors: true,
    errorCount: detectedErrors.length,
    correctedSentence: workingSentence,
    errorHighlights: detectedErrors,
    primaryRuleTitle: detectedErrors.length === 1 
      ? primaryError.ruleTitle 
      : `${detectedErrors.length} Distinct Grammar Flaws Detected`,
    primaryFormula: primaryError.formula || "Subject + Verb Agreement & Correct Prepositions",
    primaryHindiExplanation: primaryError.hindiExplanation,
    primaryEnglishExplanation: primaryError.reason,
    examTrapTip: "एसएससी परीक्षा में एक ही वाक्य में कई अलग-अलग पार्ट्स में एरर फंसाए जाते हैं। हर क्लॉज और वर्ब की अलग से जांच करें!",
    vocabularyUpgrade: workingSentence
  };
};

export const GrammarChecker: React.FC = () => {
  const { setCurrentView } = useApp();
  
  // ─── FREE TIER LIMIT: 50 SCANS ───
  const FREE_TIER_LIMIT = 50;
  const [scanCount, setScanCount] = useState<number>(() => {
    const saved = localStorage.getItem('englishpro_ai_scans_used');
    return saved ? parseInt(saved, 10) : 0;
  });
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const incrementScanCount = () => {
    const next = scanCount + 1;
    setScanCount(next);
    localStorage.setItem('englishpro_ai_scans_used', next.toString());
  };

  // ─── TWO TABS: 'grammar' | 'vocab' ───
  const [activeTab, setActiveTab] = useState<'grammar' | 'vocab'>('grammar');

  // Grammar Scanner State
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<GrammarAnalysisResult | null>(null);
  const [hasChecked, setHasChecked] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Vocab Intelligence State
  const [vocabSearch, setVocabSearch] = useState('');
  const [activeVocabItem, setActiveVocabItem] = useState<VocabItem | null>(null);
  const [vocabItemsData, setVocabItemsData] = useState<VocabItem[]>([]);

  // Lazy-load vocab data on mount
  useEffect(() => {
    loadVocabData().then(data => setVocabItemsData(data));
  }, []);

  // Alias for backward compatibility in this component
  const VOCAB_ITEMS = vocabItemsData;

  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (activeTab === 'grammar') {
          setInputText(prev => (prev ? `${prev} ${transcript}` : transcript));
        } else {
          setVocabSearch(transcript);
          handleVocabLookup(transcript);
        }
        setIsListening(false);
      };

      recognitionRef.current.onerror = () => {
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, [activeTab]);

  const toggleVoiceInput = () => {
    if (!recognitionRef.current) {
      alert('Voice dictation is not supported in this browser. Please use Chrome, Edge or Safari.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      if (activeTab === 'grammar') {
        setInputText('');
      } else {
        setVocabSearch('');
      }
      setIsListening(true);
      recognitionRef.current.start();
    }
  };

  const handleCheckGrammar = async (textToCheck?: string) => {
    const text = (textToCheck || inputText).trim();
    if (!text) return;

    if (scanCount >= FREE_TIER_LIMIT) {
      setShowUpgradeModal(true);
      return;
    }
    incrementScanCount();

    setIsLoading(true);
    setErrorMessage(null);

    // Step 1: Run local high-precision SSC Grammar Engine
    let finalResult = scanAllGrammarErrors(text);

    // Step 2: Query LanguageTool Public API via Native CapacitorHttp / Web fetch
    try {
      const { CapacitorHttp } = await import('@capacitor/core');
      const params = new URLSearchParams();
      params.append('text', text);
      params.append('language', 'en-US');

      let ltData: any = null;
      try {
        const capRes = await CapacitorHttp.post({
          url: 'https://api.languagetool.org/v2/check',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          data: params.toString(),
          connectTimeout: 6000,
          readTimeout: 6000
        });
        ltData = typeof capRes.data === 'string' ? JSON.parse(capRes.data) : capRes.data;
      } catch {
        const fallbackRes = await fetch('https://api.languagetool.org/v2/check', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: params.toString()
        });
        ltData = await fallbackRes.json();
      }

      if (ltData && Array.isArray(ltData.matches) && ltData.matches.length > 0) {
          const extraErrors: DetailedError[] = [];
          let currentCorrected = finalResult.correctedSentence;

          for (const match of ltData.matches) {
            const faultyWord = text.substr(match.offset, match.length).trim();
            const suggestion = match.replacements?.[0]?.value?.trim();

            // Ignore empty, unchanged words or purely non-alphanumeric punctuation
            if (!suggestion || !faultyWord || suggestion.toLowerCase() === faultyWord.toLowerCase()) {
              continue;
            }

            // Only add if not already captured by SSC engine
            const alreadyCaptured = finalResult.errorHighlights.some(
              e => e.originalPhrase.toLowerCase().includes(faultyWord.toLowerCase()) ||
                   e.correctedPhrase.toLowerCase().includes(suggestion.toLowerCase())
            );

            if (!alreadyCaptured) {
              // Safe string replacement (case-insensitive)
              const idx = currentCorrected.toLowerCase().indexOf(faultyWord.toLowerCase());
              if (idx !== -1) {
                currentCorrected = currentCorrected.substring(0, idx) + suggestion + currentCorrected.substring(idx + faultyWord.length);
              }

              extraErrors.push({
                id: `lt-err-${extraErrors.length + 1}`,
                originalPhrase: faultyWord,
                correctedPhrase: suggestion,
                reason: match.message || 'Grammar, tense, or spelling correction.',
                ruleTitle: match.rule?.category?.name || match.rule?.description || 'Grammar & Syntax Rule',
                formula: `${faultyWord} ➔ ${suggestion}`,
                hindiExplanation: `वाक्य में '${faultyWord}' के स्थान पर '${suggestion}' का प्रयोग मानक व्याकरण के अनुसार सही है। (${match.message})`
              });
            }
          }

          if (extraErrors.length > 0 && currentCorrected.trim().toLowerCase() !== text.toLowerCase()) {
            finalResult = {
              ...finalResult,
              hasErrors: true,
              errorCount: finalResult.errorHighlights.length + extraErrors.length,
              correctedSentence: currentCorrected,
              errorHighlights: [...finalResult.errorHighlights, ...extraErrors],
              primaryRuleTitle: `${finalResult.errorHighlights.length + extraErrors.length} Distinct Grammar Flaws Detected`
            };
          }
        }
    } catch {
      // If LanguageTool times out or is offline, local result is used
    } finally {
      // Final sanity check: if corrected sentence is identical to original, it's 100% accurate!
      if (finalResult.correctedSentence.trim().toLowerCase() === text.toLowerCase()) {
        finalResult = {
          hasErrors: false,
          errorCount: 0,
          correctedSentence: text.trim(),
          errorHighlights: [],
          primaryRuleTitle: "Grammatically Flawless Sentence",
          primaryFormula: "Standard Syntactic Structure Verified",
          primaryHindiExplanation: "यह वाक्य व्याकरण की दृष्टि से पूर्णतः शुद्ध है। इसमें कर्ता-क्रिया सामंजस्य (Subject-Verb Agreement), काल (Tense), और कारक (Prepositions) का सही प्रयोग हुआ है।",
          primaryEnglishExplanation: "This sentence adheres to standard English grammar rules. Sentence structure, tenses, and agreements are syntactically sound.",
          examTrapTip: "परीक्षा में इस प्रकार के वाक्य 'No Error' (कोई त्रुटि नहीं) विकल्प के लिए उपयुक्त होते हैं।"
        };
      }

      setResult(finalResult);
      setHasChecked(true);
      setIsLoading(false);
    }
  };

  const [isVocabLoading, setIsVocabLoading] = useState(false);

  const handleVocabLookup = async (word: string) => {
    const clean = word.trim().toLowerCase();
    if (!clean) return;
    const capitalizedWord = clean.charAt(0).toUpperCase() + clean.slice(1);

    setIsVocabLoading(true);

    try {
      const { lookupVocabWithAI } = await import('../services/aiService');
      const aiResult = await lookupVocabWithAI(clean);
      if (aiResult) {
        setActiveVocabItem({
          id: `vocab-live-${clean}-${Date.now()}`,
          word: aiResult.word || capitalizedWord,
          meaning: aiResult.englishDefinition || `Definition for ${capitalizedWord}.`,
          hindiMeaning: aiResult.hindiMeaning || 'शब्दावली अर्थ',
          type: 'synonym',
          synonyms: aiResult.synonyms || [],
          antonyms: aiResult.antonyms || [],
          exampleSentence: aiResult.sscExamUsage || `The word "${capitalizedWord}" is used in standard English examinations.`,
          examTag: 'Live Web Vocab'
        });
      }
    } catch (err) {
      setActiveVocabItem({
        id: `vocab-err-${clean}`,
        word: capitalizedWord,
        meaning: `"${capitalizedWord}" को लाइव वेब डिक्शनरी से खोजा जा रहा है। कृपया इंटरनेट कनेक्शन जांचें।`,
        hindiMeaning: 'डिक्शनरी परिणाम',
        type: 'synonym',
        synonyms: [],
        antonyms: [],
        exampleSentence: `Example sentence for "${capitalizedWord}".`,
        examTag: 'Live Search'
      });
    } finally {
      setIsVocabLoading(false);
    }
  };

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleClear = () => {
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setInputText('');
    setResult(null);
    setHasChecked(false);
    setErrorMessage(null);
  };

  return (
    <div style={{
      maxWidth: '640px',
      margin: '0 auto',
      padding: '14px 12px 36px 12px',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      width: '100%',
      boxSizing: 'border-box',
      overflowX: 'hidden'
    }}>
      
      {/* ─── 1. TOP DUAL PREMIUM TABS: AI GRAMMAR | AI VOCAB ─── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-color)',
        padding: '5px',
        borderRadius: '14px',
        gap: '6px',
        width: '100%',
        boxSizing: 'border-box',
        boxShadow: 'var(--shadow-xs)'
      }}>
        {/* AI Grammar Tab */}
        <button
          onClick={() => setActiveTab('grammar')}
          style={{
            padding: '9px 10px',
            borderRadius: '10px',
            background: activeTab === 'grammar' 
              ? 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)' 
              : 'transparent',
            color: activeTab === 'grammar' ? '#ffffff' : 'var(--text-main)',
            border: activeTab === 'grammar' 
              ? '1px solid rgba(255, 255, 255, 0.2)' 
              : '1px solid transparent',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            boxShadow: activeTab === 'grammar' 
              ? '0 4px 12px rgba(79, 70, 229, 0.3)' 
              : 'none',
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            minWidth: 0,
            overflow: 'hidden'
          }}
        >
          <div style={{
            width: '26px',
            height: '26px',
            borderRadius: '7px',
            background: activeTab === 'grammar' ? 'rgba(255, 255, 255, 0.22)' : 'var(--primary-light)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: activeTab === 'grammar' ? '#ffffff' : 'var(--primary)',
            flexShrink: 0
          }}>
            <Sparkles size={14} />
          </div>

          <div style={{ textAlign: 'left', minWidth: 0 }}>
            <div style={{
              fontSize: '12.5px',
              fontWeight: 800,
              letterSpacing: '-0.01em',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              lineHeight: 1.2
            }}>
              AI Grammar
            </div>
            <div style={{
              fontSize: '9.5px',
              fontWeight: 600,
              color: activeTab === 'grammar' ? 'rgba(255, 255, 255, 0.85)' : 'var(--text-dim)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              lineHeight: 1.2
            }}>
              Sentence Scanner
            </div>
          </div>
        </button>

        {/* AI Vocab Tab */}
        <button
          onClick={() => {
            setActiveTab('vocab');
            if (!activeVocabItem && VOCAB_ITEMS.length > 0) {
              setActiveVocabItem(VOCAB_ITEMS[0]);
            }
          }}
          style={{
            padding: '9px 10px',
            borderRadius: '10px',
            background: activeTab === 'vocab' 
              ? 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)' 
              : 'transparent',
            color: activeTab === 'vocab' ? '#ffffff' : 'var(--text-main)',
            border: activeTab === 'vocab' 
              ? '1px solid rgba(255, 255, 255, 0.2)' 
              : '1px solid transparent',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            boxShadow: activeTab === 'vocab' 
              ? '0 4px 12px rgba(124, 58, 237, 0.3)' 
              : 'none',
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            minWidth: 0,
            overflow: 'hidden'
          }}
        >
          <div style={{
            width: '26px',
            height: '26px',
            borderRadius: '7px',
            background: activeTab === 'vocab' ? 'rgba(255, 255, 255, 0.22)' : 'rgba(139, 92, 246, 0.12)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: activeTab === 'vocab' ? '#ffffff' : '#8b5cf6',
            flexShrink: 0
          }}>
            <Brain size={14} />
          </div>

          <div style={{ textAlign: 'left', minWidth: 0 }}>
            <div style={{
              fontSize: '12.5px',
              fontWeight: 800,
              letterSpacing: '-0.01em',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              lineHeight: 1.2
            }}>
              AI Vocab
            </div>
            <div style={{
              fontSize: '9.5px',
              fontWeight: 600,
              color: activeTab === 'vocab' ? 'rgba(255, 255, 255, 0.85)' : 'var(--text-dim)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              lineHeight: 1.2
            }}>
              6,400+ Words
            </div>
          </div>
        </button>
      </div>

      {/* ─── FREE TIER USAGE STATUS BAR ─── */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-color)',
        borderRadius: '10px',
        padding: '8px 12px',
        fontSize: '11.5px',
        boxShadow: 'var(--shadow-xs)',
        flexWrap: 'wrap',
        gap: '6px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Zap size={13} style={{ color: scanCount >= FREE_TIER_LIMIT ? 'var(--error)' : '#f59e0b' }} />
          <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>
            Free Tier:
          </span>
          <span style={{ fontWeight: 800, color: scanCount >= FREE_TIER_LIMIT ? 'var(--error)' : 'var(--primary)' }}>
            {Math.max(0, FREE_TIER_LIMIT - scanCount)} / {FREE_TIER_LIMIT} Scans Remaining
          </span>
        </div>

        {scanCount >= FREE_TIER_LIMIT ? (
          <button
            onClick={() => setShowUpgradeModal(true)}
            style={{
              background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
              color: '#ffffff',
              border: 'none',
              padding: '3px 10px',
              borderRadius: '6px',
              fontSize: '10.5px',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <Crown size={11} />
            <span>Upgrade to Premium</span>
          </button>
        ) : (
          <span style={{ fontSize: '10.5px', color: 'var(--text-dim)', fontWeight: 600 }}>
            {scanCount}/{FREE_TIER_LIMIT} Used
          </span>
        )}
      </div>

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* ─── TAB 1: AI GRAMMAR SCANNER ─── */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'grammar' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%', boxSizing: 'border-box' }}>
          
          {/* Header Banner */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px', flexWrap: 'wrap', gap: '6px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '9px',
                  background: 'rgba(168, 85, 247, 0.12)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#a855f7'
                }}>
                  <FlatIconAIChecker size={18} />
                </div>
                <div>
                  <p style={{ fontSize: '9.5px', fontWeight: 800, color: '#a855f7', letterSpacing: '0.04em', textTransform: 'uppercase', margin: 0 }}>
                    AI Multi-Error Grammar Scanner
                  </p>
                  <h2 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-main)', margin: '1px 0 0 0' }}>
                    Full Sentence Error Detector
                  </h2>
                </div>
              </div>

              <span style={{
                fontSize: '9.5px',
                fontWeight: 800,
                background: 'rgba(16, 185, 129, 0.12)',
                color: '#10b981',
                border: '1px solid rgba(16, 185, 129, 0.25)',
                padding: '2px 7px',
                borderRadius: '5px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '3px'
              }}>
                ⚡ UNLIMITED FREE SCAN
              </span>
            </div>

            <p style={{ fontSize: '11.5px', color: 'var(--text-dim)', margin: 0, lineHeight: 1.4 }}>
              Type or speak any English sentence. Our AI will catch <strong>every single error</strong> in the sentence and explain all rules with formulas in Hindi & English.
            </p>
          </div>

          {/* Input Textarea & Voice Recorder */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {isListening && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: 'rgba(239, 68, 68, 0.12)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '8px',
                padding: '6px 10px',
                color: '#ef4444',
                fontSize: '11.5px',
                fontWeight: 700
              }}>
                <span style={{
                  width: '7px',
                  height: '7px',
                  borderRadius: '50%',
                  background: '#ef4444',
                  display: 'inline-block'
                }} />
                <span>🎙️ Listening... Speak your English sentence clearly</span>
              </div>
            )}

            <div style={{ position: 'relative' }}>
              <textarea
                id="grammar-textarea"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleCheckGrammar();
                  }
                }}
                placeholder="Type or speak sentence (e.g. She have went to the market and he don't know)..."
                rows={3}
                style={{
                  width: '100%',
                  padding: '12px 42px 12px 12px',
                  borderRadius: '12px',
                  border: isListening ? '2px solid #ef4444' : '1px solid var(--border-color)',
                  background: 'var(--bg-surface)',
                  color: 'var(--text-main)',
                  fontSize: '13px',
                  lineHeight: 1.5,
                  resize: 'vertical',
                  fontFamily: 'inherit',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />

              {/* Floating Microphone Button */}
              <button
                onClick={toggleVoiceInput}
                title={isListening ? "Stop Voice Recording" : "Speak Sentence (Voice to Text)"}
                style={{
                  position: 'absolute',
                  top: '10px',
                  right: '10px',
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  background: isListening ? '#ef4444' : 'var(--bg-surface-elevated)',
                  border: `1px solid ${isListening ? '#ef4444' : 'var(--border-color)'}`,
                  color: isListening ? '#ffffff' : 'var(--primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
              >
                {isListening ? <MicOff size={15} /> : <Mic size={15} />}
              </button>
            </div>

            {/* Textarea Toolbar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 2px' }}>
              <span style={{ fontSize: '10.5px', color: 'var(--text-dim)' }}>
                {inputText.trim() ? `${inputText.trim().split(/\s+/).length} words` : 'Click 🎙️ to dictate by voice'}
              </span>
              <div style={{ display: 'flex', gap: '6px' }}>
                {inputText && (
                  <>
                    <button
                      onClick={() => speakText(inputText)}
                      style={{ background: 'none', border: 'none', color: 'var(--text-dim)', fontSize: '11px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px' }}
                      title="Pronounce Sentence"
                    >
                      <Volume2 size={12} />
                      <span>Listen</span>
                    </button>
                    <button 
                      onClick={handleClear} 
                      style={{ background: 'none', border: 'none', color: 'var(--text-dim)', fontSize: '11px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px' }}
                    >
                      <RotateCcw size={12} />
                      <span>Clear</span>
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Action Button */}
            <button
              onClick={() => handleCheckGrammar()}
              disabled={isLoading || !inputText.trim()}
              style={{
                width: '100%',
                padding: '9px 14px',
                fontSize: '12.5px',
                fontWeight: 800,
                borderRadius: '9px',
                background: inputText.trim() ? 'var(--primary)' : 'var(--bg-surface-elevated)',
                color: inputText.trim() ? '#ffffff' : 'var(--text-dim)',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                cursor: inputText.trim() ? 'pointer' : 'not-allowed',
                marginTop: '2px',
                boxShadow: inputText.trim() ? '0 2px 8px rgba(79, 70, 229, 0.25)' : 'none'
              }}
            >
              <Sparkles size={14} />
              <span>{isLoading ? 'Scanning Entire Sentence...' : 'Scan All Errors & SSC Rules'}</span>
            </button>
          </div>

          {/* Try Sample Sentences */}
          {!hasChecked && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <span style={{ fontSize: '10.5px', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Try common exam sentences:
              </span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {SAMPLE_SENTENCES.map((sample, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setInputText(sample);
                      handleCheckGrammar(sample);
                    }}
                    style={{
                      padding: '9px 12px',
                      background: 'var(--bg-surface)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '9px',
                      textAlign: 'left',
                      fontSize: '12px',
                      color: 'var(--text-main)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '8px'
                    }}
                  >
                    <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{sample}</span>
                    <ChevronRight size={13} color="var(--text-dim)" style={{ flexShrink: 0 }} />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Error Alert */}
          {errorMessage && (
            <div style={{
              borderRadius: '9px',
              padding: '10px 12px',
              background: 'var(--error-bg)',
              border: '1px solid var(--error-border)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '12px',
              color: 'var(--error)'
            }}>
              <AlertCircle size={15} />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Results Breakdown View */}
          {hasChecked && !isLoading && result && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              
              {/* Card 1: Overview Status Banner & Before vs After */}
              <div style={{
                borderRadius: '14px',
                padding: '14px 16px',
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-color)',
                boxShadow: 'var(--shadow-xs)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px', flexWrap: 'wrap', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {result.hasErrors ? (
                      <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'var(--error-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--error)', flexShrink: 0 }}>
                        <AlertCircle size={15} />
                      </div>
                    ) : (
                      <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981', flexShrink: 0 }}>
                        <CheckCircle2 size={15} />
                      </div>
                    )}
                    <div>
                      <h4 style={{ margin: 0, fontSize: '13.5px', fontWeight: 800, color: result.hasErrors ? 'var(--error)' : '#10b981' }}>
                        {result.hasErrors ? `🔴 ${result.errorCount} Grammar Error${result.errorCount > 1 ? 's' : ''} Spotted` : '🟢 100% Grammatically Accurate!'}
                      </h4>
                      <span style={{ fontSize: '10.5px', color: 'var(--text-dim)' }}>
                        {result.hasErrors ? 'All errors have been detected and corrected below' : 'Sentence complies with SSC standard English rules'}
                      </span>
                    </div>
                  </div>

                  {result.hasErrors && (
                    <button
                      onClick={() => setInputText(result.correctedSentence)}
                      style={{
                        fontSize: '11px',
                        padding: '4px 9px',
                        borderRadius: '6px',
                        background: 'var(--primary)',
                        color: '#ffffff',
                        border: 'none',
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        cursor: 'pointer'
                      }}
                    >
                      <Check size={11} />
                      <span>Apply Fixes</span>
                    </button>
                  )}
                </div>

                {/* Before vs After Display */}
                {result.hasErrors && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '6px' }}>
                    <div style={{ padding: '8px 10px', borderRadius: '8px', background: 'var(--error-bg)', border: '1px solid var(--error-border)' }}>
                      <div style={{ fontSize: '9.5px', fontWeight: 800, color: 'var(--error)', textTransform: 'uppercase', marginBottom: '2px' }}>
                        🔴 Original Sentence (With Faults):
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text-main)', textDecoration: 'line-through', lineHeight: 1.4 }}>
                        {inputText}
                      </div>
                    </div>

                    <div style={{ padding: '8px 10px', borderRadius: '8px', background: 'var(--success-bg)', border: '1px solid var(--success-border)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                        <span style={{ fontSize: '9.5px', fontWeight: 800, color: '#10b981', textTransform: 'uppercase' }}>
                          🟢 Completely Corrected Sentence:
                        </span>
                        <button
                          onClick={() => speakText(result.correctedSentence)}
                          style={{ background: 'none', border: 'none', color: '#10b981', fontSize: '10px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px' }}
                        >
                          <Volume2 size={10} /> Listen
                        </button>
                      </div>
                      <div style={{ fontSize: '12.5px', fontWeight: 800, color: 'var(--text-main)', lineHeight: 1.4 }}>
                        {result.correctedSentence}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Card 2: 📋 ALL SPOTTED ERRORS ITEMIZED LIST */}
              {result.hasErrors && result.errorHighlights.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '0 2px' }}>
                    <Layers size={12} color="var(--primary)" />
                    <span style={{ fontSize: '11.5px', fontWeight: 800, color: 'var(--text-main)' }}>
                      Detailed List of All Errors ({result.errorHighlights.length}):
                    </span>
                  </div>

                  {result.errorHighlights.map((err, errIdx) => (
                    <div
                      key={err.id}
                      style={{
                        background: 'var(--bg-surface)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '11px',
                        padding: '10px 12px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '6px',
                        boxShadow: 'var(--shadow-xs)'
                      }}
                    >
                      {/* Error Header Badge */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '6px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <span style={{
                            fontSize: '9px',
                            fontWeight: 800,
                            background: 'var(--error-bg)',
                            color: 'var(--error)',
                            border: '1px solid var(--error-border)',
                            padding: '1px 5px',
                            borderRadius: '4px'
                          }}>
                            ERROR #{errIdx + 1}
                          </span>
                          <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--text-main)' }}>
                            {err.ruleTitle}
                          </span>
                        </div>

                        {err.matchedGoldenRuleNum && (
                          <button
                            onClick={() => setCurrentView('grammar')}
                            style={{
                              fontSize: '9px',
                              fontWeight: 700,
                              background: 'var(--primary-light)',
                              color: 'var(--primary)',
                              border: '1px solid var(--primary-border)',
                              padding: '1px 5px',
                              borderRadius: '4px',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '3px',
                              cursor: 'pointer'
                            }}
                          >
                            <Award size={9} />
                            <span>Rule #{err.matchedGoldenRuleNum}</span>
                          </button>
                        )}
                      </div>

                      {/* Wrong vs Right comparison pills */}
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        background: 'var(--bg-surface-elevated)',
                        padding: '6px 8px',
                        borderRadius: '7px',
                        border: '1px solid var(--border-color)',
                        flexWrap: 'wrap'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                          <span style={{ fontSize: '9.5px', color: 'var(--error)', fontWeight: 800 }}>❌ WRONG:</span>
                          <span style={{ fontSize: '11.5px', fontWeight: 700, color: 'var(--error)', textDecoration: 'line-through', background: 'var(--error-bg)', padding: '1px 5px', borderRadius: '4px' }}>
                            {err.originalPhrase}
                          </span>
                        </div>

                        <ArrowRight size={11} color="var(--text-dim)" />

                        <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                          <span style={{ fontSize: '9.5px', color: '#10b981', fontWeight: 800 }}>🟢 CORRECT:</span>
                          <span style={{ fontSize: '11.5px', fontWeight: 800, color: '#10b981', background: 'rgba(16, 185, 129, 0.12)', padding: '1px 5px', borderRadius: '4px' }}>
                            {err.correctedPhrase}
                          </span>
                        </div>
                      </div>

                      {/* Grammar Reason */}
                      <div style={{ fontSize: '11.5px', color: 'var(--text-main)', lineHeight: 1.4 }}>
                        <strong>Why:</strong> {err.reason}
                      </div>

                      {/* Hindi Explanation */}
                      {err.hindiExplanation && (
                        <div style={{
                          fontSize: '11px',
                          color: 'var(--text-main)',
                          lineHeight: 1.45,
                          background: 'rgba(245, 158, 11, 0.08)',
                          borderLeft: '3px solid #f59e0b',
                          padding: '5px 8px',
                          borderRadius: '0 5px 5px 0'
                        }}>
                          💡 <strong>हिंदी में:</strong> {err.hindiExplanation}
                        </div>
                      )}

                      {/* Formula if present */}
                      {err.formula && (
                        <div style={{
                          fontSize: '10.5px',
                          fontFamily: 'monospace',
                          color: 'var(--primary)',
                          background: 'var(--primary-light)',
                          padding: '3px 6px',
                          borderRadius: '5px',
                          fontWeight: 700
                        }}>
                          📐 {err.formula}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Card 3: 🎯 SSC Exam Trap & Insights */}
              {result.hasErrors && (
                <div style={{
                  padding: '9px 11px',
                  borderRadius: '9px',
                  background: 'rgba(99, 102, 241, 0.08)',
                  border: '1px dashed var(--primary)',
                  display: 'flex',
                  gap: '6px',
                  alignItems: 'flex-start'
                }}>
                  <Lightbulb size={14} color="var(--primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <span style={{ fontSize: '10px', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', display: 'block' }}>
                      🎯 SSC Exam Trap & Tips:
                    </span>
                    <span style={{ fontSize: '11px', color: 'var(--text-main)', lineHeight: 1.4 }}>
                      {result.examTrapTip}
                    </span>
                  </div>
                </div>
              )}

              {/* Bottom Clear & Scan Next Sentence Button */}
              <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                <button
                  onClick={handleClear}
                  style={{
                    flex: 1,
                    padding: '11px 16px',
                    fontSize: '13px',
                    fontWeight: 800,
                    borderRadius: '11px',
                    background: 'var(--bg-surface)',
                    color: 'var(--text-main)',
                    border: '1.5px solid var(--border-color)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '7px',
                    cursor: 'pointer',
                    boxShadow: 'var(--shadow-xs)',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <RotateCcw size={15} color="var(--primary)" />
                  <span>Clear & Scan New Sentence</span>
                </button>
              </div>

            </div>
          )}

        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* ─── TAB 2: AI VOCAB INTELLIGENCE ENGINE ─── */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'vocab' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%', boxSizing: 'border-box' }}>
          
          {/* Header Banner */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px', flexWrap: 'wrap', gap: '6px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '9px',
                  background: 'rgba(139, 92, 246, 0.12)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#8b5cf6'
                }}>
                  <FlatIconVocabBank size={18} />
                </div>
                <div>
                  <p style={{ fontSize: '9.5px', fontWeight: 800, color: '#8b5cf6', letterSpacing: '0.04em', textTransform: 'uppercase', margin: 0 }}>
                    AI Vocab Intelligence Engine
                  </p>
                  <h2 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-main)', margin: '1px 0 0 0' }}>
                    Instant Hindi Meaning & Mnemonics
                  </h2>
                </div>
              </div>

              <span style={{
                fontSize: '9.5px',
                fontWeight: 800,
                background: 'rgba(139, 92, 246, 0.12)',
                color: '#8b5cf6',
                border: '1px solid rgba(139, 92, 246, 0.25)',
                padding: '2px 7px',
                borderRadius: '5px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '3px'
              }}>
                <Flame size={10} color="#8b5cf6" />
                6,400+ SSC PYQs
              </span>
            </div>

            <p style={{ fontSize: '11.5px', color: 'var(--text-dim)', margin: 0, lineHeight: 1.4 }}>
              Search any English word to get instant Hindi meanings, memory mnemonics, synonyms, antonyms & SSC CGL exam usage.
            </p>
          </div>

          {/* AI Vocab Search Input Bar (Spacious & Prominent) */}
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleVocabLookup(vocabSearch);
            }}
            style={{ position: 'relative', width: '100%', boxSizing: 'border-box' }}
          >
            <div style={{
              background: 'var(--bg-surface)',
              border: '1.5px solid rgba(139, 92, 246, 0.45)',
              borderRadius: '13px',
              padding: '6px 6px 6px 14px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              boxShadow: '0 3px 12px rgba(139, 92, 246, 0.1)',
              width: '100%',
              boxSizing: 'border-box'
            }}>
              <Search size={17} color="#8b5cf6" style={{ flexShrink: 0 }} />
              
              <input
                type="text"
                value={vocabSearch}
                onChange={(e) => {
                  setVocabSearch(e.target.value);
                }}
                placeholder="Type any word (e.g. Ephemeral, Candid, Zealous)..."
                style={{
                  width: '100%',
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-main)',
                  fontSize: '13px',
                  fontWeight: 600,
                  outline: 'none',
                  padding: '6px 0',
                  boxSizing: 'border-box'
                }}
              />

              {/* Voice Dictation Button */}
              <button
                type="button"
                onClick={toggleVoiceInput}
                title="Speak Word"
                style={{
                  background: isListening ? '#ef4444' : 'rgba(139, 92, 246, 0.12)',
                  border: 'none',
                  borderRadius: '8px',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: isListening ? '#ffffff' : '#8b5cf6',
                  cursor: 'pointer',
                  flexShrink: 0
                }}
              >
                {isListening ? <MicOff size={15} /> : <Mic size={15} />}
              </button>

              {/* Dedicated Search Action Button */}
              <button
                type="submit"
                disabled={isVocabLoading}
                style={{
                  padding: '7px 13px',
                  borderRadius: '9px',
                  background: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)',
                  color: '#ffffff',
                  border: 'none',
                  fontSize: '12px',
                  fontWeight: 800,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  cursor: isVocabLoading ? 'not-allowed' : 'pointer',
                  opacity: isVocabLoading ? 0.75 : 1,
                  boxShadow: '0 2px 8px rgba(124, 58, 237, 0.28)',
                  flexShrink: 0,
                  whiteSpace: 'nowrap'
                }}
              >
                <Search size={13} />
                <span>{isVocabLoading ? 'Searching...' : 'Search'}</span>
              </button>
            </div>
          </form>

          {/* Quick Word Suggestion Chips */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', overflowX: 'auto', scrollbarWidth: 'none', paddingBottom: '2px' }}>
            <span style={{ fontSize: '10px', fontWeight: 800, color: 'var(--text-dim)', flexShrink: 0, textTransform: 'uppercase' }}>
              Quick Tap:
            </span>
            {QUICK_VOCAB_WORDS.map((w, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setVocabSearch(w);
                  handleVocabLookup(w);
                }}
                style={{
                  padding: '3px 8px',
                  borderRadius: '5px',
                  background: vocabSearch.toLowerCase() === w.toLowerCase() ? '#8b5cf6' : 'var(--bg-surface)',
                  color: vocabSearch.toLowerCase() === w.toLowerCase() ? '#ffffff' : 'var(--text-main)',
                  border: '1px solid var(--border-color)',
                  fontSize: '11px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  flexShrink: 0
                }}
              >
                {w}
              </button>
            ))}
          </div>

          {/* Detailed Vocab Word Breakdown Card */}
          {activeVocabItem && (
            <div style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-color)',
              borderRadius: '13px',
              padding: '14px 16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
              boxShadow: 'var(--shadow-xs)'
            }}>
              {/* Top Row: Vocab Badge & Exam Tag */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{
                  background: 'rgba(139, 92, 246, 0.12)',
                  color: '#8b5cf6',
                  fontWeight: 800,
                  padding: '2px 7px',
                  borderRadius: '5px',
                  fontSize: '9.5px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em'
                }}>
                  {activeVocabItem.type ? activeVocabItem.type.toUpperCase() : 'VOCAB'}
                </span>

                {activeVocabItem.examTag && (
                  <span style={{ fontSize: '10px', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
                    <Tag size={11} />
                    <span>{activeVocabItem.examTag}</span>
                  </span>
                )}
              </div>

              {/* Title & Pronounce Audio */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <h3 style={{ fontSize: '17px', fontWeight: 800, color: 'var(--text-main)', margin: '0 0 2px 0', letterSpacing: '-0.01em' }}>
                    {activeVocabItem.word}
                  </h3>
                  {activeVocabItem.hindiMeaning && (
                    <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#8b5cf6' }}>
                      {activeVocabItem.hindiMeaning}
                    </div>
                  )}
                </div>

                <button
                  onClick={() => speakText(activeVocabItem.word)}
                  title="Pronounce word"
                  style={{
                    background: 'rgba(139, 92, 246, 0.1)',
                    border: 'none',
                    borderRadius: '8px',
                    width: '32px',
                    height: '32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#8b5cf6',
                    cursor: 'pointer',
                    flexShrink: 0
                  }}
                >
                  <Volume2 size={16} />
                </button>
              </div>

              {/* English Definition */}
              <p style={{ fontSize: '12px', color: 'var(--text-main)', margin: 0, lineHeight: 1.45 }}>
                {activeVocabItem.meaning}
              </p>

              {/* Synonyms (Green Pills) */}
              {activeVocabItem.synonyms && activeVocabItem.synonyms.length > 0 && (
                <div>
                  <div style={{ fontSize: '9.5px', fontWeight: 800, color: 'var(--success)', letterSpacing: '0.04em', marginBottom: '4px' }}>
                    SYNONYMS:
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                    {activeVocabItem.synonyms.map((syn, sIdx) => (
                      <span key={sIdx} style={{
                        background: 'rgba(16, 185, 129, 0.1)',
                        color: 'var(--success)',
                        fontWeight: 700,
                        padding: '2px 7px',
                        borderRadius: '5px',
                        fontSize: '11px'
                      }}>
                        {syn}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Antonyms (Red Pills) */}
              {activeVocabItem.antonyms && activeVocabItem.antonyms.length > 0 && (
                <div>
                  <div style={{ fontSize: '9.5px', fontWeight: 800, color: 'var(--error)', letterSpacing: '0.04em', marginBottom: '4px' }}>
                    ANTONYMS:
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                    {activeVocabItem.antonyms.map((ant, aIdx) => (
                      <span key={aIdx} style={{
                        background: 'rgba(239, 68, 68, 0.1)',
                        color: 'var(--error)',
                        fontWeight: 700,
                        padding: '2px 7px',
                        borderRadius: '5px',
                        fontSize: '11px'
                      }}>
                        {ant}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Example Sentence Container */}
              {activeVocabItem.exampleSentence && (
                <div style={{
                  background: 'var(--bg-surface-elevated)',
                  border: '1px solid var(--border-color)',
                  padding: '8px 10px',
                  borderRadius: '8px',
                  fontSize: '11.5px',
                  color: 'var(--text-dim)',
                  fontStyle: 'italic',
                  marginTop: '2px',
                  lineHeight: 1.4
                }}>
                  "{activeVocabItem.exampleSentence}"
                </div>
              )}
            </div>
          )}

        </div>
      )}

      {/* ─── UPGRADE TO PREMIUM MODAL ─── */}
      {showUpgradeModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.72)',
          backdropFilter: 'blur(5px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '16px'
        }}>
          <div style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-color)',
            borderRadius: '16px',
            maxWidth: '460px',
            width: '100%',
            padding: '24px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
            position: 'relative'
          }}>
            <div style={{
              width: '52px',
              height: '52px',
              borderRadius: '14px',
              background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              margin: '0 auto',
              boxShadow: '0 8px 16px rgba(245, 158, 11, 0.3)'
            }}>
              <Crown size={28} />
            </div>

            <div style={{ textAlign: 'center' }}>
              <span style={{
                fontSize: '10.5px',
                fontWeight: 800,
                color: 'var(--error)',
                background: 'var(--error-bg)',
                border: '1px solid var(--error-border)',
                padding: '2px 9px',
                borderRadius: '20px',
                textTransform: 'uppercase',
                letterSpacing: '0.04em'
              }}>
                Free Scan Limit Reached (50/50 Used)
              </span>
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-main)', margin: '10px 0 6px 0' }}>
                Upgrade to EnglishPro Premium
              </h3>
              <p style={{ fontSize: '12px', color: 'var(--text-dim)', lineHeight: 1.5, margin: 0 }}>
                You have reached your 50 free AI Grammar & Vocab scans. Upgrade to EnglishPro Premium to unlock unlimited AI error analysis, advanced sentence correction, and full access to all 18,000+ SSC PYQs!
              </p>
            </div>

            <div style={{
              background: 'var(--bg-surface-elevated)',
              border: '1px solid var(--border-color)',
              borderRadius: '10px',
              padding: '12px 14px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11.5px', color: 'var(--text-main)', fontWeight: 600 }}>
                <CheckCircle2 size={14} style={{ color: '#10b981', flexShrink: 0 }} />
                <span>Unlimited AI Grammar & Sentence Error Analysis</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11.5px', color: 'var(--text-main)', fontWeight: 600 }}>
                <CheckCircle2 size={14} style={{ color: '#10b981', flexShrink: 0 }} />
                <span>Unlimited AI Vocabulary & Deep Root Lookup</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11.5px', color: 'var(--text-main)', fontWeight: 600 }}>
                <CheckCircle2 size={14} style={{ color: '#10b981', flexShrink: 0 }} />
                <span>Full Access to All 18,077 SSC PYQ Topic Mock Sets</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11.5px', color: 'var(--text-main)', fontWeight: 600 }}>
                <CheckCircle2 size={14} style={{ color: '#10b981', flexShrink: 0 }} />
                <span>120 Golden Grammar Rules Master Course</span>
              </div>
            </div>

            <button
              onClick={() => {
                alert('Thank you for choosing EnglishPro Premium! Redirecting to subscription activation...');
                setShowUpgradeModal(false);
              }}
              style={{
                background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)',
                color: '#ffffff',
                border: 'none',
                padding: '11px',
                borderRadius: '10px',
                fontSize: '13px',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                boxShadow: '0 4px 14px rgba(79, 70, 229, 0.35)',
                marginTop: '4px'
              }}
            >
              <Crown size={15} />
              <span>Unlock EnglishPro Premium</span>
              <ArrowRight size={14} />
            </button>

            <button
              onClick={() => setShowUpgradeModal(false)}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-dim)',
                fontSize: '11.5px',
                fontWeight: 600,
                cursor: 'pointer',
                padding: '4px'
              }}
            >
              Maybe Later
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default GrammarChecker;
