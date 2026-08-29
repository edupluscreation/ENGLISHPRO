import React, { useState, useMemo } from 'react';
import { VOCAB_ITEMS } from '../data/vocabData';
import { Search, Tag, Sparkles, Volume2, ChevronDown, X, Loader2, Brain, Zap, BookOpen } from 'lucide-react';
import { FlatIconVocabBank } from './FlatIcons';

interface DictMeaning {
  partOfSpeech: string;
  definitions: { definition: string; example?: string }[];
  synonyms: string[];
  antonyms: string[];
}

interface ThesaurusResult {
  word: string;
  phonetic?: string;
  audioUrl?: string;
  origin?: string;
  meanings: DictMeaning[];
  extraSynonyms: string[];
  extraAntonyms: string[];
}

const getAIMnemonic = (word: string, matchedItem?: any) => {
  const w = word.toLowerCase().trim();
  if (matchedItem?.hindiMeaning) {
    return `हिंदी अर्थ: ${matchedItem.hindiMeaning} | SSC Example: "${matchedItem.exampleSentence || matchedItem.meaning}"`;
  }
  if (w === 'ephemeral') return "AI Memory Trick: 'E-film-for-all' (Movies end in 2 hours) → Lasting for a very short time (क्षणिक).";
  if (w === 'benevolent') return "AI Memory Trick: 'Bene' (Good/Kind) + 'Vol' (Wish) → Well-meaning and kindly (दयालु).";
  if (w === 'pragmatic') return "AI Memory Trick: 'Practical Management' → Dealing with things sensibly & realistically (व्यावहारिक).";
  if (w === 'eloquent') return "AI Memory Trick: 'Elocution' → Fluent and persuasive in speech (वाक्पटु).";
  if (w === 'ubiquitous') return "AI Memory Trick: 'Ubi' (Everywhere) → Present & found everywhere (सर्वव्यापी).";
  return `AI Memory Trick: Break down "${word}" into roots for instant recall in SSC CGL / CHSL exams.`;
};

