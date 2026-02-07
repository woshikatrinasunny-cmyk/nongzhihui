/**
 * 统一 API 请求层
 * 优先请求 Render 后端获取真实数据，失败时降级到本地数据
 */

const localData = require('./local-data.js');

const API_BASE = 'https://nongzhihui-api.onrender.com';
let _apiOnline = null; // null=未检测, true/false

function request(path, timeout = 12000) {
  return new Promise((resolve, reject) => {
    wx.request({
      url: `${API_BASE}${path}`,
      method: 'GET',
      timeout,
      success(res) {
        if (res.statusCode === 200 && res.data && res.data.code === 0) {
          resolve(res.data.data);
        } else {
          reject(new Error(`API ${res.statusCode}`));
        }
      },
      fail(err) { reject(err); }
    });
  });
}

/** 检测后端是否在线（带缓存） */
function checkOnline() {
  if (_apiOnline !== null) return Promise.resolve(_apiOnline);
  return request('/api/search/hot', 8000)
    .then(() => { _apiOnline = true; return true; })
    .catch(() => { _apiOnline = false; return false; });
}

/** 重置在线状态（下次会重新检测） */
function resetOnlineStatus() { _apiOnline = null; }

/** 获取热门资源 */
function getHotResources(limit = 5) {
  return request(`/api/resources/hot`)
    .then(list => (list || []).slice(0, limit).map(r => ({
      ...r, category: localData.CATEGORY_MAP[r.category] || r.category
    })))
    .catch(() => {
      console.log('[API] 热门资源降级到本地');
      return localData.getHotResources(limit).map(r => ({
        ...r, category: localData.CATEGORY_MAP[r.category] || r.category
      }));
    });
}

/** 获取最新政策 */
function getLatestPolicies(limit = 5) {
  return request(`/api/resources/latest?category=policy`)
    .then(list => (list || []).slice(0, limit).map(r => ({
      ...r, category: localData.CATEGORY_MAP[r.category] || r.category
    })))
    .catch(() => {
      console.log('[API] 最新政策降级到本地');
      return localData.getLatestPolicies(limit).map(r => ({
        ...r, category: localData.CATEGORY_MAP[r.category] || r.category
      }));
    });
}

/** 获取分类资源列表 */
function getResources(options = {}) {
  const { category, page = 1, pageSize = 20 } = options;
  const params = [`page=${page}`, `pageSize=${pageSize}`];
  if (category) params.push(`category=${category}`);

  return request(`/api/resources?${params.join('&')}`)
    .then(data => ({
      list: data.list || [],
      total: data.total || 0,
      hasMore: data.hasMore || false
    }))
    .catch(() => {
      console.log('[API] 分类资源降级到本地');
      return localData.getResources(options);
    });
}

/** 搜索 */
function search(keyword, options = {}) {
  const { category, sortBy = 'relevance', page = 1, pageSize = 10 } = options;
  const params = [
    `keyword=${encodeURIComponent(keyword)}`,
    `page=${page}`, `pageSize=${pageSize}`, `sortBy=${sortBy}`
  ];
  if (category) params.push(`category=${category}`);

  return request(`/api/search?${params.join('&')}`, 15000)
    .then(data => ({
      list: data.list || [],
      total: data.total || 0,
      hasMore: data.hasMore || false,
      isWeb: true
    }))
    .catch(() => {
      console.log('[API] 搜索降级到本地');
      const result = localData.searchResources(keyword, options);
      return { ...result, isWeb: false };
    });
}

/** 获取资源详情 */
function getResourceById(id) {
  return request(`/api/resources/${encodeURIComponent(id)}`)
    .then(data => ({ resource: data, isWeb: true }))
    .catch(() => {
      const r = localData.getResourceById(id);
      return { resource: r, isWeb: false };
    });
}

/** 获取相关推荐 */
function getRelatedResources(id) {
  return request(`/api/resources/${encodeURIComponent(id)}/related`)
    .then(list => list || [])
    .catch(() => {
      const r = localData.getResourceById(id);
      return r ? localData.getRelatedResources(r, 5) : [];
    });
}

module.exports = {
  checkOnline, resetOnlineStatus,
  getHotResources, getLatestPolicies,
  getResources, search,
  getResourceById, getRelatedResources,
  API_BASE
};
