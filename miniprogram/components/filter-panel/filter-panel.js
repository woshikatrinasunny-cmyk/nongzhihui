Component({
  properties: {
    show: {
      type: Boolean,
      value: false
    },
    filters: {
      type: Object,
      value: {}
    }
  },

  data: {
    categories: [
      { value: '', label: '全部分类' },
      { value: 'law', label: '法律法规' },
      { value: 'policy', label: '政策文件' },
      { value: 'tech', label: '农技手册' },
      { value: 'culture', label: '乡土文献' }
    ],
    sortOptions: [
      { value: 'relevance', label: '相关度' },
      { value: 'time', label: '时间' },
      { value: 'views', label: '浏览量' },
      { value: 'collects', label: '收藏量' }
    ],
    localFilters: {},
    categoryIndex: 0,
    sortIndex: 0
  },

  lifetimes: {
    attached() {
      const filters = this.properties.filters;
      this.setData({ localFilters: filters });
      
      // 设置选中的索引
      const categoryIndex = this.data.categories.findIndex(c => c.value === filters.category);
      const sortIndex = this.data.sortOptions.findIndex(s => s.value === filters.sortBy);
      
      this.setData({
        categoryIndex: categoryIndex >= 0 ? categoryIndex : 0,
        sortIndex: sortIndex >= 0 ? sortIndex : 0
      });
    }
  },

  methods: {
    onCategoryChange(e) {
      const index = parseInt(e.detail.value);
      this.setData({
        categoryIndex: index,
        'localFilters.category': this.data.categories[index].value
      });
    },

    onSortChange(e) {
      const index = parseInt(e.detail.value);
      this.setData({
        sortIndex: index,
        'localFilters.sortBy': this.data.sortOptions[index].value
      });
    },

    onStartDateChange(e) {
      this.setData({
        'localFilters.startDate': e.detail.value
      });
    },

    onEndDateChange(e) {
      this.setData({
        'localFilters.endDate': e.detail.value
      });
    },

    onConfirm() {
      this.triggerEvent('confirm', this.data.localFilters);
    },

    onReset() {
      const resetFilters = {
        category: '',
        sortBy: 'relevance',
        startDate: '',
        endDate: ''
      };
      this.setData({ localFilters: resetFilters });
      this.triggerEvent('confirm', resetFilters);
    },

    onClose() {
      this.triggerEvent('close');
    }
  }
});
