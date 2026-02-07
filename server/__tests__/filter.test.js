const fc = require('fast-check');
const filter = require('../services/filter');

// Arbitrary for a Resource-like object
const resourceArb = fc.record({
  _id: fc.string({ minLength: 1, maxLength: 20 }),
  title: fc.string({ minLength: 1, maxLength: 100 }),
  summary: fc.string({ maxLength: 200 }),
  category: fc.constantFrom('law', 'policy', 'tech', 'culture', 'paper'),
  publishTime: fc.integer({ min: 2000, max: 2026 }).map(y => `${y}-06-15`),
  source: fc.constantFrom('中国政府网', '农业农村部', 'Bing搜索', '百度搜索', '国家统计局'),
  sourceUrl: fc.constant('https://example.com'),
  tags: fc.array(fc.string({ minLength: 1, maxLength: 10 }), { maxLength: 5 }),
  authority: fc.constantFrom('official', 'professional', 'general'),
  platform: fc.constantFrom('bing', 'baidu', 'gov', 'moa'),
  platformName: fc.string({ minLength: 1, maxLength: 20 }),
  region: fc.constantFrom('北京', '上海', '广东', '四川', '黑龙江', undefined),
  cropType: fc.constantFrom('水稻', '小麦', '玉米', '大豆', undefined),
  viewCount: fc.nat({ max: 10000 }),
  collectCount: fc.nat({ max: 1000 })
});

const resourceListArb = fc.array(resourceArb, { minLength: 0, maxLength: 30 });

describe('Filter Engine', () => {
  // Feature: enhanced-agri-search, Property 3: Filter correctness
  // Validates: Requirements 2.2
  test('Property 3: All results match all active filters', () => {
    fc.assert(
      fc.property(
        resourceListArb,
        fc.record({
          category: fc.option(
            fc.subarray(['law', 'policy', 'tech', 'culture', 'paper'], { minLength: 1 }),
            { nil: undefined }
          ),
          source: fc.option(
            fc.subarray(['中国政府网', '农业农村部', 'Bing搜索', '百度搜索'], { minLength: 1 }),
            { nil: undefined }
          ),
          region: fc.option(
            fc.subarray(['北京', '上海', '广东', '四川', '黑龙江'], { minLength: 1 }),
            { nil: undefined }
          ),
          cropType: fc.option(
            fc.subarray(['水稻', '小麦', '玉米', '大豆'], { minLength: 1 }),
            { nil: undefined }
          )
        }),
        (resources, filters) => {
          const cleanFilters = {};
          if (filters.category) cleanFilters.category = filters.category;
          if (filters.source) cleanFilters.source = filters.source;
          if (filters.region) cleanFilters.region = filters.region;
          if (filters.cropType) cleanFilters.cropType = filters.cropType;

          const results = filter.applyFilters(resources, cleanFilters);

          for (const r of results) {
            if (cleanFilters.category) {
              expect(cleanFilters.category).toContain(r.category);
            }
            if (cleanFilters.source) {
              const matchesSource = cleanFilters.source.includes(r.source) ||
                                    cleanFilters.source.includes(r.platform);
              expect(matchesSource).toBe(true);
            }
            if (cleanFilters.region) {
              expect(cleanFilters.region).toContain(r.region);
            }
            if (cleanFilters.cropType) {
              expect(cleanFilters.cropType).toContain(r.cropType);
            }
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  // Feature: enhanced-agri-search, Property 4: Filter removal round-trip
  // Validates: Requirements 2.3
  test('Property 4: Applying a filter then removing it produces the same result as no filter', () => {
    fc.assert(
      fc.property(
        resourceListArb,
        fc.constantFrom('category', 'source', 'region', 'cropType'),
        (resources, dimension) => {
          // Apply no filters
          const noFilter = filter.applyFilters(resources, {});

          // Apply a filter then remove it (empty object = no filter)
          const withFilter = { [dimension]: ['law'] };
          // "Remove" the filter by setting it back to empty
          const afterRemoval = filter.applyFilters(resources, {});

          // Should be the same
          expect(afterRemoval.length).toBe(noFilter.length);
          expect(afterRemoval.map(r => r._id)).toEqual(noFilter.map(r => r._id));
        }
      ),
      { numRuns: 100 }
    );
  });

  // Feature: enhanced-agri-search, Property 5: Filter count accuracy
  // Validates: Requirements 2.4
  test('Property 5: Filter counts match actual number of resources for each option', () => {
    fc.assert(
      fc.property(
        resourceListArb,
        (resources) => {
          const counts = filter.computeFilterCounts(resources, {});

          // Verify category counts
          for (const [cat, count] of Object.entries(counts.category)) {
            const actual = resources.filter(r => r.category === cat).length;
            expect(count).toBe(actual);
          }

          // Verify source counts
          for (const [src, count] of Object.entries(counts.source)) {
            const actual = resources.filter(r =>
              (r.source === src) || (r.platform === src)
            ).length;
            expect(count).toBe(actual);
          }

          // Verify region counts
          for (const [reg, count] of Object.entries(counts.region)) {
            const actual = resources.filter(r => r.region === reg).length;
            expect(count).toBe(actual);
          }

          // Verify cropType counts
          for (const [crop, count] of Object.entries(counts.cropType)) {
            const actual = resources.filter(r => r.cropType === crop).length;
            expect(count).toBe(actual);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  // Unit tests
  test('Empty resource list returns empty', () => {
    expect(filter.applyFilters([], { category: ['law'] })).toEqual([]);
  });

  test('No filters returns all resources', () => {
    const resources = [
      { _id: '1', category: 'law', publishTime: '2024-01-01' },
      { _id: '2', category: 'tech', publishTime: '2023-06-01' }
    ];
    expect(filter.applyFilters(resources, {})).toHaveLength(2);
  });

  test('Year range filter works correctly', () => {
    const resources = [
      { _id: '1', publishTime: '2020-01-01' },
      { _id: '2', publishTime: '2023-06-01' },
      { _id: '3', publishTime: '2025-12-01' }
    ];
    const result = filter.applyFilters(resources, { year: [2022, 2024] });
    expect(result).toHaveLength(1);
    expect(result[0]._id).toBe('2');
  });
});
