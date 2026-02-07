/**
 * 本地数据服务 — 纯前端，无需后端
 * 内置涉农资源数据、搜索联想词、筛选、排序、收藏、历史
 */

// ============ 内置资源数据 ============
const ALL_RESOURCES = [
  // ===== 法律法规 =====
  { _id: 'law_1', title: '中华人民共和国农业法', summary: '为了巩固和加强农业在国民经济中的基础地位，深化农村改革，发展农业生产力，推进农业现代化，维护农民和农业生产经营组织的合法权益，增加农民收入，提高农民科学文化素质，促进农业和农村经济的持续、稳定、健康发展，实现全面建设小康社会的目标，制定本法。', category: 'law', publishTime: '2013-01-01', source: '全国人大网', sourceUrl: 'http://www.npc.gov.cn/npc/c2/c30834/202303/t20230315_425956.html', tags: ['农业法', '法律', '农业'], authority: 'official', platform: 'npc', platformName: '全国人大网', viewCount: 8520, collectCount: 342 },
  { _id: 'law_2', title: '中华人民共和国农村土地承包法', summary: '为稳定和完善以家庭承包经营为基础、统分结合的双层经营体制，赋予农民长期而有保障的土地使用权，维护农村土地承包当事人的合法权益，促进农业、农村经济发展和农村社会稳定，根据宪法，制定本法。', category: 'law', publishTime: '2019-01-01', source: '全国人大网', sourceUrl: 'http://www.npc.gov.cn/npc/c2/c30834/202303/t20230315_425960.html', tags: ['土地承包', '农村', '法律'], authority: 'official', platform: 'npc', platformName: '全国人大网', viewCount: 7650, collectCount: 298 },
  { _id: 'law_3', title: '中华人民共和国种子法', summary: '为了保护和合理利用种质资源，规范品种选育、种子生产经营和管理行为，保护植物新品种权，维护种子生产经营者、使用者的合法权益，提高种子质量，推动种业高质量发展，保障国家粮食安全，制定本法。', category: 'law', publishTime: '2022-03-01', source: '全国人大网', sourceUrl: 'http://www.npc.gov.cn/npc/c2/c30834/202303/t20230315_425962.html', tags: ['种子法', '种业', '粮食安全'], authority: 'official', platform: 'npc', platformName: '全国人大网', viewCount: 5430, collectCount: 187 },
  { _id: 'law_4', title: '中华人民共和国乡村振兴促进法', summary: '为了全面实施乡村振兴战略，促进农业全面升级、农村全面进步、农民全面发展，加快农业农村现代化，全面建设社会主义现代化国家，制定本法。本法自2021年6月1日起施行。', category: 'law', publishTime: '2021-06-01', source: '全国人大网', sourceUrl: 'http://www.npc.gov.cn/npc/c2/c30834/202106/t20210601_312969.html', tags: ['乡村振兴', '法律', '农村'], authority: 'official', platform: 'npc', platformName: '全国人大网', viewCount: 9200, collectCount: 456 },
  { _id: 'law_5', title: '中华人民共和国农产品质量安全法', summary: '为保障农产品质量安全，维护公众健康，促进农业和农村经济发展，制定本法。农产品质量安全工作实行预防为主、风险管理、源头治理、全程控制的原则。', category: 'law', publishTime: '2023-01-01', source: '全国人大网', sourceUrl: 'http://www.npc.gov.cn/npc/c2/c30834/202209/t20220902_319449.html', tags: ['农产品', '质量安全', '食品安全'], authority: 'official', platform: 'npc', platformName: '全国人大网', viewCount: 6100, collectCount: 234 },
  { _id: 'law_6', title: '中华人民共和国食品安全法', summary: '为了保证食品安全，保障公众身体健康和生命安全，制定本法。食品安全工作实行预防为主、风险管理、全程控制、社会共治，建立科学、严格的监督管理制度。', category: 'law', publishTime: '2021-04-29', source: '全国人大网', sourceUrl: 'http://www.npc.gov.cn/', tags: ['食品安全', '法律', '监管'], authority: 'official', platform: 'npc', platformName: '全国人大网', viewCount: 7800, collectCount: 310 },
  { _id: 'law_7', title: '中华人民共和国土地管理法', summary: '为了加强土地管理，维护土地的社会主义公有制，保护、开发土地资源，合理利用土地，切实保护耕地，促进社会经济的可持续发展，根据宪法，制定本法。', category: 'law', publishTime: '2020-01-01', source: '全国人大网', sourceUrl: 'http://www.npc.gov.cn/', tags: ['土地管理', '耕地保护', '法律'], authority: 'official', platform: 'npc', platformName: '全国人大网', viewCount: 8900, collectCount: 378 },
  { _id: 'law_8', title: '中华人民共和国森林法', summary: '为了践行绿水青山就是金山银山理念，保护、培育和合理利用森林资源，加快国土绿化，保障森林生态安全，建设生态文明，实现人与自然和谐共生，制定本法。', category: 'law', publishTime: '2020-07-01', source: '全国人大网', sourceUrl: 'http://www.npc.gov.cn/', tags: ['森林法', '生态', '绿化'], authority: 'official', platform: 'npc', platformName: '全国人大网', viewCount: 4200, collectCount: 156 },
  // ===== 政策文件 =====
  { _id: 'policy_1', title: '2026年中央一号文件：关于全面推进乡村振兴重点工作的意见', summary: '2026年中央一号文件聚焦乡村振兴，提出加快建设农业强国，全面推进乡村产业、人才、文化、生态、组织振兴，强化科技和改革双轮驱动，确保国家粮食安全。', category: 'policy', publishTime: '2026-02-03', source: '中国政府网', sourceUrl: 'http://www.gov.cn/', tags: ['一号文件', '乡村振兴', '2026'], authority: 'official', platform: 'gov', platformName: '中国政府网', viewCount: 15600, collectCount: 890 },
  { _id: 'policy_2', title: '国务院关于加快推进农业现代化的若干意见', summary: '为深入贯彻党的二十大精神，加快推进农业现代化，提高农业综合生产能力，保障国家粮食安全和重要农产品有效供给，促进农民持续增收，现提出以下意见。', category: 'policy', publishTime: '2025-12-15', source: '中国政府网', sourceUrl: 'http://www.gov.cn/', tags: ['农业现代化', '粮食安全', '政策'], authority: 'official', platform: 'gov', platformName: '中国政府网', viewCount: 12300, collectCount: 567 },
  { _id: 'policy_3', title: '农业农村部关于2026年农业补贴政策的通知', summary: '2026年中央财政继续加大支农力度，种粮补贴标准提高15%，新增智慧农业设备购置补贴，扩大农业保险覆盖范围。各地要确保补贴资金及时足额发放到户。', category: 'policy', publishTime: '2026-01-20', source: '农业农村部', sourceUrl: 'http://www.moa.gov.cn/', tags: ['农业补贴', '种粮补贴', '2026'], authority: 'official', platform: 'moa', platformName: '农业农村部', viewCount: 18900, collectCount: 1023 },
  { _id: 'policy_4', title: '关于推进高标准农田建设的实施方案', summary: '到2030年建成12亿亩高标准农田，亩均粮食产能提高10%以上。重点推进田块整治、灌排设施、田间道路、农田防护等工程建设，提升耕地质量。', category: 'policy', publishTime: '2025-11-08', source: '农业农村部', sourceUrl: 'http://www.moa.gov.cn/', tags: ['高标准农田', '耕地', '粮食产能'], authority: 'official', platform: 'moa', platformName: '农业农村部', viewCount: 8700, collectCount: 345 },
  { _id: 'policy_5', title: '乡村振兴战略规划（2026-2030年）', summary: '本规划明确了新阶段乡村振兴的目标任务，提出产业兴旺、生态宜居、乡风文明、治理有效、生活富裕的总要求，部署了农业农村现代化的重点工程和行动。', category: 'policy', publishTime: '2026-01-10', source: '中国政府网', sourceUrl: 'http://www.gov.cn/', tags: ['乡村振兴', '规划', '农村现代化'], authority: 'official', platform: 'gov', platformName: '中国政府网', viewCount: 11200, collectCount: 678 },
  { _id: 'policy_6', title: '关于加强农村宅基地管理的通知', summary: '严格落实一户一宅规定，规范宅基地审批管理，探索宅基地所有权、资格权、使用权分置有效实现形式，保障农民合法权益。', category: 'policy', publishTime: '2025-09-20', source: '农业农村部', sourceUrl: 'http://www.moa.gov.cn/', tags: ['宅基地', '农村', '土地管理'], authority: 'official', platform: 'moa', platformName: '农业农村部', viewCount: 9500, collectCount: 412 },
  { _id: 'policy_7', title: '关于促进农民合作社高质量发展的意见', summary: '支持农民合作社规范化建设，鼓励发展联合社，推动合作社与龙头企业、家庭农场有效衔接，提升小农户组织化程度和市场竞争力。', category: 'policy', publishTime: '2025-10-15', source: '农业农村部', sourceUrl: 'http://www.moa.gov.cn/', tags: ['合作社', '农民', '农业经营'], authority: 'official', platform: 'moa', platformName: '农业农村部', viewCount: 6800, collectCount: 289 },
  // ===== 农技手册 =====
  { _id: 'tech_1', title: '水稻高产栽培技术要点', summary: '介绍水稻从选种、育秧、移栽到田间管理、病虫害防治的全程技术要点。重点讲解合理密植、科学施肥、水分管理等关键环节，助力亩产突破600公斤。', category: 'tech', publishTime: '2025-03-15', source: '农业农村部', sourceUrl: 'http://www.moa.gov.cn/', tags: ['水稻', '种植技术', '高产'], authority: 'official', platform: 'moa', platformName: '农业农村部', viewCount: 12400, collectCount: 567 },
  { _id: 'tech_2', title: '小麦病虫害绿色防控技术方案', summary: '针对小麦赤霉病、条锈病、蚜虫等主要病虫害，推广生物防治、物理防治和科学用药相结合的绿色防控技术，减少化学农药使用量30%以上。', category: 'tech', publishTime: '2025-02-20', source: '农业农村部', sourceUrl: 'http://www.moa.gov.cn/', tags: ['小麦', '病虫害', '绿色防控'], authority: 'official', platform: 'moa', platformName: '农业农村部', viewCount: 8900, collectCount: 345 },
  { _id: 'tech_3', title: '测土配方施肥技术指南', summary: '通过土壤检测确定养分含量，根据作物需肥规律和目标产量，制定科学施肥方案。推广有机肥替代部分化肥，实现减肥增效、保护土壤。', category: 'tech', publishTime: '2025-04-10', source: '农业农村部', sourceUrl: 'http://www.moa.gov.cn/', tags: ['施肥', '土壤', '测土配方'], authority: 'official', platform: 'moa', platformName: '农业农村部', viewCount: 7600, collectCount: 298 },
  { _id: 'tech_4', title: '大棚蔬菜种植技术手册', summary: '系统介绍日光温室和塑料大棚蔬菜种植技术，包括品种选择、茬口安排、温湿度管理、水肥一体化、病虫害防治等内容，适合北方地区冬春季蔬菜生产。', category: 'tech', publishTime: '2025-01-08', source: '农业农村部', sourceUrl: 'http://www.moa.gov.cn/', tags: ['大棚', '蔬菜', '设施农业'], authority: 'official', platform: 'moa', platformName: '农业农村部', viewCount: 10200, collectCount: 456 },
  { _id: 'tech_5', title: '生猪健康养殖技术规范', summary: '从猪场选址建设、品种选择、饲料营养、疫病防控、环境控制等方面，全面介绍现代生猪健康养殖技术，重点强调非洲猪瘟等重大疫病的生物安全防控措施。', category: 'tech', publishTime: '2025-05-22', source: '农业农村部', sourceUrl: 'http://www.moa.gov.cn/', tags: ['生猪', '养殖', '疫病防控'], authority: 'official', platform: 'moa', platformName: '农业农村部', viewCount: 9800, collectCount: 412 },
  { _id: 'tech_6', title: '农业无人机植保作业技术规程', summary: '规范农业无人机在农作物病虫害防治中的应用，包括飞行参数设置、药液配制、作业安全等技术要求，提高植保作业效率和农药利用率。', category: 'tech', publishTime: '2025-06-18', source: '农业农村部', sourceUrl: 'http://www.moa.gov.cn/', tags: ['无人机', '植保', '智慧农业'], authority: 'official', platform: 'moa', platformName: '农业农村部', viewCount: 11500, collectCount: 523 },
  { _id: 'tech_7', title: '节水灌溉技术推广指南', summary: '推广滴灌、喷灌、微灌等节水灌溉技术，结合水肥一体化管理，实现农业用水效率提升40%以上。适用于干旱半干旱地区和设施农业。', category: 'tech', publishTime: '2025-07-05', source: '农业农村部', sourceUrl: 'http://www.moa.gov.cn/', tags: ['节水灌溉', '滴灌', '水肥一体化'], authority: 'official', platform: 'moa', platformName: '农业农村部', viewCount: 6700, collectCount: 234 },
  // ===== 乡土文献 =====
  { _id: 'culture_1', title: '中国传统农耕文化概论', summary: '系统梳理中国数千年农耕文明的发展脉络，介绍二十四节气、传统农具、耕作制度、农事习俗等内容，展现中华农耕文化的博大精深。', category: 'culture', publishTime: '2024-09-15', source: '中国农业博物馆', sourceUrl: 'http://www.zgnybwg.com.cn/', tags: ['农耕文化', '传统', '二十四节气'], authority: 'professional', platform: 'museum', platformName: '中国农业博物馆', viewCount: 5600, collectCount: 234 },
  { _id: 'culture_2', title: '乡村非物质文化遗产保护与传承', summary: '介绍我国农村地区非物质文化遗产的保护现状和传承实践，包括传统手工艺、民间音乐、农事节庆等，探讨乡村文化振兴的路径。', category: 'culture', publishTime: '2025-03-20', source: '文化和旅游部', sourceUrl: 'http://www.mct.gov.cn/', tags: ['非遗', '乡村文化', '传承'], authority: 'official', platform: 'mct', platformName: '文化和旅游部', viewCount: 4300, collectCount: 178 },
  { _id: 'culture_3', title: '中国传统村落保护发展报告', summary: '截至2025年，全国已有8155个村落列入中国传统村落名录。报告分析了传统村落的保护现状、面临的挑战和发展对策，提出活态保护与合理利用的建议。', category: 'culture', publishTime: '2025-06-10', source: '住建部', sourceUrl: 'http://www.mohurd.gov.cn/', tags: ['传统村落', '保护', '乡村'], authority: 'official', platform: 'mohurd', platformName: '住建部', viewCount: 3800, collectCount: 145 },
  { _id: 'culture_4', title: '休闲农业与乡村旅游发展指南', summary: '指导各地发展休闲农业和乡村旅游，推动农旅融合，打造田园综合体、农家乐、民宿等业态，促进农民增收和乡村经济多元化发展。', category: 'culture', publishTime: '2025-08-25', source: '农业农村部', sourceUrl: 'http://www.moa.gov.cn/', tags: ['休闲农业', '乡村旅游', '农旅融合'], authority: 'official', platform: 'moa', platformName: '农业农村部', viewCount: 7200, collectCount: 312 },
  { _id: 'culture_5', title: '农村人居环境整治提升行动方案', summary: '以农村厕所革命、生活污水垃圾治理、村容村貌提升为重点，推动农村人居环境从基本达标向提质升级转变，建设宜居宜业和美乡村。', category: 'culture', publishTime: '2025-04-18', source: '农业农村部', sourceUrl: 'http://www.moa.gov.cn/', tags: ['人居环境', '美丽乡村', '厕所革命'], authority: 'official', platform: 'moa', platformName: '农业农村部', viewCount: 8100, collectCount: 356 },
];

