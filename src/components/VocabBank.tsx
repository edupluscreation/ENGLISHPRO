import React, { useState, useMemo, useEffect } from 'react';
import { loadVocabData } from '../data/vocabData';
import type { VocabItem } from '../types/quiz';
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

const getAIMnemonic = (word: string, matchedItem?: any, primaryMeaning?: string, liveHindi?: string) => {
  const w = word.toLowerCase().trim();
  const hindi = matchedItem?.hindiMeaning || liveHindi;

  if (hindi) {
    const usage = matchedItem?.exampleSentence || primaryMeaning;
    return usage 
      ? `हिन्दी अर्थ: ${hindi} • Exam Context: "${usage}"`
      : `हिन्दी अर्थ: ${hindi} • Essential vocabulary for SSC CGL, CHSL, CPO & MTS examinations.`;
  }

  if (primaryMeaning) {
    return `Exam Memory Key: "${word.toUpperCase()}" ➔ ${primaryMeaning}`;
  }

  return `Exam Memory Key: "${word.toUpperCase()}" ➔ Focus on contextual usage in SSC CGL / CHSL reading comprehension and cloze tests.`;
};

export const VocabBank: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [displayLimit, setDisplayLimit] = useState<number>(30);
  
  // Lazy-loaded vocab items
  const [vocabItems, setVocabItems] = useState<VocabItem[]>([]);
  const [isVocabLoading, setIsVocabLoading] = useState(true);

  useEffect(() => {
    loadVocabData().then(data => {
      setVocabItems(data);
      setIsVocabLoading(false);
    });
  }, []);

  // Live Thesaurus Modal State
  const [isThesaurusOpen, setIsThesaurusOpen] = useState<boolean>(false);
  const [thesaurusQuery, setThesaurusQuery] = useState<string>('');
  const [thesaurusLoading, setThesaurusLoading] = useState<boolean>(false);
  const [thesaurusData, setThesaurusData] = useState<ThesaurusResult | null>(null);
  const [thesaurusError, setThesaurusError] = useState<string | null>(null);

  const filteredItems = useMemo(() => {
    const query = searchTerm.toLowerCase().trim();
    if (!query) return vocabItems;

    return vocabItems.filter(item => {
      return item.word.toLowerCase().includes(query) || 
             item.meaning.toLowerCase().includes(query) ||
             (item.hindiMeaning && item.hindiMeaning.includes(query)) ||
             (item.examTag && item.examTag.toLowerCase().includes(query));
    });
  }, [searchTerm, vocabItems]);

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
    let word = wordToSearch.trim().toLowerCase();
    if (!word) {
      const fallbackList = ['ephemeral', 'benevolent', 'pragmatic', 'ubiquitous', 'candid', 'meticulous', 'tenacious', 'resilient', 'paucity', 'voracious'];
      word = fallbackList[Math.floor(Math.random() * fallbackList.length)];
    }

    setThesaurusQuery(word);
    setThesaurusError(null);
    setIsThesaurusOpen(true);

    const matchedLocal = vocabItems.find(item => item.word.toLowerCase() === word) ||
      vocabItems.find(item => item.word.toLowerCase().startsWith(word));

    // 1. INSTANT 0ms RENDER FROM LOCAL DATABASE IF PRESENT
    if (matchedLocal) {
      setThesaurusData({
        word: matchedLocal.word,
        phonetic: '',
        audioUrl: '',
        origin: '',
        meanings: [{
          partOfSpeech: matchedLocal.type || 'Adjective / Noun',
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
      setThesaurusLoading(false);
    } else {
      setThesaurusLoading(true);
    }

    // 2. FETCH COMPREHENSIVE DICTIONARY API, DATAMUSE & HINDI TRANSLATION (8s timeout)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    try {
      const [dictRes, dmRes, synRes, antRes, mmRes] = await Promise.allSettled([
        fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`, { signal: controller.signal }).then(r => r.json()),
        fetch(`https://api.datamuse.com/words?sp=${encodeURIComponent(word)}&md=dp&max=1`, { signal: controller.signal }).then(r => r.json()),
        fetch(`https://api.datamuse.com/words?rel_syn=${encodeURIComponent(word)}&max=15`, { signal: controller.signal }).then(r => r.json()),
        fetch(`https://api.datamuse.com/words?rel_ant=${encodeURIComponent(word)}&max=15`, { signal: controller.signal }).then(r => r.json()),
        fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(word)}&langpair=en|hi`, { signal: controller.signal }).then(r => r.json())
      ]);

      clearTimeout(timeoutId);

      // Extract Hindi Meaning (Check Offline Dict First, then MyMemory)
      let liveHindiMeaning = matchedLocal?.hindiMeaning || '';
      if (!liveHindiMeaning) {
        try {
          const { lookupHindiMeaningOffline } = await import('../data/vocabData');
          const offlineMatch = await lookupHindiMeaningOffline(word);
          if (offlineMatch) liveHindiMeaning = offlineMatch;
        } catch {}
      }

      if (!liveHindiMeaning && mmRes.status === 'fulfilled' && mmRes.value?.responseData?.translatedText) {
        const tr = mmRes.value.responseData.translatedText;
        if (!tr.toLowerCase().includes('mymemory')) {
          liveHindiMeaning = tr.trim();
        }
      }

      const extraSyn: string[] = synRes.status === 'fulfilled' && Array.isArray(synRes.value)
        ? synRes.value.map((i: any) => i.word) : [];
      const extraAnt: string[] = antRes.status === 'fulfilled' && Array.isArray(antRes.value)
        ? antRes.value.map((i: any) => i.word) : [];

      let parsedMeanings: DictMeaning[] = matchedLocal ? [{
        partOfSpeech: matchedLocal.type || 'Adjective / Noun',
        definitions: [{
          definition: matchedLocal.meaning,
          example: matchedLocal.exampleSentence
        }],
        synonyms: matchedLocal.synonyms || [],
        antonyms: matchedLocal.antonyms || []
      }] : [];

      let phonetic = '';
      let audioUrl = '';
      let origin = '';

      if (dictRes.status === 'fulfilled' && Array.isArray(dictRes.value) && dictRes.value.length > 0) {
        const entry = dictRes.value[0];
        phonetic = entry.phonetic || (entry.phonetics && entry.phonetics[0]?.text) || '';
        
        // Find valid audio mp3
        if (entry.phonetics && Array.isArray(entry.phonetics)) {
          const audioObj = entry.phonetics.find((p: any) => p.audio && p.audio.length > 0);
          if (audioObj) {
            audioUrl = audioObj.audio.startsWith('//') ? 'https:' + audioObj.audio : audioObj.audio;
          }
        }

        if (entry.meanings && Array.isArray(entry.meanings) && entry.meanings.length > 0) {
          const apiMeanings: DictMeaning[] = entry.meanings.slice(0, 3).map((m: any) => ({
            partOfSpeech: m.partOfSpeech || 'Word',
            definitions: Array.isArray(m.definitions) ? m.definitions.slice(0, 2).map((d: any) => ({
              definition: d.definition,
              example: d.example
            })) : [{ definition: `Meaning of ${word}` }],
            synonyms: Array.isArray(m.synonyms) ? m.synonyms.slice(0, 8) : [],
            antonyms: Array.isArray(m.antonyms) ? m.antonyms.slice(0, 8) : []
          }));

          if (parsedMeanings.length === 0) {
            parsedMeanings = apiMeanings;
          } else {
            parsedMeanings = [...parsedMeanings, ...apiMeanings];
          }
        }
      }

      // Datamuse definition fallback
      if (parsedMeanings.length === 0 && dmRes.status === 'fulfilled' && Array.isArray(dmRes.value) && dmRes.value[0]?.defs) {
        const defs: string[] = dmRes.value[0].defs;
        if (defs.length > 0) {
          const parts = defs[0].split('\t');
          const pos = parts.length > 1 ? parts[0] : 'Word';
          const defText = parts.length > 1 ? parts[1].trim() : defs[0].trim();
          parsedMeanings = [{
            partOfSpeech: pos,
            definitions: [{ definition: defText }],
            synonyms: extraSyn,
            antonyms: extraAnt
          }];
        }
      }

      if (parsedMeanings.length === 0) {
        if (extraSyn.length > 0 || extraAnt.length > 0 || liveHindiMeaning) {
          parsedMeanings = [{
            partOfSpeech: 'Word',
            definitions: [{ definition: liveHindiMeaning ? `Hindi Meaning: ${liveHindiMeaning}` : `English vocabulary entry for "${word}".` }],
            synonyms: extraSyn,
            antonyms: extraAnt
          }];
        } else if (!matchedLocal) {
          if (!navigator.onLine) {
            setThesaurusError('📡 इंटरनेट बंद है। नए शब्दों को खोजने के लिए कृपया Mobile Data / Wi-Fi चालू करें।');
          } else {
            setThesaurusError(`"${word}" के लिए कोई शब्दकोश परिणाम नहीं मिला। कृपया वर्तनी (Spelling) जांचें।`);
          }
          setThesaurusLoading(false);
          return;
        }
      }

      const combinedSyn = Array.from(new Set([
        ...(matchedLocal?.synonyms || []),
        ...parsedMeanings.flatMap(m => m.synonyms),
        ...extraSyn
      ])).slice(0, 15);

      const combinedAnt = Array.from(new Set([
        ...(matchedLocal?.antonyms || []),
        ...parsedMeanings.flatMap(m => m.antonyms),
        ...extraAnt
      ])).slice(0, 15);

      setThesaurusData({
        word: matchedLocal?.word || word,
        phonetic,
        audioUrl,
        origin,
        meanings: parsedMeanings,
        extraSynonyms: combinedSyn,
        extraAntonyms: combinedAnt
      });

    } catch {
      // If network fails and local exists, local data is already active
    } finally {
      clearTimeout(timeoutId);
      setThesaurusLoading(false);
    }
  };

  return (
    <div style={{ padding: '16px 12px 32px 12px', maxWidth: '680px', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
      
      {/* ─── HEADER ─── */}
      <div style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
          <FlatIconVocabBank size={24} />
          <p style={{ fontSize: '11px', fontWeight: 800, color: '#8b5cf6', letterSpacing: '0.5px', textTransform: 'uppercase', margin: 0 }}>
            AI Vocab Intelligence Engine
          </p>
        </div>
        <h1 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-main)', margin: '0 0 3px 0' }}>
          Search Any English Word
        </h1>
        <p style={{ fontSize: '12px', color: 'var(--text-dim)', margin: 0 }}>
          Instant Hindi meanings, memory tricks & 6,400+ SSC PYQ breakdown.
        </p>
      </div>

      {/* ─── AI WORD SEARCH BAR ─── */}
      <div style={{
        background: 'var(--bg-surface)',
        border: '1.5px solid rgba(168, 85, 247, 0.4)',
        borderRadius: '14px',
        padding: '6px 8px 6px 14px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        marginBottom: '12px'
      }}>
        <Brain size={16} color="#8b5cf6" style={{ flexShrink: 0 }} />
        <input
          type="text"
          placeholder="Type any word (e.g. ephemeral, candid)..."
          value={searchTerm}
          onChange={handleSearchChange}
          onKeyDown={(e) => e.key === 'Enter' && fetchThesaurusWord(searchTerm || 'ephemeral')}
          style={{
            flex: 1,
            padding: '8px 0',
            background: 'transparent',
            border: 'none',
            color: 'var(--text-main)',
            fontSize: '13.5px',
            outline: 'none',
            minWidth: 0
          }}
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-dim)',
              cursor: 'pointer',
              padding: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}
            title="Clear text"
          >
            <X size={15} />
          </button>
        )}
        <button
          onClick={() => fetchThesaurusWord(searchTerm || 'ephemeral')}
          style={{
            padding: '8px 14px',
            fontSize: '12.5px',
            fontWeight: 700,
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)',
            color: '#ffffff',
            border: 'none',
            cursor: 'pointer',
            flexShrink: 0
          }}
        >
          <span>AI Scan</span>
        </button>
      </div>

      {/* ─── QUICK TAP VOCAB CHIPS ─── */}
      <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '14px', scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch', width: '100%', boxSizing: 'border-box' }}>
        {['ephemeral', 'benevolent', 'pragmatic', 'ubiquitous', 'candid', 'lethal', 'meticulous', 'tenacious'].map(w => (
          <button
            key={w}
            onClick={() => {
              setSearchTerm(w);
              fetchThesaurusWord(w);
            }}
            style={{
              padding: '5px 11px',
              borderRadius: '8px',
              background: 'var(--bg-surface-elevated)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-main)',
              fontSize: '11.5px',
              fontWeight: 600,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              flexShrink: 0
            }}
          >
            🔍 {w}
          </button>
        ))}
      </div>

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
                  const matched = vocabItems.find(item => item.word.toLowerCase() === thesaurusData.word.toLowerCase());
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
      <div style={{ fontSize: '11.5px', color: 'var(--text-dim)', marginBottom: '12px', fontWeight: 600 }}>
        Showing {visibleItems.length} of {filteredItems.length} vocabulary words
      </div>

      {/* Vocab Cards Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
        gap: '10px',
        width: '100%',
        boxSizing: 'border-box'
      }}>
        {visibleItems.map(item => (
          <div
            key={item.id}
            style={{
              padding: '14px 16px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-color)',
              borderRadius: '12px',
              boxShadow: 'var(--shadow-xs)',
              gap: '10px'
            }}
          >
            <div>
              {/* Top Row: VOCAB Badge on left, Exam Tag on right */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{
                  background: 'var(--primary-light)',
                  color: 'var(--primary)',
                  fontWeight: 800,
                  padding: '2px 7px',
                  borderRadius: '5px',
                  fontSize: '9.5px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em'
                }}>
                  VOCAB
                </span>

                {item.examTag && (
                  <span style={{ fontSize: '10px', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
                    <Tag size={11} />
                    <span>{item.examTag}</span>
                  </span>
                )}
              </div>

              {/* Title Row: Word Name + Audio Speaker Button */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.01em', wordBreak: 'break-word', margin: 0 }}>
                  {item.word}
                </h3>
                <button 
                  onClick={() => speakWord(item.word)} 
                  title="Pronounce word"
                  style={{
                    background: 'var(--primary-light)',
                    border: 'none',
                    borderRadius: '8px',
                    width: '30px',
                    height: '30px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--primary)',
                    cursor: 'pointer',
                    flexShrink: 0
                  }}
                >
                  <Volume2 size={15} />
                </button>
              </div>

              {/* Hindi Meaning in Purple Text */}
              {item.hindiMeaning && (
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#8b5cf6', marginBottom: '6px' }}>
                  {item.hindiMeaning}
                </div>
              )}

              {/* English Meaning */}
              <p style={{ fontSize: '12px', color: 'var(--text-main)', marginBottom: '10px', lineHeight: 1.4, margin: 0 }}>
                {item.meaning}
              </p>

              {/* SYNONYMS Section (Green Pills) */}
              {item.synonyms && item.synonyms.length > 0 && (
                <div style={{ marginTop: '8px' }}>
                  <div style={{ fontSize: '9.5px', fontWeight: 800, color: 'var(--success)', letterSpacing: '0.04em', marginBottom: '4px' }}>
                    SYNONYMS:
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                    {item.synonyms.map((syn, synIdx) => (
                      <span key={synIdx} style={{
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

              {/* ANTONYMS Section (Red Pills) */}
              {item.antonyms && item.antonyms.length > 0 && (
                <div style={{ marginTop: '8px' }}>
                  <div style={{ fontSize: '9.5px', fontWeight: 800, color: 'var(--error)', letterSpacing: '0.04em', marginBottom: '4px' }}>
                    ANTONYMS:
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                    {item.antonyms.map((ant, antIdx) => (
                      <span key={antIdx} style={{
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
            </div>

            {/* Quoted Example Sentence Container */}
            {item.exampleSentence && (
              <div style={{
                background: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-color)',
                padding: '8px 10px',
                borderRadius: '8px',
                fontSize: '11.5px',
                color: 'var(--text-dim)',
                fontStyle: 'italic',
                marginTop: '4px',
                lineHeight: 1.4
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
