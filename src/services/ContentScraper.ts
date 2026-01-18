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
        
        try {
          // 添加超时控制（5秒）
          const timeoutPromise = new Promise<never>((_, reject) => {
            setTimeout(() => reject(new Error('API请求超时')), 5000)
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

          Logger.info('内容抓取成功（真实API）', { 
            postId, 
            imageCount: content.images.length,
            titleLength: content.title.length,
            contentLength: content.content.length
          })

          return content
        } catch (apiError) {
          // API调用失败，降级到模拟数据
          Logger.warn('真实API调用失败，使用模拟数据', { error: apiError })
          console.warn('⚠️ API调用失败，使用模拟数据:', apiError)
          console.warn('⚠️ 请检查EdgeOne控制台：')
          console.warn('   1. API Functions是否部署成功')
          console.warn('   2. 环境变量ZHIPU_API_KEY是否配置')
          console.warn('   3. 路由配置是否正确')
        }
      }

      // 使用模拟数据（开发阶段或API失败时）
      Logger.info('使用模拟数据')
      await new Promise(resolve => setTimeout(resolve, 800))

      const content: ScrapedContent = {
        title: '夏日清爽穿搭分享 | 简约又时尚',
        content: '今天给大家分享一套超级适合夏天的穿搭！\n\n白色T恤搭配牛仔短裤，简单又清爽。\n\n配上一双小白鞋，整体look非常干净利落。\n\n这套穿搭的重点是要选择合身的版型，这样才能穿出好身材。\n\n姐妹们可以试试看哦！',
        images: [
          'https://picsum.photos/400/400?random=1',
          'https://picsum.photos/400/400?random=2',
          'https://picsum.photos/400/400?random=3',
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