// ============ 搜索联想词（精简版） ============
const SUGGESTION_KEYWORDS = [
  '农村土地承包法','土地管理法','农业法','种子法','森林法','乡村振兴促进法','农产品质量安全法','食品安全法',
  '农业补贴','种粮补贴','农机补贴','农业保险','惠农政策','一号文件','乡村振兴','脱贫攻坚',
  '水稻种植','小麦种植','玉米种植','大豆种植','蔬菜种植','大棚蔬菜','有机蔬菜',
  '病虫害防治','绿色防控','测土配方施肥','节水灌溉','水肥一体化',
  '生猪养殖','肉牛养殖','家禽养殖','水产养殖','饲料',
  '农业无人机','智慧农业','数字农业','精准农业','农业物联网',
  '高标准农田','耕地保护','土地流转','宅基地','农民合作社','家庭农场',
  '农产品加工','绿色食品','有机食品','农产品品牌','冷链物流',
  '农耕文化','传统村落','乡村旅游','休闲农业','美丽乡村','人居环境',
  '粮食安全','种业振兴','农村改革','农村金融','农村教育','农村医疗',
  '农业机械','收割机','拖拉机','播种机','植保机械',
  '生态农业','循环农业','农业面源污染','秸秆还田','农膜回收',
  '茶叶','中药材','花卉','果树','食用菌','草莓','葡萄','苹果','柑橘'
];

