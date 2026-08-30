import React, { useState, useEffect, useMemo } from 'react';
import { loadGrammarRules } from '../data/grammarRules';
import type { GrammarRuleItem } from '../types/quiz';
import { SmartQuestionCanvas } from './SmartQuestionCanvas';
import { 
  Search, 
  CheckCircle2, 
  XCircle, 
  Sparkles, 
  BookOpen, 
  ChevronLeft, 
  ChevronRight, 
  Zap, 
  Tag, 
  Target, 
  ArrowLeft, 
  Grid, 
  Languages, 
  Lightbulb, 
  AlertTriangle,
  Award,
  BookMarked,
  X,
  RotateCcw
} from 'lucide-react';

interface GrammarRulesProps {
  onSelectRuleForChecker?: (ruleText: string) => void;
}

export const GrammarRules: React.FC<GrammarRulesProps> = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [viewMode, setViewMode] = useState<'card' | 'list'>('card');
  const [ruleLanguage, setRuleLanguage] = useState<'english' | 'hindi'>('english');
  const [activeRuleIndex, setActiveRuleIndex] = useState(0);
  const [showRuleGridModal, setShowRuleGridModal] = useState(false);

  // Lazy-loaded grammar rules data
  const [grammarRules, setGrammarRules] = useState<GrammarRuleItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadGrammarRules().then(data => {
      setGrammarRules(data);
      setIsLoading(false);
    });
  }, []);

  // Dedicated Screen Practice state
  const [activePracticeRule, setActivePracticeRule] = useState<GrammarRuleItem | null>(null);
  const [currentPyqIndex, setCurrentPyqIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);

  const categories = [
    'All',
    'Subject-Verb Agreement',
    'Prepositions',
    'Verbs & Tenses',
    'Adjectives & Adverbs',
    'Nouns',
    'Pronouns',
    'Conjunctions',
    'Conditionals & Modifiers'
  ];

  const filteredRules = useMemo(() => {
    if (grammarRules.length === 0) return [];
    const sTerm = searchTerm.toLowerCase().trim();
    const selCat = selectedCategory.toLowerCase();

    return grammarRules.filter(rule => {
      const matchesCategory = selectedCategory === 'All' || 
                              rule.category.toLowerCase().includes(selCat) || 
                              selCat.includes(rule.category.toLowerCase());
      
      if (!matchesCategory) return false;
      if (!sTerm) return true;

      return rule.title.toLowerCase().includes(sTerm) || 
             rule.ruleDescription.toLowerCase().includes(sTerm) ||
             (rule.explanation && rule.explanation.toLowerCase().includes(sTerm)) ||
             (rule.hindiExplanation && rule.hindiExplanation.includes(searchTerm)) ||
             `rule ${rule.id}`.includes(sTerm) ||
             `${rule.id}` === sTerm;
    });
  }, [selectedCategory, searchTerm, grammarRules]);

  const activeRule = filteredRules[activeRuleIndex] || filteredRules[0] || grammarRules[0];

  // Touch swipe support for mobile & tablets
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchStartY, setTouchStartY] = useState<number | null>(null);

  // Reset practice state when active rule changes
  useEffect(() => {
    setCurrentPyqIndex(0);
    setSelectedOption(null);
    setShowExplanation(false);
  }, [activeRuleIndex, searchTerm, selectedCategory]);

  const handleNextRule = () => {
    if (activeRuleIndex < filteredRules.length - 1) {
      setActiveRuleIndex(prev => prev + 1);
    }
  };

  const handlePrevRule = () => {
    if (activeRuleIndex > 0) {
      setActiveRuleIndex(prev => prev - 1);
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
    setTouchStartY(e.touches[0].clientY);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null || touchStartY === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;

    const deltaX = touchEndX - touchStartX;
    const deltaY = touchEndY - touchStartY;

    // Trigger swipe if horizontal movement is dominant and > 45px
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 45) {
      if (deltaX < 0) {
        // Swiped Left ➔ Next Rule
        handleNextRule();
      } else {
        // Swiped Right ➔ Previous Rule
        handlePrevRule();
      }
    }

    setTouchStartX(null);
    setTouchStartY(null);
  };

  // Keyboard navigation with Left and Right arrows
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (showRuleGridModal || activePracticeRule) return;
      if (['input', 'textarea'].includes((e.target as HTMLElement)?.tagName?.toLowerCase())) return;

      if (e.key === 'ArrowRight') {
        handleNextRule();
      } else if (e.key === 'ArrowLeft') {
        handlePrevRule();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeRuleIndex, filteredRules.length, showRuleGridModal, activePracticeRule]);

  const handleJumpToRule = (ruleId: number) => {
    const targetIdx = filteredRules.findIndex(r => r.id === ruleId);
    if (targetIdx !== -1) {
      setActiveRuleIndex(targetIdx);
    } else {
      setSelectedCategory('All');
      setSearchTerm('');
      const globalIdx = grammarRules.findIndex(r => r.id === ruleId);
      if (globalIdx !== -1) {
        setActiveRuleIndex(globalIdx);
      }
    }
    setShowRuleGridModal(false);
  };

  const formatSubscripts = (str: string) => {
    return str
      .replace(/\bV([1-5])\b/g, (_, n) => `V${['₀','₁','₂','₃','₄','₅'][Number(n)] || n}`)
      .replace(/\bv([1-5])\b/g, (_, n) => `v${['₀','₁','₂','₃','₄','₅'][Number(n)] || n}`)
      .replace(/\bS([1-2])\b/g, (_, n) => `S${['₀','₁','₂'][Number(n)] || n}`)
      .replace(/\bSubject ([1-2])\b/g, (_, n) => `Subject${['₀','₁','₂'][Number(n)] || n}`)
      .replace(/\bNoun ([1-2])\b/g, (_, n) => `Noun${['₀','₁','₂'][Number(n)] || n}`);
  };

  const renderFormattedText = (text: string) => {
    if (!text) return null;
    const formattedWithSubscripts = formatSubscripts(text);
    const parts = formattedWithSubscripts.split(/(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*)/g);
    return parts.map((part, idx) => {
      if (part.startsWith('`') && part.endsWith('`')) {
        return (
          <code key={idx} style={{
            fontFamily: 'var(--font-mono)',
            fontWeight: 700,
            color: 'var(--primary)',
            background: 'var(--primary-light)',
            padding: '2px 6px',
            borderRadius: '4px',
            border: '1px solid var(--primary-border)',
            display: 'inline-block',
            wordBreak: 'break-word',
            fontSize: '0.88em'
          }}>
            {part.slice(1, -1)}
          </code>
        );
      }
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={idx} style={{ fontWeight: 800, color: 'var(--text-main)' }}>{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith('*') && part.endsWith('*') && part.length > 2) {
        return <strong key={idx} style={{ fontWeight: 800, color: 'var(--text-main)' }}>{part.slice(1, -1)}</strong>;
      }
      const cleaned = part.replace(/\*\*/g, '').replace(/\*/g, '');
      return cleaned;
    });
  };

  const renderSmartRuleTitle = (title: string, isListView: boolean = false) => {
    if (!title) return null;

    // Check if title has parenthetical examples/triggers e.g. "Title (Examples / Triggers)"
    const match = title.match(/^([^(]+)\s*\(([^)]+)\)$/);
    if (match) {
      const mainTitle = match[1].trim();
      const subTitle = match[2].trim();
      return (
        <div style={{ marginBottom: isListView ? '6px' : '10px' }}>
          <h2 style={{
            fontSize: isListView ? '13px' : '15px',
            fontWeight: 800,
            color: 'var(--text-main)',
            lineHeight: 1.35,
            letterSpacing: '-0.01em',
            margin: 0,
            wordBreak: 'break-word'
          }}>
            {renderFormattedText(mainTitle)}
          </h2>
          <div style={{
            fontSize: '11px',
            fontWeight: 600,
            color: 'var(--text-dim)',
            marginTop: '3px',
            lineHeight: 1.4,
            display: 'flex',
            alignItems: 'center',
            gap: '5px'
          }}>
            <span style={{ color: 'var(--primary)', fontSize: '11px' }}>⚡</span>
            <span>{renderFormattedText(subTitle)}</span>
          </div>
        </div>
      );
    }

    return (
      <h2 style={{
        fontSize: isListView ? '13px' : '15px',
        fontWeight: 800,
        color: 'var(--text-main)',
        marginBottom: isListView ? '6px' : '10px',
        lineHeight: 1.35,
        letterSpacing: '-0.01em',
        wordBreak: 'break-word'
      }}>
        {renderFormattedText(title)}
      </h2>
    );
  };

  const renderSmartRuleDescription = (text: string) => {
    if (!text) return null;

    // Cleanly split text into paragraphs without aggressive character splitting
    const rawBlocks = text.split(/\n+/).map(b => b.trim()).filter(b => b.length > 0);

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {rawBlocks.map((block, idx) => {
          // Ignore accidental stray punctuation lines like ").", ")", "."
          const cleanedText = block.replace(/^[❌✖✔✅•\-\*📌📋💡⚠️⛔♦\s]+/, '').trim();
          if (cleanedText.length <= 2 && /^[\).,;:!\s]+$/.test(cleanedText)) {
            return null;
          }

          // 1. Explicit Full Incorrect Example Line (starts with ❌ or [Incorrect])
          if (/^([❌✖]|\[\s*Incorrect\s*\])/i.test(block) && cleanedText.length > 3) {
            return (
              <div key={idx} style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '8px',
                color: 'var(--error)',
                background: 'var(--error-bg)',
                border: '1px solid var(--error-border)',
                borderLeft: '3px solid var(--error)',
                borderRadius: '8px',
                padding: '8px 12px',
                fontSize: '12px',
                fontWeight: 600,
                lineHeight: 1.5
              }}>
                <XCircle size={14} style={{ flexShrink: 0, marginTop: '2px', color: 'var(--error)' }} />
                <div style={{ flex: 1, minWidth: 0, wordBreak: 'break-word' }}>
                  <span style={{ textDecoration: 'line-through', opacity: 0.9 }}>{renderFormattedText(cleanedText)}</span>
                </div>
              </div>
            );
          }

          // 2. Explicit Full Correct Example Line (starts with ✔ or [Correct])
          if (/^([✔✅]|\[\s*Correct\s*\])/i.test(block) && cleanedText.length > 3) {
            return (
              <div key={idx} style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '8px',
                color: '#10b981',
                background: 'var(--success-bg)',
                border: '1px solid var(--success-border)',
                borderLeft: '3px solid #10b981',
                borderRadius: '8px',
                padding: '8px 12px',
                fontSize: '12px',
                fontWeight: 600,
                lineHeight: 1.5
              }}>
                <CheckCircle2 size={14} style={{ flexShrink: 0, marginTop: '2px', color: '#10b981' }} />
                <div style={{ flex: 1, minWidth: 0, wordBreak: 'break-word' }}>
                  <span>{renderFormattedText(cleanedText)}</span>
                </div>
              </div>
            );
          }

          // 3. Bullet Items (starts with •, -, *, 1., 2.)
          if (/^[•\-\*]|\d+\.\s*/.test(block)) {
            return (
              <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '12px', color: 'var(--text-main)', lineHeight: 1.5 }}>
                <span style={{ color: 'var(--primary)', fontWeight: 800, flexShrink: 0, marginTop: '1px' }}>•</span>
                <div style={{ flex: 1, minWidth: 0, wordBreak: 'break-word' }}>
                  {renderFormattedText(cleanedText)}
                </div>
              </div>
            );
          }

          // 4. Subheadings (e.g. Examples:, Complete List of Words:)
          if (/^Examples?:/i.test(block)) {
            const content = block.replace(/^Examples?:/i, '').trim();
            return (
              <div key={idx} style={{ marginTop: '4px' }}>
                <div style={{ fontSize: '10.5px', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Sparkles size={12} /> Examples & Details:
                </div>
                {content && (
                  <div style={{ fontSize: '12px', color: 'var(--text-main)', lineHeight: 1.5, paddingLeft: '2px' }}>
                    {renderFormattedText(content)}
                  </div>
                )}
              </div>
            );
          }

          // 5. Standard Clean Paragraph
          return (
            <p key={idx} style={{ fontSize: '12px', color: 'var(--text-main)', lineHeight: 1.55, margin: 0, wordBreak: 'break-word' }}>
              {renderFormattedText(block.replace(/^[📌📋💡⚠️⛔♦\s]+/, ''))}
            </p>
          );
        })}
      </div>
    );
  };

  const renderFormattedHindiExplanation = (text: string) => {
    if (!text) return null;
    const rawLines = text.split(/\n+/).map(l => l.trim()).filter(Boolean);

    return (
      <div style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-color)',
        borderRadius: '12px',
        padding: '12px 14px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        fontFamily: "var(--font-sans), 'Noto Sans Devanagari', 'Segoe UI', system-ui, sans-serif"
      }}>
        {rawLines.map((line, idx) => {
          // Strip stray symbols and emoji prefixes cleanly
          const cleanLine = line.replace(/^[📌📋💡⚠️⛔♦\s*•\-]+/, '').trim();

          // 1. Exam Tip / Caution / Warning Line
          if (line.includes('परीक्षा टिप') || line.includes('अपवाद') || line.toLowerCase().includes('caution')) {
            const cleanTipContent = cleanLine.replace(/^(?:परीक्षा\s*टिप|अपवाद|महत्वपूर्ण|caution|note)\s*[:\-\/]*\s*/i, '')
                                             .replace(/^(?:परीक्षा\s*टिप|अपवाद|महत्वपूर्ण|caution|note)\s*[:\-\/]*\s*/i, '')
                                             .replace(/^[:\-\/\s]+/, '')
                                             .trim();
            // Split by semicolon or newlines to separate multiple examples/facts on distinct lines
            const tipParts = cleanTipContent.split(/;\s*|\n+/).filter(Boolean);

            return (
              <div
                key={idx}
                style={{
                  background: 'var(--error-bg)',
                  border: '1px solid var(--error-border)',
                  borderLeft: '3px solid var(--error)',
                  borderRadius: '8px',
                  padding: '8px 12px',
                  marginTop: '4px'
                }}
              >
                <div style={{
                  fontSize: '10.5px',
                  fontWeight: 800,
                  color: 'var(--error)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  marginBottom: '6px'
                }}>
                  <span>⚠️</span>
                  <span>परीक्षा टिप / अपवाद (Exam Tip)</span>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  {tipParts.map((tPart, pIdx) => {
                    const isWrong = tPart.includes('❌') || tPart.includes('गलत');
                    const isRight = tPart.includes('✔') || tPart.includes('सही');

                    return (
                      <div
                        key={pIdx}
                        style={{
                          fontSize: '12px',
                          color: isWrong ? 'var(--error)' : isRight ? '#10b981' : 'var(--text-main)',
                          lineHeight: 1.5,
                          background: isWrong ? 'rgba(239, 68, 68, 0.07)' : isRight ? 'rgba(16, 185, 129, 0.07)' : 'transparent',
                          padding: (isWrong || isRight) ? '4px 8px' : '0',
                          borderRadius: '5px',
                          fontWeight: (isWrong || isRight) ? 600 : 500
                        }}
                      >
                        {renderFormattedText(tPart.replace(/^[:\s]+/, '').trim())}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          }

          // 2. Formula Line
          if (line.includes('फॉर्मूला') || line.includes('फ़ॉर्मूला') || line.toLowerCase().includes('formula:')) {
            const cleanFormulaContent = cleanLine.replace(/^(?:फ़ॉर्मूला|फॉर्मूला|formula)\s*[:\-\/]*\s*/i, '')
                                                 .replace(/^(?:फ़ॉर्मूला|फॉर्मूला|formula)\s*[:\-\/]*\s*/i, '')
                                                 .replace(/^[:\-\/\s]+/, '')
                                                 .trim();
            // Split formulas separated by pipe '|' or newlines
            const formulaParts = cleanFormulaContent.split(/\s*\|\s*|\n+/).filter(Boolean);

            return (
              <div
                key={idx}
                style={{
                  background: 'var(--primary-light)',
                  border: '1px solid var(--primary-border)',
                  borderLeft: '3px solid var(--primary)',
                  borderRadius: '8px',
                  padding: '8px 12px',
                  marginTop: '4px'
                }}
              >
                <div style={{
                  fontSize: '10.5px',
                  fontWeight: 800,
                  color: 'var(--primary)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  marginBottom: '6px'
                }}>
                  <span>📐</span>
                  <span>फ़ॉर्मूला (Rule Formula)</span>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  {formulaParts.map((fPart, fIdx) => (
                    <div
                      key={fIdx}
                      style={{
                        fontSize: '12px',
                        color: 'var(--primary)',
                        fontWeight: 700,
                        lineHeight: 1.4,
                        padding: '6px 10px',
                        background: 'var(--bg-surface)',
                        borderRadius: '6px',
                        border: '1px solid var(--primary-border)',
                        wordBreak: 'break-word'
                      }}
                    >
                      {renderFormattedText(fPart.trim())}
                    </div>
                  ))}
                </div>
              </div>
            );
          }

          // 3. Subheading (e.g. "महत्वपूर्ण अंतर:", "मुख्य नियम:", "पूरी सूची:", "सही व गलत रूप:")
          if (cleanLine.endsWith(':') || cleanLine.startsWith('महत्वपूर्ण अंतर') || cleanLine.startsWith('मुख्य नियम') || cleanLine.startsWith('पूरी सूची')) {
            return (
              <div
                key={idx}
                style={{
                  fontSize: '12.5px',
                  fontWeight: 800,
                  color: 'var(--primary)',
                  marginTop: idx > 0 ? '6px' : '0',
                  marginBottom: '2px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px'
                }}
              >
                <span style={{ fontSize: '11px' }}>🔹</span>
                <span>{renderFormattedText(cleanLine)}</span>
              </div>
            );
          }

          // 4. Bullet Items (starts with •, -, 1., 2.)
          if (/^[•\-\*]|\d+\.\s*/.test(line)) {
            return (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '8px',
                  fontSize: '12px',
                  color: 'var(--text-main)',
                  lineHeight: 1.6,
                  paddingLeft: '2px'
                }}
              >
                <span style={{ color: 'var(--primary)', fontWeight: 800, flexShrink: 0, marginTop: '2px' }}>•</span>
                <div style={{ flex: 1, minWidth: 0, wordBreak: 'break-word' }}>
                  {renderFormattedText(cleanLine)}
                </div>
              </div>
            );
          }

          // 5. Standard paragraph
          return (
            <p
              key={idx}
              style={{
                fontSize: '12px',
                color: 'var(--text-main)',
                lineHeight: 1.6,
                margin: 0,
                wordBreak: 'break-word'
              }}
            >
              {renderFormattedText(cleanLine)}
            </p>
          );
        })}
      </div>
    );
  };

  const renderFormattedExplanation = (text: string) => {
    if (!text) return null;
    let cleanText = text.replace(/^Rule\s*#\d+\s*\([^)]*\):\s*/i, '').trim();
    const points = cleanText.split(/\n+/).map(p => p.trim()).filter(Boolean);

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
        {points.map((point, idx) => (
          <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '0.94rem', color: 'var(--text-main)', lineHeight: 1.65 }}>
            <span style={{ color: 'var(--primary)', fontWeight: 800, flexShrink: 0, marginTop: '2px' }}>•</span>
            <div style={{ flex: 1, minWidth: 0, wordBreak: 'break-word' }}>
              {renderFormattedText(point)}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderSmartFormulaBox = (formulaRaw: string) => {
    if (!formulaRaw) return null;

    let text = formulaRaw.trim();
    const restrictions: string[] = [];

    // Extract bracketed constraints e.g. "[Strictly NO 'Not' ...]"
    const bracketMatches = text.match(/\[([^\]]+)\]/g);
    if (bracketMatches) {
      bracketMatches.forEach(m => {
        const inner = m.slice(1, -1).trim();
        if (
          inner.toLowerCase().includes('never') || 
          inner.toLowerCase().includes('no ') || 
          inner.toLowerCase().includes('strictly') || 
          inner.toLowerCase().includes('prohibit') || 
          inner.toLowerCase().includes('avoid') ||
          inner.toLowerCase().includes('not ')
        ) {
          restrictions.push(inner);
          text = text.replace(m, '').trim();
        }
      });
    }

    // Split multiple structures by pipe '|' or ' OR ' or newlines
    const formulas = text
      .split(/\s*\|\s*|\s+OR\s+|\n+/)
      .map(f => f.trim())
      .filter(Boolean);

    return (
      <div style={{
        background: 'var(--bg-surface-elevated)',
        border: '1.5px solid var(--border-color)',
        borderLeft: '4px solid var(--primary)',
        borderRadius: '10px',
        padding: '10px 12px',
        marginBottom: '14px',
        boxShadow: 'var(--shadow-xs)'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '8px',
          flexWrap: 'wrap',
          gap: '6px'
        }}>
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '9.5px',
            fontWeight: 800,
            color: 'var(--primary)',
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            background: 'var(--primary-light)',
            padding: '2px 7px',
            borderRadius: '4px'
          }}>
            <Zap size={11} />
            <span>Core Syntax Formula</span>
          </span>
          {formulas.length > 1 && (
            <span style={{ fontSize: '10px', color: 'var(--text-dim)', fontWeight: 600 }}>
              {formulas.length} Core Structures
            </span>
          )}
        </div>

        {/* Formula Rows */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {formulas.map((fItem, fIdx) => (
            <div
              key={fIdx}
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-color)',
                borderRadius: '7px',
                padding: '8px 12px',
                fontSize: '12px',
                fontWeight: 700,
                color: 'var(--text-main)',
                lineHeight: 1.45,
                wordBreak: 'break-word',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              {formulas.length > 1 && (
                <span style={{
                  fontSize: '9.5px',
                  color: 'var(--primary)',
                  fontWeight: 800,
                  background: 'var(--primary-light)',
                  padding: '1px 5px',
                  borderRadius: '3px',
                  border: '1px solid var(--primary-border)',
                  flexShrink: 0
                }}>
                  #{fIdx + 1}
                </span>
              )}
              <div style={{ flex: 1, fontSize: '12px', fontWeight: 700, color: 'var(--text-main)' }}>
                {renderFormattedText(fItem)}
              </div>
            </div>
          ))}
        </div>

        {/* Restrictions / Caveats Alert */}
        {restrictions.length > 0 && (
          <div style={{
            marginTop: '10px',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px'
          }}>
            {restrictions.map((rText, rIdx) => (
              <div
                key={rIdx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '0.84rem',
                  fontWeight: 700,
                  color: 'var(--error)',
                  background: 'var(--error-bg)',
                  border: '1px solid var(--error-border)',
                  borderRadius: '6px',
                  padding: '7px 12px'
                }}
              >
                <AlertTriangle size={14} style={{ flexShrink: 0 }} />
                <span>Exam Restriction: {rText}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={{ width: '100%', maxWidth: '680px', margin: '0 auto', padding: '14px 12px 40px 12px', boxSizing: 'border-box', overflowX: 'hidden' }}>
      
      {/* ─── SCENARIO A: DEDICATED PRACTICE QUIZ SCREEN ─── */}
      {activePracticeRule && activePracticeRule.pyqs && activePracticeRule.pyqs.length > 0 ? (
        <div style={{ maxWidth: '680px', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
          
          {/* Quiz Top Navigation Bar */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between', 
            marginBottom: '16px', 
            background: 'var(--bg-surface)', 
            padding: '12px 18px', 
            borderRadius: 'var(--radius-md)', 
            border: '1px solid var(--border-color)', 
            boxShadow: 'var(--shadow-xs)',
            flexWrap: 'wrap', 
            gap: '10px' 
          }}>
            <button
              onClick={() => setActivePracticeRule(null)}
              className="btn-secondary"
              style={{
                padding: '7px 12px',
                fontSize: '0.84rem'
              }}
            >
              <ArrowLeft size={16} />
              <span>Back to Rule {activePracticeRule.id}</span>
            </button>

            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Rule {activePracticeRule.id < 10 ? `0${activePracticeRule.id}` : activePracticeRule.id} Practice Quiz
              </div>
              <div style={{ fontSize: '0.98rem', fontWeight: 800, color: 'var(--text-main)' }}>
                Question {currentPyqIndex + 1} of {activePracticeRule.pyqs.length}
              </div>
            </div>

            <span className="badge badge-primary" style={{ padding: '5px 10px', fontSize: '0.78rem' }}>
              <Award size={14} />
              <span>{Math.round(((currentPyqIndex + 1) / activePracticeRule.pyqs.length) * 100)}% Complete</span>
            </span>
          </div>

          {/* Solid Progress Bar */}
          <div style={{ height: '6px', background: 'var(--bg-surface-elevated)', borderRadius: '9999px', overflow: 'hidden', marginBottom: '18px', border: '1px solid var(--border-color)' }}>
            <div style={{
              height: '100%',
              width: `${((currentPyqIndex + 1) / activePracticeRule.pyqs.length) * 100}%`,
              background: 'var(--primary)',
              transition: 'width 0.25s ease'
            }} />
          </div>

          {/* Main Question Card */}
          <div style={{ 
            background: 'var(--bg-surface)', 
            border: '1px solid var(--border-color)', 
            borderRadius: 'var(--radius-lg)', 
            padding: '24px 22px', 
            marginBottom: '18px',
            boxShadow: 'var(--shadow-sm)'
          }}>
            {/* Exam Tag */}
            {activePracticeRule.pyqs[currentPyqIndex]?.examTag && (
              <div style={{ 
                display: 'inline-flex', 
                alignItems: 'center', 
                gap: '6px', 
                fontSize: '0.76rem', 
                fontWeight: 700, 
                color: 'var(--primary)', 
                background: 'var(--primary-light)', 
                padding: '4px 10px', 
                borderRadius: '6px', 
                border: '1px solid var(--primary-border)', 
                marginBottom: '16px' 
              }}>
                <Tag size={13} />
                <span>{activePracticeRule.pyqs[currentPyqIndex].examTag}</span>
              </div>
            )}

            {/* Smart Question Canvas with Dynamic Topic Formats & Real-time Live Blank Preview */}
            <SmartQuestionCanvas
              question={activePracticeRule.pyqs[currentPyqIndex] as any}
              selectedOption={selectedOption ?? undefined}
              onSelectOption={(optIdx) => {
                if (selectedOption === null) {
                  setSelectedOption(optIdx);
                  setShowExplanation(true);
                }
              }}
              showExplanation={showExplanation}
            />

            {/* Options List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '18px' }}>
              {activePracticeRule.pyqs[currentPyqIndex]?.options.map((optionText, optIdx) => {
                const isSelected = selectedOption === optIdx;
                const isCorrect = optIdx === activePracticeRule.pyqs![currentPyqIndex].correctAnswer;
                const hasAnswered = selectedOption !== null;

                let btnBg = 'var(--bg-surface-elevated)';
                let btnBorder = 'var(--border-color)';
                let btnColor = 'var(--text-main)';
                let icon = null;

                if (hasAnswered) {
                  if (isCorrect) {
                    btnBg = 'var(--success-bg)';
                    btnBorder = 'var(--success-border)';
                    btnColor = 'var(--text-main)';
                    icon = <CheckCircle2 size={18} color="var(--success)" style={{ flexShrink: 0 }} />;
                  } else if (isSelected && !isCorrect) {
                    btnBg = 'var(--error-bg)';
                    btnBorder = 'var(--error-border)';
                    btnColor = 'var(--text-main)';
                    icon = <XCircle size={18} color="var(--error)" style={{ flexShrink: 0 }} />;
                  }
                }

                return (
                  <button
                    key={optIdx}
                    onClick={() => {
                      if (!hasAnswered) {
                        setSelectedOption(optIdx);
                        setShowExplanation(true);
                      }
                    }}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      borderRadius: 'var(--radius-sm)',
                      background: btnBg,
                      border: `1.5px solid ${btnBorder}`,
                      color: btnColor,
                      fontSize: '0.92rem',
                      fontWeight: 600,
                      textAlign: 'left',
                      cursor: hasAnswered ? 'default' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '12px',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <span style={{ flex: 1, minWidth: 0, wordBreak: 'break-word', whiteSpace: 'normal', lineHeight: 1.5 }}>
                      <strong style={{ 
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '22px',
                        height: '22px',
                        borderRadius: '4px',
                        background: isSelected || (hasAnswered && isCorrect) ? 'transparent' : 'var(--bg-primary)',
                        border: '1px solid var(--border-color)',
                        fontSize: '0.78rem',
                        fontWeight: 800,
                        marginRight: '8px'
                      }}>
                        {String.fromCharCode(65 + optIdx)}
                      </strong> 
                      {optionText}
                    </span>
                    {icon}
                  </button>
                );
              })}
            </div>

            {/* Explanation Toggle & Content */}
            {selectedOption !== null && (
              <div style={{ marginTop: '14px' }}>
                <button
                  onClick={() => setShowExplanation(prev => !prev)}
                  className="btn-secondary"
                  style={{
                    fontSize: '0.82rem',
                    padding: '6px 14px',
                    marginBottom: '10px'
                  }}
                >
                  <Lightbulb size={15} color="var(--accent)" />
                  <span>{showExplanation ? 'Hide Detailed Solution' : 'View Detailed Solution'}</span>
                </button>

                {showExplanation && activePracticeRule.pyqs[currentPyqIndex]?.explanation && (
                  <div style={{ 
                    background: 'var(--bg-surface-elevated)', 
                    border: '1px solid var(--border-color)', 
                    borderRadius: 'var(--radius-sm)', 
                    padding: '16px 18px', 
                    lineHeight: 1.6, 
                    fontSize: '0.92rem', 
                    color: 'var(--text-main)', 
                    borderLeft: '4px solid var(--primary)',
                    boxShadow: 'var(--shadow-xs)'
                  }}>
                    <div style={{ fontSize: '0.84rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Lightbulb size={15} /> Solution Explanation & Rule Breakdown:
                    </div>
                    {renderFormattedExplanation(activePracticeRule.pyqs[currentPyqIndex].explanation)}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Bottom Quiz Navigation Controls */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', flexWrap: 'wrap' }}>
            <button
              onClick={() => {
                if (currentPyqIndex > 0) {
                  setCurrentPyqIndex(prev => prev - 1);
                  setSelectedOption(null);
                  setShowExplanation(false);
                }
              }}
              disabled={currentPyqIndex === 0}
              className="btn-secondary"
              style={{
                opacity: currentPyqIndex === 0 ? 0.4 : 1,
                cursor: currentPyqIndex === 0 ? 'not-allowed' : 'pointer'
              }}
            >
              <ChevronLeft size={16} />
              <span>Previous</span>
            </button>

            <button
              onClick={() => {
                if (activePracticeRule?.pyqs && currentPyqIndex < activePracticeRule.pyqs.length - 1) {
                  setCurrentPyqIndex(prev => prev + 1);
                  setSelectedOption(null);
                  setShowExplanation(false);
                }
              }}
              disabled={Boolean(activePracticeRule?.pyqs && currentPyqIndex === activePracticeRule.pyqs.length - 1)}
              className="btn-primary"
              style={{
                opacity: (activePracticeRule?.pyqs && currentPyqIndex === activePracticeRule.pyqs.length - 1) ? 0.4 : 1,
                cursor: (activePracticeRule?.pyqs && currentPyqIndex === activePracticeRule.pyqs.length - 1) ? 'not-allowed' : 'pointer'
              }}
            >
              <span>Next</span>
              <ChevronRight size={16} />
            </button>
          </div>

        </div>
      ) : (
        /* ─── SCENARIO B: MAIN 120 RULES DASHBOARD & CARDS ─── */
        <>
          {/* Solid Clean Hero Header */}
          <div style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-color)',
            borderRadius: '14px',
            padding: '14px 16px',
            marginBottom: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '10px',
            boxShadow: 'var(--shadow-xs)',
            width: '100%',
            boxSizing: 'border-box'
          }}>
            <div style={{ minWidth: 0, flex: '1 1 auto' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                <span style={{
                  fontSize: '9.5px',
                  fontWeight: 800,
                  color: 'var(--primary)',
                  background: 'var(--primary-light)',
                  padding: '1px 6px',
                  borderRadius: '4px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '3px'
                }}>
                  <Zap size={11} />
                  <span>Grammar Rules</span>
                </span>
                <span style={{
                  fontSize: '9.5px',
                  fontWeight: 800,
                  color: '#f59e0b',
                  background: 'rgba(245, 158, 11, 0.12)',
                  padding: '1px 6px',
                  borderRadius: '4px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '3px'
                }}>
                  <Sparkles size={11} />
                  <span>120 Golden Rules</span>
                </span>
              </div>
              <h1 style={{ fontSize: '17px', fontWeight: 800, margin: '0 0 2px 0', letterSpacing: '-0.01em', color: 'var(--text-main)' }}>
                120 Golden Rules <span className="gradient-text">of English Grammar</span>
              </h1>
              <p style={{ fontSize: '11.5px', color: 'var(--text-dim)', margin: 0, lineHeight: 1.4 }}>
                Master complete theory, core formulas, common exam traps & practice authentic SSC PYQs.
              </p>
            </div>

            {/* Quick Rule Grid Opener Button */}
            <button
              onClick={() => setShowRuleGridModal(true)}
              style={{
                padding: '6px 12px',
                borderRadius: '8px',
                background: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-main)',
                fontWeight: 700,
                fontSize: '11.5px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                cursor: 'pointer',
                flexShrink: 0
              }}
            >
              <Grid size={14} color="var(--primary)" />
              <span>Jump to Rule (1–120)</span>
            </button>
          </div>

          {/* Mode & Language Bar */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: '12px',
            marginBottom: '16px',
            flexWrap: 'wrap'
          }}>
            {/* Language & View Segmented Controls */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              {/* Language Switcher */}
              <div className="segmented-control">
                <button
                  onClick={() => setRuleLanguage('english')}
                  className={ruleLanguage === 'english' ? 'active' : ''}
                >
                  English
                </button>
                <button
                  onClick={() => setRuleLanguage('hindi')}
                  className={ruleLanguage === 'hindi' ? 'active' : ''}
                >
                  हिंदी Notes
                </button>
              </div>

              {/* View Switcher */}
              <div className="segmented-control">
                <button
                  onClick={() => setViewMode('card')}
                  className={viewMode === 'card' ? 'active' : ''}
                  title="Card View"
                >
                  Card
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={viewMode === 'list' ? 'active' : ''}
                  title="List View"
                >
                  List
                </button>
              </div>
            </div>
          </div>

          {/* Quick Jump Rule Grid Modal (Clean Solid Popup) */}
          {showRuleGridModal && (
            <div style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'var(--bg-modal-overlay)',
              zIndex: 1000,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '16px'
            }}>
              <div style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-lg)',
                padding: '22px',
                maxWidth: '640px',
                width: '100%',
                maxHeight: '85vh',
                overflowY: 'auto',
                boxShadow: 'var(--shadow-lg)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <BookMarked size={18} color="var(--primary)" />
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>Jump to Golden Rule (1–120)</h3>
                  </div>
                  <button
                    onClick={() => setShowRuleGridModal(false)}
                    style={{
                      background: 'var(--bg-surface-elevated)',
                      border: '1px solid var(--border-color)',
                      color: 'var(--text-muted)',
                      borderRadius: 'var(--radius-xs)',
                      padding: '5px 10px',
                      fontWeight: 700,
                      fontSize: '0.8rem'
                    }}
                  >
                    Close
                  </button>
                </div>

                <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginBottom: '14px' }}>
                  Select any rule number to view theory, formulas, and dedicated practice questions.
                </p>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(46px, 1fr))',
                  gap: '6px'
                }}>
                  {grammarRules.map(rule => {
                    const isCurrent = activeRule && activeRule.id === rule.id;
                    return (
                      <button
                        key={rule.id}
                        onClick={() => handleJumpToRule(rule.id)}
                        style={{
                          height: '38px',
                          borderRadius: '6px',
                          background: isCurrent ? 'var(--primary)' : 'var(--bg-surface-elevated)',
                          color: isCurrent ? '#ffffff' : 'var(--text-main)',
                          border: isCurrent ? '1px solid var(--primary)' : '1px solid var(--border-color)',
                          fontWeight: 800,
                          fontSize: '0.82rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          transition: 'all 0.1s ease'
                        }}
                      >
                        {rule.id}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ─── CARD VIEW ─── */}
          {viewMode === 'card' && filteredRules.length > 0 && activeRule && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              {/* Solid Master Rule Card with Touch & Swipe Gestures */}
              <div 
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
                style={{
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '14px',
                  padding: '14px 16px',
                  boxShadow: 'var(--shadow-xs)',
                  position: 'relative',
                  touchAction: 'pan-y'
                }}
              >
                {/* Top Rule Bar */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px', flexWrap: 'wrap', gap: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                    <span style={{ 
                      background: 'var(--primary)', 
                      color: '#ffffff', 
                      fontSize: '9.5px', 
                      fontWeight: 800, 
                      padding: '2px 7px', 
                      borderRadius: '5px',
                      letterSpacing: '0.04em'
                    }}>
                      RULE {activeRule.id < 10 ? `0${activeRule.id}` : activeRule.id}
                    </span>
                    <span style={{ 
                      fontSize: '9.5px', 
                      fontWeight: 700, 
                      color: 'var(--text-dim)', 
                      background: 'var(--bg-surface-elevated)', 
                      padding: '2px 7px', 
                      borderRadius: '5px', 
                      border: '1px solid var(--border-color)' 
                    }}>
                      {activeRule.category}
                    </span>
                  </div>

                  <div style={{ fontSize: '10.5px', fontWeight: 700, color: 'var(--text-dim)' }}>
                    Rule {activeRuleIndex + 1} of {filteredRules.length}
                  </div>
                </div>

                {/* Rule Title */}
                {renderSmartRuleTitle(activeRule.title)}

                {/* Formula Box */}
                {activeRule.formula && renderSmartFormulaBox(activeRule.formula)}

                {/* Core Concept & Explanation */}
                <div style={{ marginBottom: '14px', lineHeight: 1.55 }}>
                  {ruleLanguage === 'hindi' && activeRule.hindiExplanation ? (
                    <div>
                      <div style={{ fontSize: '10.5px', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Languages size={12} /> हिंदी व्याख्या (Exam Notes):
                      </div>
                      {renderFormattedHindiExplanation(activeRule.hindiExplanation)}
                    </div>
                  ) : (
                    <div>
                      <div style={{ fontSize: '10.5px', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <BookOpen size={12} /> Concept & Grammar Rule Breakdown:
                      </div>
                      {renderSmartRuleDescription(activeRule.ruleDescription)}
                    </div>
                  )}
                </div>

                {/* Solid Incorrect vs Correct SSC Comparison Cards */}
                {activeRule.incorrectExample && activeRule.correctExample && (
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', 
                    gap: '8px', 
                    marginBottom: '14px' 
                  }}>
                    {/* Common Mistake Card */}
                    <div style={{ 
                      background: 'var(--error-bg)', 
                      border: '1px solid var(--error-border)', 
                      borderLeft: '3px solid var(--error)',
                      borderRadius: '8px', 
                      padding: '10px 12px' 
                    }}>
                      <div style={{ fontSize: '10px', fontWeight: 800, color: 'var(--error)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <XCircle size={12} /> Common Mistake (Incorrect)
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text-main)', fontStyle: 'italic', lineHeight: 1.45 }}>
                        "{activeRule.incorrectExample?.replace(/^[*\-+\s"']+|[*\-+\s"']+$/g, '').trim()}"
                      </div>
                    </div>

                    {/* SSC Correct Card */}
                    <div style={{ 
                      background: 'var(--success-bg)', 
                      border: '1px solid var(--success-border)', 
                      borderLeft: '3px solid #10b981',
                      borderRadius: '8px', 
                      padding: '10px 12px' 
                    }}>
                      <div style={{ fontSize: '10px', fontWeight: 800, color: '#10b981', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <CheckCircle2 size={12} /> SSC Standard (Correct)
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text-main)', fontWeight: 700, lineHeight: 1.45 }}>
                        "{activeRule.correctExample?.replace(/^[*\-+\s"']+|[*\-+\s"']+$/g, '').trim()}"
                      </div>
                    </div>
                  </div>
                )}

                {/* Additional Real-Exam Variations & Edge Cases */}
                {activeRule.moreExamples && activeRule.moreExamples.length > 0 && (
                  <div style={{ marginBottom: '14px' }}>
                    <div style={{ fontSize: '10.5px', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Sparkles size={12} /> Additional Real-Exam Variations:
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {activeRule.moreExamples.map((ex, exIdx) => (
                        <div key={exIdx} style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '8px 10px' }}>
                          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', color: 'var(--error)', fontSize: '11.5px', textDecoration: 'line-through', opacity: 0.88, marginBottom: '3px', lineHeight: 1.4 }}>
                            <XCircle size={12} style={{ flexShrink: 0, marginTop: '2px' }} />
                            <span>{ex.incorrect}</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', color: '#10b981', fontSize: '12px', fontWeight: 700, marginBottom: ex.note ? '4px' : '0', lineHeight: 1.4 }}>
                            <CheckCircle2 size={12} style={{ flexShrink: 0, marginTop: '2px' }} />
                            <span>{ex.correct}</span>
                          </div>
                          {ex.note && (
                            <div style={{ fontSize: '11px', color: 'var(--text-dim)', background: 'var(--bg-surface)', padding: '5px 8px', borderRadius: '5px', border: '1px solid var(--border-color)', marginTop: '4px', lineHeight: 1.4 }}>
                              💡 <strong>Exam Note:</strong> {ex.note}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Practice Quiz Launcher CTA */}
                <div style={{ 
                  background: 'var(--bg-surface-elevated)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '10px',
                  padding: '10px 12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '12px'
                }}>
                  <div>
                    <div style={{ fontSize: '0.98rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '2px' }}>
                      ⚡ Practice Rule {activeRule.id} Questions
                    </div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                      Test your mastery with {activeRule.pyqs?.length || 0} real exam questions.
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setCurrentPyqIndex(0);
                      setSelectedOption(null);
                      setShowExplanation(false);
                      setActivePracticeRule(activeRule);
                    }}
                    className="btn-primary"
                    style={{
                      padding: '10px 18px',
                      fontSize: '0.88rem'
                    }}
                  >
                    <Target size={16} />
                    <span>Start Practice ({activeRule.pyqs?.length || 0} Qs)</span>
                    <ChevronRight size={15} />
                  </button>
                </div>

              </div>

              {/* Bottom Card Navigation Controls */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '12px',
                marginTop: '8px'
              }}>
                {/* Prev and Next Buttons Pair */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '12px',
                  width: '100%'
                }}>
                  <button
                    onClick={handlePrevRule}
                    disabled={activeRuleIndex === 0}
                    className="btn-secondary"
                    style={{
                      flex: '1',
                      maxWidth: '220px',
                      padding: '10px 18px',
                      fontSize: '0.9rem',
                      fontWeight: 700,
                      opacity: activeRuleIndex === 0 ? 0.4 : 1,
                      cursor: activeRuleIndex === 0 ? 'not-allowed' : 'pointer'
                    }}
                  >
                    <ChevronLeft size={18} />
                    <span>Previous Rule</span>
                  </button>

                  <button
                    onClick={handleNextRule}
                    disabled={activeRuleIndex === filteredRules.length - 1}
                    className="btn-primary"
                    style={{
                      flex: '1',
                      maxWidth: '220px',
                      padding: '10px 18px',
                      fontSize: '0.9rem',
                      fontWeight: 700,
                      opacity: activeRuleIndex === filteredRules.length - 1 ? 0.4 : 1,
                      cursor: activeRuleIndex === filteredRules.length - 1 ? 'not-allowed' : 'pointer'
                    }}
                  >
                    <span>Next Rule</span>
                    <ChevronRight size={18} />
                  </button>
                </div>

                {/* Rule X of 120 Jump Button Placed Below */}
                <button
                  onClick={() => setShowRuleGridModal(true)}
                  style={{
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-color)',
                    padding: '7px 16px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <span>Rule {activeRuleIndex + 1} of {filteredRules.length}</span>
                  <span style={{ color: 'var(--primary)', fontWeight: 800 }}>• Jump to (1–120) ↗</span>
                </button>
              </div>

            </div>
          )}

          {/* ─── LIST VIEW ─── */}
          {viewMode === 'list' && filteredRules.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {filteredRules.map((rule) => (
                <div
                  key={rule.id}
                  style={{
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                    padding: '18px 20px',
                    boxShadow: 'var(--shadow-xs)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px', flexWrap: 'wrap', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ 
                        background: 'var(--primary)', 
                        color: '#fff', 
                        fontSize: '0.74rem', 
                        fontWeight: 800, 
                        padding: '2px 8px', 
                        borderRadius: '4px' 
                      }}>
                        Rule {rule.id}
                      </span>
                      <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                        {rule.category}
                      </span>
                    </div>

                    <button
                      onClick={() => {
                        setCurrentPyqIndex(0);
                        setSelectedOption(null);
                        setActivePracticeRule(rule);
                      }}
                      className="btn-secondary"
                      style={{
                        padding: '5px 10px',
                        fontSize: '0.76rem'
                      }}
                    >
                      <Target size={13} color="var(--primary)" />
                      <span>Practice ({rule.pyqs?.length || 10} Qs)</span>
                    </button>
                  </div>

                  {/* Rule Title */}
                  {renderSmartRuleTitle(rule.title, true)}

                  {rule.formula && renderSmartFormulaBox(rule.formula)}

                  <div style={{ marginBottom: '12px', fontSize: '0.9rem', color: 'var(--text-main)' }}>
                    {ruleLanguage === 'hindi' && rule.hindiExplanation ? (
                      renderFormattedHindiExplanation(rule.hindiExplanation)
                    ) : (
                      renderSmartRuleDescription(rule.ruleDescription)
                    )}
                  </div>

                  {rule.incorrectExample && rule.correctExample && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '8px', fontSize: '0.84rem' }}>
                      <div style={{ background: 'var(--error-bg)', color: 'var(--text-main)', padding: '8px 10px', borderRadius: '6px', border: '1px solid var(--error-border)' }}>
                        <strong style={{ textDecoration: 'line-through' }}>✖ {rule.incorrectExample}</strong>
                      </div>
                      <div style={{ background: 'var(--success-bg)', color: 'var(--text-main)', padding: '8px 10px', borderRadius: '6px', border: '1px solid var(--success-border)' }}>
                        <strong>✔ {rule.correctExample}</strong>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* No Rules Found State */}
          {filteredRules.length === 0 && (
            <div style={{
              textAlign: 'center',
              padding: '48px 20px',
              background: 'var(--bg-surface)',
              border: '1px dashed var(--border-color)',
              borderRadius: 'var(--radius-lg)'
            }}>
              <Search size={36} color="var(--text-dim)" style={{ marginBottom: '10px' }} />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '4px' }}>No rules match your search</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '14px' }}>
                Try searching for another keyword or reset the category filter.
              </p>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('All');
                }}
                className="btn-primary"
                style={{ fontSize: '0.85rem' }}
              >
                <RotateCcw size={15} />
                <span>Reset All Filters</span>
              </button>
            </div>
          )}

        </>
      )}

    </div>
  );
};

export default GrammarRules;
