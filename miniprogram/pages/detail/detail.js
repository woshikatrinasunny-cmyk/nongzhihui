const app = getApp();
// 引入封装的所有请求工具，统一替换原生wx.request
const { get, post } = require('../../utils/request.js');

Page({
  data: {
    resourceId: '',
    resource: null,
    isCollected: false,
    relatedResources: [],
    fixedUserId: 'test_user',
    apiUrl: app.globalData.apiUrl
  },

  onLoad(options) {
    this.setData({
      resourceId: options.id || ''
    });
    if (this.data.resourceId) {
      this.loadResourceDetail();
      this.checkCollectStatus();
      this.loadRelatedResources();
      this.addToHistory();
    }
  },

  // 添加到浏览历史
  addToHistory() {
    const { fixedUserId, resourceId } = this.data;
    if (!resourceId) return;
    
    post('/api/history/add', {
      userId: fixedUserId,
      resourceId: resourceId
    }).catch(err => {
      console.error('添加历史记录失败：', err);
    });
  },

  // 加载资源详情：保留逻辑，失败仅打印不提示（适配测试数据）
  loadResourceDetail() {
    wx.showLoading({ title: '加载中...', mask: true });
    get(`/api/resources/${this.data.resourceId}`)
      .then(res => {
        this.setData({ resource: res.data });
        wx.setNavigationBarTitle({ title: res.data.title });
      })
      .catch(err => {
        console.error('资源详情加载失败：', err);
        // 测试阶段用默认数据，不提示失败
      })
      .finally(() => {
        wx.hideLoading();
      });
  },

  // 检查收藏状态：用固定用户ID查询，适配后端接口
  checkCollectStatus() {
    const { fixedUserId, resourceId } = this.data;
    // 无资源ID直接设为未收藏
    if (!resourceId) {
      this.setData({ isCollected: false });
      return;
    }
    // 优先从本地缓存查，适配测试（后端check接口后续加，先复用本地）
    const collectedIds = wx.getStorageSync('collectedResources') || [];
    this.setData({ isCollected: collectedIds.includes(resourceId) });
    // 后续后端加了check接口，替换为以下代码即可
    // get(`/collect/check`, {
    //   userId: fixedUserId,
    //   resourceId: resourceId
    // })
    //   .then(res => {
    //     this.setData({ isCollected: res.data.isCollected });
    //     const collectedIds = wx.getStorageSync('collectedResources') || [];
    //     if (res.data.isCollected && !collectedIds.includes(resourceId)) {
    //       collectedIds.push(resourceId);
    //       wx.setStorageSync('collectedResources', collectedIds);
    //     }
    //   })
    //   .catch(err => {
    //     console.error('收藏状态校验失败：', err);
    //     this.setData({ isCollected: collectedIds.includes(resourceId) });
    //   });
  },

  // 加载关联资源：保留逻辑，失败用默认数据
  loadRelatedResources() {
    get(`/api/resources/${this.data.resourceId}/related`)
      .then(res => {
        this.setData({ relatedResources: res.data });
      })
      .catch(err => {
        console.error('关联资源加载失败：', err);
        // 测试阶段用默认数据
      });
  },

  // 切换收藏状态：核心修改——跳过登录、用固定用户ID、兼容数字ID
  toggleCollect() {
    const { resourceId, fixedUserId } = this.data;
    // 仅校验资源ID，跳过登录校验
    if (!resourceId) {
      wx.showToast({ title: '资源ID异常，无法收藏', icon: 'none' });
      return;
    }

    let collectedIds = wx.getStorageSync('collectedResources') || [];
    const preIsCollected = this.data.isCollected;

    // 1. 乐观更新：先更页面状态+本地缓存，提升体验
    this.setData({ isCollected: !preIsCollected });
    if (!preIsCollected) {
      collectedIds.push(resourceId);
      wx.showToast({ title: '收藏成功', icon: 'success' });
    } else {
      collectedIds = collectedIds.filter(id => id !== resourceId);
      wx.showToast({ title: '已取消收藏', icon: 'success' });
    }
    wx.setStorageSync('collectedResources', collectedIds);

    // 2. 调用后端同步：传固定用户ID+当前资源ID（兼容数字）
    post('/api/collect/toggle', {
      userId: fixedUserId, // 临时固定，后续改openid
      resourceId: resourceId // 直接传，后端已做数字ID兼容
    })
      .then(res => {
        console.log('收藏状态同步成功：', res.message);
        // 同步成功后更新本地收藏状态（保证和后端一致）
        this.setData({ isCollected: res.data.isCollected });
      })
      .catch(err => {
        // 同步失败：回滚页面+本地缓存，避免状态不一致
        console.error('收藏同步失败：', err);
        this.setData({ isCollected: preIsCollected });
        wx.showToast({ title: `收藏失败：${err.message || '服务器异常'}`, icon: 'none', duration: 2000 });
        // 回滚本地缓存
        if (!preIsCollected) {
          collectedIds = collectedIds.filter(id => id !== resourceId);
        } else {
          collectedIds.push(resourceId);
        }
        wx.setStorageSync('collectedResources', collectedIds);
      });
  },

  // 分享功能：保留原有逻辑
  shareResource() {
    wx.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline']
    });
  },

  // 转发好友：保留原有逻辑，传当前资源ID
  onShareAppMessage() {
    return {
      title: this.data.resource.title,
      path: `/pages/detail/detail?id=${this.data.resourceId}`
    };
  },

  // 查看原文链接：保留原有逻辑
  viewSource() {
    const { sourceUrl } = this.data.resource;
    if (!sourceUrl) {
      wx.showToast({ title: '暂无原文链接', icon: 'none' });
      return;
    }
    wx.setClipboardData({
      data: sourceUrl,
      success: () => {
        wx.showToast({ title: '链接已复制', icon: 'success' });
      },
      fail: () => {
        wx.showToast({ title: '链接复制失败', icon: 'none' });
      }
    });
  },

  // 下载附件：保留原有逻辑
  downloadAttachment(e) {
    const url = e.currentTarget.dataset.url;
    if (!url) {
      wx.showToast({ title: '附件地址异常', icon: 'none' });
      return;
    }
    wx.showLoading({ title: '下载中...', mask: true });
    wx.downloadFile({
      url: url,
      success: (res) => {
        if (res.statusCode === 200) {
          wx.openDocument({
            filePath: res.tempFilePath,
            showMenu: true,
            fail: () => {
              wx.showToast({ title: '文件打开失败', icon: 'none' });
            }
          });
        } else {
          wx.showToast({ title: '文件下载失败', icon: 'none' });
        }
      },
      fail: () => {
        wx.showToast({ title: '网络异常，下载失败', icon: 'none' });
      },
      finally: () => {
        wx.hideLoading();
      }
    });
  },

  // 标签搜索：保留原有逻辑
  searchTag(e) {
    const tag = e.currentTarget.dataset.tag;
    if (tag) {
      wx.navigateTo({
        url: `/pages/search/search?keyword=${encodeURIComponent(tag)}`
      });
    }
  },

  // 查看关联资源：适配前端测试数据，传数字ID（后端已兼容）
  viewRelated(e) {
    const id = e.currentTarget.dataset.id;
    if (id) {
      wx.redirectTo({
        url: `/pages/detail/detail?id=${id}`
      });
    }
  }
});