// ============ 分类名映射 ============
const CATEGORY_MAP = { law: '法律法规', policy: '政策文件', tech: '农技手册', culture: '乡土文献' };

// ============ 搜索联想词 ============
function getSuggestions(prefix, limit = 8) {
  if (!prefix || !prefix.trim()) return [];
  const p = prefix.trim().toLowerCase();
  return SUGGESTION_KEYWORDS
    .filter(k => k.toLowerCase().includes(p))
    .slice(0, limit);
}

// ============ 搜索资源 ============
function searchResources(keyword, options = {}) {
  const { category, sortBy = 'relevance', page = 1, pageSize = 20 } = options;
  let results = [...ALL_RESOURCES];

  // 关键词过滤
  if (keyword) {
    const kw = keyword.toLowerCase();
    results = results.filter(r =>
      r.title.toLowerCase().includes(kw) ||
      (r.summary && r.summary.toLowerCase().includes(kw)) ||
      (r.tags && r.tags.some(t => t.toLowerCase().includes(kw)))
    );
  }

  // 分类过滤
  if (category) {
    results = results.filter(r => r.category === category);
  }

  // 排序
  switch (sortBy) {
    case 'time':
      results.sort((a, b) => (b.publishTime || '').localeCompare(a.publishTime || ''));
      break;
    case 'authority':
      const authOrder = { official: 3, professional: 2, general: 1 };
      results.sort((a, b) => (authOrder[b.authority] || 0) - (authOrder[a.authority] || 0));
      break;
    case 'popularity':
      results.sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0));
      break;
    default: // relevance
      if (keyword) {
        const kw = keyword.toLowerCase();
        results.sort((a, b) => {
          const aTitle = a.title.toLowerCase().includes(kw) ? 10 : 0;
          const bTitle = b.title.toLowerCase().includes(kw) ? 10 : 0;
          return (bTitle + (b.viewCount || 0) / 1000) - (aTitle + (a.viewCount || 0) / 1000);
        });
      }
      break;
  }

  // 分页
  const start = (page - 1) * pageSize;
  const list = results.slice(start, start + pageSize);

  return { list, total: results.length, hasMore: start + pageSize < results.length };
}

