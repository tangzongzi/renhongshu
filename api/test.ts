/**
 * EdgeOne Node Function: 测试API
 * GET /api/test
 * 
 * 用于测试EdgeOne Functions是否正常工作
 */

export default async function handler(request: Request): Promise<Response> {
  // 处理CORS
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    })
  }

  const testData = {
    success: true,
    message: 'EdgeOne Functions 工作正常！',
    timestamp: new Date().toISOString(),
    environment: {
      hasZhipuKey: !!process.env.ZHIPU_API_KEY,
      zhipuKeyLength: process.env.ZHIPU_API_KEY?.length || 0,
      nodeVersion: process.version || 'unknown',
    },
    test: {
      fetch: typeof fetch !== 'undefined',
      json: typeof JSON !== 'undefined',
    }
  }

  return new Response(JSON.stringify(testData, null, 2), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
  })
}
