# Vercel 部署指南

## 🚀 为什么使用Vercel？

EdgeOne不支持Serverless Functions（后端API），所以我们改用Vercel：
- ✅ 免费
- ✅ 支持Serverless Functions
- ✅ 自动从GitHub部署
- ✅ 配置简单
- ✅ 全球CDN加速

## 📋 部署步骤

### 第1步：注册Vercel账号

1. 访问 https://vercel.com
2. 点击 "Sign Up"
3. 选择 "Continue with GitHub"（用GitHub账号登录）
4. 授权Vercel访问你的GitHub

### 第2步：导入项目

1. 登录后，点击 "Add New..." → "Project"
2. 找到你的仓库 `tangzongzi/renhongshu`
3. 点击 "Import"

### 第3步：配置项目

在配置页面：

**Framework Preset**: 选择 `Vite`

**Build Command**: 
```
npm run build
```

**Output Directory**: 
```
dist
```

**Install Command**: 
```
npm install
```

### 第4步：配置环境变量

在 "Environment Variables" 部分添加：

```
变量名: ZHIPU_API_KEY
变量值: 5da539c561a24becb4d557372f20b7b9.xhDQrrOzEiXYlxQA
```

⚠️ **重要**：
- 变量名是 `ZHIPU_API_KEY`（不带VITE_前缀）
- 这是给后端API用的

### 第5步：部署

1. 点击 "Deploy" 按钮
2. 等待部署完成（约1-2分钟）
3. 部署成功后会显示你的网站地址

## 🔧 部署后配置

### 查看部署状态

1. 进入项目Dashboard
2. 查看 "Deployments" 标签
3. 最新的部署应该显示 "Ready"

### 查看Functions日志

1. 进入项目Dashboard
2. 点击 "Functions" 标签
3. 可以看到所有API Functions的状态和日志

### 测试API

部署成功后，在浏览器控制台测试：

```javascript
// 替换为你的Vercel域名
fetch('https://你的域名.vercel.app/api/test')
  .then(r => r.json())
  .then(data => console.log('✅ API正常:', data))
```

## 📝 Vercel配置文件说明

项目中的 `vercel.json` 文件配置了：

```json
{
  "functions": {
    "api/**/*.ts": {
      "runtime": "nodejs18.x",
      "memory": 1024,
      "maxDuration": 30
    }
  }
}
```

- `runtime`: Node.js 18
- `memory`: 1GB内存
- `maxDuration`: 30秒超时

## 🔄 自动部署

配置完成后，每次推送到GitHub的main分支，Vercel会自动：
1. 拉取最新代码
2. 安装依赖
3. 构建项目
4. 部署到生产环境

## 🌐 自定义域名（可选）

如果你有自己的域名：

1. 进入项目Dashboard
2. 点击 "Settings" → "Domains"
3. 添加你的域名
4. 按照提示配置DNS

## ⚠️ 常见问题

### Q: 部署失败怎么办？
A: 查看部署日志，通常是：
- 依赖安装失败
- 构建命令错误
- TypeScript编译错误

### Q: API返回404？
A: 检查：
- `vercel.json` 配置是否正确
- API文件是否在 `api/` 目录下
- 文件名是否正确（`.ts`后缀）

### Q: 环境变量不生效？
A: 
- 确认变量名正确（`ZHIPU_API_KEY`）
- 重新部署项目（环境变量修改后需要重新部署）

### Q: 超时错误？
A: 
- Vercel免费版Functions最长执行30秒
- 如果小红书响应慢，可能会超时
- 已在配置中设置 `maxDuration: 30`

## 🎉 部署完成

部署成功后：
1. 你会得到一个 `.vercel.app` 域名
2. 所有API都可以正常工作
3. 每次推送GitHub会自动部署

## 📞 需要帮助？

如果遇到问题：
1. 查看Vercel的部署日志
2. 查看Functions日志
3. 在浏览器控制台查看错误信息
