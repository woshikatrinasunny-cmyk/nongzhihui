const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 数据库连接（可选，如果配置了就连接）
if (process.env.MONGODB_URI && process.env.USE_DATABASE === 'true') {
  const mongoose = require('mongoose');
  mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  }).then(() => {
    console.log('MongoDB 连接成功');
    
    // 启动爬虫调度器
    if (process.env.ENABLE_CRAWLER === 'true') {
      const scheduler = require('./scheduler');
      scheduler.start();
      console.log('爬虫调度器已启动');
    }
  }).catch(err => {
    console.error('MongoDB 连接失败:', err);
    console.log('将使用纯实时聚合模式（不依赖数据库）');
  });
} else {
  console.log('未配置数据库，使用纯实时聚合模式');
}

// 路由
app.use('/api/resources', require('./routes/resources'));
app.use('/api/search', require('./routes/search'));
app.use('/api/users', require('./routes/users'));
app.use('/api/collect', require('./routes/collect'));
app.use('/api/history', require('./routes/history'));
app.use('/api/feedback', require('./routes/feedback'));
app.use('/api/statistics', require('./routes/statistics'));

// 爬虫管理路由
app.use('/api/crawler', require('./routes/crawler'));

// 健康检查
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: '服务运行正常' });
});

// 错误处理
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    code: -1,
    message: '服务器错误',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

app.listen(PORT, () => {
  console.log(`服务器运行在端口 ${PORT}`);
  console.log(`访问地址: http://localhost:${PORT}`);
});

