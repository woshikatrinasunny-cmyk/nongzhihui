/**
 * 统一 API 请求层
 * 优先请求 Render 后端获取真实数据，失败时降级到本地数据
 */
var localData = require('./local-data.js');
var API_BASE = 'https://nongzhihui-api.onrender.com';
var _apiOnline = null;

function request(path, timeout) {
  if (!timeout) timeout = 12000;
  return new Promise(function(resolve, reject) {
    wx.request({
      url: API_BASE + path,
      method: 'GET',
      timeout: timeout,
      success: function(res) {
        if (res.statusCode === 200 && res.data && res.data.code === 0) {
          resolve(res.data.data);
        } else {
          reject(new Error('API ' + res.statusCode));
        }
      },
      fail: function(err) { reject(err); }
    });
  });
}

function checkOnline() {
  if (_apiOnline !== null) return Promise.resolve(_apiOnline);
  return request('/api/search/hot', 8000)
    .then(function() { _apiOnline = true; return true; })
    .catch(function() { _apiOnline = false; return false; });
}

function resetOnlineStatus() { _apiOnline = null; }

function mapCategory(list, limit) {
  return (list || []).slice(0, limit).map(function(r) {
    var item = {};
    for (var k in r) { item[k] = r[k]; }
    item.category = localData.CATEGORY_MAP[r.category] || r.category;
    return item;
  });
}

function getHotResources(limit) {
  if (!limit) limit = 5;
  return request('/api/resources/hot')
    .then(function(list) { return mapCategory(list, limit); })
    .catch(function() {
      console.log('[API] 热门资源降级到本地');
      return mapCategory(localData.getHotResources(limit), limit);
    });
}

function getLatestPolicies(limit) {
  if (!limit) limit = 5;
  return request('/api/resources/latest?category=policy')
    .then(function(list) { return mapCategory(list, limit); })
    .catch(function() {
      console.log('[API] 最新政策降级到本地');
      return mapCategory(localData.getLatestPolicies(limit), limit);
    });
}

function getResources(options) {
  if (!options) options = {};
  var category = options.category;
  var page = options.page || 1;
  var pageSize = options.pageSize || 20;
  var params = ['page=' + page, 'pageSize=' + pageSize];
  if (category) params.push('category=' + category);

  return request('/api/resources?' + params.join('&'))
    .then(function(data) {
      return { list: data.list || [], total: data.total || 0, hasMore: data.hasMore || false };
    })
    .catch(function() {
      console.log('[API] 分类资源降级到本地');
      return localData.getResources(options);
    });
}

function search(keyword, options) {
  if (!options) options = {};
  var category = options.category;
  var sortBy = options.sortBy || 'relevance';
  var page = options.page || 1;
  var pageSize = options.pageSize || 10;
  var params = [
    'keyword=' + encodeURIComponent(keyword),
    'page=' + page, 'pageSize=' + pageSize, 'sortBy=' + sortBy
  ];
  if (category) params.push('category=' + category);

  return request('/api/search?' + params.join('&'), 15000)
    .then(function(data) {
      return { list: data.list || [], total: data.total || 0, hasMore: data.hasMore || false, isWeb: true };
    })
    .catch(function() {
      console.log('[API] 搜索降级到本地');
      var result = localData.searchResources(keyword, options);
      result.isWeb = false;
      return result;
    });
}

function getResourceById(id) {
  return request('/api/resources/' + encodeURIComponent(id))
    .then(function(data) { return { resource: data, isWeb: true }; })
    .catch(function() {
      var r = localData.getResourceById(id);
      return { resource: r, isWeb: false };
    });
}

function getRelatedResources(id) {
  return request('/api/resources/' + encodeURIComponent(id) + '/related')
    .then(function(list) { return list || []; })
    .catch(function() {
      var r = localData.getResourceById(id);
      return r ? localData.getRelatedResources(r, 5) : [];
    });
}

module.exports = {
  checkOnline: checkOnline,
  resetOnlineStatus: resetOnlineStatus,
  getHotResources: getHotResources,
  getLatestPolicies: getLatestPolicies,
  getResources: getResources,
  search: search,
  getResourceById: getResourceById,
  getRelatedResources: getRelatedResources,
  API_BASE: API_BASE
};