# UI设计规范 - Modern Rural-Fresh UI

## 🎨 设计理念

农智汇采用**Modern Rural-Fresh UI with Agricultural Illustrations**（现代乡村清新风格），营造亲切、接地气、充满生机的视觉氛围，传递专业而温暖的乡村服务感。

**核心关键词**: Organic green palette、Soft gradients、Rural fresh tones、Warm accents、Low-contrast shadows、Agricultural-themed icons、Modern flat illustrations、Rural-friendly visuals、Playful yet professional

## 🌾 设计语言

### 1. 色彩风格 (Color Language)

#### 主色系：生机翠绿系
```css
--primary-green: #2E7D32;      /* 生机翠绿 - 主色，代表农业生机 */
--primary-light: #43A047;      /* 明亮绿 - 强调元素 */
--primary-soft: #66BB6A;       /* 柔和绿 - 辅助色 */
--primary-pale: #81C784;       /* 浅茶绿 - 次要文字、图标 */
--secondary-green: #558B2F;    /* 深绿 - 正文文字 */
```

#### 辅助色系：暖橙暖黄（功能强调色）
```css
--accent-orange: #FFB74D;      /* 暖橙 - 按钮、标签 */
--accent-orange-dark: #FFA726; /* 深橙 - 强调 */
--accent-yellow: #FFF59D;      /* 柔黄 - 高亮 */
--accent-yellow-dark: #FFEE58; /* 深黄 - 强调 */
```

#### 背景色系：米白浅灰
```css
--bg-primary: #F5F5F0;         /* 米白 - 主背景 */
--bg-secondary: #FAFAF5;       /* 浅米白 - 次背景 */
--card-bg: #FFFFFF;            /* 纯白 - 卡片背景 */
--neutral-gray: #9E9E9E;       /* 中性灰 - 说明文字 */
```

#### 渐变色系
```css
--gradient-green: linear-gradient(135deg, #2E7D32 0%, #43A047 100%);
--gradient-green-light: linear-gradient(135deg, #66BB6A 0%, #81C784 100%);
--gradient-orange: linear-gradient(135deg, #FFB74D 0%, #FFA726 100%);
--gradient-yellow: linear-gradient(135deg, #FFF59D 0%, #FFEE58 100%);
--gradient-bg: linear-gradient(135deg, #E8F5E9 0%, #F1F8E9 100%);
```

### 2. 布局风格 (Layout Language)

#### 单栏流式布局
- **顶部轻量化导航栏**: 图标化 + 极简文字
- **中间核心内容区**: 圆角悬浮卡片做信息分组，搭配充足留白
- **底部导航**: 图标 + 极简文字，增强易用性

#### 悬浮卡片设计
- **充足留白**: 卡片间距 24rpx，内边距 32-40rpx
- **圆角**: 20rpx（柔和但不过度）
- **悬浮感阴影**: 低饱和度，营造轻盈感
- **清晰层级**: 每组功能独立包装

**关键词**: Floating rounded cards、Ample white space、Clean information hierarchy、Lightweight navigation、Subtle micro-interactions

### 3. 图标与插画风格 (Icon & Illustration Style)

#### 现代线性 + 面性结合图标
- 圆润边角
- 色彩统一为绿、橙、黄
- 农技主题：田野、作物、农具等元素

#### 轻量农技主题插画
- 扁平柔和风格
- 田野、作物、农具等元素
- 专业感 + 亲切感

**关键词**: Agricultural-themed icons、Modern flat illustrations、Rural-friendly visuals、Playful yet professional

## 📐 设计规范

### 字体规范

```css
font-family: 'FZXiaoBiaoSong-B05S', serif;  /* 方正小标宋简体 */
```

| 用途 | 大小 | 粗细 | 颜色 |
|------|------|------|------|
| 大标题 | 40-48rpx | bold | #2E7D32 |
| 标题 | 32-36rpx | bold | #2E7D32 |
| 正文 | 28-30rpx | normal | #2E7D32 |
| 辅助文字 | 24-26rpx | normal | #558B2F |
| 说明文字 | 22rpx | normal | #9E9E9E |

### 间距规范

| 类型 | 尺寸 | 说明 |
|------|------|------|
| 页面边距 | 24-32rpx | 左右边距 |
| 卡片间距 | 24rpx | 充足呼吸感 |
| 内容间距 | 16-20rpx | 段落间距 |
| 元素间距 | 12-16rpx | 小元素间距 |
| 卡片内边距 | 32-40rpx | 舒适留白 |

### 圆角规范

| 元素 | 圆角 | 说明 |
|------|------|------|
| 卡片 | 20rpx | 柔和圆角 |
| 按钮 | 48-50rpx | 胶囊形 |
| 标签 | 20-24rpx | 柔和胶囊 |
| 图标容器 | 20rpx | 柔和方形 |