export const VocabBank: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [displayLimit, setDisplayLimit] = useState<number>(30);
  
  // Live Thesaurus Modal State
  const [isThesaurusOpen, setIsThesaurusOpen] = useState<boolean>(false);
  const [thesaurusQuery, setThesaurusQuery] = useState<string>('');
  const [thesaurusLoading, setThesaurusLoading] = useState<boolean>(false);
  const [thesaurusData, setThesaurusData] = useState<ThesaurusResult | null>(null);
  const [thesaurusError, setThesaurusError] = useState<string | null>(null);

  const filteredItems = useMemo(() => {
    const query = searchTerm.toLowerCase().trim();
    if (!query) return VOCAB_ITEMS;

    return VOCAB_ITEMS.filter(item => {
      return item.word.toLowerCase().includes(query) || 
             item.meaning.toLowerCase().includes(query) ||
             (item.hindiMeaning && item.hindiMeaning.includes(query)) ||
             (item.examTag && item.examTag.toLowerCase().includes(query));
    });
  }, [searchTerm]);

  const visibleItems = useMemo(() => {
    return filteredItems.slice(0, displayLimit);
  }, [filteredItems, displayLimit]);

  const speakWord = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setDisplayLimit(30);
  };

  const fetchThesaurusWord = async (wordToSearch: string) => {
    const word = wordToSearch.trim().toLowerCase();
    if (!word) return;

    setThesaurusQuery(word);
    setThesaurusLoading(true);
    setThesaurusError(null);
    setIsThesaurusOpen(true);

    const matchedLocal = VOCAB_ITEMS.find(item => item.word.toLowerCase() === word);

    try {
      const [synRes, antRes, dictRes] = await Promise.allSettled([
        fetch(`https://api.datamuse.com/words?rel_syn=${word}&max=15`).then(r => r.json()),
        fetch(`https://api.datamuse.com/words?rel_ant=${word}&max=15`).then(r => r.json()),
        fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`).then(r => r.json())
      ]);

      const extraSyn: string[] = synRes.status === 'fulfilled' && Array.isArray(synRes.value)
        ? synRes.value.map((i: any) => i.word) : [];
      const extraAnt: string[] = antRes.status === 'fulfilled' && Array.isArray(antRes.value)
        ? antRes.value.map((i: any) => i.word) : [];

      let phonetic = '';
      let audioUrl = '';
      let origin = '';
      let meanings: DictMeaning[] = [];

      if (dictRes.status === 'fulfilled' && Array.isArray(dictRes.value) && dictRes.value.length > 0) {
        const entry = dictRes.value[0];
        phonetic = entry.phonetic || entry.phonetics?.[0]?.text || '';
        audioUrl = entry.phonetics?.find((p: any) => p.audio)?.audio || '';
        if (audioUrl && !audioUrl.startsWith('http')) audioUrl = 'https:' + audioUrl;
        origin = entry.origin || '';

        meanings = (entry.meanings || []).map((m: any) => ({
          partOfSpeech: m.partOfSpeech || '',
          definitions: (m.definitions || []).slice(0, 3).map((d: any) => ({
            definition: d.definition || '',
            example: d.example || undefined
          })),
          synonyms: m.synonyms || [],
          antonyms: m.antonyms || []
        }));
      }

      if (matchedLocal && meanings.length === 0) {
        meanings = [{
          partOfSpeech: matchedLocal.type || 'Word',
          definitions: [{
            definition: matchedLocal.meaning,
            example: matchedLocal.exampleSentence
          }],
          synonyms: matchedLocal.synonyms || [],
          antonyms: matchedLocal.antonyms || []
        }];
      }

      if (meanings.length === 0 && extraSyn.length === 0 && extraAnt.length === 0) {
        setThesaurusError(`No results found for "${word}".`);
      } else {
        setThesaurusData({
          word, phonetic, audioUrl, origin, meanings,
          extraSynonyms: Array.from(new Set([...(matchedLocal?.synonyms || []), ...extraSyn])).slice(0, 15),
          extraAntonyms: Array.from(new Set([...(matchedLocal?.antonyms || []), ...extraAnt])).slice(0, 15)
        });
      }
    } catch (err) {
      if (matchedLocal) {
        setThesaurusData({
          word,
          phonetic: '',
          audioUrl: '',
          origin: '',
          meanings: [{
            partOfSpeech: matchedLocal.type || 'Word',
            definitions: [{
              definition: matchedLocal.meaning,
              example: matchedLocal.exampleSentence
            }],
            synonyms: matchedLocal.synonyms || [],
            antonyms: matchedLocal.antonyms || []
          }],
          extraSynonyms: matchedLocal.synonyms || [],
          extraAntonyms: matchedLocal.antonyms || []
        });
      } else {
        setThesaurusError('Unable to connect to Thesaurus API. Please check your internet connection.');
      }
    } finally {
      setThesaurusLoading(false);
    }
  };

  return (
    <div style={{ padding: '40px 24px 48px 24px', maxWidth: '720px', margin: '0 auto' }}>
      
      {/* ─── HEADER ─── */}
      <div style={{ marginBottom: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
          <FlatIconVocabBank size={32} />
          <p style={{ fontSize: '0.8rem', fontWeight: 800, color: '#8b5cf6', letterSpacing: '0.5px', textTransform: 'uppercase', margin: 0 }}>
            AI Vocab Intelligence Engine
          </p>
        </div>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.5px', lineHeight: 1.2, marginBottom: '8px' }}>
          Search any English word.
        </h1>
        <p style={{ fontSize: '0.92rem', color: 'var(--text-muted)', lineHeight: 1.5, margin: 0 }}>
          Instant AI memory tricks, Hindi meanings, etymology & 1,600+ SSC PYQ breakdown.
        </p>
      </div>

      {/* ─── AI WORD SEARCH BAR ─── */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(168, 85, 247, 0.05) 100%)',
        border: '1.5px solid rgba(168, 85, 247, 0.35)',
        borderRadius: '16px',
        padding: '6px 6px 6px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        marginBottom: '20px',
        boxShadow: '0 4px 20px rgba(168, 85, 247, 0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
          <Brain size={18} color="#8b5cf6" />
          <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#8b5cf6', background: 'rgba(168, 85, 247, 0.14)', padding: '3px 8px', borderRadius: '6px', textTransform: 'uppercase', letterSpacing: '0.3px' }}>
            AI Engine
          </span>
        </div>
        <input
          type="text"
          placeholder="Type any word (e.g. ephemeral, benevolent)..."
          value={searchTerm}
          onChange={handleSearchChange}
          onKeyDown={(e) => e.key === 'Enter' && fetchThesaurusWord(searchTerm || 'consistent')}
          style={{
            flex: 1,
            padding: '10px 0',
            background: 'transparent',
            border: 'none',
            color: 'var(--text-main)',
            fontSize: '0.95rem',
            outline: 'none',
            minWidth: 0
          }}
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '50%',
              flexShrink: 0
            }}
            title="Clear text"
          >
            <X size={15} />
          </button>
        )}
        <button
          onClick={() => fetchThesaurusWord(searchTerm || 'consistent')}
          style={{
            padding: '10px 20px',
            fontSize: '0.85rem',
            fontWeight: 700,
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
            color: '#ffffff',
            border: 'none',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            whiteSpace: 'nowrap',
            flexShrink: 0,
            boxShadow: '0 4px 14px rgba(168, 85, 247, 0.35)',
            transition: 'all 0.15s ease'
          }}
        >
          <Sparkles size={15} />
          <span>AI Word Search</span>
        </button>
      </div>

      {/* ─── QUICK WORD SUGGESTIONS ─── */}
      {!isThesaurusOpen && (
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '28px' }}>
          {['Ephemeral', 'Benevolent', 'Pragmatic', 'Eloquent', 'Ubiquitous'].map(w => (
            <button
              key={w}
              onClick={() => { setSearchTerm(w.toLowerCase()); fetchThesaurusWord(w.toLowerCase()); }}
              style={{
                padding: '6px 14px',
                borderRadius: '9999px',
                background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(168, 85, 247, 0.08) 100%)',
                border: '1px solid rgba(168, 85, 247, 0.25)',
                color: 'var(--text-main)',
                fontSize: '0.78rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                transition: 'all 0.15s ease'
              }}
            >
              <Sparkles size={11} color="#8b5cf6" />
              <span>{w}</span>
            </button>
          ))}
        </div>
      )}

      {/* Live Thesaurus Modal */}
      {isThesaurusOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(6px)',
          zIndex: 999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div className="card" style={{
            maxWidth: '600px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '26px',
            position: 'relative',
            background: 'var(--bg-surface-elevated)',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
            borderRadius: 'var(--radius-md)'
          }}>
            {/* Close Button */}
            <button
              onClick={() => setIsThesaurusOpen(false)}
              style={{
                position: 'absolute',
                top: '18px',
                right: '18px',
                background: 'rgba(255, 255, 255, 0.1)',
                border: 'none',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--text-muted)',
                cursor: 'pointer'
              }}
            >
              <X size={18} />
            </button>

            {/* Modal Title */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                padding: '5px 14px', borderRadius: '9999px',
                background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(168, 85, 247, 0.15) 100%)',
                border: '1px solid rgba(168, 85, 247, 0.3)',
                color: '#8b5cf6', fontSize: '0.78rem', fontWeight: 800, letterSpacing: '0.5px'
              }}>
                <Sparkles size={14} color="#8b5cf6" />
                <span>AI VOCAB INTELLIGENCE ENGINE</span>
              </span>
            </div>

            {/* Live Search Input Inside Modal */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', position: 'relative' }}>
              <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center' }}>
                <input
                  type="text"
                  value={thesaurusQuery}
                  onChange={(e) => setThesaurusQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && fetchThesaurusWord(thesaurusQuery)}
                  placeholder="Search any English word (e.g. consistent, ephemeral)..."
                  style={{
                    width: '100%',
                    padding: '10px 36px 10px 14px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-main)',
                    fontSize: '0.95rem',
                    outline: 'none'
                  }}
                />
                {thesaurusQuery && (
                  <button
                    onClick={() => setThesaurusQuery('')}
                    style={{
                      position: 'absolute',
                      right: '10px',
                      background: 'none',
                      border: 'none',
                      color: 'var(--text-muted)',
                      cursor: 'pointer',
                      padding: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                    title="Clear text"
                  >
                    <X size={15} />
                  </button>
                )}
              </div>
              <button
                onClick={() => fetchThesaurusWord(thesaurusQuery)}
                disabled={thesaurusLoading || !thesaurusQuery.trim()}
                style={{
                  padding: '10px 18px',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                  color: '#ffffff',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                {thesaurusLoading ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Sparkles size={15} />}
                <span>AI Search</span>
              </button>
            </div>

            {/* Loading State */}
            {thesaurusLoading && (
              <div style={{ textAlign: 'center', padding: '36px 20px', color: 'var(--text-muted)' }}>
                <div style={{
                  width: '56px', height: '56px', borderRadius: '50%',
                  background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.12) 0%, rgba(168, 85, 247, 0.12) 100%)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 16px auto'
                }}>
                  <Brain size={28} color="#8b5cf6" style={{ animation: 'pulse 1.5s ease-in-out infinite' }} />
                </div>
                <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '4px' }}>
                  AI Engine Analyzing "{thesaurusQuery}"...
                </div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  Extracting etymology, memory mnemonics, Hindi meaning & SSC PYQ frequency
                </div>
              </div>
            )}

            {/* Error State */}
            {thesaurusError && !thesaurusLoading && (
              <div style={{ padding: '16px', borderRadius: 'var(--radius-sm)', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', textAlign: 'center' }}>
                {thesaurusError}
              </div>
            )}

            {/* Result Display */}
            {thesaurusData && !thesaurusLoading && (
              <div>
                {/* Word Header + Audio */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <h3 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-main)', margin: 0, textTransform: 'capitalize' }}>
                    {thesaurusData.word}
                  </h3>
                  <button
                    onClick={() => {
                      if (thesaurusData.audioUrl) {
                        new Audio(thesaurusData.audioUrl).play();
                      } else {
                        speakWord(thesaurusData.word);
                      }
                    }}
                    style={{
                      background: 'rgba(99, 102, 241, 0.1)', border: 'none', borderRadius: '50%',
                      width: '36px', height: '36px', display: 'flex', alignItems: 'center',
                      justifyContent: 'center', color: 'var(--primary)', cursor: 'pointer'
                    }}
                    title="Play pronunciation"
                  >
                    <Volume2 size={18} />
                  </button>
                </div>

                {/* Phonetic */}
                {thesaurusData.phonetic && (
                  <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '16px', fontStyle: 'italic' }}>
                    {thesaurusData.phonetic}
                  </p>
                )}

                {/* ─── AI SMART INSIGHTS CARD ─── */}
                {(() => {
                  const matched = VOCAB_ITEMS.find(item => item.word.toLowerCase() === thesaurusData.word.toLowerCase());
                  const mnemonicText = getAIMnemonic(thesaurusData.word, matched);
                  return (
                    <div style={{
                      borderRadius: '14px',
                      padding: '16px 18px',
                      marginBottom: '20px',
                      background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(168, 85, 247, 0.08) 100%)',
                      border: '1px solid rgba(168, 85, 247, 0.3)',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', fontWeight: 800, color: '#8b5cf6', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                          <Brain size={15} />
                          <span>AI Smart Memory & Exam Insights</span>
                        </div>
                        <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '2px 8px', borderRadius: '6px', background: 'rgba(168, 85, 247, 0.15)', color: '#8b5cf6' }}>
                          {matched?.examTag || 'SSC CGL / CHSL High Frequency'}
                        </span>
                      </div>
                      <p style={{ fontSize: '0.88rem', color: 'var(--text-main)', margin: 0, lineHeight: 1.6, fontWeight: 500 }}>
                        💡 <strong>{mnemonicText}</strong>
                      </p>
                    </div>
                  );
                })()}

                {/* All Meanings */}
                {thesaurusData.meanings.map((m, mIdx) => (
                  <div key={mIdx} style={{ marginBottom: '20px' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.3px', marginBottom: '8px', paddingBottom: '6px', borderBottom: '1px solid var(--border-color)' }}>
                      {m.partOfSpeech}
                    </div>
                    {m.definitions.map((d, dIdx) => (
                      <div key={dIdx} style={{ marginBottom: '10px', paddingLeft: '12px', borderLeft: '2px solid var(--border-color)' }}>
                        <p style={{ fontSize: '0.9rem', color: 'var(--text-main)', margin: '0 0 4px 0', lineHeight: 1.5 }}>
                          {dIdx + 1}. {d.definition}
                        </p>
                        {d.example && (
                          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: 0, fontStyle: 'italic' }}>
                            "{d.example}"
                          </p>
                        )}
                      </div>
                    ))}

                    {/* Inline synonyms for this meaning */}
                    {m.synonyms.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px' }}>
                        <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--success)', alignSelf: 'center' }}>SYN:</span>
                        {m.synonyms.slice(0, 8).map((s, i) => (
                          <button key={i} onClick={() => fetchThesaurusWord(s)} style={{
                            background: 'rgba(16,185,129,0.08)', color: 'var(--success)',
                            border: '1px solid rgba(16,185,129,0.2)', fontWeight: 600,
                            padding: '3px 10px', borderRadius: '9999px', fontSize: '0.75rem', cursor: 'pointer'
                          }}>{s}</button>
                        ))}
                      </div>
                    )}
                    {m.antonyms.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '6px' }}>
                        <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--error)', alignSelf: 'center' }}>ANT:</span>
                        {m.antonyms.slice(0, 8).map((a, i) => (
                          <button key={i} onClick={() => fetchThesaurusWord(a)} style={{
                            background: 'rgba(239,68,68,0.08)', color: 'var(--error)',
                            border: '1px solid rgba(239,68,68,0.2)', fontWeight: 600,
                            padding: '3px 10px', borderRadius: '9999px', fontSize: '0.75rem', cursor: 'pointer'
                          }}>{a}</button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}

                {/* Extra Synonyms from Datamuse */}
                {thesaurusData.extraSynonyms.length > 0 && (
                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--success)', letterSpacing: '0.3px', marginBottom: '8px', textTransform: 'uppercase' }}>
                      More Synonyms
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {thesaurusData.extraSynonyms.map((s, idx) => (
                        <button key={idx} onClick={() => fetchThesaurusWord(s)} style={{
                          background: 'rgba(16,185,129,0.1)', color: 'var(--success)',
                          border: '1px solid rgba(16,185,129,0.25)', fontWeight: 700,
                          padding: '4px 12px', borderRadius: '9999px', fontSize: '0.78rem', cursor: 'pointer'
                        }}>{s}</button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Extra Antonyms from Datamuse */}
                {thesaurusData.extraAntonyms.length > 0 && (
                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--error)', letterSpacing: '0.3px', marginBottom: '8px', textTransform: 'uppercase' }}>
                      More Antonyms
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {thesaurusData.extraAntonyms.map((a, idx) => (
                        <button key={idx} onClick={() => fetchThesaurusWord(a)} style={{
                          background: 'rgba(239,68,68,0.1)', color: 'var(--error)',
                          border: '1px solid rgba(239,68,68,0.25)', fontWeight: 700,
                          padding: '4px 12px', borderRadius: '9999px', fontSize: '0.78rem', cursor: 'pointer'
                        }}>{a}</button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Origin */}
                {thesaurusData.origin && (
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontStyle: 'italic', marginTop: '12px', paddingTop: '12px', borderTop: '1px solid var(--border-color)' }}>
                    Origin: {thesaurusData.origin}
                  </p>
                )}
              </div>
            )}

          </div>
        </div>
      )}

      {/* Results Count Banner */}
      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '16px', fontWeight: 600 }}>
        Showing {visibleItems.length} of {filteredItems.length} vocabulary words
      </div>

      {/* Vocab Cards Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(330px, 1fr))',
        gap: '20px'
      }}>
        {visibleItems.map(item => (
          <div key={item.id} className="card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', background: 'var(--bg-surface)' }}>
            <div>
              {/* Top Row: VOCAB Badge on left, Exam Tag on right */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                <span style={{
                  background: 'rgba(99, 102, 241, 0.12)',
                  color: 'var(--primary)',
                  fontWeight: 700,
                  padding: '4px 12px',
                  borderRadius: '9999px',
                  fontSize: '0.75rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  VOCAB
                </span>

                {item.examTag && (
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '5px', fontWeight: 600 }}>
                    <Tag size={13} />
                    {item.examTag}
                  </span>
                )}
              </div>

              {/* Title Row: Word Name + Audio Speaker Button */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.3px', wordBreak: 'break-word' }}>
                  {item.word}
                </h3>
                <button 
                  onClick={() => speakWord(item.word)} 
                  title="Pronounce word"
                  style={{
                    background: 'rgba(99, 102, 241, 0.1)',
                    border: 'none',
                    borderRadius: '50%',
                    width: '36px',
                    height: '36px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--primary)',
                    cursor: 'pointer',
                    flexShrink: 0
                  }}
                >
                  <Volume2 size={18} />
                </button>
              </div>

              {/* Hindi Meaning in Purple Text */}
              {item.hindiMeaning && (
                <div style={{ fontSize: '1rem', fontWeight: 700, color: '#8b5cf6', marginBottom: '10px' }}>
                  {item.hindiMeaning}
                </div>
              )}

              {/* English Meaning */}
              <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', marginBottom: '18px', lineHeight: 1.5 }}>
                {item.meaning}
              </p>

              {/* SYNONYMS Section (Green Pills) */}
              {item.synonyms && item.synonyms.length > 0 && (
                <div style={{ marginBottom: '14px' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--success)', letterSpacing: '0.5px', marginBottom: '6px' }}>
                    SYNONYMS:
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {item.synonyms.map((syn, synIdx) => (
                      <span key={synIdx} style={{
                        background: 'rgba(16, 185, 129, 0.12)',
                        color: 'var(--success)',
                        fontWeight: 700,
                        padding: '5px 12px',
                        borderRadius: '9999px',
                        fontSize: '0.8rem'
                      }}>
                        {syn}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* ANTONYMS Section (Red Pills) */}
              {item.antonyms && item.antonyms.length > 0 && (
                <div style={{ marginBottom: '18px' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--error)', letterSpacing: '0.5px', marginBottom: '6px' }}>
                    ANTONYMS:
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {item.antonyms.map((ant, antIdx) => (
                      <span key={antIdx} style={{
                        background: 'rgba(239, 68, 68, 0.12)',
                        color: 'var(--error)',
                        fontWeight: 700,
                        padding: '5px 12px',
                        borderRadius: '9999px',
                        fontSize: '0.8rem'
                      }}>
                        {ant}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Quoted Example Sentence Container */}
            {item.exampleSentence && (
              <div style={{
                background: 'rgba(99, 102, 241, 0.06)',
                border: '1px solid rgba(99, 102, 241, 0.15)',
                padding: '12px 16px',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.875rem',
                color: 'var(--text-main)',
                fontStyle: 'italic',
                marginTop: '14px',
                lineHeight: 1.5
              }}>
                "{item.exampleSentence}"
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Load More Button */}
      {visibleItems.length < filteredItems.length && (
        <div style={{ textAlign: 'center', marginTop: '32px' }}>
          <button
            onClick={() => setDisplayLimit(prev => prev + 40)}
            className="btn-secondary"
            style={{ padding: '12px 28px', fontSize: '0.9rem', borderRadius: '9999px' }}
          >
            <span>Load More Words ({filteredItems.length - visibleItems.length} Remaining)</span>
            <ChevronDown size={16} />
          </button>
        </div>
      )}

    </div>
  );
};
