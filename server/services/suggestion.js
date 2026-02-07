/**
 * 搜索联想词服务 (Suggestion Service)
 * 基于农业关键词字典的 Trie 树前缀匹配，支持中文和拼音
 */

const { pinyin } = require('pinyin-pro');

// Trie 节点
class TrieNode {
  constructor() {
    this.children = {};
    this.entries = []; // 匹配到此前缀的关键词条目
  }
}

class SuggestionService {
  constructor() {
    this.trie = new TrieNode();
    this.dictionary = [];
    this.loaded = false;
    this.loadDictionary();
  }

  /**
   * 加载农业关键词字典并构建 Trie
   */
  loadDictionary() {
    try {
      this.dictionary = buildAgriDictionary();
      // 为每个词条生成拼音并插入 Trie
      for (const entry of this.dictionary) {
        const py = pinyin(entry.keyword, { toneType: 'none', type: 'array' }).join('');
        const pyInitial = pinyin(entry.keyword, { pattern: 'first', toneType: 'none', type: 'array' }).join('');
        entry.pinyin = py;
        entry.pinyinInitial = pyInitial;

        // 插入中文前缀
        this._insert(entry.keyword, entry);
        // 插入全拼前缀
        this._insert(py, entry);
        // 插入首字母前缀
        this._insert(pyInitial, entry);
      }
      this.loaded = true;
      console.log(`[联想词服务] 加载 ${this.dictionary.length} 个农业关键词`);
    } catch (err) {
      console.error('[联想词服务] 字典加载失败:', err.message);
      this.loaded = false;
    }
  }

  _insert(key, entry) {
    let node = this.trie;
    for (const ch of key.toLowerCase()) {
      if (!node.children[ch]) node.children[ch] = new TrieNode();
      node = node.children[ch];
      // 只保留去重引用
      if (!node.entries.includes(entry)) node.entries.push(entry);
    }
  }

  /**
   * 根据前缀获取建议列表
   * @param {string} prefix - 用户输入前缀（中文或拼音）
   * @param {number} limit - 最大返回数量，默认 8
   * @returns {string[]} 建议关键词列表
   */
  getSuggestions(prefix, limit = 8) {
    if (!prefix || typeof prefix !== 'string') return [];
    const normalizedPrefix = prefix.trim().toLowerCase();
    if (normalizedPrefix.length === 0) return [];

    let node = this.trie;
    for (const ch of normalizedPrefix) {
      if (!node.children[ch]) return [];
      node = node.children[ch];
    }

    // 按权重降序排列，取前 limit 个，去重
    const seen = new Set();
    const results = [];
    const sorted = node.entries.slice().sort((a, b) => b.weight - a.weight);
    for (const entry of sorted) {
      if (seen.has(entry.keyword)) continue;
      seen.add(entry.keyword);
      results.push(entry.keyword);
      if (results.length >= limit) break;
    }
    return results;
  }

  /**
   * 判断拼音前缀是否匹配某关键词
   * @param {string} prefix - 拼音前缀
   * @param {string} keyword - 中文关键词
   * @returns {boolean}
   */
  pinyinMatch(prefix, keyword) {
    if (!prefix || !keyword) return false;
    const p = prefix.toLowerCase();
    const py = pinyin(keyword, { toneType: 'none', type: 'array' }).join('').toLowerCase();
    const pyInitial = pinyin(keyword, { pattern: 'first', toneType: 'none', type: 'array' }).join('').toLowerCase();
    return py.startsWith(p) || pyInitial.startsWith(p);
  }
}

/**
 * 构建农业关键词字典 (500+ 词条)
 * 涵盖：粮食作物、经济作物、畜牧养殖、水产养殖、农业政策法规、
 *       农业技术、农业机械、土壤肥料、病虫害防治、农产品加工、
 *       乡村振兴、农业经济等领域
 */
