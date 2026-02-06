const app = getApp();

Page({
  data: {
    keyword: '',
    autoFocus: true,
    searchHistory: [],
    hotKeywords: [],
    searchResults: [],
    totalCount: 0,
    loading: false,
    hasSearched: false, // 标记是否已搜索过
    showFilter: false,
    filters: {
      category: '',
      sortBy: 'relevance'
    }
  },

  onLoad(options) {
    this.loadSearchHistory();
    this.loadHotKeywords();
    
    if (options.keyword) {
      this.setData({ keyword: decodeURIComponent(options.keyword) });
      this.saveSearchHistory(this.data.keyword);
      this.performSearch();
    }
  },

  onInput(e) {
    this.setData({ keyword: e.detail.value });
  },

  onSearch() {
    const keyword = this.data.keyword.trim();
    if (!keyword) {
      wx.showToast({ title: '请输入搜索关键词', icon: 'none' });
      return;
    }
    this.saveSearchHistory(keyword);
    this.performSearch();
  },

  performSearch() {
    const keyword = this.data.keyword.trim();
    if (!keyword) return;

    this.setData({ loading: true, hasSearched: true });
    
    const params = {
      keyword: keyword,
      sortBy: this.data.filters.sortBy || 'relevance',
      page: 1,
      pageSize: 20
    };
    
    if (this.data.filters.category) {
      params.category = this.data.filters.category;
    }

    console.log('[搜索] 发送请求, 参数:', params);
    
    wx.request({
      url: `${app.globalData.apiUrl}/api/search`,
      data: params,
      method: 'GET',
      success: (res) => {
        console.log('[搜索] 响应状态:', res.statusCode);
        console.log('[搜索] 响应数据:', JSON.stringify(res.data).substring(0, 200));
        
        if (res.data && res.data.code === 0) {
          const data = res.data.data;
          const list = data.list || [];
          console.log('[搜索] 结果数量:', list.length, '总数:', data.total);
          
          this.setData({
            searchResults: list,
            totalCount: data.total || 0,
            loading: false
          });
          
          if (list.length > 0) {
            wx.showToast({ title: `找到 ${data.total} 条结果`, icon: 'none', duration: 1500 });
          }
        } else {
          console.log('[搜索] 返回异常:', res.data);
          this.setData({ searchResults: [], totalCount: 0, loading: false });
        }
      },
      fail: (err) => {
        console.error('[搜索] 请求失败:', err);
        this.setData({ loading: false });
        wx.showToast({ title: '网络错误', icon: 'none' });
      }
    });
  },

  loadSearchHistory() {
    const history = wx.getStorageSync('searchHistory') || [];
    this.setData({ searchHistory: history.slice(0, 10) });
  },

  loadHotKeywords() {
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
    this.setData({ keyword: '', searchResults: [], totalCount: 0, hasSearched: false });
  },

  clearHistory() {
    wx.showModal({
      title: '提示',
      content: '确定清空搜索历史？',
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
    if (id) {
      wx.navigateTo({
        url: `/pages/detail/detail?id=${id}`
      });
    }
  },

  toggleFilter() {
    this.setData({ showFilter: !this.data.showFilter });
  },

  onFilterConfirm(e) {
    this.setData({
      filters: e.detail,
      showFilter: false
    });
    if (this.data.keyword) {
      this.performSearch();
    }
  },

  onFilterClose() {
    this.setData({ showFilter: false });
  }
});
