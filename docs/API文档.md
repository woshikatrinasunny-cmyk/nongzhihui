# 农智汇 API 文档

## 基础信息

- **Base URL**: `http://localhost:3000/api`
- **响应格式**: JSON
- **字符编码**: UTF-8

## 通用响应格式

### 成功响应

```json
{
  "code": 0,
  "message": "成功",
  "data": {}
}
```

### 失败响应

```json
{
  "code": -1,
  "message": "错误信息",
  "error": "详细错误（仅开发环境）"
}
```

## 资源接口

### 1. 获取资源列表

**接口**: `GET /resources`

**参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| category | string | 否 | 分类：law/policy/tech/culture |
| page | number | 否 | 页码，默认1 |
| pageSize | number | 否 | 每页数量，默认20 |

**响应**:
```json
{
  "code": 0,
  "data": {
    "list": [
      {
        "_id": "资源ID",
        "title": "标题",
        "summary": "摘要",
        "category": "分类",
        "publishTime": "发布时间",
        "source": "来源"
      }
    ],
    "total": 100,
    "hasMore": true
  }
}
```

### 2. 获取热门资源

**接口**: `GET /resources/hot`

**参数**: 无

**响应**: 返回浏览量最高的10条资源

### 3. 获取最新资源

**接口**: `GET /resources/latest`

**参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| category | string | 否 | 分类筛选 |

**响应**: 返回最新发布的10条资源

### 4. 获取资源详情

**接口**: `GET /resources/:id`

**参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | string | 是 | 资源ID（支持数字ID和ObjectId） |

**响应**:
```json
{
  "code": 0,
  "data": {
    "_id": "资源ID",
    "title": "标题",
    "summary": "摘要",
    "content": "正文内容",
    "category": "分类",
    "source": "来源",
    "sourceUrl": "原文链接",
    "tags": ["标签1", "标签2"],
    "attachments": [
      {
        "name": "附件名称",
        "url": "下载链接",
        "size": "文件大小"
      }
    ],
    "publishTime": "发布时间",
    "viewCount": 100,
    "collectCount": 50
  }
}
```

### 5. 获取相关资源

**接口**: `GET /resources/:id/related`

**参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | string | 是 | 资源ID |

**响应**: 返回同分类的5条相关资源

## 搜索接口

### 1. 搜索资源

**接口**: `GET /search`

**参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| keyword | string | 是 | 搜索关键词 |
| category | string | 否 | 分类筛选 |
| source | string | 否 | 来源筛选 |
| startDate | string | 否 | 开始日期 YYYY-MM-DD |
| endDate | string | 否 | 结束日期 YYYY-MM-DD |
| sortBy | string | 否 | 排序：relevance/time/views/collects |
| page | number | 否 | 页码 |
| pageSize | number | 否 | 每页数量 |

**响应**:
```json
{
  "code": 0,
  "data": {
    "list": [...],
    "total": 50,
    "hasMore": true
  }
}
```

### 2. 获取热门搜索

**接口**: `GET /search/hot`

**参数**: 无

**响应**:
```json
{
  "code": 0,
  "data": [
    {
      "id": 1,
      "keyword": "农村土地承包法"
    }
  ]
}
```

## 收藏接口

### 1. 切换收藏状态

**接口**: `POST /collect/toggle`

**参数**:
```json
{
  "userId": "用户ID",
  "resourceId": "资源ID"
}
```

**响应**:
```json
{
  "code": 0,
  "message": "收藏成功",
  "data": {
    "isCollected": true
  }
}
```

### 2. 获取收藏列表

**接口**: `GET /collect/list`

**参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| userId | string | 是 | 用户ID |
| page | number | 否 | 页码 |
| pageSize | number | 否 | 每页数量 |

**响应**:
```json
{
  "code": 0,
  "data": {
    "list": [...],
    "total": 20,
    "hasMore": false
  }
}
```

## 历史记录接口

### 1. 添加浏览历史

**接口**: `POST /history/add`

**参数**:
```json
{
  "userId": "用户ID",
  "resourceId": "资源ID"
}
```

**响应**:
```json
{
  "code": 0,
  "message": "记录成功"
}
```

### 2. 获取浏览历史

**接口**: `GET /history/list`

**参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| userId | string | 是 | 用户ID |
| page | number | 否 | 页码 |
| pageSize | number | 否 | 每页数量 |

**响应**:
```json
{
  "code": 0,
  "data": {
    "list": [
      {
        "_id": "资源ID",
        "title": "标题",
        "viewTime": "浏览时间"
      }
    ],
    "total": 30,
    "hasMore": true
  }
}
```

