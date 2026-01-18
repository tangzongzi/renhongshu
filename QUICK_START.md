# ⚡ 快速开始指南

## 🚀 5分钟上手

### 1. 克隆项目

```bash
git clone <your-repo-url>
cd xiaohongshu-auto-publisher
```

### 2. 安装依赖

```bash
npm install
```

### 3. 启动开发服务器

```bash
npm run dev
```

### 4. 打开浏览器

访问 http://localhost:5173

---

## 🎯 基本使用

### 步骤1：输入链接
粘贴小红书帖子链接，例如：
```
https://www.xiaohongshu.com/explore/123456
```

### 步骤2：查看内容
系统自动抓取标题、文案和图片

### 步骤3：AI改写
点击"使用AI改写"按钮，自动生成新内容

### 步骤4：发布
按照指引下载图片、复制文案，打开小红书APP发布

---

## 🔧 配置真实API（可选）

### 1. 申请智谱AI API Key

访问 https://open.bigmodel.cn/ 注册并获取免费API Key

### 2. 创建 .env 文件

```bash
cp .env.example .env
```

### 3. 配置环境变量

编辑 `.env`：
```env
VITE_USE_REAL_API=true
VITE_ZHIPU_API_KEY=your_api_key_here
```

### 4. 重启服务器

```bash
# Ctrl+C 停止
npm run dev
```

---

## 📦 部署到生产环境

### 方式一：EdgeOne CLI（推荐）

```bash
# 安装CLI
npm install -g @edgeone/cli

# 登录
edgeone login

# 部署
npm run build
edgeone deploy
```

### 方式二：手动部署

1. 构建项目：`npm run build`
2. 上传 `dist` 目录到EdgeOne
3. 配置环境变量
4. 完成！

---

## 💡 常用命令

```bash
# 开发
npm run dev          # 启动开发服务器
npm run build        # 构建生产版本
npm run preview      # 预览生产构建

# 部署
edgeone deploy       # 部署到EdgeOne
edgeone logs         # 查看日志
```

---

## 🐛 遇到问题？

### 链接解析失败
- 检查链接格式是否正确
- 支持的格式：标准链接、分享链接、短链接

### 内容抓取失败
- 默认使用mock数据，无需担心
- 如需真实抓取，配置真实API

### AI改写失败
- 检查API Key是否正确
- 确认网络连接正常
- 系统会自动使用降级方案

---

## 📚 更多文档

- [完整README](./README.md)
- [部署指南](./DEPLOYMENT.md)
- [API集成](./API_INTEGRATION.md)
- [项目总结](./FINAL_SUMMARY.md)

---

## 🎉 开始使用

```bash
npm install && npm run dev
```

就这么简单！🚀
