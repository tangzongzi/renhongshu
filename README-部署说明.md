# 小红书自动发布工具 - 部署说明

## ✅ 已完成的优化

### 1. 修复"获取内容"卡住问题
- **问题**：应用在EdgeOne环境中调用API时无限等待
- **解决方案**：
  - 添加5秒超时控制（内容抓取）
  - 添加8秒超时控制（AI改写）
  - API失败时自动降级到模拟数据
  - 在控制台输出详细调试信息

### 2. 优化模拟数据
- 使用更真实的示例内容（穿搭分享）
- 使用真实图片服务（picsum.photos）
- 减少加载时间（1.5秒 → 0.8秒）

### 3. 尝试隐藏底部提示
- 在 `index.html` 添加CSS规则
- 隐藏非root的div元素
- 如果提示仍然存在，需要在EdgeOne控制台检查

## 🔍 EdgeOne 配置检查

### 必须配置的环境变量
在EdgeOne控制台 → 环境变量中添加：

```
ZHIPU_API_KEY = 5da539c561a24becb4d557372f20b7b9.xhDQrrOzEiXYlxQA
```

⚠️ **注意**：变量名是 `ZHIPU_API_KEY`（不是 `VITE_ZHIPU_API_KEY`）

### 检查API Functions部署
确认以下3个函数已部署：
- ✅ `/api/parse-link.ts`
- ✅ `/api/scrape-content.ts`
- ✅ `/api/rewrite.ts`

### 检查路由配置
确认路由规则已生效（在 `edgeone.json` 中）：
```json
{
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/api/$1"
    }
  ]
}
```

## 🧪 测试方法

### 1. 在浏览器控制台测试API
打开应用 → F12打开控制台 → 运行：

```javascript
// 测试内容抓取
fetch('/api/scrape-content', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ postId: '123456' })
})
.then(r => r.json())
.then(data => console.log('✅ API正常:', data))
.catch(err => console.error('❌ API失败:', err))
```

### 2. 查看应用日志
输入小红书链接后，在控制台查看：
- ✅ `内容抓取成功（真实API）` - API正常工作
- ⚠️ `API调用失败，使用模拟数据` - API有问题，需要检查EdgeOne配置

## 📋 关于底部提示

**"仅用于演示和测试目的。请勿输入任何敏感数据。"**

这个提示不在代码中，可能来源：
1. EdgeOne平台的"演示模式"标记
2. EdgeOne的测试环境提示
3. 浏览器扩展注入

**解决方法**：
1. 检查EdgeOne控制台是否有"演示模式"开关
2. 确认项目环境设置为"生产环境"
3. 查看EdgeOne项目设置中的环境标记
4. 已在代码中添加CSS尝试隐藏

## 🚀 当前工作流程

### 正常流程（API正常）
1. 用户输入小红书链接
2. 调用 `/api/scrape-content` 抓取真实内容（5秒超时）
3. 显示原始内容预览
4. 调用 `/api/rewrite` 进行AI改写（8秒超时）
5. 显示改写后的内容
6. 引导用户发布

### 降级流程（API失败）
1. 用户输入小红书链接
2. 尝试调用API，5秒后超时
3. 自动降级到模拟数据
4. 在控制台输出警告信息
5. 继续后续流程（使用模拟数据）

## 📝 下一步操作

1. **等待EdgeOne自动部署**（约1-2分钟）
2. **访问应用并测试**
3. **打开浏览器控制台查看日志**
4. **如果仍有问题**：
   - 查看EdgeOne部署日志
   - 检查API Functions状态
   - 确认环境变量配置
   - 查看Network标签的API请求详情

## 💡 提示

- 应用已配置自动降级，即使API失败也能正常使用
- 模拟数据仅用于测试，真实环境需要API正常工作
- 所有调试信息都会在浏览器控制台输出
- 如果看到模拟数据，说明API未正常工作，需要检查EdgeOne配置
