/**
 * 爬虫定时任务调度器
 */

const cron = require('node-cron');
const GovCrawler = require('./crawlers/gov-crawler');
const CrawlLog = require('./models/CrawlLog');

class Scheduler {
  constructor() {
    this.tasks = [];
  }

  /**
   * 启动所有定时任务
   */
  start() {
    console.log('启动爬虫调度器...');

    // 每天凌晨2点爬取中国政府网
    const govTask = cron.schedule('0 2 * * *', async () => {
      console.log('开始定时爬取中国政府网...');
      await this.runCrawler('gov', GovCrawler);
    });

    this.tasks.push({ name: 'gov-crawler', task: govTask });

    // 可以添加更多定时任务
    // const moaTask = cron.schedule('0 3 * * *', async () => {
    //   console.log('开始定时爬取农业农村部...');
    //   await this.runCrawler('moa', MOACrawler);
    // });

    console.log(`已启动 ${this.tasks.length} 个定时任务`);
  }

  /**
   * 运行爬虫并记录日志
   */
  async runCrawler(name, CrawlerClass) {
    const log = await CrawlLog.create({
      crawler: name,
      status: 'running',
      startTime: new Date()
    });

    try {
      const crawler = new CrawlerClass();
      const result = await crawler.run();

      await CrawlLog.findByIdAndUpdate(log._id, {
        status: 'success',
        endTime: new Date(),
        duration: Date.now() - log.startTime.getTime(),
        successCount: result.success,
        failedCount: result.failed,
        itemsCount: result.success + result.failed
      });

      console.log(`${name} 爬取完成: 成功 ${result.success}, 失败 ${result.failed}`);
    } catch (error) {
      await CrawlLog.findByIdAndUpdate(log._id, {
        status: 'failed',
        endTime: new Date(),
        duration: Date.now() - log.startTime.getTime(),
        errors: [{
          message: error.message,
          timestamp: new Date()
        }]
      });

      console.error(`${name} 爬取失败:`, error);
    }
  }

  /**
   * 手动触发爬虫
   */
  async triggerCrawler(name) {
    console.log(`手动触发爬虫: ${name}`);
    
    switch (name) {
      case 'gov':
        await this.runCrawler('gov', GovCrawler);
        break;
      // 添加更多爬虫
      default:
        throw new Error(`未知的爬虫: ${name}`);
    }
  }

  /**
   * 停止所有定时任务
   */
  stop() {
    console.log('停止爬虫调度器...');
    this.tasks.forEach(({ name, task }) => {
      task.stop();
      console.log(`已停止: ${name}`);
    });
  }

  /**
   * 获取爬虫状态
   */
  async getStatus() {
    const logs = await CrawlLog.find()
      .sort({ startTime: -1 })
      .limit(10);

    return {
      tasks: this.tasks.map(t => ({
        name: t.name,
        running: t.task.getStatus() === 'scheduled'
      })),
      recentLogs: logs
    };
  }
}

module.exports = new Scheduler();
