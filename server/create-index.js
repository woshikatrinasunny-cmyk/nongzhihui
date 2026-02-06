const mongoose = require('mongoose');
const Resource = require('./models/Resource');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/nongzhihui')
  .then(async () => {
    console.log('MongoDB 连接成功');
    console.log('正在创建文本搜索索引...');
    
    // 删除旧索引
    try {
      await Resource.collection.dropIndexes();
      console.log('已删除旧索引');
    } catch (err) {
      console.log('没有旧索引需要删除');
    }
    
    // 创建新的文本索引
    await Resource.collection.createIndex({
      title: 'text',
      summary: 'text',
      content: 'text',
      tags: 'text'
    }, {
      weights: {
        title: 10,
        tags: 5,
        summary: 3,
        content: 1
      },
      name: 'resource_text_index'
    });
    
    console.log('文本搜索索引创建成功！');
    
    // 测试搜索
    console.log('\n测试搜索功能...');
    const results = await Resource.find({
      $text: { $search: '粮食' }
    }).limit(3);
    
    console.log(`搜索"粮食"找到 ${results.length} 条结果:`);
    results.forEach(r => console.log(`  - ${r.title}`));
    
    process.exit(0);
  })
  .catch(err => {
    console.error('错误:', err);
    process.exit(1);
  });
