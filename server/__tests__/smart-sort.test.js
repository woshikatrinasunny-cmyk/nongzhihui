const fc = require('fast-check');
const smartSort = require('../services/smart-sort');

const resourceArb = fc.record({
  _id: fc.uuid(),
  title: fc.string({ minLength: 1, maxLength: 50 }),
  summary: fc.string({ maxLength: 100 }),
  category: fc.constantFrom('law', 'policy', 'tech', 'culture', 'paper'),
  publishTime: fc.integer({ min: 2000, max: 2026 }).map(y => `${y}-06-15`),
  source: fc.constantFrom('中国政府网', '农业农村部', 'Bing搜索'),
  sourceUrl: fc.constant('https://example.com'),
  tags: fc.array(fc.string({ minLength: 1, maxLength: 10 }), { maxLength: 5 }),
  authority: fc.constantFrom('official', 'professional', 'general'),
  platform: fc.constantFrom('bing', 'baidu', 'gov'),
  platformName: fc.string({ minLength: 1, maxLength: 20 }),
  viewCount: fc.nat({ max: 100000 }),
  collectCount: fc.nat({ max: 10000 })
});

const AUTHORITY_RANK = { official: 3, professional: 2, general: 1 };

describe('Smart Sort Engine', () => {
  // Feature: enhanced-agri-search, Property 9: Authority sort ordering
  // Validates: Requirements 5.3
  test('Property 9: Authority sort produces non-increasing authority order', () => {
    fc.assert(
      fc.property(
        fc.array(resourceArb, { minLength: 0, maxLength: 30 }),
        (resources) => {
          const sorted = smartSort.sort(resources, 'authority');
          for (let i = 1; i < sorted.length; i++) {
            const rankPrev = AUTHORITY_RANK[sorted[i - 1].authority] || 0;
            const rankCurr = AUTHORITY_RANK[sorted[i].authority] || 0;
            expect(rankPrev).toBeGreaterThanOrEqual(rankCurr);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  // Feature: enhanced-agri-search, Property 10: Relevance score composite formula
  // Validates: Requirements 5.2
  test('Property 10: Higher composite score appears before lower score in relevance sort', () => {
    fc.assert(
      fc.property(
        fc.array(resourceArb, { minLength: 0, maxLength: 30 }),
        fc.string({ minLength: 1, maxLength: 10 }),
        (resources, keyword) => {
          const sorted = smartSort.sort(resources, 'relevance', keyword);
          for (let i = 1; i < sorted.length; i++) {
            const scoreA = smartSort.computeRelevanceScore(sorted[i - 1], keyword);
            const scoreB = smartSort.computeRelevanceScore(sorted[i], keyword);
            expect(scoreA).toBeGreaterThanOrEqual(scoreB);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  // Unit tests
  test('Time sort puts newest first', () => {
    const resources = [
      { _id: '1', publishTime: '2020-01-01' },
      { _id: '2', publishTime: '2025-06-01' },
      { _id: '3', publishTime: '2022-03-15' }
    ];
    const sorted = smartSort.sort(resources, 'time');
    expect(sorted[0]._id).toBe('2');
    expect(sorted[1]._id).toBe('3');
    expect(sorted[2]._id).toBe('1');
  });

  test('Popularity sort puts highest viewCount first', () => {
    const resources = [
      { _id: '1', viewCount: 100 },
      { _id: '2', viewCount: 5000 },
      { _id: '3', viewCount: 500 }
    ];
    const sorted = smartSort.sort(resources, 'popularity');
    expect(sorted[0]._id).toBe('2');
    expect(sorted[1]._id).toBe('3');
    expect(sorted[2]._id).toBe('1');
  });

  test('Sort does not mutate original array', () => {
    const resources = [
      { _id: '1', authority: 'general' },
      { _id: '2', authority: 'official' }
    ];
    const original = [...resources];
    smartSort.sort(resources, 'authority');
    expect(resources[0]._id).toBe(original[0]._id);
  });
});
