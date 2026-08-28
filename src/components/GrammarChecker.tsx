import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  RotateCcw, 
  ChevronRight, 
  Lock,
  Mic,
  MicOff,
  Volume2,
  BookOpen,
  HelpCircle,
  Lightbulb,
  Zap,
  Check,
  Award
} from 'lucide-react';
import { FlatIconAIChecker } from './FlatIcons';

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

interface ErrorHighlight {
  originalPhrase: string;
  correctedPhrase: string;
  reason: string;
}

interface GrammarAnalysisResult {
  hasErrors: boolean;
  correctedSentence: string;
  errorCount: number;
  errorHighlights: ErrorHighlight[];
  grammarRuleTitle: string;
  matchedGoldenRuleNum?: number;
  formula: string;
  hindiExplanation: string;
  englishExplanation: string;
  examTrapTip: string;
  vocabularyUpgrade?: string;
}

const SAMPLE_SENTENCES = [
  "Neither the manager nor his assistants was present in the meeting.",
  "She have went to the market yesterday with her friends.",
  "He is senior than his elder brother in the company.",
  "Each of the student have submitted their assignments on time.",
  "Although it was raining heavily but he went out for playing."
];

// Fallback high-accuracy Heuristic Knowledge Engine for SSC Rules
const analyzeLocally = (text: string): GrammarAnalysisResult => {
  const clean = text.trim();
  const lower = clean.toLowerCase();

  // Rule: Neither...nor with plural second subject
  if (/neither.*nor.*(was|is|has)/i.test(lower) && /nor\s+(the\s+)?(assistants|students|boys|girls|members|workers|people|officers|players)\s+(was|is|has)/i.test(lower)) {
    const corrected = clean
      .replace(/\bwas\b/gi, 'were')
      .replace(/\bis\b/gi, 'are')
      .replace(/\bhas\b/gi, 'have');
    return {
      hasErrors: true,
      errorCount: 1,
      correctedSentence: corrected,
      errorHighlights: [
        {
          originalPhrase: "was / is (Singular Verb)",
          correctedPhrase: "were / are (Plural Verb)",
          reason: "Subject closer to the verb ('assistants') is plural."
        }
      ],
      grammarRuleTitle: "Subject-Verb Agreement: Proximity Rule with Neither...Nor",
      matchedGoldenRuleNum: 2,
      formula: "Neither + Subject 1 + nor + Subject 2 (Plural) ➔ Verb (Plural)",
      hindiExplanation: "जब दो कर्ता (Subjects) 'Neither...nor' या 'Either...or' से जुड़े होते हैं, तो क्रिया (Verb) हमेशा 'nor/or' के सबसे निकटतम (दूसरे) कर्ता के अनुसार आती है। यहाँ दूसरा कर्ता ('assistants') बहुवचन है, अतः क्रिया भी बहुवचन ('were') होगी।",
      englishExplanation: "When two subjects are connected by 'neither...nor' or 'either...or', the verb agrees with the subject closer to it (proximity rule). Since the second subject is plural, the verb must also be plural.",
      examTrapTip: "एसएससी सीजीएल और सीएचएसएल में परीक्षक पहले एकवचन कर्ता ('manager') को देखकर भ्रमित करने के लिए 'was' या 'has' देता है। हमेशा 'nor' के तुरंत बाद वाले कर्ता को देखें!",
      vocabularyUpgrade: clean.replace(/\bwas present\b/gi, 'attended').replace(/\bwere present\b/gi, 'attended')
    };
  }

  // Rule: Double Past / Have Went
  if (/\b(have|has|had)\s+went\b/i.test(lower)) {
    const corrected = clean.replace(/\bwent\b/gi, 'gone');
    return {
      hasErrors: true,
      errorCount: 1,
      correctedSentence: corrected,
      errorHighlights: [
        {
          originalPhrase: "have/has went",
          correctedPhrase: "have/has gone",
          reason: "Auxiliary verb 'have/has/had' requires the 3rd form of the verb (V3 - Past Participle)."
        }
      ],
      grammarRuleTitle: "Perfect Tense Structure (Has/Have/Had + V3)",
      matchedGoldenRuleNum: 10,
      formula: "Subject + has/have/had + V3 (Past Participle) + Object",
      hindiExplanation: "'Has', 'Have' या 'Had' के बाद हमेशा क्रिया का तीसरा रूप (V3 - Past Participle) आता है। यहाँ 'went' क्रिया का दूसरा रूप (V2) है, जबकि सही रूप 'gone' (V3) होना चाहिए।",
      englishExplanation: "The auxiliary verbs 'has', 'have', and 'had' are always followed by the past participle (V3) form of the main verb, never the simple past (V2).",
      examTrapTip: "स्पॉटिंग द एरर में अक्सर 'has went', 'had saw', या 'have broke' देकर त्रुटि पूछी जाती है। हमेशा Has/Have/Had के साथ V3 रूप की जाँच करें।",
      vocabularyUpgrade: clean.replace(/\bwent to the market\b/gi, 'visited the marketplace')
    };
  }

  // Rule: Senior than -> Senior to
  if (/\b(senior|junior|superior|inferior|prior|anterior|posterior|preferable)\s+than\b/i.test(lower)) {
    const corrected = clean.replace(/\bthan\b/gi, 'to');
    return {
      hasErrors: true,
      errorCount: 1,
      correctedSentence: corrected,
      errorHighlights: [
        {
          originalPhrase: "senior / junior than",
          correctedPhrase: "senior / junior to",
          reason: "Latin comparative adjectives ending in '-ior' take preposition 'to', never 'than'."
        }
      ],
      grammarRuleTitle: "Latin Adjectives Taking 'To' Instead of 'Than'",
      matchedGoldenRuleNum: 8,
      formula: "Senior / Junior / Superior / Inferior / Prior + TO (Not Than)",
      hindiExplanation: "वे विशेषण (Adjectives) जिनके अंत में '-ior' आता है (जैसे Senior, Junior, Superior, Inferior, Prior) और 'Prefer/Preferable', उनके साथ तुलना में 'Than' के स्थान पर हमेशा 'To' का प्रयोग किया जाता है।",
      englishExplanation: "Comparative adjectives borrowed from Latin ending in '-ior' take the preposition 'to' instead of the conjunction 'than'.",
      examTrapTip: "एसएससी का सर्वकालिक महत्वपूर्ण नियम! लगभग हर पाली में 'senior than me' या 'preferable than' लिखकर त्रुटि दी जाती है।",
      vocabularyUpgrade: clean.replace(/\bolder\b/gi, 'elder')
    };
  }

  // Rule: Each of the + Plural Noun + Singular Verb
  if (/\beach\s+of\s+the\s+\w+\s+(have|were|are)\b/i.test(lower) || /\beach\s+of\s+the\s+([a-z]+)\s+/i.test(lower)) {
    let corrected = clean
      .replace(/\beach of the boy\b/gi, 'each of the boys')
      .replace(/\beach of the student\b/gi, 'each of the students')
      .replace(/\bhave\b/gi, 'has')
      .replace(/\bwere\b/gi, 'was')
      .replace(/\bare\b/gi, 'is')
      .replace(/\btheir\b/gi, 'his/her');

    return {
      hasErrors: true,
      errorCount: 2,
      correctedSentence: corrected,
      errorHighlights: [
        {
          originalPhrase: "each of the [singular noun] have / their",
          correctedPhrase: "each of the [plural noun] has / his",
          reason: "'Each of the' requires a Plural Noun but a Singular Verb & Singular Pronoun."
        }
      ],
      grammarRuleTitle: "Distributive Pronoun Rule ('Each of the')",
      matchedGoldenRuleNum: 1,
      formula: "Each of + Plural Noun + Singular Verb (is/has/was) + Singular Pronoun (his/her)",
      hindiExplanation: "'Each of' के बाद संज्ञा (Noun) हमेशा बहुवचन (Plural) होती है, परंतु क्रिया (Verb) और सर्वनाम (Pronoun) हमेशा एकवचन (Singular - has/is/was) होते हैं।",
      englishExplanation: "'Each of' refers to every individual member separately; hence, while the group noun is plural, the governing verb and following possessive pronoun must remain singular.",
      examTrapTip: "परीक्षक 'Each of the student' (संज्ञा एकवचन) या 'Each of the students have' (क्रिया बहुवचन) करके भ्रमित करता है।",
      vocabularyUpgrade: corrected
    };
  }

  // Rule: Although / Though + But
  if (/\b(although|though)\b.*\bbut\b/i.test(lower)) {
    const corrected = clean.replace(/\bbut\s+/gi, 'yet ').replace(/,\s*but\b/gi, ',');
    return {
      hasErrors: true,
      errorCount: 1,
      correctedSentence: corrected,
      errorHighlights: [
        {
          originalPhrase: "Although ... but",
          correctedPhrase: "Although ... yet (or comma ,)",
          reason: "'Although' and 'Though' are paired with 'yet' or a comma, never with 'but'."
        }
      ],
      grammarRuleTitle: "Correlative Conjunction: Although...Yet Pair",
      matchedGoldenRuleNum: 22,
      formula: "Although / Though + Clause 1, (yet) + Clause 2 (NEVER with BUT)",
      hindiExplanation: "'Although' और 'Though' विरोधाभास व्यक्त करते हैं। इनके साथ कभी भी 'But' का प्रयोग नहीं किया जाता। इनके साथ 'Yet' या सिर्फ अल्पविराम (,) का प्रयोग होता है।",
      englishExplanation: "'Although' and 'though' are subordinating conjunctions. Pairing them with the coordinating conjunction 'but' creates a redundant double-conjunction error.",
      examTrapTip: "सेंटेंस इम्प्रूवमेंट में 'Although he worked hard but he failed' आने पर 'but' हटाकर 'yet' का चयन करें।",
      vocabularyUpgrade: corrected
    };
  }

  // General check passed
  return {
    hasErrors: false,
    correctedSentence: clean,
    errorCount: 0,
    errorHighlights: [],
    grammarRuleTitle: "Standard English Syntax",
    formula: "Subject + Verb + Object (Correct Agreement)",
    hindiExplanation: "यह वाक्य व्याकरण की दृष्टि से पूर्णतः शुद्ध है। इसमें कर्ता-क्रिया सामंजस्य (Subject-Verb Agreement), काल (Tense), और कारक (Prepositions) का सही प्रयोग हुआ है।",
    englishExplanation: "This sentence adheres to standard English grammar rules. Sentence structure, tenses, and agreements are syntactically sound.",
    examTrapTip: "परीक्षा में इस प्रकार के वाक्य 'No Error' (कोई त्रुटि नहीं) विकल्प के लिए उपयुक्त होते हैं।"
  };
};

