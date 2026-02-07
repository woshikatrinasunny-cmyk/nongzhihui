/**
 * 智能排序引擎 (Smart Sort Engine)
 * 支持相关性、时间、权威度、热度四种排序模式
 */

const AUTHORITY_ORDER = { official: 3, professional: 2, general: 1 };

class SmartSortEngine {
  /**
   * 按指定模式排序
   * @param {object[]} resources - 资源列表
   * @param {string} mode - 排序模式: relevance | time | authority | popularity
   * @param {string} keyword - 搜索关键词（相关性排序用）
   * @returns {object[]} 排序后的资源列表（新数组）
   */
  sort(resources, mode = 'relevance', keyword = '') {
    if (!resources || !Array.isArray(resources)) return [];
    const sorted = [...resources];

    switch (mode) {
      case 'time':
        sorted.sort((a, b) => {
          const ta = a.publishTime || '';
          const tb = b.publishTime || '';
          return tb.localeCompare(ta); // newest first
        });
        break;

      case 'authority':
        sorted.sort((a, b) => {
          const aa = AUTHORITY_ORDER[a.authority] || 0;
          const ab = AUTHORITY_ORDER[b.authority] || 0;
          return ab - aa; // highest authority first
        });
        break;

      case 'popularity':
        sorted.sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0));
        break;

      case 'relevance':
      default:
        // Pre-compute scores for stable sort
        const scores = new Map();
        for (const r of sorted) {
          scores.set(r, this.computeRelevanceScore(r, keyword));
        }
        sorted.sort((a, b) => scores.get(b) - scores.get(a));
        break;
    }

    return sorted;
  }

  /**
   * 计算综合相关性分数
   * keyword match (40%) + authority (30%) + recency (20%) + popularity (10%)
   * @param {object} resource
   * @param {string} keyword
   * @returns {number} 0-100 分数
   */
  computeRelevanceScore(resource, keyword) {
    const matchScore = this._keywordMatchScore(resource, keyword) * 0.4;
    const authScore = this._authorityScore(resource) * 0.3;
    const recencyScore = this._recencyScore(resource) * 0.2;
    const popScore = this._popularityScore(resource) * 0.1;
    return matchScore + authScore + recencyScore + popScore;
  }

  _keywordMatchScore(resource, keyword) {
    if (!keyword) return 50; // neutral when no keyword
    const kw = keyword.toLowerCase();
    const title = (resource.title || '').toLowerCase();
    const summary = (resource.summary || '').toLowerCase();
    const tags = (resource.tags || []).map(t => t.toLowerCase());

    let score = 0;
    if (title.includes(kw)) score += 60;
    if (summary.includes(kw)) score += 20;
    if (tags.some(t => t.includes(kw) || kw.includes(t))) score += 20;
    return Math.min(score, 100);
  }

  _authorityScore(resource) {
    const level = AUTHORITY_ORDER[resource.authority] || 0;
    return (level / 3) * 100; // official=100, professional=66.7, general=33.3
  }

  _recencyScore(resource) {
    if (!resource.publishTime) return 0;
    const match = String(resource.publishTime).match(/(\d{4})/);
    if (!match) return 0;
    const year = parseInt(match[1], 10);
    const currentYear = new Date().getFullYear();
    const age = currentYear - year;
    if (age <= 0) return 100;
    if (age >= 20) return 0;
    return Math.max(0, 100 - age * 5);
  }

  _popularityScore(resource) {
    const views = resource.viewCount || 0;
    // Log scale, cap at 100
    if (views <= 0) return 0;
    return Math.min(100, Math.log10(views + 1) * 20);
  }
}

module.exports = new SmartSortEngine();