function buildAgriDictionary() {
  const dict = [];
  let id = 1;
  const add = (keyword, weight = 50) => { dict.push({ id: id++, keyword, weight }); };

  // ===== 粮食作物 (weight: 90) =====
  const grainCrops = [
    '水稻', '水稻种植', '水稻病虫害', '水稻育种', '杂交水稻', '超级稻',
    '小麦', '小麦种植', '冬小麦', '春小麦', '小麦病害',
    '玉米', '玉米种植', '玉米深加工', '甜玉米', '糯玉米',
    '大豆', '大豆种植', '转基因大豆', '大豆蛋白',
    '高粱', '谷子', '燕麦', '荞麦', '青稞', '薏仁',
    '粮食安全', '粮食储备', '粮食产量', '粮食收购', '粮食价格'
  ];
  grainCrops.forEach(k => add(k, 90));

  // ===== 经济作物 (weight: 85) =====
  const cashCrops = [
    '棉花', '棉花种植', '油菜', '花生', '芝麻', '向日葵',
    '甘蔗', '甜菜', '烟草', '茶叶', '茶叶种植', '绿茶', '红茶',
    '咖啡种植', '橡胶', '蚕桑', '麻类',
    '中药材', '中药材种植', '人参', '枸杞', '黄芪', '当归', '三七',
    '天麻', '灵芝', '石斛', '金银花', '板蓝根'
  ];
  cashCrops.forEach(k => add(k, 85));

  // ===== 蔬菜瓜果 (weight: 85) =====
  const vegetables = [
    '蔬菜种植', '大棚蔬菜', '有机蔬菜', '无公害蔬菜',
    '番茄', '黄瓜', '辣椒', '茄子', '白菜', '萝卜', '土豆', '红薯',
    '西瓜', '甜瓜', '草莓', '葡萄', '苹果', '柑橘', '桃子', '梨',
    '芒果', '荔枝', '龙眼', '香蕉', '猕猴桃', '蓝莓', '樱桃',
    '食用菌', '香菇', '平菇', '金针菇', '木耳', '银耳',
    '设施农业', '温室大棚', '智慧温室'
  ];
  vegetables.forEach(k => add(k, 85));

  // ===== 畜牧养殖 (weight: 80) =====
  const livestock = [
    '生猪养殖', '养猪技术', '猪瘟防治', '非洲猪瘟',
    '肉牛养殖', '奶牛养殖', '牛肉', '牛奶',
    '肉羊养殖', '绵羊', '山羊', '羊毛',
    '家禽养殖', '蛋鸡养殖', '肉鸡养殖', '鸭养殖', '鹅养殖',
    '兔养殖', '鸽子养殖', '蜜蜂养殖',
    '饲料', '饲料添加剂', '青贮饲料', '配合饲料',
    '动物疫病', '动物防疫', '兽药', '畜牧业', '草原畜牧'
  ];
  livestock.forEach(k => add(k, 80));

  // ===== 水产养殖 (weight: 80) =====
  const aquaculture = [
    '水产养殖', '淡水养殖', '海水养殖', '池塘养殖',
    '鱼类养殖', '草鱼', '鲤鱼', '鲫鱼', '罗非鱼', '鲈鱼',
    '虾类养殖', '对虾', '小龙虾', '基围虾',
    '蟹类养殖', '大闸蟹', '梭子蟹',
    '贝类养殖', '牡蛎', '扇贝', '鲍鱼',
    '海带', '紫菜', '海参', '甲鱼', '泥鳅', '黄鳝',
    '渔业', '远洋渔业', '休闲渔业', '水产品加工'
  ];
  aquaculture.forEach(k => add(k, 80));

  // ===== 农业政策法规 (weight: 95) =====
  const policies = [
    '农村土地承包法', '土地管理法', '农业法', '种子法', '森林法',
    '草原法', '渔业法', '动物防疫法', '农产品质量安全法', '食品安全法',
    '农村土地承包', '土地流转', '土地确权', '宅基地', '集体产权',
    '乡村振兴', '乡村振兴战略', '乡村振兴促进法', '美丽乡村',
    '脱贫攻坚', '精准扶贫', '产业扶贫', '易地搬迁',
    '农业补贴', '种粮补贴', '农机补贴', '良种补贴', '农业保险',
    '惠农政策', '强农惠农', '支农政策', '三农政策', '三农问题',
    '农村改革', '农业供给侧改革', '农村集体经济',
    '一号文件', '中央一号文件', '农业农村部', '农业政策',
    '耕地保护', '基本农田', '永久基本农田', '耕地红线',
    '农村宅基地管理', '农村建设用地', '农村产权交易',
    '新型农业经营主体', '家庭农场', '农民合作社', '农业产业化',
    '农村金融', '农业贷款', '农村信用社', '农业担保'
  ];
  policies.forEach(k => add(k, 95));

  // ===== 农业技术 (weight: 85) =====
  const agriTech = [
    '测土配方施肥', '精准施肥', '有机肥', '化肥减量',
    '节水灌溉', '滴灌技术', '喷灌', '水肥一体化',
    '病虫害防治', '绿色防控', '生物防治', '农药减量',
    '杂草防除', '除草剂', '植物保护',
    '育种技术', '杂交育种', '分子育种', '航天育种',
    '转基因技术', '基因编辑', '生物技术',
    '土壤改良', '盐碱地改良', '酸性土壤改良', '土壤检测',
    '农业气象', '气象灾害', '干旱', '洪涝', '霜冻', '台风',
    '农业遥感', '卫星遥感', '无人机遥感',
    '保护性耕作', '免耕播种', '秸秆还田', '深松整地',
    '嫁接技术', '扦插繁殖', '组织培养'
  ];
  agriTech.forEach(k => add(k, 85));

  // ===== 智慧农业 (weight: 90) =====
  const smartAgri = [
    '智慧农业', '数字农业', '农业物联网', '农业大数据',
    '农业人工智能', '农业机器人', '无人农场',
    '农业无人机', '植保无人机', '农用无人机',
    '精准农业', '变量施肥', '变量喷药',
    '农业信息化', '农村电商', '农产品电商', '直播带货',
    '冷链物流', '农产品物流', '产地仓储',
    '农业区块链', '农产品溯源', '质量追溯',
    '智能灌溉', '智能温控', '环境监测'
  ];
  smartAgri.forEach(k => add(k, 90));

  // ===== 农业机械 (weight: 80) =====
  const machinery = [
    '农业机械', '农机购置补贴', '农机化',
    '拖拉机', '收割机', '联合收割机', '插秧机',
    '播种机', '旋耕机', '犁', '耙',
    '植保机械', '喷雾器', '弥雾机',
    '烘干机', '粮食烘干', '脱粒机',
    '农机维修', '农机安全', '农机合作社'
  ];
  machinery.forEach(k => add(k, 80));

  // ===== 农产品加工 (weight: 75) =====
  const processing = [
    '农产品加工', '粮油加工', '果蔬加工', '肉类加工',
    '乳制品加工', '水产品加工', '茶叶加工',
    '食品安全', '食品检测', '农药残留', '兽药残留',
    '绿色食品', '有机食品', '无公害农产品', '地理标志产品',
    '农产品质量', '农产品标准', '农产品认证',
    '农产品品牌', '区域公用品牌', '农产品营销'
  ];
  processing.forEach(k => add(k, 75));

  // ===== 生态环保 (weight: 80) =====
  const ecology = [
    '生态农业', '循环农业', '低碳农业', '绿色发展',
    '农业面源污染', '化肥农药污染', '畜禽粪污处理',
    '秸秆综合利用', '农膜回收', '农业废弃物',
    '退耕还林', '退牧还草', '水土保持', '荒漠化防治',
    '湿地保护', '生物多样性', '农业碳汇', '碳中和'
  ];
  ecology.forEach(k => add(k, 80));

  // ===== 林业 (weight: 75) =====
  const forestry = [
    '林业', '造林绿化', '森林防火', '林下经济',
    '木材加工', '竹产业', '花卉种植', '苗木培育',
    '果树种植', '核桃', '板栗', '油茶', '油桐',
    '森林康养', '林业碳汇', '天然林保护'
  ];
  forestry.forEach(k => add(k, 75));

  // ===== 农村社会 (weight: 70) =====
  const ruralSociety = [
    '农村教育', '农村医疗', '新农合', '农村养老',
    '农村低保', '农村社保', '农民工', '返乡创业',
    '新型职业农民', '高素质农民', '农民培训',
    '农村人居环境', '厕所革命', '垃圾分类', '污水处理',
    '农村道路', '农村饮水', '农村电网', '农村通信',
    '村庄规划', '乡村治理', '村民自治', '乡风文明',
    '农村文化', '非物质文化遗产', '传统村落', '乡村旅游',
    '休闲农业', '观光农业', '采摘园', '农家乐', '民宿'
  ];
  ruralSociety.forEach(k => add(k, 70));

  // ===== 农业经济 (weight: 75) =====
  const agriEcon = [
    '农业GDP', '农民收入', '农村经济', '农业产值',
    '农产品价格', '粮食价格', '猪肉价格', '蔬菜价格',
    '农产品市场', '批发市场', '期货市场', '农产品贸易',
    '农业进出口', '农产品关税', '农业国际合作',
    '农业投资', '农业招商', '农业园区', '现代农业产业园',
    '农业科技园', '农业示范区', '高标准农田'
  ];
  agriEcon.forEach(k => add(k, 75));

  // ===== 地方特色农业 (weight: 70) =====
  const regional = [
    '东北大米', '五常大米', '盘锦大米',
    '新疆棉花', '新疆葡萄', '哈密瓜', '和田玉枣',
    '云南普洱茶', '西湖龙井', '安溪铁观音', '武夷岩茶',
    '阳澄湖大闸蟹', '盱眙龙虾', '潜江小龙虾',
    '赣南脐橙', '烟台苹果', '洛川苹果', '库尔勒香梨',
    '宁夏枸杞', '青海冬虫夏草', '长白山人参',
    '内蒙古牛羊肉', '西藏牦牛', '藏香猪',
    '海南热带水果', '广西甘蔗', '四川花椒', '贵州辣椒'
  ];
  regional.forEach(k => add(k, 70));

  // ===== 农业灾害 (weight: 85) =====
  const disasters = [
    '旱灾', '涝灾', '洪水', '台风灾害', '冰雹',
    '霜冻害', '雪灾', '沙尘暴',
    '蝗灾', '草地贪夜蛾', '稻飞虱', '棉铃虫', '蚜虫',
    '稻瘟病', '小麦锈病', '玉米螟', '白粉病', '枯萎病',
    '禽流感', '口蹄疫', '布鲁氏菌病', '炭疽',
    '农业保险理赔', '灾后恢复', '防灾减灾'
  ];
  disasters.forEach(k => add(k, 85));

  // ===== 种业 (weight: 85) =====
  const seeds = [
    '种业振兴', '种子安全', '种质资源', '基因库',
    '良种繁育', '品种审定', '品种推广', '种子市场',
    '杂交稻种子', '玉米种子', '蔬菜种子', '花卉种子',
    '种畜禽', '水产苗种', '种业企业', '种业科技'
  ];
  seeds.forEach(k => add(k, 85));

  // ===== 农村能源 (weight: 70) =====
  const energy = [
    '农村沼气', '生物质能', '秸秆发电', '光伏农业',
    '农村太阳能', '风力发电', '农村清洁能源',
    '农村煤改气', '农村煤改电'
  ];
  energy.forEach(k => add(k, 70));

  // ===== 农业科研 (weight: 75) =====
  const research = [
    '农业科研', '农业院校', '农科院', '农业推广',
    '农业论文', '农业学报', '田间试验', '示范推广'
  ];
  research.forEach(k => add(k, 75));

  // ===== 国际农业 (weight: 65) =====
  const intlAgri = [
    '国际农业合作', '一带一路农业', '南南合作',
    '联合国粮农组织', '世界粮食计划署', '国际农业发展基金',
    '全球粮食安全', '粮食危机', '农业可持续发展',
    '有机农业标准', '公平贸易', '农业技术转让'
  ];
  intlAgri.forEach(k => add(k, 65));

  return dict;
}

module.exports = new SuggestionService();
