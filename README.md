# 小红书自动发布工具

一个基于React + TypeScript + 智谱AI的小红书内容自动发布工具。

## 功能特点

- ✅ 链接解析（支持3种小红书链接格式）
- ✅ 内容抓取（自动获取标题、文案、图片）
- ✅ AI改写（智谱AI GLM-4-Flash智能改写）
- ✅ 内容验证（敏感词检测、长度检查）
- ✅ 图片处理（批量下载）
- ✅ APP唤起（跨平台支持）
- ✅ 历史记录（本地持久化）
- ✅ 响应式设计（完美适配手机/平板/桌面）

## 技术栈

- **前端**: React 18 + TypeScript + Vite + Tailwind CSS
- **状态管理**: Zustand
- **AI服务**: 智谱AI GLM-4-Flash
- **部署**: 腾讯EdgeOne

## 快速开始

### 本地开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 访问
http://localhost:5173
```

### 构建生产版本

```bash
npm run build
```

## 项目结构

```
├── api/                    # EdgeOne Functions后端API
│   ├── parse-link.ts      # 链接解析
│   ├── scrape-content.ts  # 内容抓取
│   └── rewrite.ts         # AI改写
├── src/
│   ├── components/        # React组件
│   ├── services/          # 业务服务
│   ├── store/            # 状态管理
│   └── utils/            # 工具函数
├── edgeone.json          # EdgeOne配置
└── package.json          # 项目配置
```

## 环境变量

创建 `.env` 文件：

```env
VITE_ZHIPU_API_KEY=your_api_key_here
VITE_USE_REAL_API=true
VITE_API_BASE_URL=/api
```

## 部署

本项目配置了腾讯EdgeOne自动部署，推送到GitHub后会自动部署。

## License

MIT
