import React from 'react';

interface SmartExplanationProps {
  text: string;
}

export const SmartExplanation: React.FC<SmartExplanationProps> = ({ text }) => {
  if (!text) return null;

  // Split text into logical sections by double newlines
  const rawSections = text
    .split(/\n\s*\n/)
    .map(s => s.trim())
    .filter(Boolean);

  // Helper to render inline markdown like **bold**, `code`, etc.
  const renderFormattedText = (str: string) => {
    const parts = str.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
    return parts.map((part, pIdx) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={pIdx} style={{ color: 'var(--text-main)', fontWeight: 800 }}>
            {part.slice(2, -2)}
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
              fontSize: '0.85rem',
              fontWeight: 700 
            }}
          >
            {part.slice(1, -1)}
          </code>
        );
      }
      return <span key={pIdx}>{part}</span>;
    });
  };

  // Helper to render option meanings grid if section matches (A) ... • (B) ...
  const renderOptionsGrid = (sectionText: string) => {
    const cleanHeader = sectionText.replace(/📝\s*\*\*विकल्पों का अर्थ \(Options\)\*\*:\s*/i, '').trim();
    const parts = cleanHeader.split(/\s*•\s*/).filter(Boolean);

    return (
      <div style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-md)',
        padding: '14px 16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px'
      }}>
        <div style={{
          fontSize: '0.8rem',
          fontWeight: 800,
          color: 'var(--text-muted)',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}>
          <span>📝</span>
          <span>विकल्पों का अर्थ (Option Meanings)</span>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '8px'
        }}>
          {parts.map((p, pIdx) => {
            const m = p.match(/^\(([A-D])\)\s*([^:]+)(:\s*(.+))?$/);
            if (m) {
              const letter = m[1];
              const engWord = m[2].trim();
              const hindiMeaning = (m[4] || '').trim();

              return (
                <div
                  key={pIdx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    background: 'var(--bg-surface-elevated)',
                    border: '1px solid var(--border-color)',
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.88rem'
                  }}
                >
                  <span style={{
                    fontSize: '0.74rem',
                    fontWeight: 800,
                    color: 'var(--primary)',
                    background: 'var(--primary-light)',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    flexShrink: 0
                  }}>
                    {letter}
                  </span>
                  <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>{engWord}</span>
                  {hindiMeaning && (
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.84rem' }}>: {hindiMeaning}</span>
                  )}
                </div>
              );
            }

            return (
              <div key={pIdx} style={{ fontSize: '0.88rem', color: 'var(--text-main)' }}>
                {p}
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
              <div key={lIdx} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '0.94rem', lineHeight: 1.6 }}>
                <span style={{ color: 'var(--primary)', fontWeight: 800, flexShrink: 0, marginTop: '2px' }}>•</span>
                <div>
                  <strong style={{ color: 'var(--text-main)', marginRight: '6px' }}>{dashMatch[1].trim()}:</strong>
                  <span style={{ color: 'var(--text-main)' }}>{dashMatch[2].trim()}</span>
                </div>
              </div>
            );
          }

          return (
            <p key={lIdx} style={{ fontSize: '0.94rem', lineHeight: 1.65, margin: 0, color: 'var(--text-main)' }}>
              {renderFormattedText(line)}
            </p>
          );
        })}
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '10px' }}>
      {rawSections.map((section, idx) => {
        const isHindiSection = section.includes('हिन्दी व्याख्या') || section.includes('💡');
        const isOptionsSection = section.includes('विकल्पों का अर्थ') || section.includes('📝') || (section.includes('(A)') && section.includes('(B)'));
        const isRuleSection = section.includes('📘') || section.includes('Grammar Rule') || section.includes('📌');

        // Style for Hindi Explanation Box
        if (isHindiSection && !isOptionsSection) {
          return (
            <div
              key={idx}
              style={{
                background: 'rgba(99, 102, 241, 0.06)',
                border: '1px solid rgba(99, 102, 241, 0.25)',
                borderLeft: '4px solid var(--primary)',
                borderRadius: '8px',
                padding: '12px 16px',
                fontSize: '0.94rem',
                lineHeight: 1.7,
                color: 'var(--text-main)'
              }}
            >
              {renderFormattedText(section)}
            </div>
          );
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
                borderLeft: '4px solid #10b981',
                borderRadius: '8px',
                padding: '12px 16px',
                fontSize: '0.92rem',
                lineHeight: 1.65,
                color: 'var(--text-main)'
              }}
            >
              {renderFormattedText(section)}
            </div>
          );
        }

        // Default Section (Check if it has definitions)
        return (
          <div
            key={idx}
            style={{
              fontSize: '0.94rem',
              lineHeight: 1.65,
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
