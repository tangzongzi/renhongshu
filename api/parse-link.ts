/**
 * EdgeOne Node Function: 链接解析API
 * POST /api/parse-link
 */

import { LinkParser } from '../src/services/LinkParser'

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

export default async function handler(request: Request): Promise<Response> {
  // 只允许 POST 请求
  if (request.method !== 'POST') {
    return new Response(
      JSON.stringify({ success: false, error: 'Method not allowed' }),
      { status: 405, headers: { 'Content-Type': 'application/json' } }
    )
  }

  try {
    const body: RequestBody = await request.json()
    const { url } = body

    if (!url) {
      return new Response(
        JSON.stringify({ success: false, error: '链接不能为空' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // 解析链接
    const parsed = LinkParser.parseLink(url)

    const response: ResponseData = {
      success: true,
      data: {
        postId: parsed.postId,
        linkType: parsed.linkType,
        originalUrl: parsed.originalUrl,
      },
    }

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '链接解析失败'
    
    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage,
        trackingId: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
