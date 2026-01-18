# EdgeOne 问题诊断指南

## 🔍 问题：无法读取网页数据和图片

### 可能的原因

1. **EdgeOne API Functions未部署成功**
   - 检查EdgeOne控制台的部署状态
   - 查看部署日志是否有错误

2. **小红书反爬虫机制**
   - 小红书有强大的反爬虫系统
   - 直接抓取HTML可能被拦截
   - 需要Cookie、特殊Header或使用官方API

3. **环境变量未配置**
   - `ZHIPU_API_KEY` 未在EdgeOne中配置
   - 变量名错误（应该是 `ZHIPU_API_KEY` 不是 `VITE_ZHIPU_API_KEY`）

4. **路由配置问题**
   - `/api/*` 路由未正确映射到Functions
   - CORS配置问题

## 🧪 诊断步骤

### 步骤1：测试EdgeOne Functions是否工作

在浏览器控制台运行：

```javascript
// 测试基础API
fetch('/api/test')
  .then(r => r.json())
  .then(data => {
    console.log('✅ EdgeOne Functions工作正常:', data)
    console.log('环境变量配置:', data.environment)
  })
  .catch(err => console.error('❌ EdgeOne Functions不工作:', err))
```

**预期结果**：
```json
{
  "success": true,
  "message": "EdgeOne Functions 工作正常！",
  "environment": {
    "hasZhipuKey": true,
    "zhipuKeyLength": 48
  }
}
```

如果失败，说明EdgeOne Functions未部署成功。

### 步骤2：测试内容抓取API

```javascript
// 测试内容抓取（使用真实的小红书postId）
fetch('/api/scrape-content', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ postId: '你的小红书postId' })
})
.then(r => r.json())
.then(data => {
  if (data.success) {
    console.log('✅ 内容抓取成功:', data.data)
  } else {
    console.error('❌ 内容抓取失败:', data.error)
    console.log('TrackingId:', data.trackingId)
  }
})
```

### 步骤3：查看EdgeOne日志

1. 登录EdgeOne控制台
2. 进入你的项目
3. 查看 "Functions" → "日志"
4. 搜索 trackingId 查看详细错误

## 🔧 解决方案

### 方案1：检查EdgeOne配置（最优先）

1. **确认API Functions已部署**
   - EdgeOne控制台 → Functions
   - 确认 `api/scrape-content.ts` 状态为"运行中"
   - 确认 `api/rewrite.ts` 状态为"运行中"
   - 确认 `api/test.ts` 状态为"运行中"

2. **确认环境变量**
   - EdgeOne控制台 → 环境变量
   - 添加：`ZHIPU_API_KEY = 5da539c561a24becb4d557372f20b7b9.xhDQrrOzEiXYlxQA`
   - 注意：变量名不要带 `VITE_` 前缀

3. **确认路由配置**
   - 检查 `edgeone.json` 中的路由规则
   - 确认 `/api/*` 正确映射到Functions

### 方案2：小红书反爬虫问题

如果EdgeOne配置正确但仍然无法抓取，可能是小红书反爬虫：

**临时解决方案**：
1. 使用小红书官方API（需要申请）
2. 使用第三方爬虫服务
3. 手动输入内容（绕过抓取）

**长期解决方案**：
1. 研究小红书最新的反爬虫机制
2. 使用浏览器自动化工具（Puppeteer/Playwright）
3. 使用代理IP池
4. 申请小红书官方API权限

### 方案3：修改为手动输入模式

如果抓取确实无法实现，可以改为手动输入：

1. 用户手动复制小红书内容
2. 粘贴到应用中
3. 只使用AI改写功能
4. 图片手动下载

## 📋 EdgeOne控制台检查清单

- [ ] 项目已创建并绑定GitHub仓库
- [ ] 自动部署已启用
- [ ] 最新代码已部署成功
- [ ] Functions状态显示"运行中"
- [ ] 环境变量 `ZHIPU_API_KEY` 已配置
- [ ] 路由规则已生效
- [ ] 部署日志无错误
- [ ] 可以访问 `/api/test` 端点

## 🚨 常见错误

### 错误1：404 Not Found
**原因**：路由未配置或Functions未部署
**解决**：检查 `edgeone.json` 和Functions部署状态

### 错误2：500 Internal Server Error
**原因**：Functions代码错误或环境变量缺失
**解决**：查看EdgeOne日志，检查环境变量

### 错误3：CORS错误
**原因**：CORS头未正确配置
**解决**：检查API返回的CORS头

### 错误4：小红书反爬虫拦截
**原因**：小红书检测到爬虫行为
**解决**：使用官方API或其他方案

## 💡 下一步

1. **先运行测试API**：确认EdgeOne Functions基础功能正常
2. **查看EdgeOne日志**：找到具体的错误信息
3. **根据错误类型**：选择对应的解决方案
4. **如果是反爬虫问题**：考虑使用官方API或手动输入方案

## 📞 需要提供的信息

如果问题仍未解决，请提供：
1. `/api/test` 的返回结果
2. EdgeOne控制台的部署日志
3. 浏览器控制台的错误信息
4. EdgeOne Functions的运行日志
5. 具体的错误信息和trackingId
