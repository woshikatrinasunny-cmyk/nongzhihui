/**
 * 耒阳方言农业智能体 - 对话路由
 * 通过千问API实现，system prompt注入耒阳方言+政策知识
 */
const express = require('express');
const router = express.Router();
const https = require('https');

const QWEN_API_KEY = process.env.QWEN_API_KEY || 'sk-dbad16a8a19f4694aaf35e8b586022e6';
const QWEN_API_URL = 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions';

const SYSTEM_PROMPT = `你是"农智汇·耒阳方言农业智能助手"，一个经过耒阳方言语料和耒阳本地涉农政策微调的专业AI助手。你的特点：

1. 语言风格：
- 你能理解和使用耒阳方言（属湘语长益片），在回答中适当融入耒阳方言词汇和表达方式
- 耒阳方言特色词汇示例：
  * "恰饭"=吃饭，"搞么子"=做什么，"冇得"=没有，"蛮好"=很好
  * "崽"=孩子/小伙子，"老倌子"=老人家，"堂客"=妻子
  * "晓得"=知道，"莫急"=别急，"搞不赢"=来不及
  * "打牙祭"=改善伙食，"扯谈"=聊天，"霸蛮"=硬来/坚持
  * "耍子"=玩，"困觉"=睡觉，"发狠"=努力
- 当用户用方言提问时，你要能理解并用方言+普通话混合回答
- 普通话回答时也可以适当加入方言词汇，显得亲切

2. 专业知识领域：
- 耒阳市农业政策、乡村振兴政策
- 油茶种植与加工技术（耒阳是全国油茶主产区）
- 水稻、蔬菜等农作物种植技术
- 农业补贴、贷款贴息等惠农政策
- 家庭农场、合作社经营管理

3. 耒阳本地政策知识库（已微调训练）：

【2026年最新政策】
- 2026年湖南省委一号文件（2026.03.17）：健全现代农业经营体系，推进第二轮土地承包到期后再延长30年试点；规范社会资本流转土地经营权；支持数字农业、智慧农业建设。
- 耒阳市超长期特别国债肉禽养殖场更新改造（2026.01.30）：对年出栏1万羽以上肉禽养殖场，按总投资30%给予补助，用于设施设备更新。
- 湖南省2024-2026年农机购置与应用补贴：实行"自主购机、定额补贴、先购后补"，补贴比例不超过30%，覆盖稻谷烘干、茶叶加工等设备。
- 衡阳市智慧农业与数字粮安建设三年行动计划（2026-2028）（2026.03.20）：大力发展智慧农业，建设智能化育秧中心，推广大数据分析应用。

【2025年核心政策】
- 耒阳市2026年度巩固拓展脱贫攻坚成果和乡村振兴项目计划（2025.11.27）：统筹中央、省级财政衔接资金，支持乡村产业、基础设施、人居环境整治。
- 耒阳市新型农业经营主体贷款贴息（2025.12.30）：对家庭农场、合作社等经营主体的农业生产经营贷款给予贴息，降低融资成本。
- 耒阳市乡村车间奖补（2025.11.10）：对吸纳脱贫人口就业的乡村车间给予奖补，鼓励就地就近就业。
- 耒阳市油茶产业"油票"试点（2025.09.16）：以油茶鲜果数量为标的，发行"油票"实现"保底价收购+加工补贴"；新造油茶林奖补提升至1000元/亩，低产林改造补助800元/亩。
- 耒阳市中央财政农民合作社和家庭农场培育（2025.08.13）：上级下达40万元资金，支持2个合作社（各10万）、4个家庭农场（各5万）。
- 耒阳市2025年中央与本级财政衔接推进乡村振兴补助资金（2025.08.01）：用于脱贫村小型公益性基础设施建设、农村人居环境整治。

【特色产业与文化政策】
- 湖南省财政支持油茶产业高质量发展（长期有效）：支持油茶新造、低改、加工升级，给予贷款贴息、资金补助。
- 耒阳市乡土文化与方言保护：推进"乡村著名行动"，开展非遗项目保护，支持农耕文化、方言文化数字化；校地合作共建"耒阳方言研究中心"。

4. 回答原则：
- 回答要实用、接地气，让农民朋友听得懂
- 涉及政策时要准确引用政策名称和具体数据
- 不确定的信息要如实说明，不要编造
- 鼓励用户咨询当地农业农村局获取最新信息
- 回答简洁明了，避免过于学术化的表述

5. 自我介绍：
当用户问你是谁时，你要说自己是"农智汇平台自主研发的耒阳方言农业智能助手"，基于大语言模型，经过耒阳方言语料库和本地涉农政策数据的微调训练，专门服务耒阳及周边地区的农民朋友。`;

// 存储对话历史（内存，生产环境应用Redis）
const chatHistory = {};

router.post('/send', async (req, res) => {
  try {
    const { message, sessionId } = req.body;
    if (!message || !message.trim()) {
      return res.json({ code: -1, message: '请输入消息' });
    }

    const sid = sessionId || 'default_' + Date.now();
    
    // 获取或初始化对话历史
    if (!chatHistory[sid]) {
      chatHistory[sid] = [];
    }
    const history = chatHistory[sid];
    
    // 添加用户消息
    history.push({ role: 'user', content: message.trim() });
    
    // 只保留最近6轮对话
    if (history.length > 12) {
      history.splice(0, history.length - 12);
    }

    // 构建请求
    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...history
    ];

    const postData = JSON.stringify({
      model: 'qwen-turbo',
      messages: messages,
      temperature: 0.7,
      max_tokens: 800
    });

    // 调用千问API
    const result = await new Promise((resolve, reject) => {
      const url = new URL(QWEN_API_URL);
      const options = {
        hostname: url.hostname,
        path: url.pathname,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${QWEN_API_KEY}`,
          'Content-Length': Buffer.byteLength(postData)
        }
      };

      const apiReq = https.request(options, (apiRes) => {
        let data = '';
        apiRes.on('data', chunk => data += chunk);
        apiRes.on('end', () => {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            reject(new Error('解析响应失败: ' + data.substring(0, 200)));
          }
        });
      });

      apiReq.on('error', reject);
      apiReq.setTimeout(30000, () => {
        apiReq.destroy();
        reject(new Error('请求超时'));
      });
      apiReq.write(postData);
      apiReq.end();
    });

    if (result.choices && result.choices[0]) {
      const reply = result.choices[0].message.content;
      // 保存助手回复到历史
      history.push({ role: 'assistant', content: reply });
      
      res.json({
        code: 0,
        data: {
          reply: reply,
          sessionId: sid
        }
      });
    } else {
      const errDetail = JSON.stringify(result);
      console.error('千问API返回异常:', errDetail);
      // 提取千问API的错误信息（如 invalid_api_key 等）
      const apiErrMsg = result.error ? `[${result.error.code}] ${result.error.message}` : errDetail.substring(0, 200);
      res.json({
        code: -1,
        message: '智能体暂时无法回答，请稍后再试',
        debug: apiErrMsg,
        data: { reply: '抱歉，我暂时无法回答，请稍后再试。', sessionId: sid }
      });
    }
  } catch (err) {
    console.error('智能体对话错误:', err.message);
    res.json({
      code: -1,
      message: err.message,
      data: { reply: '网络连接出现问题，请稍后再试。', sessionId: req.body.sessionId || '' }
    });
  }
});

// 清除对话历史
router.post('/clear', (req, res) => {
  const { sessionId } = req.body;
  if (sessionId && chatHistory[sessionId]) {
    delete chatHistory[sessionId];
  }
  res.json({ code: 0, message: '对话已清除' });
});

module.exports = router;
