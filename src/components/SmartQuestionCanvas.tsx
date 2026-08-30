import React from 'react';
import type { Question } from '../types/quiz';
import { 
  Sparkles, 
  AlertCircle, 
  BookOpen, 
  Layers, 
  Edit3, 
  CheckSquare,
  HelpCircle
} from 'lucide-react';

interface SmartQuestionCanvasProps {
  question: Question;
  selectedOption: number | null | undefined;
  onSelectOption: (optionIndex: number) => void;
  showExplanation?: boolean;
  activePassage?: string;
  blankNumber?: number;
}

// Helper to intelligently separate question instructions from the actual target sentence/phrase
function separateInstructionAndSentence(rawText: string, topic?: string): { instruction: string; sentence: string } {
  let text = (rawText || '').trim();

  // Strip leading generic wrappers like 'Fill in the blank: "'
  text = text.replace(/^(?:Fill in the blank[s]?:?\s*)+/i, '').trim();
  text = text.replace(/^["']|["']$/g, '').trim();

  // Pattern matching standard SSC instructions/directions at the start
  const instructionRegex = /^(Select the most appropriate [^\.\?\:\n]+[\.\?\:\n]|Identify the [^\.\?\:\n]+[\.\?\:\n]|In the following (?:sentence|question)[^\.\?\:\n]+[\.\?\:\n]|Parts of the following [^\.\?\:\n]+[\.\?\:\n]|The following sentence has been [^\.\?\:\n]+[\.\?\:\n]|Select the option that [^\.\?\:\n]+[\.\?\:\n]|Select the option [^\.\?\:\n]+[\.\?\:\n]|Choose the [^\.\?\:\n]+[\.\?\:\n]|Select the sentence [^\.\?\:\n]+[\.\?\:\n]|Select the correctly [^\.\?\:\n]+[\.\?\:\n]|Select the incorrectly [^\.\?\:\n]+[\.\?\:\n]|Select the INCORRECTLY [^\.\?\:\n]+[\.\?\:\n]|Select the CORRECTLY [^\.\?\:\n]+[\.\?\:\n]|Substitute the [^\.\?\:\n]+[\.\?\:\n]|Improve the [^\.\?\:\n]+[\.\?\:\n]|Find the [^\.\?\:\n]+[\.\?\:\n]|Identify the segment [^\.\?\:\n]+[\.\?\:\n]|Select ONE WORD [^\.\?\:\n]+[\.\?\:\n]|One of the [^\.\?\:\n]+[\.\?\:\n]|If there is no error[^\.\?\:\n]+[\.\?\:\n])/i;

  const match = text.match(instructionRegex);
  let instruction = '';
  let sentence = text;

  if (match) {
    instruction = match[1].trim();
    sentence = text.substring(match[0].length).trim();
  }

  // Clean trailing/leading quotes from sentence
  sentence = sentence.replace(/^["']|["']$/g, '').trim();

  // Fallback if sentence ended up empty
  if (!sentence && instruction) {
    sentence = instruction;
    instruction = '';
  }

  // Default clean instructions per topic if not explicitly specified
  if (!instruction) {
    if (topic === 'fill_blanks') {
      instruction = 'Select the most appropriate option to fill in the blank.';
    } else if (topic === 'spot_error') {
      instruction = 'Identify the segment in the sentence which contains a grammatical error.';
    } else if (topic === 'sentence_improvement') {
      instruction = 'Select the most appropriate option to substitute the underlined / highlighted segment.';
    } else if (topic === 'one_word') {
      instruction = 'Select the option that can be used as a one-word substitute for the given group of words.';
    } else if (topic === 'idioms_phrases') {
      instruction = 'Select the option that best expresses the figurative meaning of the given idiom.';
    } else if (topic === 'synonyms') {
      instruction = 'Select the most appropriate SYNONYM of the given word:';
    } else if (topic === 'antonyms') {
      instruction = 'Select the most appropriate ANTONYM of the given word:';
    } else if (topic === 'misspelled') {
      const isCorrect = sentence.toLowerCase().includes('correct') && !sentence.toLowerCase().includes('incorrect');
      instruction = isCorrect ? 'Select the CORRECTLY spelt word:' : 'Select the INCORRECTLY spelt word:';
    }
  }

  return { instruction, sentence };
}

export const SmartQuestionCanvas: React.FC<SmartQuestionCanvasProps> = ({
  question,
  selectedOption,
  onSelectOption: _onSelectOption,
  showExplanation: _showExplanation = false
}) => {
  const qText = (question.questionText || '').trim();
  const topic = question.topic;
  const hasSelected = selectedOption !== null && selectedOption !== undefined;
  const currentPreviewWord = hasSelected ? question.options[selectedOption!] : null;

  const { instruction, sentence } = separateInstructionAndSentence(qText, topic);

  // Helper to format underlined / bold segments in sentences
  const renderSentenceWithUnderline = (text: string) => {
    if (!text) return null;
    const parts = text.split(/(\*\*[^*]+\*\*|__[^_]+__|<u>[^<]+<\/u>)/g);
    return parts.map((part, idx) => {
      if ((part.startsWith('**') && part.endsWith('**')) || (part.startsWith('__') && part.endsWith('__'))) {
        const inner = part.slice(2, -2);
        return (
          <span
            key={idx}
            style={{
              textDecoration: 'underline',
              textDecorationThickness: '3px',
              textDecorationColor: 'var(--primary)',
              textUnderlineOffset: '4px',
              fontWeight: 800,
              color: 'var(--primary)',
              padding: '0 3px',
              background: 'var(--primary-light)',
              borderRadius: '4px'
            }}
          >
            {inner}
          </span>
        );
      }
      if (part.startsWith('<u>') && part.endsWith('</u>')) {
        const inner = part.slice(3, -4);
        return (
          <span
            key={idx}
            style={{
              textDecoration: 'underline',
              textDecorationThickness: '3px',
              textDecorationColor: 'var(--primary)',
              textUnderlineOffset: '4px',
              fontWeight: 800,
              color: 'var(--primary)',
              padding: '0 3px',
              background: 'var(--primary-light)',
              borderRadius: '4px'
            }}
          >
            {inner}
          </span>
        );
      }
      return <span key={idx}>{part}</span>;
    });
  };

  // ─────────────────────────────────────────────────────────────
  // 1. FILL IN THE BLANKS (Instruction on Top + Dynamic Sentence Card Below)
  // ─────────────────────────────────────────────────────────────
  if (topic === 'fill_blanks' || qText.toLowerCase().includes('fill in the blank') || qText.includes('___') || qText.includes('________')) {
    let cleanSentence = sentence;
    if (cleanSentence.includes(', ,') || cleanSentence.includes(',  ,')) {
      cleanSentence = cleanSentence.replace(/,\s*,/g, '________').replace(/\s*_{3,}\s*\./g, '.');
    }

    if (!cleanSentence.includes('___') && !cleanSentence.includes('________')) {
      cleanSentence = cleanSentence.replace(/\.?$/, ' ________.');
    }

    const parts = cleanSentence.split(/(_{3,}|________)/);

    return (
      <div style={{ marginBottom: '10px' }}>
        {/* Instruction Header */}
        <div style={{
          background: 'var(--primary-light)',
          border: '1px solid var(--border-color)',
          borderRadius: '8px',
          padding: '6px 10px',
          marginBottom: '8px',
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}>
          <Edit3 size={13} color="var(--primary)" style={{ flexShrink: 0 }} />
          <div style={{ fontSize: '11.5px', color: 'var(--text-main)', fontWeight: 600, lineHeight: 1.3 }}>
            {instruction}
          </div>
        </div>

        {/* Target Sentence Card */}
        <div style={{
          fontSize: '14px',
          lineHeight: 1.5,
          color: 'var(--text-main)',
          fontWeight: 600,
          background: 'var(--bg-surface-elevated)',
          padding: '12px 14px',
          borderRadius: '10px',
          border: '1px solid var(--border-color)',
          borderLeft: '4px solid var(--primary)'
        }}>
          {parts.map((part, i) => {
            if (part.startsWith('___') || part.includes('___') || part === '________') {
              return (
                <span
                  key={i}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '2px 8px',
                    margin: '0 4px',
                    borderRadius: '6px',
                    background: currentPreviewWord ? 'var(--primary)' : 'var(--primary-light)',
                    color: currentPreviewWord ? '#ffffff' : 'var(--primary)',
                    border: currentPreviewWord ? '1.5px solid var(--primary)' : '1.5px dashed var(--primary)',
                    fontWeight: 800,
                    fontSize: '12.5px',
                    verticalAlign: 'baseline',
                    minWidth: '70px',
                    textAlign: 'center'
                  }}
                >
                  {currentPreviewWord ? (
                    <span>{currentPreviewWord}</span>
                  ) : (
                    <span>✍️ [ Blank ]</span>
                  )}
                </span>
              );
            }
            return <span key={i}>{part}</span>;
          })}
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // 2. SPOT THE ERROR (Instruction on Top + Segmented Sentence Below)
  // ─────────────────────────────────────────────────────────────
  if (topic === 'spot_error' || qText.toLowerCase().includes('identify the segment')) {
    const segments = sentence.split(/\s*\/\s*/).filter(Boolean);

    return (
      <div style={{ marginBottom: '10px' }}>
        {/* Instruction Header */}
        <div style={{
          background: 'var(--error-bg)',
          border: '1px solid var(--error-border)',
          borderRadius: '8px',
          padding: '5px 10px',
          marginBottom: '6px',
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}>
          <AlertCircle size={13} color="#ef4444" style={{ flexShrink: 0 }} />
          <div style={{ fontSize: '11px', color: 'var(--text-main)', fontWeight: 600, lineHeight: 1.3 }}>
            {instruction}
          </div>
        </div>

        {/* Target Sentence Card */}
        <div style={{
          background: 'var(--bg-surface-elevated)',
          padding: '10px 14px',
          borderRadius: '10px',
          border: '1px solid var(--border-color)',
          borderLeft: '4px solid #ef4444',
          fontSize: '14px',
          lineHeight: 1.45,
          color: 'var(--text-main)',
          fontWeight: 600
        }}>
          {segments.length > 1 ? (
            <span>
              {segments.map((seg, sIdx) => (
                <React.Fragment key={sIdx}>
                  <span>{renderSentenceWithUnderline(seg.trim())}</span>
                  {sIdx < segments.length - 1 && (
                    <span style={{
                      display: 'inline-block',
                      margin: '0 6px',
                      color: '#ef4444',
                      fontWeight: 800
                    }}>
                      /
                    </span>
                  )}
                </React.Fragment>
              ))}
            </span>
          ) : (
            <span>{renderSentenceWithUnderline(sentence)}</span>
          )}
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // 3. SYNONYMS & ANTONYMS (Instruction on Top + Prominent Target Word Banner)
  // ─────────────────────────────────────────────────────────────
  if (topic === 'synonyms' || topic === 'antonyms') {
    const isSynonym = topic === 'synonyms';
    let targetWord = sentence.replace(/^["']|["']$/g, '').trim();
    const m = targetWord.match(/["']([^"']+)["']/);
    if (m) targetWord = m[1];

    const themeColor = isSynonym ? '#10b981' : '#f43f5e';
    const themeBg = isSynonym ? 'var(--success-bg)' : 'var(--error-bg)';
    const themeBorder = isSynonym ? 'var(--success-border)' : 'var(--error-border)';

    return (
      <div style={{ marginBottom: '10px' }}>
        {/* Instruction Header */}
        <div style={{
          background: themeBg,
          border: `1px solid ${themeBorder}`,
          borderRadius: '8px',
          padding: '5px 10px',
          marginBottom: '6px',
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}>
          <Sparkles size={13} color={themeColor} style={{ flexShrink: 0 }} />
          <div style={{ fontSize: '11px', color: 'var(--text-main)', fontWeight: 600, lineHeight: 1.3 }}>
            {instruction}
          </div>
        </div>

        {/* Word Display Banner */}
        <div style={{
          background: themeBg,
          border: `1px solid ${themeBorder}`,
          borderRadius: '10px',
          padding: '12px 14px',
          textAlign: 'center'
        }}>
          <div style={{ 
            fontSize: '18px', 
            fontWeight: 900, 
            color: 'var(--text-main)', 
            letterSpacing: '0.8px',
            textTransform: 'uppercase',
            margin: '2px 0'
          }}>
            "{targetWord.toUpperCase()}"
          </div>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // 4. IDIOMS & PHRASES (Instruction on Top + Idiom Banner Below)
  // ─────────────────────────────────────────────────────────────
  if (topic === 'idioms_phrases') {
    let targetIdiom = sentence.replace(/^["']|["']$/g, '').trim();
    const m = targetIdiom.match(/["']([^"']+)["']/);
    if (m) targetIdiom = m[1];

    return (
      <div style={{ marginBottom: '10px' }}>
        {/* Instruction Header */}
        <div style={{
          background: 'var(--warning-bg)',
          border: '1px solid var(--warning-border)',
          borderRadius: '8px',
          padding: '5px 10px',
          marginBottom: '6px',
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}>
          <BookOpen size={13} color="var(--warning)" style={{ flexShrink: 0 }} />
          <div style={{ fontSize: '11px', color: 'var(--text-main)', fontWeight: 600, lineHeight: 1.3 }}>
            {instruction}
          </div>
        </div>

        {/* Idiom Phrase Card */}
        <div style={{
          background: 'var(--bg-surface-elevated)',
          border: '1px solid var(--border-color)',
          borderLeft: '4px solid var(--warning)',
          borderRadius: '10px',
          padding: '10px 14px'
        }}>
          <div style={{ 
            fontSize: '15px', 
            fontWeight: 800, 
            color: 'var(--text-main)', 
            lineHeight: 1.4
          }}>
            "{targetIdiom}"
          </div>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // 5. ONE WORD SUBSTITUTION (Instruction on Top + Phrase Below)
  // ─────────────────────────────────────────────────────────────
  if (topic === 'one_word') {
    let phrase = sentence.replace(/^["']|["']$/g, '').trim();
    const m = phrase.match(/["']([^"']+)["']/);
    if (m) phrase = m[1];

    return (
      <div style={{ marginBottom: '10px' }}>
        {/* Instruction Header */}
        <div style={{
          background: 'var(--primary-light)',
          border: '1px solid var(--border-color)',
          borderRadius: '8px',
          padding: '5px 10px',
          marginBottom: '6px',
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}>
          <Layers size={13} color="#8b5cf6" style={{ flexShrink: 0 }} />
          <div style={{ fontSize: '11px', color: 'var(--text-main)', fontWeight: 600, lineHeight: 1.3 }}>
            {instruction}
          </div>
        </div>

        {/* Group of Words Card */}
        <div style={{
          background: 'var(--bg-surface-elevated)',
          border: '1px solid var(--border-color)',
          borderLeft: '4px solid #8b5cf6',
          borderRadius: '10px',
          padding: '10px 14px'
        }}>
          <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-main)', lineHeight: 1.45 }}>
            "{phrase}"
          </div>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // 6. SPELLING ERRORS (Instruction on Top + Prompt Below)
  // ─────────────────────────────────────────────────────────────
  if (topic === 'misspelled') {
    const isIncorrect = qText.toLowerCase().includes('incorrect') || !qText.toLowerCase().includes('correctly');
    const color = isIncorrect ? '#f43f5e' : '#06b6d4';

    return (
      <div style={{ marginBottom: '10px' }}>
        {/* Instruction Header */}
        <div style={{
          background: isIncorrect ? 'var(--error-bg)' : 'var(--primary-light)',
          border: `1px solid ${isIncorrect ? 'var(--error-border)' : 'var(--border-color)'}`,
          borderRadius: '8px',
          padding: '5px 10px',
          marginBottom: '6px',
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}>
          <CheckSquare size={13} color={color} style={{ flexShrink: 0 }} />
          <div style={{ fontSize: '11px', color: 'var(--text-main)', fontWeight: 600, lineHeight: 1.3 }}>
            {instruction}
          </div>
        </div>

        {/* Prompt Card */}
        <div style={{
          background: 'var(--bg-surface-elevated)',
          border: '1px solid var(--border-color)',
          borderLeft: `4px solid ${color}`,
          borderRadius: '10px',
          padding: '10px 14px'
        }}>
          <div style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--text-main)', lineHeight: 1.45 }}>
            {isIncorrect 
              ? 'Find the word with the INCORRECT (wrong) spelling from the options below:' 
              : 'Find the word with the 100% CORRECT spelling from the options below:'}
          </div>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // 7. SENTENCE IMPROVEMENT (Instruction on Top + Target Sentence Below)
  // ─────────────────────────────────────────────────────────────
  if (topic === 'sentence_improvement') {
    return (
      <div style={{ marginBottom: '10px' }}>
        {/* Instruction Header */}
        <div style={{
          background: 'var(--primary-light)',
          border: '1px solid var(--border-color)',
          borderRadius: '8px',
          padding: '5px 10px',
          marginBottom: '6px',
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}>
          <Sparkles size={13} color="var(--primary)" style={{ flexShrink: 0 }} />
          <div style={{ fontSize: '11px', color: 'var(--text-main)', fontWeight: 600, lineHeight: 1.3 }}>
            {instruction}
          </div>
        </div>

        {/* Target Sentence Card */}
        <div style={{
          fontSize: '14px',
          lineHeight: 1.45,
          color: 'var(--text-main)',
          fontWeight: 600,
          background: 'var(--bg-surface-elevated)',
          padding: '10px 14px',
          borderRadius: '10px',
          border: '1px solid var(--border-color)',
          borderLeft: '4px solid var(--primary)'
        }}>
          {renderSentenceWithUnderline(sentence)}
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // DEFAULT / GENERAL
  // ─────────────────────────────────────────────────────────────
  return (
    <div style={{ marginBottom: '10px' }}>
      {instruction && instruction !== sentence && (
        <div style={{
          background: 'var(--bg-surface-elevated)',
          border: '1px solid var(--border-color)',
          borderRadius: '8px',
          padding: '5px 10px',
          marginBottom: '6px',
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}>
          <HelpCircle size={13} color="var(--primary)" style={{ flexShrink: 0 }} />
          <div style={{ fontSize: '11px', color: 'var(--text-main)', fontWeight: 600, lineHeight: 1.3 }}>
            {instruction}
          </div>
        </div>
      )}

      <div style={{
        fontSize: '14px',
        lineHeight: 1.45,
        color: 'var(--text-main)',
        fontWeight: 600,
        background: 'var(--bg-surface-elevated)',
        padding: '10px 14px',
        borderRadius: '10px',
        border: '1px solid var(--border-color)',
        borderLeft: '4px solid var(--primary)'
      }}>
        {renderSentenceWithUnderline(sentence)}
      </div>
    </div>
  );
};

