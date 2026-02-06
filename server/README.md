# 农智汇后端服务

## 环境要求

- Node.js >= 14.0.0
- MongoDB >= 4.4
- npm 或 yarn

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

复制 `.env.example` 文件为 `.env`，并修改配置：

```bash
cp .env.example .env
```

修改 `.env` 文件中的配置项：

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/nongzhihui
JWT_SECRET=your-secret-key
WECHAT_APPID=your-wechat-appid
WECHAT_SECRET=your-wechat-secret
```

### 3. 启动 MongoDB

确保 MongoDB 服务已启动：

```bash
# Windows
net start MongoDB

# macOS/Linux
sudo systemctl start mongod
```

### 4. 初始化数据

```bash
npm run init-data
```

### 5. 启动服务

开发模式（自动重启）：

```bash
npm run dev
```

生产模式：

```bash
npm start
```

服务将在 `http://localhost:3000` 启动。

## API 接口

### 资源相关

- `GET /api/resources` - 获取资源列表
- `GET /api/resources/hot` - 获取热门资源
- `GET /api/resources/latest` - 获取最新资源
- `GET /api/resources/:id` - 获取资源详情
- `GET /api/resources/:id/related` - 获取相关资源

### 搜索相关

- `GET /api/search` - 搜索资源
- `GET /api/search/hot` - 获取热门搜索

### 收藏相关

- `POST /api/collect/toggle` - 切换收藏状态
- `GET /api/collect/list` - 获取收藏列表

### 历史记录

- `POST /api/history/add` - 添加浏览历史
- `GET /api/history/list` - 获取浏览历史
- `DELETE /api/history/clear` - 清空浏览历史

### 反馈相关

- `POST /api/feedback/add` - 提交反馈
- `GET /api/feedback/list` - 获取反馈列表

### 用户相关

- `POST /api/users/login` - 用户登录
- `GET /api/users/info` - 获取用户信息

## 数据模型

### Resource（资源）

```javascript
{
  title: String,          // 标题
  summary: String,        // 摘要
  content: String,        // 内容
  category: String,       // 分类：law/policy/tech/culture
  source: String,         // 来源
  sourceUrl: String,      // 原文链接
  tags: [String],         // 标签
  attachments: [{         // 附件
    name: String,
    url: String,
    size: String
  }],
  publishTime: Date,      // 发布时间
  viewCount: Number,      // 浏览量
  collectCount: Number,   // 收藏量
  status: String          // 状态：draft/published/archived
}
```

### Favorite（收藏）

```javascript
{
  userId: String,         // 用户ID
  resourceId: ObjectId,   // 资源ID
  createdAt: Date,        // 创建时间
  updatedAt: Date         // 更新时间
}
```

### History（历史记录）

```javascript
{
  userId: String,         // 用户ID
  resourceId: ObjectId,   // 资源ID
  createdAt: Date,        // 创建时间
  updatedAt: Date         // 更新时间
}
```

### Feedback（反馈）

```javascript
{
  userId: String,         // 用户ID
  content: String,        // 反馈内容
  contact: String,        // 联系方式
  status: String,         // 状态：pending/processing/resolved
  reply: String,          // 回复内容
  createdAt: Date,        // 创建时间
  updatedAt: Date         // 更新时间
}
```

## 项目结构

```
server/
├── models/              # 数据模型
│   ├── Resource.js
│   ├── Favorite.js
│   ├── History.js
│   └── Feedback.js
├── routes/              # 路由
│   ├── resources.js
│   ├── search.js
│   ├── collect.js
│   ├── history.js
│   ├── feedback.js
│   └── users.js
├── scripts/             # 脚本
│   └── init-data.js
├── app.js               # 应用入口
├── package.json
└── .env                 # 环境配置
```

## 开发说明

### 添加新接口

1. 在 `models/` 目录创建数据模型
2. 在 `routes/` 目录创建路由文件
3. 在 `app.js` 中注册路由

### 数据库操作

使用 Mongoose 进行数据库操作，参考现有模型和路由。

### 错误处理

所有接口统一返回格式：

```javascript
{
  code: 0,              // 0表示成功，-1表示失败
  message: "提示信息",
  data: {}              // 返回数据
}
```

## 部署

详见 `docs/部署指南.md`

## 许可证

MIT
