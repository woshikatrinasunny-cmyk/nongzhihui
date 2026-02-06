# Vant Weapp 组件库使用指南

## 安装步骤

### 1. 安装依赖
在 `miniprogram` 目录下打开命令行，执行：
```bash
npm install
```

### 2. 构建 npm
在微信开发者工具中：
1. 点击菜单栏：**工具 → 构建 npm**
2. 等待构建完成
3. 会生成 `miniprogram_npm` 文件夹

### 3. 配置 app.json
已经配置好了，无需修改。

## 使用示例

### 在页面中使用组件

#### 1. 在页面的 json 文件中引入组件
```json
{
  "usingComponents": {
    "van-button": "@vant/weapp/button/index",
    "van-cell": "@vant/weapp/cell/index",
    "van-icon": "@vant/weapp/icon/index",
    "van-search": "@vant/weapp/search/index",
    "van-tag": "@vant/weapp/tag/index",
    "van-card": "@vant/weapp/card/index"
  }
}
```

#### 2. 在 wxml 中使用
```xml
<!-- 按钮 -->
<van-button type="primary">主要按钮</van-button>
<van-button type="success">成功按钮</van-button>

<!-- 搜索框 -->
<van-search placeholder="请输入搜索关键词" />

<!-- 标签 -->
<van-tag type="primary">标签</van-tag>

<!-- 单元格 -->
<van-cell title="单元格" value="内容" />
```

## 常用组件

### 基础组件
- **Button 按钮** - 各种样式的按钮
- **Icon 图标** - 内置图标库
- **Image 图片** - 增强的图片组件
- **Cell 单元格** - 列表项

### 表单组件
- **Search 搜索** - 搜索框
- **Field 输入框** - 表单输入
- **Radio 单选框**
- **Checkbox 复选框**

### 展示组件
- **Tag 标签** - 标记和分类
- **Card 卡片** - 商品卡片
- **Collapse 折叠面板**
- **NoticeBar 通知栏**

### 导航组件
- **Tab 标签页**
- **Tabbar 标签栏**
- **NavBar 导航栏**

### 反馈组件
- **Toast 轻提示**
- **Dialog 弹出框**
- **Loading 加载**

## 官方文档
https://vant-contrib.gitee.io/vant-weapp/

## 注意事项
1. 每次修改 package.json 后需要重新 `npm install` 和 **构建 npm**
2. 组件路径必须正确：`@vant/weapp/组件名/index`
3. 如果组件不显示，检查是否构建了 npm
