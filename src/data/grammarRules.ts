import type { GrammarRuleItem } from '../types/quiz';

// ══════════════════════════════════════════════════════════════════
// LAZY-LOADED GRAMMAR RULES DATA — Only loads 1MB JSON when first needed
// Prevents blocking the main thread on app startup
// ══════════════════════════════════════════════════════════════════

let _rulesCache: GrammarRuleItem[] | null = null;
let _rulesLoadPromise: Promise<GrammarRuleItem[]> | null = null;

/**
 * Async loader — call this to ensure grammar rules data is ready before use.
 */
export async function loadGrammarRules(): Promise<GrammarRuleItem[]> {
  if (_rulesCache) return _rulesCache;
  if (_rulesLoadPromise) return _rulesLoadPromise;

  _rulesLoadPromise = import('./grammarRulesData.json')
    .then(mod => {
      const data = (mod.default || mod) as GrammarRuleItem[];
      _rulesCache = data;
      return data;
    })
    .catch(() => {
      _rulesCache = [];
      return [] as GrammarRuleItem[];
    });

  return _rulesLoadPromise;
}

/**
 * Synchronous getter — returns cached data or empty array.
 */
export function getGrammarRules(): GrammarRuleItem[] {
  return _rulesCache || [];
}

// Backward-compatible export (Proxy ensures lazy load triggers on first access)
export const GOLDEN_GRAMMAR_RULES: GrammarRuleItem[] = new Proxy([] as GrammarRuleItem[], {
  get(target, prop, receiver) {
    if (_rulesCache) {
      return Reflect.get(_rulesCache, prop, receiver);
    }
    loadGrammarRules();
    return Reflect.get(target, prop, receiver);
  }
});

export default GOLDEN_GRAMMAR_RULES;