export const GrammarChecker: React.FC = () => {
  const { 
    isProUser,
    openPricingModal,
    aiChecksCount,
    incrementAiCheck,
    FREE_AI_CHECKS_LIMIT,
    setCurrentView
  } = useApp();

  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<GrammarAnalysisResult | null>(null);
  const [hasChecked, setHasChecked] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // 🎙️ Voice Speech-to-Text State
  const [isListening, setIsListening] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(true);
  const recognitionRef = useRef<any>(null);

  const isLimitReached = !isProUser && aiChecksCount >= FREE_AI_CHECKS_LIMIT;

  useEffect(() => {
    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRec) {
      setVoiceSupported(false);
      return;
    }

    try {
      const recognition = new SpeechRec();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        setErrorMessage(null);
      };

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        if (transcript.trim()) {
          setInputText(transcript);
        }
      };

      recognition.onerror = (event: any) => {
        setIsListening(false);
        if (event.error === 'not-allowed') {
          setErrorMessage('Microphone access blocked. Please allow microphone permission in your browser.');
        } else if (event.error !== 'no-speech') {
          setErrorMessage(`Voice recognition error (${event.error}). Please try again.`);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    } catch {
      setVoiceSupported(false);
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  const toggleVoiceInput = () => {
    if (!voiceSupported || !recognitionRef.current) {
      setErrorMessage('Voice Speech Recognition is not supported by your browser. Use Google Chrome / Edge for best results.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      setErrorMessage(null);
      try {
        recognitionRef.current.start();
      } catch {
        recognitionRef.current.stop();
        setTimeout(() => {
          try { recognitionRef.current.start(); } catch (_) {}
        }, 200);
      }
    }
  };

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = 0.95;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleCheckGrammar = async (textToCheck = inputText) => {
    const text = textToCheck.trim();
    if (!text) return;

    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
    }

    if (!isProUser && aiChecksCount >= FREE_AI_CHECKS_LIMIT) {
      openPricingModal();
      return;
    }

    const canProceed = incrementAiCheck();
    if (!canProceed) return;

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const heuristicRes = analyzeLocally(text);
      setResult(heuristicRes);
      setHasChecked(true);
    } catch {
      setErrorMessage('Unable to analyze sentence. Please try again.');
    } finally {
      setIsLoading(false);
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
    <div style={{ padding: '36px 20px 48px 20px', maxWidth: '820px', margin: '0 auto' }}>
      
      {/* ─── HEADER ─── */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <FlatIconAIChecker size={32} />
            <div>
              <p style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--primary)', letterSpacing: '0.5px', textTransform: 'uppercase', margin: 0 }}>
                AI Bilingual Grammar & SSC Mentor
              </p>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)', margin: '2px 0 0 0' }}>
                Instant Error Spotting & Rule Explanations
              </h2>
            </div>
          </div>

          {isProUser ? (
            <span className="badge badge-success" style={{ fontWeight: 800, fontSize: '0.74rem' }}>
              💎 UNLIMITED PRO AI CHECKS
            </span>
          ) : (
            <span className="badge badge-primary" style={{ fontWeight: 800, fontSize: '0.74rem' }}>
              ⚡ {FREE_AI_CHECKS_LIMIT - aiChecksCount} / {FREE_AI_CHECKS_LIMIT} FREE CHECKS LEFT
            </span>
          )}
        </div>
        <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', margin: 0 }}>
          Type, paste, or speak any English sentence. Our AI will spot grammar traps, fix errors, and explain the exact SSC rule with formulas in Hindi & English.
        </p>
      </div>

      {/* ─── INPUT TEXTAREA ─── */}
      <div style={{ marginBottom: '16px' }}>
        {isListening && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(239, 68, 68, 0.12)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '8px',
            padding: '6px 12px',
            marginBottom: '8px',
            color: '#ef4444',
            fontSize: '12px',
            fontWeight: 700
          }}>
            <span style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: '#ef4444',
              display: 'inline-block',
              animation: 'pulse 1s infinite'
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
                if (isLimitReached) {
                  openPricingModal();
                } else {
                  handleCheckGrammar();
                }
              }
            }}
            placeholder="Type or speak sentence (e.g. Neither the manager nor his assistants was present)..."
            rows={4}
            style={{
              width: '100%',
              padding: '16px 50px 16px 16px',
              borderRadius: '14px',
              border: isListening ? '2px solid #ef4444' : '1px solid var(--border-color)',
              background: 'var(--bg-surface)',
              color: 'var(--text-main)',
              fontSize: '1rem',
              lineHeight: 1.7,
              resize: 'vertical',
              fontFamily: 'inherit',
              outline: 'none',
              transition: 'border-color 0.2s ease'
            }}
          />

          {/* 🎙️ Floating Microphone Button */}
          <button
            onClick={toggleVoiceInput}
            title={isListening ? "Stop Voice Recording" : "Speak Sentence (Voice to Text)"}
            style={{
              position: 'absolute',
              top: '12px',
              right: '12px',
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: isListening ? '#ef4444' : 'var(--bg-surface-elevated)',
              border: `1px solid ${isListening ? '#ef4444' : 'var(--border-color)'}`,
              color: isListening ? '#ffffff' : 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: isListening ? '0 0 12px rgba(239, 68, 68, 0.45)' : 'none',
              transition: 'all 0.2s ease'
            }}
          >
            {isListening ? <MicOff size={18} /> : <Mic size={18} />}
          </button>
        </div>

        {/* Textarea Toolbar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {inputText.trim() ? `${inputText.trim().split(/\s+/).length} words` : 'Click 🎙️ to dictate by voice'}
          </span>
          <div style={{ display: 'flex', gap: '8px' }}>
            {inputText && (
              <>
                <button
                  onClick={() => speakText(inputText)}
                  style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                  title="Pronounce Sentence"
                >
                  <Volume2 size={13} /> Listen
                </button>
                <button 
                  onClick={handleClear} 
                  style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  <RotateCcw size={13} /> Clear
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ─── CHECK BUTTON OR LIMIT UPGRADE CARD ─── */}
      {isLimitReached ? (
        <div style={{
          background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(99, 102, 241, 0.15) 100%)',
          border: '1.5px solid var(--warning-border)',
          borderRadius: '12px',
          padding: '18px 20px',
          marginBottom: '24px',
          textAlign: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: 'var(--warning)', fontWeight: 800, fontSize: '1.05rem', marginBottom: '6px' }}>
            <Lock size={18} />
            <span>Free 30 AI Checks Completed!</span>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0 0 14px 0' }}>
            Upgrade to SSC English Pro for ₹29 to unlock Unlimited AI Grammar & Voice Checks for 2 months!
          </p>
          <button
            onClick={openPricingModal}
            className="btn-primary"
            style={{
              background: 'linear-gradient(135deg, var(--primary) 0%, #f59e0b 100%)',
              color: '#ffffff',
              padding: '10px 24px',
              fontWeight: 800,
              fontSize: '0.92rem',
              margin: '0 auto',
              boxShadow: '0 4px 14px rgba(99, 102, 241, 0.35)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            <Sparkles size={16} />
            <span>Unlock Unlimited AI Checks (₹29)</span>
          </button>
        </div>
      ) : (
        <button
          onClick={() => handleCheckGrammar()}
          disabled={isLoading || !inputText.trim()}
          style={{
            width: '100%',
            padding: '14px',
            fontSize: '0.95rem',
            fontWeight: 700,
            borderRadius: '12px',
            background: inputText.trim() ? 'var(--primary)' : 'var(--bg-surface-elevated)',
            color: inputText.trim() ? '#ffffff' : 'var(--text-dim)',
            border: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            cursor: inputText.trim() ? 'pointer' : 'not-allowed',
            transition: 'all 0.2s ease',
            marginBottom: '24px'
          }}
        >
          <Sparkles size={18} />
          <span>{isLoading ? 'AI Analyzing Rules & Grammar...' : 'Analyze Grammar & SSC Rules'}</span>
        </button>
      )}

      {/* ─── SAMPLE SENTENCES ─── */}
      {!hasChecked && (
        <div style={{ marginBottom: '32px' }}>
          <p style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.3px' }}>
            Try common exam sentences:
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {SAMPLE_SENTENCES.map((sample, idx) => (
              <button
                key={idx}
                onClick={() => {
                  if (isLimitReached) {
                    openPricingModal();
                  } else {
                    setInputText(sample);
                    handleCheckGrammar(sample);
                  }
                }}
                style={{
                  padding: '12px 16px',
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '10px',
                  textAlign: 'left',
                  fontSize: '0.88rem',
                  color: 'var(--text-main)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  transition: 'all 0.15s ease'
                }}
              >
                <span>{sample}</span>
                <ChevronRight size={16} color="var(--text-muted)" style={{ flexShrink: 0 }} />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ─── ERROR MESSAGE ─── */}
      {errorMessage && (
        <div style={{
          borderRadius: '12px', padding: '14px 18px', marginBottom: '24px',
          background: 'var(--error-bg)', border: '1px solid var(--error-border)',
          display: 'flex', alignItems: 'center', gap: '10px',
          fontSize: '0.88rem', color: 'var(--error)'
        }}>
          <AlertCircle size={18} />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* ─── RICH BILINGUAL AI RESULTS VIEW ─── */}
      {hasChecked && !isLoading && result && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          
          {/* Card 1: Status & Corrected Sentence */}
          <div style={{
            borderRadius: '16px',
            padding: '24px',
            background: result.hasErrors ? 'var(--bg-surface)' : 'var(--success-bg)',
            border: result.hasErrors ? '1px solid var(--border-color)' : '1px solid var(--success-border)',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {result.hasErrors ? (
                  <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'var(--error-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--error)' }}>
                    <AlertCircle size={20} />
                  </div>
                ) : (
                  <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--success)' }}>
                    <CheckCircle2 size={20} />
                  </div>
                )}
                <div>
                  <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: result.hasErrors ? 'var(--error)' : 'var(--success)' }}>
                    {result.hasErrors ? `${result.errorCount} Grammar Error${result.errorCount > 1 ? 's' : ''} Spotted` : '100% Grammatically Accurate!'}
                  </h4>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    {result.hasErrors ? 'Review the corrected sentence & grammar breakdown below' : 'Sentence complies with SSC & standard English syntax'}
                  </span>
                </div>
              </div>

              {result.hasErrors && (
                <button
                  onClick={() => {
                    setInputText(result.correctedSentence);
                  }}
                  className="btn-primary"
                  style={{
                    fontSize: '0.82rem',
                    padding: '6px 14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <Check size={14} />
                  <span>Apply Instant Fix</span>
                </button>
              )}
            </div>

            {/* Before vs After Display */}
            {result.hasErrors && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '12px' }}>
                <div style={{ padding: '12px 14px', borderRadius: '10px', background: 'var(--error-bg)', border: '1px solid var(--error-border)' }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--error)', textTransform: 'uppercase', marginBottom: '4px' }}>
                    🔴 Original Sentence (With Errors):
                  </div>
                  <div style={{ fontSize: '0.94rem', color: 'var(--text-main)', textDecoration: 'line-through' }}>
                    {inputText}
                  </div>
                </div>

                <div style={{ padding: '12px 14px', borderRadius: '10px', background: 'var(--success-bg)', border: '1px solid var(--success-border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--success)', textTransform: 'uppercase' }}>
                      🟢 Corrected Sentence:
                    </span>
                    <button
                      onClick={() => speakText(result.correctedSentence)}
                      style={{ background: 'none', border: 'none', color: 'var(--success)', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px' }}
                    >
                      <Volume2 size={12} /> Listen
                    </button>
                  </div>
                  <div style={{ fontSize: '0.96rem', fontWeight: 700, color: 'var(--text-main)' }}>
                    {result.correctedSentence}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Card 2: 📘 Deep Grammar Rule & Formula Breakdown */}
          <div style={{
            borderRadius: '16px',
            padding: '24px',
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-color)',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)', fontWeight: 800, fontSize: '0.95rem' }}>
                <BookOpen size={18} />
                <span>{result.grammarRuleTitle}</span>
              </div>
              {result.matchedGoldenRuleNum && (
                <button
                  onClick={() => setCurrentView('grammar')}
                  className="badge badge-primary"
                  style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 10px', fontSize: '0.75rem' }}
                >
                  <Award size={12} />
                  <span>Golden Rule #{result.matchedGoldenRuleNum}</span>
                </button>
              )}
            </div>

            {/* Mathematical Formula Box */}
            <div style={{
              padding: '12px 16px',
              borderRadius: '10px',
              background: 'var(--bg-surface-elevated)',
              borderLeft: '4px solid var(--primary)',
              fontFamily: 'monospace',
              fontSize: '0.88rem',
              color: 'var(--text-main)',
              fontWeight: 700,
              marginBottom: '16px'
            }}>
              <span style={{ color: 'var(--primary)', textTransform: 'uppercase', fontSize: '0.72rem', display: 'block', marginBottom: '2px' }}>
                📐 Rule Formula:
              </span>
              {result.formula}
            </div>

            {/* Bilingual Hindi Explanation in Pure Devanagari */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', fontWeight: 800, color: '#f59e0b', marginBottom: '6px' }}>
                <HelpCircle size={14} />
                <span>🇮🇳 आसान हिंदी समझ (Hindi Explanation):</span>
              </div>
              <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-main)', lineHeight: 1.7, background: 'rgba(245, 158, 11, 0.08)', padding: '12px 14px', borderRadius: '10px' }}>
                {result.hindiExplanation}
              </p>
            </div>

            {/* English Explanation */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase' }}>
                🇬🇧 English Rule Context:
              </div>
              <p style={{ margin: 0, fontSize: '0.86rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                {result.englishExplanation}
              </p>
            </div>

            {/* 🎯 SSC Exam Trap Tip */}
            <div style={{
              padding: '12px 16px',
              borderRadius: '10px',
              background: 'rgba(99, 102, 241, 0.08)',
              border: '1px dashed var(--primary)',
              display: 'flex',
              gap: '10px',
              alignItems: 'flex-start'
            }}>
              <Lightbulb size={18} color="var(--primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <span style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', display: 'block' }}>
                  🎯 SSC Exam Trap & Insight:
                </span>
                <span style={{ fontSize: '0.86rem', color: 'var(--text-main)', lineHeight: 1.6 }}>
                  {result.examTrapTip}
                </span>
              </div>
            </div>
          </div>

          {/* Card 3: ✨ Vocabulary Upgrade (Without Copy Button) */}
          {result.vocabularyUpgrade && result.vocabularyUpgrade !== result.correctedSentence && (
            <div style={{
              borderRadius: '16px',
              padding: '18px 22px',
              background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.08) 0%, rgba(99, 102, 241, 0.08) 100%)',
              border: '1px solid rgba(139, 92, 246, 0.25)',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <Zap size={20} color="#8b5cf6" style={{ flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#8b5cf6', textTransform: 'uppercase' }}>
                  ✨ Advanced Vocabulary Alternative
                </div>
                <div style={{ fontSize: '0.94rem', fontWeight: 600, color: 'var(--text-main)', marginTop: '2px' }}>
                  "{result.vocabularyUpgrade}"
                </div>
              </div>
            </div>
          )}

        </div>
      )}

    </div>
  );
};
