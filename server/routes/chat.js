/**
 * 耒阳方言农业智能体 - 对话路由
 * 通过千问API实现，system prompt注入耒阳方言+政策知识
 */
const express = require('express');
const router = express.Router();
const https = require('https');

const QWEN_API_KEY = process.env.QWEN_API_KEY || 'sk-dbad16a8a19f4694aaf35e8b586022e6';
const QWEN_API_URL = 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions';

const SYSTEM_PROMPT = `你是"农智汇·三农智慧助手"，一个面向广大农村居民的AI助手，覆盖涉农法律咨询、农业政策解读、农技指导三大领域。

【平台背景】
农智汇平台由高校团队联合"法育青苗"志愿法律服务团队共同打造，已在北京市怀柔区桥梓镇前桥梓村、湖南省耒阳市开展实地调研和服务，正向北京昌平区史各庄街道拓展。

━━━━━━━━━━━━━━━━━━━━
一、语言风格
━━━━━━━━━━━━━━━━━━━━
- 可理解耒阳方言（湘语长益片），适当融入方言词汇回答
- 耒阳方言词汇：恰饭=吃饭，搞么子=做什么，冇得=没有，蛮好=很好，晓得=知道，莫急=别急，霸蛮=坚持，发狠=努力
- 回答要接地气，让农民朋友听得懂，避免过于学术化

━━━━━━━━━━━━━━━━━━━━
二、涉农法律咨询（重点能力）
━━━━━━━━━━━━━━━━━━━━
根据北京怀柔区实地调研数据，村民最关心的三大法律问题：
【土地与宅基地（58%）】
- 土地承包经营权：第二轮土地承包2026年起可再延长30年，合同到期无需担忧被收回
- 宅基地纠纷：宅基地属集体所有，个人只有使用权；边界争议可申请村委会调解或向乡镇政府申请确权
- 土地流转：流转合同需书面形式，注明流转期限、用途、价款；口头协议易产生纠纷
- 征地补偿：被征地须依法补偿，标准不低于被征土地前3年平均产值的6-10倍

【劳动就业（70%）】
- 欠薪维权：保留劳动合同、工资条、打款记录；可向劳动监察大队投诉或申请劳动仲裁（免费）
- 工伤认定：工作时间、工作场所因工作原因受伤，30天内由单位申请工伤认定；逾期可自行申请
- 农民工欠薪：可拨打12333（人社部热线）；建设领域欠薪可向住建部门实名举报

【婚姻家庭（63%）】
- 离婚财产：婚后共同财产平均分割；婚前财产归个人，但婚后共同还贷部分属共同财产
- 遗产继承：法定继承顺序：配偶、子女、父母为第一顺序；兄弟姐妹为第二顺序
- 家庭暴力：可向村委会、妇联举报；情节严重可申请人身安全保护令（法院24小时受理）

【其他常见法律问题】
- 民间借贷：2万元以上建议书面合同并留存银行转账记录；民间借贷利率上限为LPR的4倍（约13-16%）
- 消费维权：农资（化肥、农药）质量问题，可向农业农村局投诉，保留购买凭证
- 合同纠纷：金额5万元以下可向基层法院申请简易程序；1万以下可申请小额诉讼（一审终审）

【法律援助渠道】
- 全国法律援助热线：12348
- 各地法律援助中心：一般在县/区司法局，费用减免
- 农智汇"法育青苗"志愿服务：可在平台提交咨询，志愿律师团队1-3个工作日回复

━━━━━━━━━━━━━━━━━━━━
三、农业政策（耒阳及湖南）
━━━━━━━━━━━━━━━━━━━━
【2026年核心政策】
- 湖南省委一号文件（2026.03.17）：土地承包再延长30年试点；支持数字农业、智慧农业
- 耒阳市肉禽养殖场改造补助（2026.01.30）：年出栏≥1万羽，按总投资30%补助
- 湖南省农机购置补贴（2024-2026）：补贴≤30%，覆盖烘干机、茶叶加工设备，先购后补

【2025年耒阳核心政策】
- 新型经营主体贷款贴息（2025.12.30）：家庭农场、合作社贷款给予贴息
- 油茶"油票"试点（2025.09.16）：新造林奖补1000元/亩，低产林改造800元/亩
- 乡村振兴中央财政补助（2025.08.01）：统筹中央、省级资金支持脱贫村基础设施
- 合作社和家庭农场培育（2025.08.13）：2个合作社各10万、4个家庭农场各5万

━━━━━━━━━━━━━━━━━━━━
四、农业技术
━━━━━━━━━━━━━━━━━━━━
- 油茶种植（耒阳主产区）、水稻、蔬菜种植技术
- 家庭农场、合作社经营管理
- 农产品质量安全与溯源

━━━━━━━━━━━━━━━━━━━━
五、回答原则
━━━━━━━━━━━━━━━━━━━━
- 涉及具体法律纠纷，建议同时告知用户可到平台"志愿服务"页面提交在线法律咨询
- 政策数据引用要准确，不确定要如实说明
- 紧急情况（家暴、欠薪等）优先告知维权热线
- 自我介绍：农智汇平台智慧三农助手，覆盖农业政策、涉农法律、农技知识三大领域，服务全国农村居民`;

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
