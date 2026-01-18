/**
 * AIRewriter - AI内容改写服务
 * 使用智谱AI GLM-4-Flash进行内容改写和标签生成
 */

import { Logger } from '../utils/logger'
import { ApiClient } from './apiClient'

export interface RewrittenContent {
  title: string
  content: string
  tags: string[]
  originalTitle: string
  originalContent: string
}

export class AIRewriter {
  /**
   * 改写标题和文案，并生成标签
   */
  static async rewriteContent(
    title: string,
    content: string
  ): Promise<RewrittenContent> {
    Logger.logUserAction('AI改写内容', { 
      titleLength: title.length, 
      contentLength: content.length 
    })

    try {
      Logger.info('调用真实AI API改写')
      
      // 添加超时控制（15秒）
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('AI API请求超时（15秒），请检查EdgeOne API Functions和智谱AI配置')), 15000)
      })

      const apiPromise = ApiClient.post<RewrittenContent>('/rewrite', {
        title,
        content,
      })

      const data = await Promise.race([apiPromise, timeoutPromise])

      // 验证改写结果
      const validation = this.validateRewrittenContent(data)
      if (!validation.valid) {
        Logger.warn('改写内容验证失败', { errors: validation.errors })
        throw new Error(`内容验证失败: ${validation.errors.join(', ')}`)
      }

      Logger.info('AI改写成功', { 
        titleLength: data.title.length,
        contentLength: data.content.length,
        tagCount: data.tags.length
      })

      return data
    } catch (error) {
      Logger.error('AI改写失败', { error })
      
      // 输出详细错误信息
      console.error('❌ AI改写失败:', error)
      console.error('请检查EdgeOne控制台：')
      console.error('  1. API Functions是否部署成功')
      console.error('  2. 环境变量ZHIPU_API_KEY是否配置正确')
      console.error('  3. 智谱AI API Key是否有效')
      console.error('  4. 查看EdgeOne部署日志')
      
      throw error
    }
  }

  /**
   * 验证改写后的内容是否符合要求
   */
  static validateRewrittenContent(content: RewrittenContent): {
    valid: boolean
    errors: string[]
  } {
    const errors: string[] = []

    // 检查标题长度（1-50字）
    if (!content.title || content.title.length === 0) {
      errors.push('标题不能为空')
    } else if (content.title.length > 50) {
      errors.push('标题不能超过50字')
    }

    // 检查文案长度（1-2000字）
    if (!content.content || content.content.length === 0) {
      errors.push('文案不能为空')
    } else if (content.content.length > 2000) {
      errors.push('文案不能超过2000字')
    }

    // 检查标签数量（1-10个）
    if (!content.tags || content.tags.length === 0) {
      errors.push('至少需要1个标签')
    } else if (content.tags.length > 10) {
      errors.push('标签不能超过10个')
    }

    return {
      valid: errors.length === 0,
      errors,
    }
  }

  /**
   * 格式化内容用于发布（添加标签）
   */
  static formatForPublish(content: RewrittenContent): string {
    const tags = content.tags.map(tag => `#${tag}`).join(' ')
    return `${content.content}\n\n${tags}`
  }
}
