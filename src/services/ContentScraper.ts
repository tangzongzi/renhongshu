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

// 是否使用真实API（通过环境变量控制）
const USE_REAL_API = import.meta.env?.VITE_USE_REAL_API === 'true'

export class ContentScraper {
  /**
   * 抓取小红书帖子内容
   * 注意：由于浏览器环境限制，这里使用模拟数据
   * 实际部署时，应该在 EdgeOne Node Functions 中实现
   */
  static async scrapeContent(postId: string): Promise<ScrapedContent> {
    Logger.logUserAction('抓取内容', { postId })

    try {
      // 如果配置了使用真实API，则调用后端
      if (USE_REAL_API) {
        Logger.info('使用真实API抓取内容')
        
        const data = await ApiClient.post<{
          title: string
          content: string
          images: string[]
          postId: string
          scrapedAt: string
        }>('/scrape-content', { postId })

        const content: ScrapedContent = {
          ...data,
          scrapedAt: new Date(data.scrapedAt),
        }

        // 验证内容完整性
        if (!this.validateContent(content)) {
          throw new Error('抓取的内容不完整')
        }

        Logger.info('内容抓取成功（真实API）', { 
          postId, 
          imageCount: content.images.length,
          titleLength: content.title.length,
          contentLength: content.content.length
        })

        return content
      }

      // 使用模拟数据（开发阶段）
      Logger.info('使用模拟数据')
      await new Promise(resolve => setTimeout(resolve, 1500))

      const content: ScrapedContent = {
        title: '这是从小红书抓取的原始标题',
        content: '这是从小红书抓取的原始文案内容。\n\n包含了详细的描述信息，可能有多个段落。\n\n这里是第三段内容。',
        images: [
          'https://via.placeholder.com/400x400?text=Image+1',
          'https://via.placeholder.com/400x400?text=Image+2',
          'https://via.placeholder.com/400x400?text=Image+3',
        ],
        postId,
        scrapedAt: new Date(),
      }

      // 验证内容完整性
      if (!this.validateContent(content)) {
        throw new Error('抓取的内容不完整')
      }

      Logger.info('内容抓取成功（模拟数据）', { 
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
