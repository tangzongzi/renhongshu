/**
 * ContentScraper - 小红书内容抓取服务
 * 使用 Cheerio 解析 HTML，提取标题、文案、图片
 */

import { Logger } from '../utils/logger'
import { ErrorHandler, ErrorType } from '../utils/errorHandler'
import { ApiClient } from './apiClient'

export interface ScrapedContent {
  title: string
  content: string
  images: string[]
  postId: string
  scrapedAt: Date
}

export class ContentScraper {
  /**
   * 抓取小红书帖子内容
   * 调用EdgeOne API Functions进行真实内容抓取
   */
  static async scrapeContent(postId: string): Promise<ScrapedContent> {
    Logger.logUserAction('抓取内容', { postId })

    try {
      Logger.info('调用真实API抓取内容')
      
      // 添加超时控制（10秒）
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('API请求超时（10秒），请检查EdgeOne API Functions是否部署成功')), 10000)
      })

      const apiPromise = ApiClient.post<{
        title: string
        content: string
        images: string[]
        postId: string
        scrapedAt: string
      }>('/scrape-content', { postId })

      const data = await Promise.race([apiPromise, timeoutPromise])

      const content: ScrapedContent = {
        ...data,
        scrapedAt: new Date(data.scrapedAt),
      }

      // 验证内容完整性
      if (!this.validateContent(content)) {
        throw new Error('抓取的内容不完整')
      }

      Logger.info('内容抓取成功', { 
        postId, 
        imageCount: content.images.length,
        titleLength: content.title.length,
        contentLength: content.content.length
      })

      return content
    } catch (error) {
      const appError = ErrorHandler.handleAndLog(
        error instanceof Error ? error : new Error('未知错误'),
        ErrorType.NETWORK
      )
      
      // 输出详细错误信息
      console.error('❌ 内容抓取失败:', appError.message)
      console.error('请检查EdgeOne控制台：')
      console.error('  1. API Functions是否部署成功')
      console.error('  2. 环境变量ZHIPU_API_KEY是否配置')
      console.error('  3. 路由配置是否正确')
      console.error('  4. 查看EdgeOne部署日志')
      
      throw new Error(appError.message)
    }
  }

  /**
   * 验证抓取的内容是否完整
   */
  static validateContent(content: ScrapedContent): boolean {
    return !!(
      content.title &&
      content.content &&
      content.images &&
      content.images.length > 0 &&
      content.postId
    )
  }

  /**
   * 清理和格式化文案内容
   */
  static cleanContent(content: string): string {
    return content
      .trim()
      .replace(/\s+/g, ' ') // 合并多余空格
      .replace(/\n{3,}/g, '\n\n') // 最多保留两个换行
  }
}
