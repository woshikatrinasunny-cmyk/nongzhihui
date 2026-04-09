const express = require('express');
const router = express.Router();

// 模拟数据存储
let consults = [];
let replies = [];
let cases = [];
let consultIdCounter = 1;
let replyIdCounter = 1;
let caseIdCounter = 1;

// 初始化示例数据
function initSampleData() {
  consults = [
    {
      id: 1,
      content: '我家的土地承包合同到期了，但是村委会不给续签，这种情况下我该怎么办？',
      category: '法律咨询',
      status: 'answered',
      userId: 'user1',
      createTime: Date.now() - 86400000,
      replyCount: 2
    },
    {
      id: 2,
      content: '农产品质量安全出现问题，消费者要求赔偿，我作为农户需要承担什么责任？',
      category: '法律咨询',
      status: 'pending',
      userId: 'user2',
      createTime: Date.now() - 3600000,
      replyCount: 0
    }
  ];

  replies = [
    {
      id: 1,
      consultId: 1,
      content: '根据《农村土地承包法》，承包期届满后，土地承包经营权人可以按照国家有关规定继续承包。建议您先与村委会协商，如协商不成可向县级以上人民政府农业农村主管部门申请调解。',
      userId: 'volunteer1',
      username: '法律志愿者张律师',
      isVolunteer: true,
      createTime: Date.now() - 43200000,
      likeCount: 5,
      liked: false
    }
  ];

  cases = [
    {
      id: 1,
      title: '土地承包纠纷解决案例',
      summary: '农户因土地承包合同纠纷，通过法律途径成功维护自身权益的典型案例。',
      content: '详细案例内容...',
      tags: ['土地承包', '合同纠纷', '农村法律'],
      category: '法律咨询',
      viewCount: 156,
      likeCount: 23,
      createTime: Date.now() - 604800000
    },
    {
      id: 2,
      title: '农产品质量安全责任认定',
      summary: '关于农产品质量安全问题的责任认定和赔偿标准的法律解析。',
      content: '详细案例内容...',
      tags: ['农产品质量', '安全责任', '赔偿标准'],
      category: '法律咨询',
      viewCount: 89,
      likeCount: 12,
      createTime: Date.now() - 1209600000
    },
    {
      id: 3,
      title: '农业补贴申请流程指南',
      summary: '详细介绍农业补贴的申请条件、所需材料和办理流程。',
      content: '详细案例内容...',
      tags: ['农业补贴', '申请流程', '政策解读'],
      category: '政策咨询',
      viewCount: 234,
      likeCount: 45,
      createTime: Date.now() - 259200000
    }
  ];

  consultIdCounter = consults.length + 1;
  replyIdCounter = replies.length + 1;
  caseIdCounter = cases.length + 1;
}

initSampleData();

// 发布咨询
router.post('/consult', (req, res) => {
  try {
    const { content, category = '法律咨询' } = req.body;
    const userId = req.headers.authorization || 'anonymous';

    if (!content || !content.trim()) {
      return res.json({ success: false, message: '咨询内容不能为空' });
    }

    const newConsult = {
      id: consultIdCounter++,
      content: content.trim(),
      category,
      status: 'pending',
      userId,
      createTime: Date.now(),
      replyCount: 0
    };

    consults.unshift(newConsult);
    res.json({ success: true, message: '咨询发布成功', data: newConsult });
  } catch (error) {
    console.error('发布咨询失败:', error);
    res.json({ success: false, message: '发布失败，请稍后重试' });
  }
});

// 获取我的咨询
router.get('/my-consults', (req, res) => {
  try {
    const userId = req.headers.authorization || 'anonymous';
    const myConsults = consults.filter(item => item.userId === userId);
    res.json({ success: true, data: myConsults });
  } catch (error) {
    console.error('获取我的咨询失败:', error);
    res.json({ success: false, message: '获取失败，请稍后重试' });
  }
});

// 获取待回答咨询
router.get('/pending-consults', (req, res) => {
  try {
    const pendingConsults = consults.filter(item => item.status === 'pending');
    res.json({ success: true, data: pendingConsults });
  } catch (error) {
    console.error('获取待回答咨询失败:', error);
    res.json({ success: false, message: '获取失败，请稍后重试' });
  }
});

// 获取已解决案例
router.get('/resolved-cases', (req, res) => {
  try {
    res.json({ success: true, data: cases });
  } catch (error) {
    console.error('获取已解决案例失败:', error);
    res.json({ success: false, message: '获取失败，请稍后重试' });
  }
});

// 获取咨询详情
router.get('/consult/:id', (req, res) => {
  try {
    const consultId = parseInt(req.params.id);
    const consult = consults.find(item => item.id === consultId);

    if (!consult) {
      return res.json({ success: false, message: '咨询不存在' });
    }

    res.json({ success: true, data: consult });
  } catch (error) {
    console.error('获取咨询详情失败:', error);
    res.json({ success: false, message: '获取失败，请稍后重试' });
  }
});

// 获取咨询回复
router.get('/consult/:id/replies', (req, res) => {
  try {
    const consultId = parseInt(req.params.id);
    const consultReplies = replies.filter(item => item.consultId === consultId);
    res.json({ success: true, data: consultReplies });
  } catch (error) {
    console.error('获取咨询回复失败:', error);
    res.json({ success: false, message: '获取失败，请稍后重试' });
  }
});

// 回复咨询
router.post('/consult/:id/reply', (req, res) => {
  try {
    const consultId = parseInt(req.params.id);
    const { content, replyToId } = req.body;
    const userId = req.headers.authorization || 'anonymous';

    if (!content || !content.trim()) {
      return res.json({ success: false, message: '回复内容不能为空' });
    }

    const consult = consults.find(item => item.id === consultId);
    if (!consult) {
      return res.json({ success: false, message: '咨询不存在' });
    }

    const newReply = {
      id: replyIdCounter++,
      consultId,
      content: content.trim(),
      userId,
      username: userId.includes('volunteer') ? '志愿者' : '用户',
      isVolunteer: userId.includes('volunteer'),
      createTime: Date.now(),
      likeCount: 0,
      liked: false,
      replyToId: replyToId || null
    };

    replies.push(newReply);
    consult.replyCount = replies.filter(r => r.consultId === consultId).length;
    if (consult.status === 'pending' && newReply.isVolunteer) {
      consult.status = 'answered';
    }

    res.json({ success: true, message: '回复成功', data: newReply });
  } catch (error) {
    console.error('回复咨询失败:', error);
    res.json({ success: false, message: '回复失败，请稍后重试' });
  }
});

// 获取案例详情
router.get('/case/:id', (req, res) => {
  try {
    const caseId = parseInt(req.params.id);
    const caseDetail = cases.find(item => item.id === caseId);

    if (!caseDetail) {
      return res.json({ success: false, message: '案例不存在' });
    }

    caseDetail.viewCount = (caseDetail.viewCount || 0) + 1;
    res.json({ success: true, data: caseDetail });
  } catch (error) {
    console.error('获取案例详情失败:', error);
    res.json({ success: false, message: '获取失败，请稍后重试' });
  }
});

module.exports = router;
