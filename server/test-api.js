/**
 * API测试脚本 - 测试无数据库模式下的所有接口
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

// 测试用例
const tests = [
  {
    name: '健康检查',
    method: 'GET',
    url: '/health'
  },
  {
    name: '获取热门资源',
    method: 'GET',
    url: '/api/resources/hot'
  },
  {
    name: '获取最新资源',
    method: 'GET',
    url: '/api/resources/latest'
  },
  {
    name: '获取资源列表',
    method: 'GET',
    url: '/api/resources?page=1&pageSize=10'
  },
  {
    name: '获取法律分类资源',
    method: 'GET',
    url: '/api/resources?category=law&page=1&pageSize=10'
  },
  {
    name: '获取资源详情',
    method: 'GET',
    url: '/api/resources/1'
  },
  {
    name: '获取相关资源',
    method: 'GET',
    url: '/api/resources/1/related'
  },
  {
    name: '搜索资源',
    method: 'GET',
    url: '/api/search?keyword=农业&page=1&pageSize=10'
  },
  {
    name: '获取热门搜索',
    method: 'GET',
    url: '/api/search/hot'
  }
];

// 运行测试
async function runTests() {
  console.log('========================================');
  console.log('开始测试API接口（无数据库模式）');
  console.log('========================================\n');

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    try {
      console.log(`测试: ${test.name}`);
      console.log(`请求: ${test.method} ${test.url}`);
      
      const response = await axios({
        method: test.method,
        url: `${BASE_URL}${test.url}`,
        timeout: 5000
      });

      if (response.status === 200) {
        console.log(`✓ 成功 (状态码: ${response.status})`);
        if (response.data) {
          if (response.data.code === 0) {
            console.log(`  返回数据: ${JSON.stringify(response.data).substring(0, 100)}...`);
          } else {
            console.log(`  返回: ${JSON.stringify(response.data)}`);
          }
        }
        passed++;
      } else {
        console.log(`✗ 失败 (状态码: ${response.status})`);
        failed++;
      }
    } catch (error) {
      console.log(`✗ 失败: ${error.message}`);
      if (error.response) {
        console.log(`  状态码: ${error.response.status}`);
        console.log(`  错误信息: ${JSON.stringify(error.response.data)}`);
      }
      failed++;
    }
    console.log('');
  }

  console.log('========================================');
  console.log('测试完成');
  console.log(`通过: ${passed}/${tests.length}`);
  console.log(`失败: ${failed}/${tests.length}`);
  console.log('========================================');
}

// 检查服务器是否启动
async function checkServer() {
  try {
    await axios.get(`${BASE_URL}/health`, { timeout: 2000 });
    return true;
  } catch (error) {
    return false;
  }
}

// 主函数
async function main() {
  console.log('检查服务器状态...\n');
  
  const isRunning = await checkServer();
  
  if (!isRunning) {
    console.log('❌ 服务器未启动！');
    console.log('请先运行: node app.js');
    console.log('或使用: 无数据库启动.bat\n');
    process.exit(1);
  }

  console.log('✓ 服务器正在运行\n');
  await runTests();
}

main();
