const fc = require('fast-check');
const suggestion = require('../services/suggestion');

describe('Suggestion Service', () => {
  // Feature: enhanced-agri-search, Property 1: Suggestion count limit
  // Validates: Requirements 1.3
  test('Property 1: For any query prefix, getSuggestions returns at most 8 suggestions', () => {
    fc.assert(
      fc.property(
        fc.oneof(
          fc.constant(''),
          fc.string({ minLength: 1, maxLength: 1 }),
          fc.stringMatching(/^[\u4e00-\u9fff]{1,4}$/),
          fc.stringMatching(/^[a-z]{1,8}$/)
        ),
        (prefix) => {
          const results = suggestion.getSuggestions(prefix);
          expect(results.length).toBeLessThanOrEqual(8);
          // Results should be an array of strings
          results.forEach(r => expect(typeof r).toBe('string'));
          // No duplicates
          expect(new Set(results).size).toBe(results.length);
        }
      ),
      { numRuns: 100 }
    );
  });

  // Feature: enhanced-agri-search, Property 2: Pinyin prefix matching correctness
  // Validates: Requirements 1.5
  test('Property 2: For any keyword in dictionary, searching by its pinyin prefix includes that keyword', () => {
    fc.assert(
      fc.property(
        // Pick a random keyword from the dictionary
        fc.integer({ min: 0, max: suggestion.dictionary.length - 1 }),
        // Pick a prefix length (at least 1 char of pinyin)
        fc.integer({ min: 1, max: 6 }),
        (idx, prefixLen) => {
          const entry = suggestion.dictionary[idx];
          const fullPinyin = entry.pinyin;
          if (!fullPinyin || fullPinyin.length === 0) return; // skip if no pinyin

          const prefix = fullPinyin.substring(0, Math.min(prefixLen, fullPinyin.length));
          // pinyinMatch should return true
          expect(suggestion.pinyinMatch(prefix, entry.keyword)).toBe(true);

          // getSuggestions with this prefix should include the keyword
          // (if within the 8-item limit — we check it's findable at some limit)
          const results = suggestion.getSuggestions(prefix, 500);
          expect(results).toContain(entry.keyword);
        }
      ),
      { numRuns: 100 }
    );
  });

  // Unit tests for specific examples
  test('Chinese prefix "水稻" returns relevant suggestions', () => {
    const results = suggestion.getSuggestions('水稻');
    expect(results.length).toBeGreaterThan(0);
    expect(results.length).toBeLessThanOrEqual(8);
    results.forEach(r => expect(r).toMatch(/水稻/));
  });

  test('Pinyin prefix "nongye" returns agriculture-related suggestions', () => {
    const results = suggestion.getSuggestions('nongye');
    expect(results.length).toBeGreaterThan(0);
    results.forEach(r => expect(r).toMatch(/农/));
  });

  test('Empty or whitespace prefix returns empty array', () => {
    expect(suggestion.getSuggestions('')).toEqual([]);
    expect(suggestion.getSuggestions('  ')).toEqual([]);
    expect(suggestion.getSuggestions(null)).toEqual([]);
    expect(suggestion.getSuggestions(undefined)).toEqual([]);
  });

  test('Non-matching prefix returns empty array', () => {
    expect(suggestion.getSuggestions('zzzzzzz')).toEqual([]);
    expect(suggestion.getSuggestions('xyz123')).toEqual([]);
  });

  test('Dictionary has 500+ terms', () => {
    expect(suggestion.dictionary.length).toBeGreaterThanOrEqual(500);
  });
});
