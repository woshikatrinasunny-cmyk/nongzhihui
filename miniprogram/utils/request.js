const app = getApp();

const request = (options) => {
  return new Promise((resolve, reject) => {
    wx.request({
      url: `${app.globalData.apiUrl}${options.url}`,
      method: options.method || 'GET',
      data: options.data || {},
      header: {
        'Content-Type': 'application/json',
        'Authorization': wx.getStorageSync('token') || ''
      },
      success: (res) => {
        // 核心修复：所有状态码都解析res.data，按后端code判断成功/失败
        if (res.data) {
          if (res.data.code === 0) {
            resolve(res.data);
          } else {
            // 后端返回的错误（400/404/500），显示后端的message
            const msg = res.data.message || '请求失败';
            wx.showToast({ title: msg, icon: 'none', duration: 2000 });
            reject(res.data);
          }
        } else {
          // 无返回数据的情况（纯网络错误）
          wx.showToast({ title: '网络错误', icon: 'none' });
          reject(res);
        }
      },
      fail: (err) => {
        // 纯连接失败（如后端没启动）
        wx.showToast({ title: '网络连接失败', icon: 'none' });
        reject(err);
      }
    });
  });
};

module.exports = {
  get: (url, data) => request({ url, data, method: 'GET' }),
  post: (url, data) => request({ url, data, method: 'POST' }),
  put: (url, data) => request({ url, data, method: 'PUT' }),
  delete: (url, data) => request({ url, data, method: 'DELETE' })
};