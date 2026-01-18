/**
 * EdgeOne Node Function: 内容抓取API
 * POST /api/scrape-content
 * 
 * 抓取小红书内容
 * 注意：小红书有反爬虫机制，可能需要使用API或其他方案
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
  debug?: any
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

  const trackingId = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
  
  try {
    const body: RequestBody = await request.json()
    const { postId } = body

    console.log(`[${trackingId}] 开始抓取内容, postId:`, postId)

    if (!postId) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: '帖子ID不能为空',
          trackingId 
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

    // 构建小红书URL
    const url = `https://www.xiaohongshu.com/explore/${postId}`
    console.log(`[${trackingId}] 请求URL:`, url)

    // 发送请求（需要伪装User-Agent）
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
        'Referer': 'https://www.xiaohongshu.com/',
        'Cookie': '', // 小红书可能需要Cookie
      },
    })

    console.log(`[${trackingId}] HTTP状态:`, response.status)

    if (!response.ok) {
      console.error(`[${trackingId}] HTTP错误:`, response.status, response.statusText)
      throw new Error(`HTTP ${response.status}: 无法访问小红书（可能被反爬虫拦截）`)
    }

    const html = await response.text()
    console.log(`[${trackingId}] HTML长度:`, html.length)

    // 检查是否被重定向到登录页或验证页
    if (html.includes('验证') || html.includes('login') || html.length < 1000) {
      console.error(`[${trackingId}] 可能被反爬虫拦截`)
      throw new Error('小红书反爬虫拦截，无法直接抓取。建议使用小红书官方API或其他方案')
    }

    // 从HTML中提取数据
    // 小红书的数据通常在 <script> 标签中的 window.__INITIAL_STATE__ 对象里
    const stateMatch = html.match(/window\.__INITIAL_STATE__\s*=\s*({.+?})\s*<\/script>/)
    
    if (!stateMatch) {
      console.error(`[${trackingId}] 未找到__INITIAL_STATE__`)
      
      // 尝试其他可能的数据位置
      const alternativeMatch = html.match(/__INITIAL_SSR_STATE__\s*=\s*({.+?})</)
      if (alternativeMatch) {
        console.log(`[${trackingId}] 找到__INITIAL_SSR_STATE__`)
      } else {
        throw new Error('无法解析页面数据（页面结构可能已变化）')
      }
    }

    const initialState = JSON.parse(stateMatch[1])
    console.log(`[${trackingId}] 解析到的数据结构:`, Object.keys(initialState))

    const noteData = initialState?.note?.noteDetailMap?.[postId]?.note

    if (!noteData) {
      console.error(`[${trackingId}] 未找到帖子数据`)
      console.error(`[${trackingId}] 可用的keys:`, Object.keys(initialState?.note?.noteDetailMap || {}))
      throw new Error('未找到帖子数据（postId可能不正确）')
    }

    // 提取标题、文案和图片
    const title = noteData.title || noteData.desc?.substring(0, 50) || '无标题'
    const content = noteData.desc || ''
    const images = noteData.imageList?.map((img: any) => img.urlDefault || img.url) || []

    console.log(`[${trackingId}] 抓取成功:`, {
      title: title.substring(0, 20),
      contentLength: content.length,
      imageCount: images.length
    })

    const responseData: ResponseData = {
      success: true,
      data: {
        title,
        content,
        images,
        postId,
        scrapedAt: new Date().toISOString(),
      },
      trackingId,
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
    
    console.error(`[${trackingId}] 错误:`, errorMessage)
    console.error(`[${trackingId}] 错误堆栈:`, error instanceof Error ? error.stack : '')
    
    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage,
        trackingId,
        debug: {
          message: errorMessage,
          timestamp: new Date().toISOString(),
        }
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
