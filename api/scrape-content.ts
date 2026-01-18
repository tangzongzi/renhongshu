/**
 * EdgeOne Node Function: 内容抓取API
 * POST /api/scrape-content
 * 
 * 使用 Cheerio 抓取小红书内容
 */

interface RequestBody {
  postId: string
}

interface ResponseData {
  success: boolean
  data?: {
    title: string
    content: string
    images: string[]
    postId: string
    scrapedAt: string
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
    const { postId } = body

    if (!postId) {
      return new Response(
        JSON.stringify({ success: false, error: '帖子ID不能为空' }),
        { 
          status: 400, 
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          } 
        }
      )
    }

    // 构建小红书URL
    const url = `https://www.xiaohongshu.com/explore/${postId}`

    // 发送请求（需要伪装User-Agent）
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
        'Referer': 'https://www.xiaohongshu.com/',
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: 无法访问小红书`)
    }

    const html = await response.text()

    // 从HTML中提取数据
    // 小红书的数据通常在 <script> 标签中的 window.__INITIAL_STATE__ 对象里
    const stateMatch = html.match(/window\.__INITIAL_STATE__\s*=\s*({.+?})\s*<\/script>/)
    
    if (!stateMatch) {
      throw new Error('无法解析页面数据')
    }

    const initialState = JSON.parse(stateMatch[1])
    const noteData = initialState?.note?.noteDetailMap?.[postId]?.note

    if (!noteData) {
      throw new Error('未找到帖子数据')
    }

    // 提取标题、文案和图片
    const title = noteData.title || noteData.desc?.substring(0, 50) || '无标题'
    const content = noteData.desc || ''
    const images = noteData.imageList?.map((img: any) => img.urlDefault || img.url) || []

    const responseData: ResponseData = {
      success: true,
      data: {
        title,
        content,
        images,
        postId,
        scrapedAt: new Date().toISOString(),
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
    const errorMessage = error instanceof Error ? error.message : '内容抓取失败'
    
    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage,
        trackingId: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      }),
      { 
        status: 500, 
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        } 
      }
    )
  }
}
