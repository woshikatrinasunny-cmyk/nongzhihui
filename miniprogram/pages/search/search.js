const localData = require('../../utils/local-data.js');
const webSearch = require('../../utils/web-search.js');

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
    searchMode: 'web', // 'web' | 'local'
    apiAvailable: false
  },

  onLoad(options) {
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
    // 检测后端是否可用
    webSearch.checkAvailability().then(ok => {
      this.setData({ apiAvailable: ok, searchMode: ok ? 'web' : 'local' });
      if (!ok) console.log('[搜索] 后端不可用，使用本地模式');
    });
    if (options.keyword) {
      this.setData({ keyword: decodeURIComponent(options.keyword) });
      this.saveSearchHistory(this.data.keyword);
      this.performSearch();
    }
  },

  onInput(e) {
    const value = e.detail.value;
    this.setData({ keyword: value });
    clearTimeout(this._suggestionTimer);
    this._suggestionTimer = setTimeout(() => {
      // 本地联想词（即时响应）
      const local = localData.getSuggestions(value.trim());
      this.setData({ suggestions: local });
    }, 100);
  },

  selectSuggestion(e) {
    const keyword = e.currentTarget.dataset.keyword;
    this.setData({ keyword, suggestions: [] });
    this.saveSearchHistory(keyword);
    this.performSearch();
  },

  setSort(e) {
    const sortBy = e.currentTarget.dataset.sort;
    this.setData({ 'filters.sortBy': sortBy });
    if (this.data.keyword) this.performSearch();
  },

  switchMode(e) {
    const mode = e.currentTarget.dataset.mode;
    this.setData({ searchMode: mode });
    if (this.data.keyword) this.performSearch();
  },

  onSearch() {
    const keyword = this.data.keyword.trim();
    if (!keyword) return wx.showToast({ title: '请输入搜索关键词', icon: 'none' });
    this.saveSearchHistory(keyword);
    this.performSearch();
  },

  performSearch() {
    const keyword = this.data.keyword.trim();
    if (!keyword) return;
    this.setData({ loading: true, hasSearched: true, suggestions: [] });

    if (this.data.searchMode === 'web' && this.data.apiAvailable) {
      this.doWebSearch(keyword);
    } else {
      this.doLocalSearch(keyword);
    }
  },

  doWebSearch(keyword) {
    webSearch.search(keyword, {
      category: this.data.filters.category,
      sortBy: this.data.filters.sortBy,
      page: 1,
      pageSize: 10
    }).then(result => {
      this.setData({
        searchResults: result.list || [],
        totalCount: result.total || 0,
        loading: false
      });
      const count = (result.list || []).length;
      if (count > 0) {
        wx.showToast({ title: `找到 ${result.total} 条结果`, icon: 'none', duration: 1500 });
      }
    }).catch(err => {
      console.error('[搜索] 网络搜索失败，降级到本地:', err);
      wx.showToast({ title: '网络搜索暂不可用，使用本地数据', icon: 'none' });
      this.setData({ searchMode: 'local' });
      this.doLocalSearch(keyword);
    });
  },

  doLocalSearch(keyword) {
    const result = localData.searchResources(keyword, {
      category: this.data.filters.category,
      sortBy: this.data.filters.sortBy
    });
    this.setData({ searchResults: result.list, totalCount: result.total, loading: false });
    if (result.list.length > 0) {
      wx.showToast({ title: `找到 ${result.total} 条结果`, icon: 'none', duration: 1500 });
    }
  },

  loadSearchHistory() {
    const history = wx.getStorageSync('searchHistory') || [];
    this.setData({ searchHistory: history.slice(0, 10) });
  },

  saveSearchHistory(keyword) {
    let history = wx.getStorageSync('searchHistory') || [];
    history = history.filter(item => item !== keyword);
    history.unshift(keyword);
    history = history.slice(0, 10);
    wx.setStorageSync('searchHistory', history);
    this.setData({ searchHistory: history });
  },

  clearKeyword() {
    this.setData({ keyword: '', searchResults: [], totalCount: 0, hasSearched: false, suggestions: [] });
  },

  clearHistory() {
    wx.showModal({
      title: '提示', content: '确定清空搜索历史？',
      success: (res) => {
        if (res.confirm) {
          wx.removeStorageSync('searchHistory');
          this.setData({ searchHistory: [] });
        }
      }
    });
  },

  selectHistory(e) {
    const keyword = e.currentTarget.dataset.keyword;
    this.setData({ keyword });
    this.saveSearchHistory(keyword);
    this.performSearch();
  },

  selectHot(e) {
    const keyword = e.currentTarget.dataset.keyword;
    this.setData({ keyword });
    this.saveSearchHistory(keyword);
    this.performSearch();
  },

  viewDetail(e) {
    const id = e.currentTarget.dataset.id;
    const item = this.data.searchResults.find(r => r._id === id);
    // 网络搜索结果（来自百度/Bing）：显示摘要+复制原文链接
    if (item && (item.platform === 'bing' || item.platform === 'baidu') && item.sourceUrl) {
      wx.showModal({
        title: item.title,
        content: `来源：${item.source || item.platformName}\n\n${item.summary}\n\n点击「复制链接」在浏览器中查看原文`,
        confirmText: '复制链接',
        cancelText: '关闭',
        success: (res) => {
          if (res.confirm) {
            wx.setClipboardData({
              data: item.sourceUrl,
              success: () => wx.showToast({ title: '链接已复制', icon: 'success' })
            });
          }
        }
      });
      return;
    }
    // 本地数据：跳转详情页
    if (id) wx.navigateTo({ url: `/pages/detail/detail?id=${id}` });
  },

  toggleFilter() { this.setData({ showFilter: !this.data.showFilter }); },
  onFilterConfirm(e) {
    this.setData({ filters: e.detail, showFilter: false });
    if (this.data.keyword) this.performSearch();
  },
  onFilterClose() { this.setData({ showFilter: false }); }
});
