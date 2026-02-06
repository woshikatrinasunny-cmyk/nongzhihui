# 需求文档：全网涉农资源聚合搜索

## 简介

本需求旨在将"农智汇"从单一本地数据库搜索升级为**全网涉农资源聚合搜索平台**，通过整合多个涉农资源平台，实现"一键跨库检索"，大幅提升资源覆盖面和内容丰富度。

## 术语表

- **System**：农智汇平台系统
- **Crawler**：资源爬虫模块
- **Aggregator**：资源聚合器
- **External_API**：外部资源平台API
- **Local_Index**：本地资源索引
- **User**：平台用户（农民、农技人员等）

## 需求

### 需求 1：多源资源爬取

**用户故事**：作为平台管理员，我希望系统能自动爬取多个涉农资源网站的内容，以便用户能搜索到更丰富的资源。

#### 验收标准

1. WHEN 系统启动定时任务 THEN THE Crawler SHALL 自动爬取配置的资源网站
2. WHEN 爬取到新资源 THEN THE System SHALL 去重并存储到本地数据库
3. WHEN 爬取失败 THEN THE System SHALL 记录错误日志并重试
4. THE Crawler SHALL 支持以下资源平台：
   - 中国政府网（http://www.gov.cn）
   - 全国人大网（http://www.npc.gov.cn）
   - 农业农村部（http://www.moa.gov.cn）
   - 各省农业厅官网
5. THE Crawler SHALL 每日自动更新资源
6. THE Crawler SHALL 提取资源的标题、内容、来源、发布时间、标签等元数据

### 需求 2：外部API集成

**用户故事**：作为用户，我希望搜索时能同时查询多个外部平台，以便获取最新最全的资源。

#### 验收标准

1. WHEN 用户执行搜索 THEN THE Aggregator SHALL 同时查询本地数据库和外部API
2. THE System SHALL 集成以下外部API：
   - 国家政务服务平台API
   - 农业大数据平台API
   - 开放数据API（如data.gov.cn）
3. WHEN 外部API响应超时 THEN THE System SHALL 仅返回本地结果并提示用户
4. THE System SHALL 合并本地和外部搜索结果并去重
5. THE System SHALL 标注每条结果的来源平台

### 需求 3：智能资源索引

**用户故事**：作为用户，我希望搜索结果更准确相关，以便快速找到需要的资源。

#### 验收标准

1. THE System SHALL 使用Elasticsearch建立全文搜索索引
2. WHEN 新资源入库 THEN THE System SHALL 自动更新搜索索引
3. THE System SHALL 支持中文分词和语义搜索
4. THE System SHALL 根据以下因素排序搜索结果：
   - 关键词匹配度
   - 资源权威性（官方来源优先）
   - 发布时间（最新优先）
   - 用户行为（浏览量、收藏量）
5. THE System SHALL 支持同义词搜索（如"土地承包"和"土地流转"）

### 需求 4：资源分类和标签

**用户故事**：作为用户，我希望资源有清晰的分类和标签，以便精准筛选。

#### 验收标准

1. THE System SHALL 自动识别资源类型并分类：
   - 法律法规（国家法律、地方法规、司法解释）
   - 政策文件（中央政策、地方政策、部门文件）
   - 农技手册（种植技术、养殖技术、病虫害防治）
   - 乡土文献（地方志、民俗文化、传统技艺）
2. THE System SHALL 自动提取和生成资源标签
3. WHEN 用户搜索 THEN THE System SHALL 支持按分类和标签筛选
4. THE System SHALL 展示热门标签云

### 需求 5：资源质量保障

**用户故事**：作为用户，我希望搜索到的资源是权威可靠的，以便放心使用。

#### 验收标准

1. THE System SHALL 优先展示官方来源的资源
2. THE System SHALL 标注资源的权威等级：
   - 官方权威（政府网站、官方机构）
   - 专业可信（科研机构、高校）
   - 一般参考（其他来源）
3. WHEN 资源来源不明 THEN THE System SHALL 标注"来源待核实"
4. THE System SHALL 支持用户举报不实或过期资源
5. THE System SHALL 定期检查资源链接有效性

### 需求 6：跨平台资源整合

**用户故事**：作为用户，我希望能搜索到各个平台的资源，而不需要分别访问多个网站。

#### 验收标准

1. THE System SHALL 整合以下平台资源：
   - 政府公开信息平台
   - 农业科技文献库
   - 开源农业数据集
   - 农业视频教程平台
   - 农业问答社区
2. WHEN 显示搜索结果 THEN THE System SHALL 标注资源所属平台
3. THE System SHALL 提供"跳转到原平台"功能
4. THE System SHALL 缓存热门资源的完整内容

### 需求 7：增量更新机制

**用户故事**：作为平台管理员，我希望系统能自动发现和更新新资源，以便保持内容的时效性。

#### 验收标准

1. THE System SHALL 每日检查各资源平台的更新
2. WHEN 发现新资源 THEN THE System SHALL 自动抓取并入库
3. WHEN 资源被删除或失效 THEN THE System SHALL 标记为"已失效"
4. THE System SHALL 提供资源更新日志
5. THE System SHALL 支持手动触发全量更新

### 需求 8：搜索结果聚合展示

**用户故事**：作为用户，我希望搜索结果能清晰展示来自不同平台的资源，以便选择最合适的。

#### 验收标准

1. WHEN 显示搜索结果 THEN THE System SHALL 按来源平台分组展示
2. THE System SHALL 显示每个平台的结果数量
3. THE System SHALL 支持按平台筛选结果
4. THE System SHALL 在结果卡片上显示平台图标和名称
5. WHEN 某平台无结果 THEN THE System SHALL 提示"该平台暂无相关资源"

### 需求 9：资源预览和缓存

**用户故事**：作为用户，我希望能快速预览外部资源，而不需要跳转到其他网站。

#### 验收标准

1. THE System SHALL 缓存外部资源的摘要和关键内容
2. WHEN 用户点击外部资源 THEN THE System SHALL 先显示预览页面
3. THE System SHALL 提供"查看完整内容"按钮跳转到原平台
4. THE System SHALL 缓存用户最近浏览的外部资源
5. WHEN 缓存过期 THEN THE System SHALL 重新抓取内容

### 需求 10：数据统计和监控

**用户故事**：作为平台管理员，我希望了解各平台的资源数量和质量，以便优化聚合策略。

#### 验收标准

1. THE System SHALL 统计各平台的资源总数
2. THE System SHALL 统计各平台的更新频率
3. THE System SHALL 统计各平台的访问量和用户偏好
4. THE System SHALL 监控爬虫运行状态和成功率
5. THE System SHALL 提供可视化数据看板
