/**
 * EdgeOne Node Function: 链接解析API
 * POST /api/parse-link
 */

interface RequestBody {
  url: string
}

interface ResponseData {
  success: boolean
  data?: {
    postId: string
    linkType: string
    originalUrl: string
  }
  error?: string
  trackingId?: string
}

// 链接解析逻辑（独立实现，不依赖前端代码）
function parseLink(url: string): { postId: string; linkType: string; originalUrl: string } {
  // 清理URL
  const cleanedUrl = url.replace(/[😆🎉🔥💕✨]/g, '').trim().replace(/\s+/g, ' ')

  // 标准链接: https://www.xiaohongshu.com/explore/[postId]
  const standardMatch = cleanedUrl.match(/xiaohongshu\.com\/explore\/([a-zA-Z0-9]+)/)
  if (standardMatch) {
    return {
      postId: standardMatch[1],
      originalUrl: cleanedUrl,
      linkType: 'standard',
    }
  }

  // 分享链接: https://www.xiaohongshu.com/discovery/item/[postId]
  const shareMatch = cleanedUrl.match(/xiaohongshu\.com\/discovery\/item\/([a-zA-Z0-9]+)/)
  if (shareMatch) {
    return {
      postId: shareMatch[1],
      originalUrl: cleanedUrl,
      linkType: 'share',
    }
  }

  // 短链接: https://xhslink.com/[code]
  const shortMatch = cleanedUrl.match(/xhslink\.com\/([a-zA-Z0-9]+)/)
  if (shortMatch) {
    return {
      postId: shortMatch[1],
      originalUrl: cleanedUrl,
      linkType: 'short',
    }
  }

  throw new Error('不支持的链接格式，请输入有效的小红书链接')
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

  // 只允许 POST 请求
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
    const { url } = body

    if (!url) {
      return new Response(
        JSON.stringify({ success: false, error: '链接不能为空' }),
        { 
          status: 400, 
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          } 
        }
      )
    }

    // 解析链接
    const parsed = parseLink(url)

    const response: ResponseData = {
      success: true,
      data: parsed,
    }

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '链接解析失败'
    
    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage,
        trackingId: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      }),
      { 
        status: 400, 
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        } 
      }
    )
  }
}
