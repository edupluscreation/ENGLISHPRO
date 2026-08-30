import React, { useState, useEffect, useRef } from 'react';
import type { VocabItem } from '../types/quiz';

interface SmartExplanationProps {
  text: string;
}

// Lazy-loaded dictionaries — only fetched once, shared across all instances
let _hindiDict: Record<string, string> | null = null;
let _vocabItems: VocabItem[] | null = null;
let _dataLoadPromise: Promise<void> | null = null;

function loadDictionaries(): Promise<void> {
  if (_hindiDict && _vocabItems) return Promise.resolve();
  if (_dataLoadPromise) return _dataLoadPromise;

  _dataLoadPromise = Promise.all([
    import('../data/hindiDictionary.json').then(m => {
      _hindiDict = { ...(m.default || m) } as Record<string, string>;
    }).catch(() => { _hindiDict = {}; }),
    import('../data/vocabData').then(m => {
      return m.loadVocabData().then((items: VocabItem[]) => { _vocabItems = items; });
    }).catch(() => { _vocabItems = []; })
  ]).then(() => {});

  return _dataLoadPromise;
}

export const SmartExplanation: React.FC<SmartExplanationProps> = ({ text }) => {
  const [dataReady, setDataReady] = useState(_hindiDict !== null && _vocabItems !== null);

  useEffect(() => {
    if (!dataReady) {
      loadDictionaries().then(() => setDataReady(true));
    }
  }, [dataReady]);

  if (!text) return null;

  // Show explanation text immediately, dictionaries load in background for Hindi meanings
  const HINDI_DICT = _hindiDict || {};
  const VOCAB_ITEMS_LOCAL = _vocabItems || [];

  // Split text into logical sections by double newlines
  const rawSections = text
    .split(/\n\s*\n/)
    .map(s => s.trim())
    .filter(Boolean);

  // Helper to render inline markdown like **bold**, `code`, etc.
  const renderFormattedText = (str: string) => {
    if (!str) return null;
    const parts = str.split(/(\*\*[^*]+\*\*|`[^`]+`|\*[^*]+\*)/g);
    return parts.map((part, pIdx) => {
      if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
        return (
          <strong key={pIdx} style={{ color: 'var(--text-main)', fontWeight: 800 }}>
            {part.slice(2, -2).replace(/\*\*/g, '').replace(/\*/g, '')}
          </strong>
        );
      }
      if (part.startsWith('*') && part.endsWith('*') && part.length > 2) {
        return (
          <strong key={pIdx} style={{ color: 'var(--text-main)', fontWeight: 800 }}>
            {part.slice(1, -1).replace(/\*/g, '')}
          </strong>
        );
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return (
          <code 
            key={pIdx} 
            style={{ 
              background: 'var(--primary-light)', 
              color: 'var(--primary)', 
              padding: '2px 6px', 
              borderRadius: '4px', 
              fontSize: '11.5px',
              fontWeight: 700 
            }}
          >
            {part.slice(1, -1)}
          </code>
        );
      }
      const cleaned = part.replace(/\*\*/g, '').replace(/\*/g, '');
      return <span key={pIdx}>{cleaned}</span>;
    });
  };

  // Helper to render option meanings stacked cleanly one below another (A, B, C, D)
  const renderOptionsGrid = (sectionText: string) => {
    // Locate the first (A) to reliably ignore any preamble like (Options): or (Option Meanings):
    const startIdx = sectionText.search(/\([A-D]\)/);
    const optionsBody = startIdx !== -1 ? sectionText.slice(startIdx) : sectionText;

    // Robust regex to extract all options: (A) word : meaning
    const optionMatches = [...optionsBody.matchAll(/\(([A-D])\)\s*([^:•\n\(\)]+)(?::\s*([^•\n\(\)]+))?/g)];

    return (
      <div style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-color)',
        borderRadius: '10px',
        padding: '10px 12px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        marginTop: '6px'
      }}>
        <div style={{
          fontSize: '10.5px',
          fontWeight: 800,
          color: 'var(--text-dim)',
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
          display: 'flex',
          alignItems: 'center',
          gap: '5px'
        }}>
          <span>📝</span>
          <span>विकल्पों का अर्थ (Option Meanings)</span>
        </div>

        {/* Stacked Vertical List: Ek ke niche ek */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '6px',
          width: '100%'
        }}>
          {optionMatches.map((m, pIdx) => {
            const letter = m[1];
            const engWord = m[2].trim();
            const cleanEng = engWord.replace(/[^A-Za-z\s\-]/g, '').trim().toLowerCase();
            let hindiMeaning = (m[3] || '').trim();

            if (!hindiMeaning || hindiMeaning.includes('शब्दावली अर्थ') || hindiMeaning.includes('शुभकामनाओं')) {
              hindiMeaning = HINDI_DICT[cleanEng] || '';
            }

            if (!hindiMeaning) {
              const found = VOCAB_ITEMS_LOCAL.find(v => v.word.toLowerCase() === cleanEng);
              if (found && found.hindiMeaning && !found.hindiMeaning.includes('शब्दावली अर्थ')) {
                hindiMeaning = found.hindiMeaning;
              }
            }

            return (
              <div
                key={pIdx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: 'var(--bg-surface-elevated)',
                  border: '1px solid var(--border-color)',
                  padding: '7px 12px',
                  borderRadius: '8px',
                  fontSize: '12px',
                  minHeight: '34px',
                  boxSizing: 'border-box',
                  width: '100%'
                }}
              >
                <span style={{
                  fontSize: '10.5px',
                  fontWeight: 800,
                  color: 'var(--primary)',
                  background: 'var(--primary-light)',
                  padding: '2px 6px',
                  borderRadius: '5px',
                  flexShrink: 0
                }}>
                  {letter}
                </span>
                <span style={{ fontWeight: 700, color: 'var(--text-main)', whiteSpace: 'nowrap' }}>
                  {engWord}
                </span>
                {hindiMeaning && (
                  <span style={{ color: 'var(--text-dim)', fontSize: '11.5px' }}>
                    : {hindiMeaning}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Helper to render definition bullets if a section contains multiple definitions
  const renderDefinitionList = (sectionText: string) => {
    const lines = sectionText.split(/\n+/).map(l => l.trim()).filter(Boolean);

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {lines.map((line, lIdx) => {
          const cleanLine = line.replace(/^[•\-\*]\s*/, '').trim();
          const dashMatch = cleanLine.match(/^([A-Za-z\s]{2,25})\s*-\s*(.+)$/);

          if (dashMatch) {
            return (
              <div key={lIdx} style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', fontSize: '12px', lineHeight: 1.5 }}>
                <span style={{ color: 'var(--primary)', fontWeight: 800, flexShrink: 0, marginTop: '1px' }}>•</span>
                <div>
                  <strong style={{ color: 'var(--text-main)', marginRight: '4px' }}>{dashMatch[1].trim()}:</strong>
                  <span style={{ color: 'var(--text-main)' }}>{dashMatch[2].trim()}</span>
                </div>
              </div>
            );
          }

          return (
            <p key={lIdx} style={{ fontSize: '12px', lineHeight: 1.5, margin: 0, color: 'var(--text-main)' }}>
              {renderFormattedText(line)}
            </p>
          );
        })}
      </div>
    );
  };

  // Helper to render luxury structured Hindi explanation cards (Mistake, Rule, Correct Usage)
  const renderRichHindiSection = (sectionText: string) => {
    const lines = sectionText.split(/\n+/).map(l => l.trim()).filter(Boolean);
    const headerLine = lines[0] || '💡 हिन्दी व्याख्या';
    const bulletLines = lines.slice(1);

    return (
      <div style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-color)',
        borderRadius: '10px',
        padding: '12px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        marginTop: '6px'
      }}>
        {/* Section Header */}
        <div style={{
          fontSize: '11px',
          fontWeight: 800,
          color: 'var(--primary)',
          letterSpacing: '0.03em',
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}>
          <span>💡</span>
          <span>{headerLine.replace(/^[💡\*\s]+/, '')}</span>
        </div>

        {/* If structured bullets exist */}
        {bulletLines.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {bulletLines.map((line, bIdx) => {
              const cleanBullet = line.replace(/^[•\-\*]\s*/, '').trim();

              // 1. Error / Mistake Card (Amber / Red accent)
              if (cleanBullet.includes('गलती') || cleanBullet.includes('Mistake') || cleanBullet.includes('अशुद्ध')) {
                return (
                  <div
                    key={bIdx}
                    style={{
                      background: 'rgba(239, 68, 68, 0.06)',
                      border: '1px solid rgba(239, 68, 68, 0.2)',
                      borderLeft: '3px solid #ef4444',
                      padding: '8px 10px',
                      borderRadius: '6px',
                      fontSize: '12px',
                      lineHeight: 1.5,
                      color: 'var(--text-main)'
                    }}
                  >
                    {renderFormattedText(cleanBullet)}
                  </div>
                );
              }

              // 2. SSC Rule Card (Indigo accent)
              if (cleanBullet.includes('नियम') || cleanBullet.includes('Rule') || cleanBullet.includes('व्याकरण')) {
                return (
                  <div
                    key={bIdx}
                    style={{
                      background: 'rgba(99, 102, 241, 0.06)',
                      border: '1px solid rgba(99, 102, 241, 0.25)',
                      borderLeft: '3px solid var(--primary)',
                      padding: '8px 10px',
                      borderRadius: '6px',
                      fontSize: '12px',
                      lineHeight: 1.5,
                      color: 'var(--text-main)'
                    }}
                  >
                    {renderFormattedText(cleanBullet)}
                  </div>
                );
              }

              // 3. Correct Usage / Form Card (Emerald green accent)
              if (cleanBullet.includes('शुद्ध') || cleanBullet.includes('Correct') || cleanBullet.includes('सही')) {
                return (
                  <div
                    key={bIdx}
                    style={{
                      background: 'rgba(16, 185, 129, 0.06)',
                      border: '1px solid rgba(16, 185, 129, 0.25)',
                      borderLeft: '3px solid #10b981',
                      padding: '8px 10px',
                      borderRadius: '6px',
                      fontSize: '12px',
                      lineHeight: 1.5,
                      color: 'var(--text-main)'
                    }}
                  >
                    {renderFormattedText(cleanBullet)}
                  </div>
                );
              }

              // 4. Meaning / Context Card (Cyan / Purple accent)
              return (
                <div
                  key={bIdx}
                  style={{
                    background: 'var(--bg-surface-elevated)',
                    border: '1px solid var(--border-color)',
                    borderLeft: '3px solid #06b6d4',
                    padding: '8px 10px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    lineHeight: 1.5,
                    color: 'var(--text-main)'
                  }}
                >
                  {renderFormattedText(cleanBullet)}
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{ fontSize: '12px', lineHeight: 1.55, color: 'var(--text-main)' }}>
            {renderFormattedText(sectionText)}
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '6px' }}>
      {rawSections.map((section, idx) => {
        const isOptionsSection = section.includes('विकल्पों का अर्थ') && section.includes('(A)') && section.includes('(B)');
        const isHindiSection = (section.includes('हिन्दी व्याख्या') || section.includes('💡')) && !isOptionsSection;
        const isRuleSection = section.includes('📘') || section.includes('Grammar Rule') || section.includes('📌');

        // Style for Hindi Explanation Box
        if (isHindiSection && !isOptionsSection) {
          return <div key={idx}>{renderRichHindiSection(section)}</div>;
        }

        // Style for Options / Word Meanings Box
        if (isOptionsSection) {
          return <div key={idx}>{renderOptionsGrid(section)}</div>;
        }

        // Style for Rule / English Box
        if (isRuleSection) {
          return (
            <div
              key={idx}
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-color)',
                borderLeft: '3px solid #10b981',
                borderRadius: '8px',
                padding: '10px 12px',
                fontSize: '12px',
                lineHeight: 1.55,
                color: 'var(--text-main)'
              }}
            >
              {renderFormattedText(section)}
            </div>
          );
        }

        // Default Section
        return (
          <div
            key={idx}
            style={{
              fontSize: '12px',
              lineHeight: 1.55,
              color: 'var(--text-main)'
            }}
          >
            {renderDefinitionList(section)}
          </div>
        );
      })}
    </div>
  );
};