// ============ 获取资源列表（按分类） ============
function getResources(options = {}) {
  return searchResources('', options);
}

// ============ 获取热门资源 ============
function getHotResources(limit = 5) {
  return [...ALL_RESOURCES]
    .sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0))
    .slice(0, limit);
}

// ============ 获取最新政策 ============
function getLatestPolicies(limit = 5) {
  return ALL_RESOURCES
    .filter(r => r.category === 'policy')
    .sort((a, b) => (b.publishTime || '').localeCompare(a.publishTime || ''))
    .slice(0, limit);
}

// ============ 获取资源详情 ============
function getResourceById(id) {
  return ALL_RESOURCES.find(r => r._id === id) || null;
}

// ============ 获取相关资源 ============
function getRelatedResources(resource, limit = 5) {
  if (!resource) return [];
  return ALL_RESOURCES
    .filter(r => r._id !== resource._id && (
      r.category === resource.category ||
      (r.tags && resource.tags && r.tags.some(t => resource.tags.includes(t)))
    ))
    .slice(0, limit);
}

// ============ 收藏管理（本地存储） ============
function getCollectedIds() {
  return wx.getStorageSync('collectedResources') || [];
}

function isCollected(resourceId) {
  return getCollectedIds().includes(resourceId);
}

function toggleCollect(resourceId) {
  let ids = getCollectedIds();
  let collected;
  if (ids.includes(resourceId)) {
    ids = ids.filter(id => id !== resourceId);
    collected = false;
  } else {
    ids.unshift(resourceId);
    collected = true;
  }
  wx.setStorageSync('collectedResources', ids);
  return collected;
}

