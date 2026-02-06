/**
 * 直接测试搜索功能
 */

const aggregator = require('./services/aggregator');

async function test() {
  console.log('测试本地搜索...\n');
  
  try {
    const result = await aggregator.searchLocal('农业', {
      page: 1,
      pageSize: 10,
      sortBy: 'relevance'
    });
    
    console.log('搜索成功！');
    console.log(`找到 ${result.total} 条结果`);
    console.log(`返回 ${result.list.length} 条数据\n`);
    
    result.list.slice(0, 3).forEach((item, index) => {
      console.log(`${index + 1}. ${item.title}`);
      console.log(`   分类: ${item.category}`);
      console.log(`   来源: ${item.source}\n`);
    });
  } catch (error) {
    console.error('搜索失败:', error);
  }
}

test();
