# 🚀 腾讯EdgeOne部署指南

## 📦 需要上传的文件

### 必需文件（核心代码）
```
✅ 前端代码
├── dist/                    # 构建后的前端文件（运行 npm run build 生成）
├── src/                     # 源代码（如果需要）
├── index.html              # 入口HTML
├── package.json            # 依赖配置
├── package-lock.json       # 锁定依赖版本
├── vite.config.ts          # Vite配置
├── tsconfig.json           # TypeScript配置
├── tailwind.config.js      # Tailwind配置
└── postcss.config.js       # PostCSS配置

✅ 后端API
├── api/                    # EdgeOne Functions
│   ├── parse-link.ts      # 链接解析API
│   ├── scrape-content.ts  # 内容抓取API
│   └── rewrite.ts         # AI改写API

✅ 配置文件
├── edgeone.json           # EdgeOne部署配置
└── .env                   # 环境变量（包含智谱AI Key）
```

### 不需要上传的文件（会被删除）
```
❌ 文档文件
├── *.md                   # 所有Markdown文档
├── .kiro/                 # Kiro配置目录
└── test-zhipu-api.js     # 测试脚本

❌ 测试文件
├── jest.config.js        # Jest配置
├── **/__tests__/         # 测试目录
└── **/*.test.ts          # 测试文件

❌ 开发文件
└── node_modules/         # 依赖包（会重新安装）
```

---

## 🔧 部署步骤

### 步骤1：清理项目
```bash
# 我会帮你删除所有不需要的文件
```

### 步骤2：构建生产版本
```bash
npm run build
```

### 步骤3：配置EdgeOne

#### 3.1 登录腾讯云EdgeOne控制台
```
https://console.cloud.tencent.com/edgeone
```

#### 3.2 创建站点
1. 点击"创建站点"
2. 输入你的域名（或使用EdgeOne提供的测试域名）
3. 选择套餐（免费版即可）

#### 3.3 配置EdgeOne Functions

**方式A：使用EdgeOne CLI（推荐）**
```bash
# 1. 安装EdgeOne CLI
npm install -g @tencent/edgeone-cli

# 2. 登录
edgeone login

# 3. 初始化项目
edgeone init

# 4. 部署
edgeone deploy
```

**方式B：手动上传**
1. 在EdgeOne控制台选择"边缘函数"
2. 创建新函数
3. 上传 `api/` 目录下的文件
4. 配置路由规则

### 步骤4：配置环境变量

在EdgeOne控制台配置以下环境变量：
```
VITE_ZHIPU_API_KEY=5da539c561a24becb4d557372f20b7b9.xhDQrrOzEiXYlxQA
VITE_USE_REAL_API=true
VITE_API_BASE_URL=/api
```

### 步骤5：配置路由

在 `edgeone.json` 中已配置：
```json
{
  "routes": [
    {
      "path": "/api/parse-link",
      "function": "parse-link"
    },
    {
      "path": "/api/scrape-content",
      "function": "scrape-content"
    },
    {
      "path": "/api/rewrite",
      "function": "rewrite"
    }
  ]
}
```

### 步骤6：上传静态文件

**方式A：使用EdgeOne CLI**
```bash
edgeone deploy --static dist/
```

**方式B：手动上传**
1. 在EdgeOne控制台选择"静态资源"
2. 上传 `dist/` 目录下的所有文件

### 步骤7：测试部署

访问你的EdgeOne域名：
```
https://your-domain.edgeone.app
```

测试功能：
- ✅ 输入小红书链接
- ✅ 查看内容抓取
- ✅ 测试AI改写
- ✅ 测试图片下载

---

## 📋 部署检查清单

### 部署前
- [ ] 运行 `npm run build` 成功
- [ ] 检查 `dist/` 目录已生成
- [ ] 确认 `.env` 文件包含智谱AI Key
- [ ] 确认 `edgeone.json` 配置正确

### 部署中
- [ ] EdgeOne CLI 已安装
- [ ] 已登录EdgeOne账号
- [ ] 静态文件已上传
- [ ] API函数已部署
- [ ] 环境变量已配置
- [ ] 路由规则已配置

### 部署后
- [ ] 访问域名正常
- [ ] 链接解析功能正常
- [ ] 内容抓取功能正常
- [ ] AI改写功能正常
- [ ] 图片下载功能正常
- [ ] 历史记录功能正常

---

## 🔑 重要配置

### edgeone.json
```json
{
  "name": "xiaohongshu-auto-publisher",
  "version": "1.0.0",
  "routes": [
    {
      "path": "/api/parse-link",
      "function": "parse-link",
      "methods": ["POST"]
    },
    {
      "path": "/api/scrape-content",
      "function": "scrape-content",
      "methods": ["POST"]
    },
    {
      "path": "/api/rewrite",
      "function": "rewrite",
      "methods": ["POST"]
    }
  ],
  "functions": {
    "parse-link": {
      "handler": "api/parse-link.ts",
      "runtime": "nodejs18"
    },
    "scrape-content": {
      "handler": "api/scrape-content.ts",
      "runtime": "nodejs18"
    },
    "rewrite": {
      "handler": "api/rewrite.ts",
      "runtime": "nodejs18"
    }
  },
  "env": {
    "VITE_ZHIPU_API_KEY": "${VITE_ZHIPU_API_KEY}",
    "VITE_USE_REAL_API": "true",
    "VITE_API_BASE_URL": "/api"
  }
}
```

---

## 🐛 常见问题

### 1. 部署失败
```bash
# 检查EdgeOne CLI版本
edgeone --version

# 重新登录
edgeone logout
edgeone login

# 清除缓存重新部署
edgeone deploy --force
```

### 2. API调用失败
- 检查环境变量是否配置正确
- 检查路由规则是否生效
- 查看EdgeOne控制台的函数日志

### 3. 静态资源404
- 确认 `dist/` 目录已上传
- 检查路由配置
- 清除CDN缓存

### 4. CORS错误
在API函数中已配置CORS：
```typescript
headers: {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}
```

---

## 📞 获取帮助

### EdgeOne文档
- 官方文档: https://cloud.tencent.com/document/product/1552
- API文档: https://cloud.tencent.com/document/api/1552
- 控制台: https://console.cloud.tencent.com/edgeone

### 智谱AI文档
- 官方文档: https://open.bigmodel.cn/dev/api
- API Key管理: https://open.bigmodel.cn/usercenter/apikeys

---

## 🎯 部署后优化

### 性能优化
- [ ] 启用CDN加速
- [ ] 配置缓存策略
- [ ] 压缩静态资源
- [ ] 启用HTTP/2

### 安全优化
- [ ] 配置HTTPS
- [ ] 设置访问限制
- [ ] 添加API限流
- [ ] 配置防火墙规则

### 监控优化
- [ ] 配置日志收集
- [ ] 设置告警规则
- [ ] 监控API调用量
- [ ] 监控错误率

---

**准备好了吗？让我们开始部署！** 🚀