function getCollectedResources() {
  const ids = getCollectedIds();
  return ids.map(id => getResourceById(id)).filter(Boolean);
}

// ============ 浏览历史（本地存储） ============
function addHistory(resource) {
  if (!resource) return;
  let history = wx.getStorageSync('viewHistory') || [];
  history = history.filter(h => h._id !== resource._id);
  history.unshift({
    _id: resource._id,
    title: resource.title,
    summary: resource.summary,
    category: resource.category,
    viewTime: new Date().toLocaleString()
  });
  wx.setStorageSync('viewHistory', history.slice(0, 100));
}

function getHistory() {
  return wx.getStorageSync('viewHistory') || [];
}

function clearHistory() {
  wx.removeStorageSync('viewHistory');
}

// ============ 反馈（本地存储） ============
function submitFeedback(content, contact) {
  let feedbacks = wx.getStorageSync('feedbacks') || [];
  feedbacks.unshift({ content, contact, time: new Date().toLocaleString() });
  wx.setStorageSync('feedbacks', feedbacks);
}

module.exports = {
  getSuggestions, searchResources, getResources,
  getHotResources, getLatestPolicies,
  getResourceById, getRelatedResources,
  isCollected, toggleCollect, getCollectedResources,
  addHistory, getHistory, clearHistory,
  submitFeedback, CATEGORY_MAP, ALL_RESOURCES
};
