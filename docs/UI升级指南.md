# UI 升级指南 - 集成 Vant Weapp

## 🎯 目标
将小程序升级为使用 Vant Weapp 组件库，提升界面美观度和用户体验。

## 📋 操作步骤

### 第一步：安装依赖

1. 打开命令行（CMD 或 PowerShell）
2. 进入 miniprogram 目录：
   ```bash
   cd miniprogram
   ```
3. 安装 npm 包：
   ```bash
   npm install
   ```

### 第二步：构建 npm

1. 打开微信开发者工具
2. 点击菜单栏：**工具 → 构建 npm**
3. 勾选"使用 npm 模块"
4. 点击"确定"
5. 等待构建完成（会生成 miniprogram_npm 文件夹）

### 第三步：验证安装

构建成功后，你会看到：
- `miniprogram/miniprogram_npm/@vant` 文件夹
- 控制台显示"构建 npm 完成"

### 第四步：使用组件

#### 方案A：逐步替换（推荐）
保持现有页面，新建页面时使用 Vant 组件

#### 方案B：全面升级
将所有页面改造为使用 Vant 组件

## 🎨 Vant 组件示例

### 搜索框
```xml
<!-- 原来的 -->
<view class="search-bar">
  <text>🔍</text>
  <input placeholder="搜索..." />
</view>

<!-- 使用 Vant -->
<van-search 
  placeholder="搜索涉农法律、政策、技术..." 
  bind:search="onSearch"
/>
```

### 标签
```xml
<!-- 原来的 -->
<text class="tag">法律法规</text>

<!-- 使用 Vant -->
<van-tag type="success">法律法规</van-tag>
```

### 单元格列表
```xml
<!-- 原来的 -->
<view class="resource-item">
  <view class="title">标题</view>
  <view class="meta">信息</view>
</view>

<!-- 使用 Vant -->
<van-cell-group>
  <van-cell 
    title="中华人民共和国农村土地承包法" 
    label="2024-01-15"
    is-link
  />
</van-cell-group>
```

### 宫格导航
```xml
<!-- 原来的 -->
<view class="quick-entry">
  <view class="entry-item">...</view>
</view>

<!-- 使用 Vant -->
<van-grid column-num="4">
  <van-grid-item icon="balance-o" text="法律法规" />
  <van-grid-item icon="description" text="政策文件" />
  <van-grid-item icon="flower-o" text="农技手册" />
  <van-grid-item icon="records" text="乡土文献" />
</van-grid>
```

## 🎯 升级建议

### 优先升级的页面
1. **搜索页** - 使用 van-search
2. **列表页** - 使用 van-cell
3. **详情页** - 使用 van-card
4. **个人中心** - 使用 van-cell-group

### 保持原样的部分
- 轮播图（当前实现已经不错）
- 自定义的特殊布局

## 📚 学习资源

- **官方文档**：https://vant-contrib.gitee.io/vant-weapp/
- **示例代码**：查看文档中的每个组件示例
- **在线预览**：扫描文档中的二维码体验

## ⚠️ 常见问题

### Q1: 构建 npm 失败
**解决**：
1. 确保已经执行 `npm install`
2. 检查 project.config.json 中 `nodeModules` 是否为 `true`
3. 重启微信开发者工具

### Q2: 组件不显示
**解决**：
1. 检查是否构建了 npm
2. 检查组件路径是否正确
3. 查看控制台是否有报错

### Q3: 样式不对
**解决**：
1. Vant 组件有自己的样式，可能需要调整
2. 使用 custom-class 自定义样式
3. 参考官方文档的样式覆盖方法

## 🚀 下一步

安装完成后，我可以帮你：
1. 改造首页使用 Vant 组件
2. 改造搜索页
3. 改造列表页
4. 全面升级所有页面

你想从哪个页面开始？
