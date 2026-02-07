const localData = require('../../utils/local-data.js');
const api = require('../../utils/api.js');

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
    api.checkOnline().then(ok => {
      this.setData({ apiAvailable: ok, searchMode: ok ? 'web' : 'local' });
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
      this.setData({ suggestions: localData.getSuggestions(value.trim()) });
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
