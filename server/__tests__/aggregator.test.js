const fc = require('fast-check');
const aggregator = require('../services/aggregator');

describe('Aggregator - Merge Deduplication', () => {
  // Feature: enhanced-agri-search, Property 8: Merge deduplication and labeling
  // Validates: Requirements 4.4
  test('Property 8: Merged list has no duplicate normalized titles and every item has a platform label', () => {
    const resourceArb = fc.record({
      _id: fc.uuid(),
      title: fc.stringMatching(/^[\u4e00-\u9fff]{2,10}$/),
      summary: fc.string({ maxLength: 50 }),
      category: fc.constantFrom('law', 'policy', 'tech'),
      publishTime: fc.constant('2025-06-15'),
      source: fc.constantFrom('中国政府网', '农业农村部', ''),
      sourceUrl: fc.constant('https://example.com'),
      tags: fc.constant([]),
      authority: fc.constantFrom('official', 'general'),
      platform: fc.constantFrom('bing', 'baidu', 'gov', ''),
      platformName: fc.constantFrom('Bing搜索', '百度搜索', '政府网', '')
    });

    fc.assert(
      fc.property(
        fc.array(resourceArb, { minLength: 0, maxLength: 30 }),
        (resources) => {
          const deduped = aggregator.deduplicateResults([...resources]);

          // No two items with same normalized title
          const normalizedTitles = deduped.map(r => aggregator.normalizeTitle(r.title));
          const uniqueTitles = new Set(normalizedTitles);
          expect(uniqueTitles.size).toBe(normalizedTitles.length);

          // Every item has a non-empty platformName
          for (const r of deduped) {
            expect(r.platformName).toBeTruthy();
            expect(r.platformName.length).toBeGreaterThan(0);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  // Unit tests
  test('Duplicate titles with different punctuation are deduped', () => {
    const resources = [
      { title: '农村土地承包法', platformName: 'A', platform: 'a' },
      { title: '农村土地承包法。', platformName: 'B', platform: 'b' },
      { title: '  农村土地承包法  ', platformName: 'C', platform: 'c' }
    ];
    const result = aggregator.deduplicateResults([...resources]);
    expect(result.length).toBe(1);
  });

  test('Items without platformName get one assigned', () => {
    const resources = [
      { title: '测试资源', platformName: '', platform: 'bing', source: '' }
    ];
    const result = aggregator.deduplicateResults([...resources]);
    expect(result[0].platformName).toBeTruthy();
  });
});
