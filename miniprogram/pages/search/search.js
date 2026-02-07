const localData = require('../../utils/local-data.js');

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
    filters: { category: '', sortBy: 'relevance' }
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
      const suggestions = localData.getSuggestions(value.trim());
      this.setData({ suggestions });
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

    const result = localData.searchResources(keyword, {
      category: this.data.filters.category,
      sortBy: this.data.filters.sortBy
    });

    this.setData({
      searchResults: result.list,
      totalCount: result.total,
      loading: false
    });

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
    if (id) wx.navigateTo({ url: `/pages/detail/detail?id=${id}` });
  },

  toggleFilter() { this.setData({ showFilter: !this.data.showFilter }); },
  onFilterConfirm(e) {
    this.setData({ filters: e.detail, showFilter: false });
    if (this.data.keyword) this.performSearch();
  },
  onFilterClose() { this.setData({ showFilter: false }); }
});