### 阴影规范

```css
/* 轻阴影 - 卡片悬浮 */
box-shadow: 0 4rpx 20rpx rgba(46, 125, 50, 0.08);

/* 中阴影 - 交互反馈 */
box-shadow: 0 2rpx 16rpx rgba(46, 125, 50, 0.15);

/* 重阴影 - 用户卡片、按钮 */
box-shadow: 0 4rpx 16rpx rgba(46, 125, 50, 0.2);
```

### 边框规范

```css
/* 分割线 */
border-bottom: 2rpx solid rgba(46, 125, 50, 0.06);

/* 输入框边框 */
border: 2rpx solid rgba(46, 125, 50, 0.1);
```

## 📱 页面设计

### 首页 (index) ✅
- 顶部搜索栏（生机绿渐变背景）
- 轮播图/Banner（绿/橙/黄渐变背景）
- 功能宫格（圆角卡片，渐变图标）
- 推荐内容列表（悬浮卡片）

### 搜索页 (search) ✅
- 搜索框（柔和圆角，白色背景）
- 搜索历史（浮动标签）
- 热门搜索（渐变标签）
- 搜索结果列表（卡片式，充足留白）

### 分类页 (category) ✅
- 分类导航（渐变图标，圆角）
- 资源列表（悬浮卡片）
- 下拉刷新
- 上拉加载

### 详情页 (detail) ✅
- 标题和元信息（大标题，高行高）
- 内容正文（舒适阅读）
- 附件列表（渐变背景）
- 相关推荐（卡片式）
- 操作按钮（大图标，柔和反馈）

### 我的页面 (my) ✅
- 用户信息卡片（生机绿渐变）
- 功能菜单列表（悬浮卡片）
- 设置选项

## 🎭 动画效果

### 点击反馈（轻盈）
```css
.item:active {
  transform: translateY(2rpx);
  box-shadow: 0 2rpx 16rpx rgba(46, 125, 50, 0.15);
}
```

### 图标缩放
```css
.icon:active {
  transform: scale(0.92);
}
```

### 过渡动画
```css
transition: all 0.3s ease;
```

## 📊 响应式设计

- 使用 rpx 单位确保适配
- 设计稿基准: 750rpx
- 1rpx = 0.5px (iPhone 6)

## ♿ 无障碍设计

- 文字大小适中，易于阅读
- 生机绿与白色保持足够对比度
- 清晰的操作反馈
- 支持屏幕阅读器

## ⚡ 性能优化

- 使用 CSS 渐变代替图片
- 图片懒加载
- 列表虚拟滚动
- 避免过度动画
- 优化渲染性能

## 🎨 色彩应用场景

### 主色（生机翠绿 #2E7D32）
- 标题文字
- 主要按钮
- 导航栏背景
- 重要图标

### 辅助色（暖橙 #FFB74D）
- 次要按钮
- 功能强调
- 特殊标签
- 提示信息

### 辅助色（柔黄 #FFF59D）
- 高亮标记
- 特殊功能
- 装饰元素

### 背景色（米白 #F5F5F0）
- 页面主背景
- 营造温暖舒适感

## 📝 更新日志

### 2024-02-03 - Modern Rural-Fresh UI 全面升级
- ✅ 更新色彩系统：生机翠绿 (#2E7D32) 为主色
- ✅ 增加暖橙 (#FFB74D)、柔黄 (#FFF59D) 作为功能强调色
- ✅ 优化圆角至 20rpx（柔和但不过度）
- ✅ 优化阴影系统：低饱和度悬浮感
- ✅ 增加充足留白设计
- ✅ 统一字体为方正小标宋简体
- ✅ 更新所有页面样式：
  - 首页 (index) - 绿/橙/黄渐变轮播图
  - 搜索页 (search) - 清新搜索界面
  - 分类页 (category) - 多彩分类图标
  - 详情页 (detail) - 舒适阅读体验
  - 我的页面 (my) - 生机绿用户卡片
- ✅ 全局样式统一 (app.wxss)
- ✅ 营造亲切、接地气的乡村氛围

### 2024-01-15 - 初始版本
- 初始化UI设计规范
- 集成 Vant Weapp 组件库
- 完成基础页面布局

## 🌟 设计亮点

1. **色彩丰富但不杂乱**: 生机绿为主，暖橙暖黄点缀，营造活力感
2. **亲切接地气**: 米白背景 + 农技图标，贴近农村用户
3. **专业而温暖**: 保持专业感的同时传递温暖服务
4. **清晰易用**: 充足留白 + 清晰层级，降低认知负担
5. **现代化**: 悬浮卡片 + 柔和渐变，符合现代审美
