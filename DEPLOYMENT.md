# 部署指南

## 📋 部署前准备

### 1. 申请智谱AI API Key（免费）

1. 访问 [智谱AI开放平台](https://open.bigmodel.cn/)
2. 注册并登录账号
3. 进入控制台，创建API Key
4. 复制API Key备用

**免费额度：**
- GLM-4-Flash 模型完全免费
- 每分钟60次请求
- 足够个人使用

### 2. 准备EdgeOne账号

1. 访问 [腾讯云EdgeOne](https://cloud.tencent.com/product/teo)
2. 注册并实名认证
3. 开通EdgeOne服务

**免费额度：**
- EdgeOne Pages: 免费托管静态网站
- EdgeOne Functions: 每月100万次免费调用
- EdgeOne KV: 1GB免费存储

---

## 🚀 部署步骤

### 方式一：使用EdgeOne CLI（推荐）

#### 1. 安装EdgeOne CLI

```bash
npm install -g @edgeone/cli
```

#### 2. 登录EdgeOne

```bash
edgeone login
```

#### 3. 初始化项目

```bash
edgeone init
```

按提示选择：
- 项目类型：Static Site + Functions
- 框架：Vite + React
- 构建命令：npm run build
- 输出目录：dist

#### 4. 配置环境变量

在EdgeOne控制台配置环境变量：

```
ZHIPU_API_KEY=你的智谱AI_API_Key
```

#### 5. 部署

```bash
# 构建项目
npm run build

# 部署到EdgeOne
edgeone deploy
```

#### 6. 配置域名（可选）

在EdgeOne控制台绑定自定义域名。

---

### 方式二：手动部署

#### 1. 构建项目

```bash
npm run build
```

#### 2. 上传到EdgeOne

1. 登录EdgeOne控制台
2. 创建新站点
3. 上传 `dist` 目录
4. 上传 `api` 目录到Functions

#### 3. 配置路由规则

在EdgeOne控制台配置：

```json
{
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/api/$1"
    },
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ]
}
```

#### 4. 配置环境变量

在Functions设置中添加：

```
ZHIPU_API_KEY=你的智谱AI_API_Key
```

---

## 🔧 本地开发配置

### 1. 创建 .env 文件

```bash
cp .env.example .env
```

### 2. 配置环境变量

编辑 `.env` 文件：

```env
# 启用真实API（可选，默认使用mock数据）
VITE_USE_REAL_API=false

# 智谱AI API Key（如果启用真实API）
VITE_ZHIPU_API_KEY=your_api_key_here

# API基础URL
VITE_API_BASE_URL=http://localhost:5173/api
```

### 3. 启动开发服务器

```bash
npm run dev
```

### 4. 测试API（可选）

如果要测试真实API，需要：

1. 设置 `VITE_USE_REAL_API=true`
2. 配置 `VITE_ZHIPU_API_KEY`
3. 重启开发服务器

---

## 📝 环境变量说明

### 前端环境变量

| 变量名 | 说明 | 默认值 | 必需 |
|--------|------|--------|------|
| `VITE_USE_REAL_API` | 是否使用真实API | `false` | 否 |
| `VITE_ZHIPU_API_KEY` | 智谱AI API Key | - | 否* |
| `VITE_API_BASE_URL` | API基础URL | `/api` | 否 |

*注：仅在 `VITE_USE_REAL_API=true` 时需要

### 后端环境变量

| 变量名 | 说明 | 必需 |
|--------|------|------|
| `ZHIPU_API_KEY` | 智谱AI API Key | 是 |

---

## 🧪 测试部署

### 1. 测试链接解析API

```bash
curl -X POST https://your-domain.com/api/parse-link \
  -H "Content-Type: application/json" \
  -d '{"url":"https://www.xiaohongshu.com/explore/123456"}'
```

### 2. 测试内容抓取API

```bash
curl -X POST https://your-domain.com/api/scrape-content \
  -H "Content-Type: application/json" \
  -d '{"postId":"123456"}'
```

### 3. 测试AI改写API

```bash
curl -X POST https://your-domain.com/api/rewrite \
  -H "Content-Type: application/json" \
  -d '{"title":"测试标题","content":"测试内容"}'
```

---

## 🔍 故障排查

### API调用失败

**问题：** API返回404错误

**解决方案：**
1. 检查路由配置是否正确
2. 确认Functions已正确部署
3. 查看EdgeOne控制台日志

### 智谱AI调用失败

**问题：** AI改写返回错误

**解决方案：**
1. 检查API Key是否正确配置
2. 确认API Key有效且未过期
3. 检查是否超出免费额度
4. 查看后端日志

### 内容抓取失败

**问题：** 无法抓取小红书内容

**解决方案：**
1. 小红书可能有反爬虫机制
2. 尝试更新User-Agent
3. 考虑使用代理IP
4. 降级使用mock数据

---

## 📊 监控和日志

### 查看EdgeOne日志

1. 登录EdgeOne控制台
2. 进入Functions管理
3. 查看实时日志

### 查看前端日志

在浏览器控制台执行：

```javascript
// 查看最近10条日志
Logger.getRecentLogs(10)

// 导出所有日志
Logger.exportLogs()
```

---

## 💰 成本估算

### 免费额度

- **EdgeOne Pages**: 免费托管
- **EdgeOne Functions**: 100万次/月免费
- **EdgeOne KV**: 1GB免费存储
- **智谱AI**: GLM-4-Flash完全免费

### 超出免费额度后

- **EdgeOne Functions**: ¥0.0000167/次（约¥16.7/百万次）
- **EdgeOne KV**: ¥0.5/GB/月

**预估：** 个人使用完全免费，小团队使用每月成本 < ¥10

---

## 🔐 安全建议

1. **API Key保护**
   - 不要将API Key提交到Git
   - 使用环境变量管理敏感信息
   - 定期轮换API Key

2. **访问控制**
   - 配置CORS限制
   - 添加请求频率限制
   - 启用HTTPS

3. **数据安全**
   - 不存储用户敏感信息
   - 定期清理历史记录
   - 遵守小红书平台规则

---

## 📚 相关链接

- [智谱AI文档](https://open.bigmodel.cn/dev/api)
- [EdgeOne文档](https://cloud.tencent.com/document/product/1552)
- [项目GitHub](https://github.com/your-repo)

---

**更新时间：** 2025-01-18  
**版本：** 1.0.0
