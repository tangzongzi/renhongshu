/**
 * EdgeOne Node Function: AI改写API
 * POST /api/rewrite
 * 
 * 使用智谱AI GLM-4-Flash进行内容改写
 */

interface RequestBody {
  title: string
  content: string
}

interface ResponseData {
  success: boolean
  data?: {
    title: string
    content: string
    tags: string[]
    originalTitle: string
    originalContent: string
  }
  error?: string
  trackingId?: string
}

export default async function handler(request: Request): Promise<Response> {
  // 处理CORS预检请求
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    })
  }

  if (request.method !== 'POST') {
    return new Response(
      JSON.stringify({ success: false, error: 'Method not allowed' }),
      { 
        status: 405, 
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        } 
      }
    )
  }

  try {
    const body: RequestBody = await request.json()
    const { title, content } = body

    if (!title || !content) {
      return new Response(
        JSON.stringify({ success: false, error: '标题和内容不能为空' }),
        { 
          status: 400, 
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          } 
        }
      )
    }

    // 获取智谱AI API Key（从环境变量）
    const apiKey = process.env.ZHIPU_API_KEY

    if (!apiKey) {
      // 降级方案：使用简单的同义词替换
      console.warn('未配置智谱AI API Key，使用降级方案')
      return fallbackRewrite(title, content)
    }

    // 调用智谱AI API
    const prompt = `请帮我改写以下小红书内容，使其更加吸引人，同时保持原意。并生成3-5个相关的话题标签。

原标题：${title}
原内容：${content}

请以JSON格式返回：
{
  "title": "改写后的标题",
  "content": "改写后的内容",
  "tags": ["标签1", "标签2", "标签3"]
}`

    const aiResponse = await fetch('https://open.bigmodel.cn/api/paas/v4/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'glm-4-flash',
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
      }),
    })

    if (!aiResponse.ok) {
      throw new Error(`智谱AI API错误: ${aiResponse.status}`)
    }

    const aiData = await aiResponse.json()
    const aiContent = aiData.choices?.[0]?.message?.content

    if (!aiContent) {
      throw new Error('AI返回内容为空')
    }

    // 解析AI返回的JSON（可能包含markdown代码块）
    let rewrittenData
    try {
      // 尝试直接解析
      rewrittenData = JSON.parse(aiContent)
    } catch {
      // 如果失败，尝试提取markdown代码块中的JSON
      const jsonMatch = aiContent.match(/```json\s*\n([\s\S]*?)\n```/)
      if (jsonMatch) {
        rewrittenData = JSON.parse(jsonMatch[1])
      } else {
        throw new Error('无法解析AI返回的内容')
      }
    }

    const responseData: ResponseData = {
      success: true,
      data: {
        title: rewrittenData.title,
        content: rewrittenData.content,
        tags: rewrittenData.tags || [],
        originalTitle: title,
        originalContent: content,
      },
    }

    return new Response(JSON.stringify(responseData), {
      status: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    })
  } catch (error) {
    console.error('AI改写失败:', error)
    
    // 降级方案
    const body: RequestBody = await request.json()
    return fallbackRewrite(body.title, body.content)
  }
}

/**
 * 降级方案：简单的同义词替换
 */
function fallbackRewrite(title: string, content: string): Response {
  const synonyms: Record<string, string> = {
    '这是': '这里是',
    '原始': '初始',
    '内容': '素材',
    '标题': '题目',
    '文案': '文字',
    '分享': '推荐',
    '好物': '宝藏',
  }

  let rewrittenTitle = title
  let rewrittenContent = content

  Object.entries(synonyms).forEach(([key, value]) => {
    rewrittenTitle = rewrittenTitle.replace(new RegExp(key, 'g'), value)
    rewrittenContent = rewrittenContent.replace(new RegExp(key, 'g'), value)
  })

  const responseData: ResponseData = {
    success: true,
    data: {
      title: rewrittenTitle,
      content: rewrittenContent,
      tags: ['生活', '分享', '推荐'],
      originalTitle: title,
      originalContent: content,
    },
  }

  return new Response(JSON.stringify(responseData), {
    status: 200,
    headers: { 
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
  })
}