### 3. 清空浏览历史

**接口**: `DELETE /history/clear`

**参数**:
```json
{
  "userId": "用户ID"
}
```

**响应**:
```json
{
  "code": 0,
  "message": "清空成功"
}
```

## 反馈接口

### 1. 提交反馈

**接口**: `POST /feedback/add`

**参数**:
```json
{
  "userId": "用户ID",
  "content": "反馈内容",
  "contact": "联系方式（可选）"
}
```

**响应**:
```json
{
  "code": 0,
  "message": "提交成功",
  "data": {
    "_id": "反馈ID",
    "status": "pending"
  }
}
```

### 2. 获取反馈列表

**接口**: `GET /feedback/list`

**参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| userId | string | 是 | 用户ID |
| page | number | 否 | 页码 |
| pageSize | number | 否 | 每页数量 |

**响应**:
```json
{
  "code": 0,
  "data": {
    "list": [
      {
        "_id": "反馈ID",
        "content": "反馈内容",
        "status": "pending",
        "createdAt": "提交时间"
      }
    ],
    "total": 5,
    "hasMore": false
  }
}
```

## 统计接口

### 1. 获取平台统计

**接口**: `GET /statistics/platform`

**参数**: 无

**响应**:
```json
{
  "code": 0,
  "data": {
    "totalResources": 100,
    "totalViews": 5000,
    "totalCollects": 800,
    "categoryStats": [
      {
        "_id": "law",
        "count": 30
      }
    ]
  }
}
```

### 2. 获取热门标签

**接口**: `GET /statistics/hot-tags`

**参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| limit | number | 否 | 返回数量，默认20 |

**响应**:
```json
{
  "code": 0,
  "data": [
    {
      "tag": "土地承包",
      "count": 15
    }
  ]
}
```

### 3. 获取用户统计

**接口**: `GET /statistics/user/:userId`

**参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| userId | string | 是 | 用户ID（路径参数） |

**响应**:
```json
{
  "code": 0,
  "data": {
    "collectCount": 10,
    "historyCount": 50
  }
}
```

### 4. 获取趋势数据

**接口**: `GET /statistics/trends`

**参数**: 无

**响应**:
```json
{
  "code": 0,
  "data": [
    {
      "_id": "2024-02-01",
      "count": 5
    }
  ]
}
```

## 用户接口

### 1. 用户登录

**接口**: `POST /users/login`

**参数**:
```json
{
  "code": "微信登录code"
}
```

**响应**:
```json
{
  "code": 0,
  "data": {
    "token": "JWT Token",
    "userInfo": {
      "openid": "用户OpenID"
    }
  }
}
```

### 2. 获取用户信息

**接口**: `GET /users/info`

**请求头**:
```
Authorization: Bearer <token>
```

**响应**:
```json
{
  "code": 0,
  "data": {
    "openid": "用户OpenID",
    "nickName": "昵称",
    "avatarUrl": "头像URL"
  }
}
```

## 错误码说明

| 错误码 | 说明 |
|--------|------|
| 0 | 成功 |
| -1 | 通用错误 |
| 400 | 参数错误 |
| 404 | 资源不存在 |
| 500 | 服务器错误 |

## 注意事项

1. **分类枚举值**:
   - `law`: 法律法规
   - `policy`: 政策文件
   - `tech`: 农技手册
   - `culture`: 乡土文献

2. **排序方式**:
   - `relevance`: 相关度（默认）
   - `time`: 时间
   - `views`: 浏览量
   - `collects`: 收藏量

3. **日期格式**: 统一使用 ISO 8601 格式（YYYY-MM-DD）

4. **分页**: 默认每页20条，最大100条

5. **ID兼容**: 资源ID支持数字ID和MongoDB ObjectId

## 测试示例

### 使用 curl 测试

```bash
# 获取热门资源
curl http://localhost:3000/api/resources/hot

# 搜索资源
curl "http://localhost:3000/api/search?keyword=土地&category=law"

# 收藏资源
curl -X POST http://localhost:3000/api/collect/toggle \
  -H "Content-Type: application/json" \
  -d '{"userId":"test_user","resourceId":"1"}'
```

### 使用 Postman

1. 导入 API 集合
2. 设置环境变量 `baseUrl = http://localhost:3000/api`
3. 运行测试用例

## 更新日志

### v1.0.0 (2024-02-06)
- 初始版本发布
- 实现所有核心接口
- 支持搜索、收藏、历史、反馈功能
- 添加统计接口
