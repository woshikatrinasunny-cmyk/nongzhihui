# Implementation Plan: Enhanced Agricultural Search (农智汇增强搜索)

## Overview

基于现有 Node.js + Flask 架构，增量实现搜索联想词、多维度筛选、标签推荐、智能排序四大模块。使用 JavaScript (Node.js) 实现后端逻辑，fast-check 进行属性测试。

## Tasks

- [x] 1. Set up testing infrastructure
  - Install jest and fast-check in `server/`
  - Create `server/__tests__/` directory
  - Add test scripts to `server/package.json`
  - _Requirements: 6.1, 6.2, 6.3_

- [x] 2. Implement Resource serialization and round-trip
  - [x] 2.1 Create `server/services/serializer.js` with `serialize()` and `deserialize()` functions for Resource objects
    - Ensure all fields (_id, title, summary, category, publishTime, source, sourceUrl, tags, authority, platform, platformName, region, cropType, viewCount, collectCount) are preserved
    - _Requirements: 6.1, 6.2, 6.3_

  - [x] 2.2 Write property test for Resource serialization round-trip
    - **Property 11: Resource serialization round-trip**
    - **Validates: Requirements 6.3**

- [x] 3. Implement Suggestion Service (搜索联想词)
  - [x] 3.1 Create `server/services/suggestion.js` with agricultural keyword dictionary (500+ terms)
    - Build in-memory Trie structure for prefix matching
    - Include pinyin support using `pinyin-pro` library
    - Cover crops, livestock, policies, laws, farming techniques
    - _Requirements: 1.1, 1.2, 1.3, 1.5_

  - [x] 3.2 Add `GET /api/suggestions` route in `server/routes/search.js`
    - Accept `prefix` query parameter
    - Return up to 8 suggestions sorted by weight
    - _Requirements: 1.3, 1.6_

  - [x] 3.3 Write property test for suggestion count limit
    - **Property 1: Suggestion count limit**
    - **Validates: Requirements 1.3**

  - [x] 3.4 Write property test for pinyin prefix matching
    - **Property 2: Pinyin prefix matching correctness**
    - **Validates: Requirements 1.5**

- [x] 4. Implement Filter Engine (多维度筛选)
  - [x] 4.1 Create `server/services/filter.js` with `applyFilters()` and `computeFilterCounts()`
    - Support year range, category, source, region, cropType filters
    - All filters are AND-combined
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.6, 2.7_

  - [x] 4.2 Integrate filter engine into `GET /api/search` route
    - Accept filter parameters from query string
    - Return filtered results with filter counts
    - _Requirements: 2.1, 2.2_

  - [x] 4.3 Write property test for filter correctness
    - **Property 3: Filter correctness — all results match all active filters**
    - **Validates: Requirements 2.2**

  - [x] 4.4 Write property test for filter removal round-trip
    - **Property 4: Filter removal round-trip**
    - **Validates: Requirements 2.3**

  - [x] 4.5 Write property test for filter count accuracy
    - **Property 5: Filter count accuracy**
    - **Validates: Requirements 2.4**

- [x] 5. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 6. Implement Recommendation Service (标签推荐)
  - [x] 6.1 Create `server/services/recommendation.js` with `getRecommendations()` and `computeRelevanceScore()`
    - Score based on shared tags count, same category (+2), same source (+1)
    - Fallback to same-category resources when tag matches < 3
    - Exclude the source resource from results
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

  - [x] 6.2 Enhance `GET /api/resources/:id/related` route to use Recommendation Service
    - Replace current simple keyword-based related search
    - _Requirements: 3.1_

  - [x] 6.3 Write property test for recommendation invariants
    - **Property 6: Recommendation invariants**
    - **Validates: Requirements 3.1, 3.4, 3.5**

  - [x] 6.4 Write property test for recommendation fallback
    - **Property 7: Recommendation fallback to category**
    - **Validates: Requirements 3.3**

- [x] 7. Implement Smart Sort Engine (智能排序)
  - [x] 7.1 Create `server/services/smart-sort.js` with `sort()` and `computeRelevanceScore()`
    - Relevance mode: keyword match (40%) + authority (30%) + recency (20%) + popularity (10%)
    - Authority mode: official > professional > general
    - Time mode: newest first
    - Popularity mode: highest viewCount first
    - _Requirements: 5.1, 5.2, 5.3_

  - [x] 7.2 Integrate smart sort into search route, replacing existing simple sort
    - Accept `sortBy` parameter: relevance, time, authority, popularity
    - _Requirements: 5.1, 5.4, 5.5_

  - [x] 7.3 Write property test for authority sort ordering
    - **Property 9: Authority sort ordering**
    - **Validates: Requirements 5.3**

  - [x] 7.4 Write property test for relevance score ordering
    - **Property 10: Relevance score composite formula**
    - **Validates: Requirements 5.2**

- [x] 8. Implement merge deduplication and source labeling
  - [x] 8.1 Enhance `server/services/aggregator.js` merge logic
    - Normalize titles for dedup (trim, lowercase, remove punctuation)
    - Ensure every merged result has a non-empty platform label
    - _Requirements: 4.4_

  - [x] 8.2 Write property test for merge deduplication and labeling
    - **Property 8: Merge deduplication and labeling**
    - **Validates: Requirements 4.4**

- [x] 9. Update Flask frontend for new features
  - [x] 9.1 Add search suggestion UI to search page (`html/templates/search.html`)
    - Add AJAX call to `/api/suggestions` on input
    - Display dropdown with up to 8 suggestions
    - _Requirements: 1.1, 1.3, 1.6_

  - [x] 9.2 Add filter panel to search results page (`html/templates/search.html`)
    - Add sidebar/panel with year, category, source, region, cropType filters
    - Update results dynamically when filters change
    - _Requirements: 2.1, 2.2, 2.3_

  - [x] 9.3 Add sort mode selector to search results page
    - Add dropdown/buttons for relevance, time, authority, popularity
    - _Requirements: 5.1, 5.5_

  - [x] 9.4 Update Flask proxy routes in `html/app.py` to pass filter and sort parameters
    - Forward filter and sort params to Node backend
    - _Requirements: 2.2, 5.1_

- [x] 10. Update miniprogram frontend for new features
  - [x] 10.1 Add search suggestion to miniprogram search page (`miniprogram/pages/search/`)
    - Call `/api/suggestions` API on input change
    - Display suggestion list below search input
    - _Requirements: 1.1, 1.3, 1.6_

  - [x] 10.2 Add filter panel to miniprogram search results
    - Use existing filter-panel component or enhance it
    - _Requirements: 2.1, 2.2_

- [x] 11. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- All tasks are required (comprehensive testing)
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties
- Unit tests validate specific examples and edge cases
- The implementation builds on existing `server/services/web-search.js` and `server/services/aggregator.js`
