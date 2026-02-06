const mongoose = require('mongoose');
const Resource = require('./models/Resource');

mongoose.connect('mongodb://localhost:27017/nongzhihui')
  .then(async () => {
    console.log('测试搜索功能...\n');
    
    // 测试1：搜索"粮食"
    const results1 = await Resource.find({
      status: 'published',
      $text: { $search: '粮食' }
    }).limit(5);
    console.log(`搜索"粮食"的结果: ${results1.length}条`);
    results1.forEach(r => console.log(`  - ${r.title}`));
    console.log('');
    
    // 测试2：搜索"土地"
    const results2 = await Resource.find({
      status: 'published',
      $text: { $search: '土地' }
    }).limit(5);
    console.log(`搜索"土地"的结果: ${results2.length}条`);
    results2.forEach(r => console.log(`  - ${r.title}`));
    console.log('');
    
    // 测试3：搜索"农业"
    const results3 = await Resource.find({
      status: 'published',
      $text: { $search: '农业' }
    }).limit(5);
    console.log(`搜索"农业"的结果: ${results3.length}条`);
    results3.forEach(r => console.log(`  - ${r.title}`));
    
    process.exit(0);
  })
  .catch(err => {
    console.error('错误:', err);
    process.exit(1);
  });
