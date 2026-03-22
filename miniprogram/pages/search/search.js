var localData = require('../../utils/local-data.js');
var api = require('../../utils/api.js');
Page({
  data: {
    keyword: '',
    autoFocus: true,
    searchHistory: [],
    hotKeywords: [],
    searchResults: [],
    totalCount: 0,
    loading: false,
    hasSearched: false,
    showFilter: false,
    suggestions: [],
    filters: { category: '', sortBy: 'relevance' },
    searchMode: 'web',
    apiAvailable: false
  },
  onLoad: function(options) {
    var that = this;
    this.loadSearchHistory();
    this.setData({
      hotKeywords: [
        { id: 1, keyword: '农村土地承包法' },
        { id: 2, keyword: '乡村振兴政策' },
        { id: 3, keyword: '农业补贴' },
        { id: 4, keyword: '种植技术' },
        { id: 5, keyword: '农产品质量安全' },
        { id: 6, keyword: '农民专业合作社' }
      ]
    });
    api.checkOnline().then(function(ok) {
      that.setData({ apiAvailable: ok, searchMode: ok ? 'web' : 'local' });
    });
    if (options.keyword) {
      this.setData({ keyword: decodeURIComponent(options.keyword) });
      this.saveSearchHistory(this.data.keyword);
      this.performSearch();
    }
  },
  onInput: function(e) {
    var value = e.detail.value;
    this.setData({ keyword: value });
    clearTimeout(this._suggestionTimer);
    var that = this;
    this._suggestionTimer = setTimeout(function() {
      that.setData({ suggestions: localData.getSuggestions(value.trim()) });
    }, 100);
  },
  selectSuggestion: function(e) {
    var keyword = e.currentTarget.dataset.keyword;
    this.setData({ keyword: keyword, suggestions: [] });
    this.saveSearchHistory(keyword);
    this.performSearch();
  },
  setSort: function(e) {
    var sortBy = e.currentTarget.dataset.sort;
    this.setData({ 'filters.sortBy': sortBy });
    if (this.data.keyword) this.performSearch();
  },
  switchMode: function(e) {
    var mode = e.currentTarget.dataset.mode;
    this.setData({ searchMode: mode });
    if (this.data.keyword) this.performSearch();
  },
  onSearch: function() {
    var keyword = this.data.keyword.trim();
    if (!keyword) return wx.showToast({ title: '请输入搜索关键词', icon: 'none' });
    this.saveSearchHistory(keyword);
    this.performSearch();
  },
  performSearch: function() {
    var keyword = this.data.keyword.trim();
    if (!keyword) return;
    this.setData({ loading: true, hasSearched: true, suggestions: [] });
    var that = this;
    if (this.data.searchMode === 'web') {
      api.search(keyword, {
        category: this.data.filters.category,
        sortBy: this.data.filters.sortBy,
        page: 1,
        pageSize: 10
      }).then(function(result) {
        that.setData({
          searchResults: result.list,
          totalCount: result.total,
          loading: false,
          apiAvailable: result.isWeb !== false
        });
        if (result.list.length > 0) {
          wx.showToast({ title: '找到 ' + result.total + ' 条结果', icon: 'none', duration: 1500 });
        }
      });
    } else {
      var result = localData.searchResources(keyword, {
        category: this.data.filters.category,
        sortBy: this.data.filters.sortBy
      });
      this.setData({ searchResults: result.list, totalCount: result.total, loading: false });
      if (result.list.length > 0) {
        wx.showToast({ title: '找到 ' + result.total + ' 条结果', icon: 'none', duration: 1500 });
      }
    }
  },
  loadSearchHistory: function() {
    var history = wx.getStorageSync('searchHistory') || [];
    this.setData({ searchHistory: history.slice(0, 10) });
  },
  saveSearchHistory: function(keyword) {
    var history = wx.getStorageSync('searchHistory') || [];
    history = history.filter(function(item) { return item !== keyword; });
    history.unshift(keyword);
    history = history.slice(0, 10);
    wx.setStorageSync('searchHistory', history);
    this.setData({ searchHistory: history });
  },
  clearKeyword: function() {
    this.setData({ keyword: '', searchResults: [], totalCount: 0, hasSearched: false, suggestions: [] });
  },
  clearHistory: function() {
    var that = this;
    wx.showModal({
      title: '提示',
      content: '确定清空搜索历史？',
      success: function(res) {
        if (res.confirm) {
          wx.removeStorageSync('searchHistory');
          that.setData({ searchHistory: [] });
        }
      }
    });
  },
  selectHistory: function(e) {
    var keyword = e.currentTarget.dataset.keyword;
    this.setData({ keyword: keyword });
    this.saveSearchHistory(keyword);
    this.performSearch();
  },
  selectHot: function(e) {
    var keyword = e.currentTarget.dataset.keyword;
    this.setData({ keyword: keyword });
    this.saveSearchHistory(keyword);
    this.performSearch();
  },
  viewDetail: function(e) {
    var id = e.currentTarget.dataset.id;
    if (id) wx.navigateTo({ url: '/pages/detail/detail?id=' + id });
  },
  toggleFilter: function() {
    this.setData({ showFilter: !this.data.showFilter });
  },
  onFilterConfirm: function(e) {
    this.setData({ filters: e.detail, showFilter: false });
    if (this.data.keyword) this.performSearch();
  },
  onFilterClose: function() {
    this.setData({ showFilter: false });
  },

  // 分享给好友
  onShareAppMessage: function() {
    var keyword = this.data.keyword;
    return {
      title: keyword ? '搜索：' + keyword + ' - 农智汇' : '农智汇 - 涉农知识搜索',
      path: keyword ? '/pages/search/search?keyword=' + encodeURIComponent(keyword) : '/pages/search/search',
      imageUrl: ''
    };
  },

  // 分享到朋友圈
  onShareTimeline: function() {
    var keyword = this.data.keyword;
    return {
      title: keyword ? '搜索：' + keyword + ' - 农智汇' : '农智汇 - 涉农知识搜索',
      query: keyword ? 'keyword=' + encodeURIComponent(keyword) : '',
      imageUrl: ''
    };
  }
});
