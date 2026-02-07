/**
 * 多维度筛选引擎 (Filter Engine)
 * 支持按年份范围、分类、来源、地区、作物类型进行 AND 组合筛选
 */

class FilterEngine {
  /**
   * 对资源列表应用筛选条件
   * @param {object[]} resources - 资源列表
   * @param {object} filters - 筛选条件 { year, category, source, region, cropType }
   * @returns {object[]} 筛选后的资源列表
   */
  applyFilters(resources, filters) {
    if (!resources || !Array.isArray(resources)) return [];
    if (!filters || typeof filters !== 'object') return resources;

    return resources.filter(r => {
      // Year range filter
      if (filters.year && Array.isArray(filters.year) && filters.year.length === 2) {
        const [minYear, maxYear] = filters.year;
        const year = this._extractYear(r.publishTime);
        if (year !== null && (year < minYear || year > maxYear)) return false;
      }
      // Category filter
      if (filters.category && Array.isArray(filters.category) && filters.category.length > 0) {
        if (!filters.category.includes(r.category)) return false;
      }
      // Source filter
      if (filters.source && Array.isArray(filters.source) && filters.source.length > 0) {
        if (!filters.source.includes(r.source) && !filters.source.includes(r.platform)) return false;
      }
      // Region filter
      if (filters.region && Array.isArray(filters.region) && filters.region.length > 0) {
        if (!r.region || !filters.region.includes(r.region)) return false;
      }
      // CropType filter
      if (filters.cropType && Array.isArray(filters.cropType) && filters.cropType.length > 0) {
        if (!r.cropType || !filters.cropType.includes(r.cropType)) return false;
      }
      return true;
    });
  }

  /**
   * 计算各筛选维度的计数（基于当前已筛选结果）
   * @param {object[]} resources - 原始资源列表
   * @param {object} activeFilters - 当前激活的筛选条件
   * @returns {object} 各维度计数
   */
  computeFilterCounts(resources, activeFilters) {
    if (!resources || !Array.isArray(resources)) {
      return { year: {}, category: {}, source: {}, region: {}, cropType: {} };
    }

    const counts = { year: {}, category: {}, source: {}, region: {}, cropType: {} };

    // For each dimension, compute counts with all OTHER filters applied
    const dimensions = ['year', 'category', 'source', 'region', 'cropType'];

    for (const dim of dimensions) {
      // Apply all filters EXCEPT the current dimension
      const otherFilters = {};
      for (const d of dimensions) {
        if (d !== dim && activeFilters && activeFilters[d]) {
          otherFilters[d] = activeFilters[d];
        }
      }
      const filtered = this.applyFilters(resources, otherFilters);

      for (const r of filtered) {
        if (dim === 'year') {
          const year = this._extractYear(r.publishTime);
          if (year !== null) {
            const key = String(year);
            counts.year[key] = (counts.year[key] || 0) + 1;
          }
        } else if (dim === 'category') {
          if (r.category) {
            counts.category[r.category] = (counts.category[r.category] || 0) + 1;
          }
        } else if (dim === 'source') {
          const key = r.source || r.platform || '';
          if (key) counts.source[key] = (counts.source[key] || 0) + 1;
        } else if (dim === 'region') {
          if (r.region) counts.region[r.region] = (counts.region[r.region] || 0) + 1;
        } else if (dim === 'cropType') {
          if (r.cropType) counts.cropType[r.cropType] = (counts.cropType[r.cropType] || 0) + 1;
        }
      }
    }

    return counts;
  }

  _extractYear(publishTime) {
    if (!publishTime) return null;
    const match = String(publishTime).match(/(\d{4})/);
    return match ? parseInt(match[1], 10) : null;
  }
}

module.exports = new FilterEngine();
