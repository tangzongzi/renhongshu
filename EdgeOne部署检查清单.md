# EdgeOne 部署检查清单

## 当前问题
1. ✅ 应用在"获取内容"步骤卡住 - **已修复**（添加超时和降级方案）
2. ⚠️ 底部显示"仅用于演示和测试目的"提示 - **可能是EdgeOne平台注入**

## 必须检查的配置

### 1. EdgeOne 环境变量配置
在 EdgeOne 控制台检查以下环境变量是否正确配置：

```
ZHIPU_API_KEY = 5da539c561a24becb4d557372f20b7b9.xhDQrrOzEiXYlxQA
```

⚠️ **注意**：EdgeOne的环境变量名称应该是 `ZHIPU_API_KEY`（不带 `VITE_` 前缀）

### 2. API Functions 部署状态
检查以下3个API函数是否部署成功：
- `/api/parse-link` - 链接解析
- `/api/scrape-content` - 内容抓取
- `/api/rewrite` - AI改写

### 3. 路由配置
确认 `edgeone.json` 中的路由配置已生效：
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

### 4. 检查部署模式
⚠️ **底部提示可能的原因**：
- EdgeOne控制台可能有"演示模式"或"测试环境"开关
- 检查是否需要切换到"生产模式"
- 查看EdgeOne项目设置中是否有环境标记

## 测试步骤

### 1. 测试API端点
在浏览器控制台运行：

```javascript
// 测试内容抓取API
fetch('/api/scrape-content', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ postId: '123456' })
})
.then(r => r.json())
.then(console.log)
.catch(console.error)

// 测试AI改写API
fetch('/api/rewrite', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ 
    title: '测试标题', 
    content: '测试内容' 
  })
})
.then(r => r.json())
.then(console.log)
.catch(console.error)
```

### 2. 查看控制台日志
打开浏览器开发者工具（F12），查看：
- Console标签：查看API调用错误
- Network标签：查看API请求状态码
- 如果看到 `⚠️ API调用失败` 警告，说明API未正常工作

## 当前代码改进

### ✅ 已添加超时控制
- 内容抓取API：5秒超时
- AI改写API：8秒超时
- 超时后自动降级到模拟数据

### ✅ 已优化降级方案
- API失败时使用更真实的模拟数据
- 在控制台输出详细的调试信息
- 提示用户检查EdgeOne配置

### ✅ 已尝试隐藏底部提示
在 `index.html` 中添加了CSS规则，隐藏非root的div元素

## 下一步操作

1. **推送代码到GitHub**
   ```bash
   git add .
   git commit -m "优化API超时和降级方案，尝试隐藏EdgeOne演示提示"
   git push origin main
   ```

2. **等待EdgeOne自动部署**（约1-2分钟）

3. **在EdgeOne控制台检查**：
   - 部署日志是否有错误
   - API Functions是否成功部署
   - 环境变量是否正确配置
   - 是否有"演示模式"开关需要关闭

4. **测试应用**：
   - 输入小红书链接
   - 打开浏览器控制台查看日志
   - 如果仍然卡住，查看Network标签的API请求

## 常见问题

### Q: 为什么会使用模拟数据？
A: 当EdgeOne的API Functions未部署成功或调用失败时，应用会自动降级到模拟数据，确保功能可用。

### Q: 如何确认API是否正常工作？
A: 在浏览器控制台查看：
- 如果看到 `✅ 内容抓取成功（真实API）` - API正常
- 如果看到 `⚠️ API调用失败，使用模拟数据` - API有问题

### Q: 底部提示如何删除？
A: 
1. 检查EdgeOne控制台是否有"演示模式"开关
2. 确认项目是否设置为"生产环境"
3. 如果是EdgeOne注入的，需要在平台设置中关闭
4. 已在代码中添加CSS尝试隐藏，推送后查看效果
