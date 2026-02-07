const fc = require('fast-check');
const { serialize, deserialize } = require('../services/serializer');

// Generator for valid Resource objects
const resourceArb = fc.record({
  _id: fc.string({ minLength: 1, maxLength: 30 }),
  title: fc.string({ minLength: 1, maxLength: 200 }),
  summary: fc.string({ maxLength: 500 }),
  category: fc.constantFrom('law', 'policy', 'tech', 'culture', 'paper'),
  publishTime: fc.date({ min: new Date('2000-01-01'), max: new Date('2026-12-31') })
    .map(d => d.toISOString().split('T')[0]),
  source: fc.string({ minLength: 1, maxLength: 50 }),
  sourceUrl: fc.webUrl(),
  tags: fc.array(fc.string({ minLength: 1, maxLength: 20 }), { maxLength: 10 }),
  authority: fc.constantFrom('official', 'professional', 'general'),
  platform: fc.string({ minLength: 1, maxLength: 20 }),
  platformName: fc.string({ minLength: 1, maxLength: 30 }),
  region: fc.option(fc.string({ minLength: 1, maxLength: 20 }), { nil: undefined }),
  cropType: fc.option(fc.string({ minLength: 1, maxLength: 20 }), { nil: undefined }),
  viewCount: fc.nat({ max: 100000 }),
  collectCount: fc.nat({ max: 10000 })
});

describe('Resource Serializer', () => {
  // Feature: enhanced-agri-search, Property 11: Resource serialization round-trip
  // Validates: Requirements 6.3
  test('Property 11: For any valid Resource, serialize then deserialize produces equivalent object', () => {
    fc.assert(
      fc.property(resourceArb, (resource) => {
        const json = serialize(resource);
        const restored = deserialize(json);

        // All defined fields must match
        for (const [key, value] of Object.entries(resource)) {
          if (value !== undefined) {
            if (Array.isArray(value)) {
              expect(restored[key]).toEqual(value);
            } else {
              expect(restored[key]).toBe(value);
            }
          }
        }
      }),
      { numRuns: 100 }
    );
  });
});
