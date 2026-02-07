/**
 * 标签推荐服务 (Recommendation Service)
 * 基于共享标签、同分类、同来源计算相关度，推荐相关资源
 */

class RecommendationService {
  /**
   * 获取相关推荐资源
   * @param {object} resource - 当前资源
   * @param {object[]} allResources - 候选资源池
   * @param {number} limit - 最大推荐数量，默认 6
   * @returns {object[]} 推荐资源列表（按相关度降序）
   */
  getRecommendations(resource, allResources, limit = 6) {
    if (!resource || !allResources || !Array.isArray(allResources)) return [];

    // Exclude the source resource
    const candidates = allResources.filter(r => r._id !== resource._id);

    // Score each candidate
    const scored = candidates.map(r => ({
      resource: r,
      score: this.computeRelevanceScore(resource, r)
    }));

    // Sort by score descending
    scored.sort((a, b) => b.score - a.score);

    // Get tag-matched results (score > 0 from tags)
    const resourceTags = new Set((resource.tags || []).map(t => t.toLowerCase()));
    const tagMatched = scored.filter(s => {
      const candidateTags = (s.resource.tags || []).map(t => t.toLowerCase());
      return candidateTags.some(t => resourceTags.has(t));
    });

    let results;
    if (tagMatched.length >= 3) {
      // Enough tag matches — take top ones
      results = scored.slice(0, limit);
    } else {
      // Fallback: supplement with same-category resources
      const tagMatchedIds = new Set(tagMatched.map(s => s.resource._id));
      const sameCat = scored.filter(s =>
        !tagMatchedIds.has(s.resource._id) &&
        s.resource.category === resource.category
      );
      // Combine: tag-matched first, then same-category, re-sort by score
      const combined = [...tagMatched, ...sameCat];
      combined.sort((a, b) => b.score - a.score);
      // Deduplicate
      const seen = new Set();
      results = [];
      for (const s of combined) {
        if (seen.has(s.resource._id)) continue;
        seen.add(s.resource._id);
        results.push(s);
        if (results.length >= limit) break;
      }
    }

    return results.slice(0, limit).map(s => s.resource);
  }

  /**
   * 计算两个资源的相关度分数
   * @param {object} a - 资源 A
   * @param {object} b - 资源 B
   * @returns {number} 相关度分数
   */
  computeRelevanceScore(a, b) {
    let score = 0;

    // Shared tags count
    const tagsA = new Set((a.tags || []).map(t => t.toLowerCase()));
    const tagsB = (b.tags || []).map(t => t.toLowerCase());
    for (const t of tagsB) {
      if (tagsA.has(t)) score += 1;
    }

    // Same category bonus
    if (a.category && a.category === b.category) score += 2;

    // Same source bonus
    if (a.source && a.source === b.source) score += 1;

    return score;
  }
}

module.exports = new RecommendationService();
