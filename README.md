# 小红书自动发布工具

基于 EdgeOne 的免费部署方案，使用 React + TypeScript + Tailwind CSS 构建。

## 🚀 快速开始

### 开发环境

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 访问 http://localhost:5173
```

### 构建生产版本

```bash
npm run build
```

## ✨ 功能特性

- ✅ 链接解析：支持标准链接、分享链接、短链接
- ✅ 内容抓取：自动提取标题、文案、图片
- ✅ AI 改写：使用智谱 AI GLM-4-Flash 进行内容改写
- ✅ 标签生成：AI 自动生成相关标签
- ✅ 一键发布：图片下载、文案复制、APP 唤起
- ✅ 响应式设计：完美适配移动端和桌面端

## 📁 项目结构

```
xiaohongshu-auto-publisher/
├── src/
│   ├── components/          # React 组件
│   │   ├── LinkInput.tsx    # 链接输入组件
│   │   ├── ContentPreview.tsx  # 内容预览组件
│   │   ├── PublishGuide.tsx    # 发布指引组件
│   │   ├── PublishButton.tsx   # 发布按钮组件
│   │   └── HistoryPage.tsx     # 历史记录组件
│   ├── services/            # 核心服务
│   │   ├── LinkParser.ts    # 链接解析服务
│   │   ├── ContentScraper.ts   # 内容抓取服务
│   │   └── AIRewriter.ts    # AI 改写服务
│   ├── store/               # 状态管理
│   │   ├── useContentStore.ts  # 内容状态
│   │   └── useHistoryStore.ts  # 历史记录状态
│   ├── App.tsx              # 主应用组件
│   ├── main.tsx             # 应用入口
│   └── index.css            # 全局样式
├── .kiro/
│   ├── specs/               # 项目规格文档
│   │   └── xiaohongshu-auto-publisher/
│   │       ├── requirements.md  # 需求文档
│   │       ├── design.md        # 设计文档
│   │       ├── tasks.md         # 任务列表
│   │       └── ui-prototype.md  # UI 原型
│   └── settings/
│       └── mcp.json         # MCP 配置
├── package.json
├── vite.config.ts
├── tailwind.config.js
└── tsconfig.json
```

## 🎨 技术栈

- **前端框架**: React 18 + TypeScript
- **样式方案**: Tailwind CSS
- **构建工具**: Vite
- **AI 服务**: 智谱 AI GLM-4-Flash（免费）
- **部署平台**: 腾讯云 EdgeOne（免费）

## 📝 开发进度

### 已完成

- [x] 项目初始化和基础架构搭建
- [x] LinkParser 服务（链接解析）
- [x] ContentScraper 服务（内容抓取 - 使用 mock 数据）
- [x] AIRewriter 服务（AI 改写 - 使用 mock 数据）
- [x] LinkInput 组件（链接输入）
- [x] ContentPreview 组件（内容预览和编辑）
- [x] PublishGuide 组件（发布指引）
- [x] HistoryPage 组件（历史记录）
- [x] 状态管理（Zustand + persist）
- [x] 草稿自动保存功能
- [x] 历史记录管理
- [x] 响应式布局设计
- [x] 完整用户流程
- [x] 错误处理系统（统一错误分类和处理）
- [x] 日志记录系统（操作追踪和日志导出）
- [x] React 错误边界（全局错误捕获）

### 进行中

- [ ] 响应式布局优化（移动端测试）
- [ ] EdgeOne Node Functions API 实现
- [ ] 图片处理服务

### 待开发

- [ ] 真实内容抓取（需要后端 API）
- [ ] 智谱 AI 集成（需要 API Key）
- [ ] 属性测试（Property-Based Testing）
- [ ] EdgeOne KV 存储集成
- [ ] 部署配置和文档

## 🔧 配置说明

### 妙多 MCP 配置

项目已配置妙多 MCP 服务器，用于从妙多设计稿获取 UI 数据。

配置文件位置：`.kiro/settings/mcp.json`

```json
{
  "mcpServers": {
    "miaoduo": {
      "command": "npx",
      "args": ["@miaoduo/mcp-server"],
      "disabled": false,
      "autoApprove": []
    }
  }
}
```

### 环境变量

创建 `.env` 文件并配置以下变量：

```env
# 智谱 AI API Key（可选，开发阶段使用模拟数据）
VITE_ZHIPU_API_KEY=your_api_key_here

# EdgeOne 配置（部署时需要）
EDGEONE_PROJECT_ID=your_project_id
EDGEONE_API_KEY=your_api_key
```

## 🎯 使用流程

1. **输入链接** - 粘贴小红书帖子链接
2. **内容预览** - 查看抓取的原始内容
3. **AI 改写** - 使用 AI 改写标题和文案
4. **编辑确认** - 编辑改写后的内容
5. **发布指引** - 下载图片、复制文案
6. **打开小红书** - 一键打开小红书 APP 发布

## 📱 支持的链接格式

- 标准链接：`https://www.xiaohongshu.com/explore/[postId]`
- 分享链接：`https://www.xiaohongshu.com/discovery/item/[postId]`
- 短链接：`https://xhslink.com/[code]`

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License

## 🔗 相关链接

- [智谱 AI 文档](https://open.bigmodel.cn/)
- [腾讯云 EdgeOne](https://cloud.tencent.com/product/teo)
- [妙多 MCP 文档](https://miaoduo.com/help/docs/sections/358051479306243)
