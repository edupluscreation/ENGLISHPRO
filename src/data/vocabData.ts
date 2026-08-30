import type { VocabItem } from '../types/quiz';

// ══════════════════════════════════════════════════════════════════
// LAZY-LOADED VOCAB DATA & HINDI DICTIONARY
// Prevents blocking the main thread on app startup
// ══════════════════════════════════════════════════════════════════

let _vocabItemsCache: VocabItem[] | null = null;
let _vocabLoadPromise: Promise<VocabItem[]> | null = null;

let _hindiDictCache: Record<string, string> | null = null;
let _hindiDictPromise: Promise<Record<string, string>> | null = null;

/**
 * Synchronously returns cached vocab items (empty array if not yet loaded).
 */
export const VOCAB_ITEMS: VocabItem[] = new Proxy([] as VocabItem[], {
  get(target, prop, receiver) {
    if (_vocabItemsCache) {
      return Reflect.get(_vocabItemsCache, prop, receiver);
    }
    loadVocabData();
    return Reflect.get(target, prop, receiver);
  }
});

/**
 * Async loader for 2,530+ SSC PYQ Vocab dataset.
 */
export async function loadVocabData(): Promise<VocabItem[]> {
  if (_vocabItemsCache) return _vocabItemsCache;
  if (_vocabLoadPromise) return _vocabLoadPromise;

  _vocabLoadPromise = import('./pyqVocabData.json')
    .then(mod => {
      const data = (mod.default || mod) as VocabItem[];
      _vocabItemsCache = data;
      return data;
    })
    .catch(() => {
      _vocabItemsCache = [];
      return [] as VocabItem[];
    });

  return _vocabLoadPromise;
}

/**
 * Async loader for 16,675+ English-to-Hindi Dictionary.
 */
export async function loadHindiDict(): Promise<Record<string, string>> {
  if (_hindiDictCache) return _hindiDictCache;
  if (_hindiDictPromise) return _hindiDictPromise;

  _hindiDictPromise = import('./hindiDictionary.json')
    .then(mod => {
      const data = (mod.default || mod) as Record<string, string>;
      _hindiDictCache = data;
      return data;
    })
    .catch(() => {
      _hindiDictCache = {};
      return {};
    });

  return _hindiDictPromise;
}

/**
 * Get vocab items synchronously (returns empty array if not loaded yet).
 */
export function getVocabItems(): VocabItem[] {
  return _vocabItemsCache || [];
}

/**
 * Quick lookup in offline Hindi Dictionary.
 */
export async function lookupHindiMeaningOffline(word: string): Promise<string | null> {
  const clean = word.toLowerCase().trim();
  const dict = await loadHindiDict();
  return dict[clean] || null;
}
