const fc = require('fast-check');
const recommendation = require('../services/recommendation');

const tagArb = fc.constantFrom(
  '水稻', '小麦', '玉米', '大豆', '农业补贴', '土地承包',
  '病虫害', '种植技术', '乡村振兴', '农产品', '畜牧', '渔业'
);

const resourceArb = fc.record({
  _id: fc.uuid(),
  title: fc.string({ minLength: 1, maxLength: 50 }),
  summary: fc.string({ maxLength: 100 }),
  category: fc.constantFrom('law', 'policy', 'tech', 'culture', 'paper'),
  publishTime: fc.integer({ min: 2000, max: 2026 }).map(y => `${y}-06-15`),
  source: fc.constantFrom('中国政府网', '农业农村部', 'Bing搜索'),
  sourceUrl: fc.constant('https://example.com'),
  tags: fc.array(tagArb, { minLength: 0, maxLength: 5 }),
  authority: fc.constantFrom('official', 'professional', 'general'),
  platform: fc.constantFrom('bing', 'baidu', 'gov'),
  platformName: fc.string({ minLength: 1, maxLength: 20 }),
  viewCount: fc.nat({ max: 10000 }),
  collectCount: fc.nat({ max: 1000 })
});

describe('Recommendation Service', () => {
  // Feature: enhanced-agri-search, Property 6: Recommendation invariants
  // Validates: Requirements 3.1, 3.4, 3.5
  test('Property 6: Recommendations have at most 6 items, exclude source, sorted by score desc', () => {
    fc.assert(
      fc.property(
        resourceArb,
        fc.array(resourceArb, { minLength: 0, maxLength: 20 }),
        (source, pool) => {
          const results = recommendation.getRecommendations(source, pool, 6);

          // (a) At most 6 items
          expect(results.length).toBeLessThanOrEqual(6);

          // (b) Never includes the source resource
          for (const r of results) {
            expect(r._id).not.toBe(source._id);
          }

          // (c) Sorted by relevance score descending
          for (let i = 1; i < results.length; i++) {
            const scoreA = recommendation.computeRelevanceScore(source, results[i - 1]);
            const scoreB = recommendation.computeRelevanceScore(source, results[i]);
            expect(scoreA).toBeGreaterThanOrEqual(scoreB);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  // Feature: enhanced-agri-search, Property 7: Recommendation fallback to category
  // Validates: Requirements 3.3
  test('Property 7: When tag matches < 3, supplements with same-category resources', () => {
    fc.assert(
      fc.property(
        resourceArb,
        fc.array(resourceArb, { minLength: 5, maxLength: 20 }),
        (source, pool) => {
          // Ensure source has unique tags that won't match much
          const modifiedSource = {
            ...source,
            tags: ['极其罕见的标签XYZ']
          };

          // Add some same-category resources to the pool
          const sameCatResources = pool.map((r, i) => ({
            ...r,
            _id: `same_cat_${i}`,
            category: modifiedSource.category,
            tags: ['其他标签']
          }));

          const fullPool = [...pool, ...sameCatResources];
          const results = recommendation.getRecommendations(modifiedSource, fullPool, 6);

          // If there are same-category resources available, results should not be empty
          const availableSameCat = fullPool.filter(r =>
            r._id !== modifiedSource._id && r.category === modifiedSource.category
          );
          if (availableSameCat.length > 0) {
            expect(results.length).toBeGreaterThan(0);
            // Should contain some same-category resources
            const sameCatInResults = results.filter(r => r.category === modifiedSource.category);
            expect(sameCatInResults.length).toBeGreaterThan(0);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  // Unit tests
  test('Empty pool returns empty recommendations', () => {
    const source = { _id: '1', tags: ['水稻'], category: 'tech' };
    expect(recommendation.getRecommendations(source, [])).toEqual([]);
  });

  test('computeRelevanceScore gives bonus for shared tags, category, source', () => {
    const a = { tags: ['水稻', '种植'], category: 'tech', source: '农业农村部' };
    const b = { tags: ['水稻', '病虫害'], category: 'tech', source: '农业农村部' };
    const score = recommendation.computeRelevanceScore(a, b);
    // 1 shared tag + 2 same category + 1 same source = 4
    expect(score).toBe(4);
  });
});
