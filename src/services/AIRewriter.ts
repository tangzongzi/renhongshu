/**
 * AIRewriter - AI内容改写服务
 * 使用智谱AI GLM-4-Flash进行内容改写和标签生成
 */

import { Logger } from '../utils/logger'
import { ApiClient } from './apiClient'
import { ContentValidator } from '../utils/contentValidator'

export interface RewrittenContent {
  title: string
  content: string
  tags: string[]
  originalTitle: string
  originalContent: string
}

// 是否使用真实API（通过环境变量控制）
const USE_REAL_API = (import.meta as any).env?.VITE_USE_REAL_API === 'true'

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
      // 如果配置了使用真实API，则调用后端
      if (USE_REAL_API) {
        Logger.info('使用真实AI API改写')
        
        const data = await ApiClient.post<RewrittenContent>('/rewrite', {
          title,
          content,
        })

        // 验证改写结果
        const validation = this.validateRewrittenContent(data)
        if (!validation.valid) {
          Logger.warn('改写内容验证失败', { errors: validation.errors })
          throw new Error(`内容验证失败: ${validation.errors.join(', ')}`)
        }

        Logger.info('AI改写成功（真实API）', { 
          titleLength: data.title.length,
          contentLength: data.content.length,
          tagCount: data.tags.length
        })

        return data
      }

      // 使用模拟数据（开发阶段）
      Logger.info('使用模拟AI改写')
      await new Promise(resolve => setTimeout(resolve, 2000))

      const rewrittenTitle = this.simulateRewrite(title)
      const rewrittenContent = this.simulateRewrite(content)
      const tags = this.generateTags(content)

      const result: RewrittenContent = {
        title: rewrittenTitle,
        content: rewrittenContent,
        tags,
        originalTitle: title,
        originalContent: content,
      }

      // 验证改写结果
      const validation = ContentValidator.validateAll(
        result.title,
        result.content,
        result.tags
      )
      
      if (!validation.valid) {
        Logger.warn('改写内容验证失败', { errors: validation.errors })
        throw new Error(`内容验证失败: ${validation.errors.join(', ')}`)
      }

      if (validation.warnings.length > 0) {
        Logger.warn('改写内容有警告', { warnings: validation.warnings })
      }

      Logger.info('AI改写成功（模拟数据）', { 
        titleLength: result.title.length,
        contentLength: result.content.length,
        tagCount: result.tags.length
      })

      return result
    } catch (error) {
      Logger.error('AI改写失败，使用降级方案', { error })
      // 降级方案：使用简单的同义词替换
      return this.fallbackRewrite(title, content)
    }
  }

  /**
   * 模拟AI改写（开发阶段使用）
   */
  private static simulateRewrite(text: string): string {
    // 简单的文本变换模拟
    const synonyms: Record<string, string> = {
      '这是': '这里是',
      '原始': '初始',
      '内容': '素材',
      '标题': '题目',
      '文案': '文字',
    }

    let result = text
    Object.entries(synonyms).forEach(([key, value]) => {
      result = result.replace(new RegExp(key, 'g'), value)
    })

    return result
  }

  /**
   * 生成相关标签
   */
  private static generateTags(_content: string): string[] {
    // 简单的关键词提取模拟
    const keywords = ['美食', '旅行', '生活', '分享', '推荐']
    
    // 随机选择2-4个标签
    const count = Math.floor(Math.random() * 3) + 2
    const shuffled = keywords.sort(() => 0.5 - Math.random())
    return shuffled.slice(0, count)
  }

  /**
   * 降级方案：简单的同义词替换
   */
  private static fallbackRewrite(
    title: string,
    content: string
  ): RewrittenContent {
    return {
      title: this.simulateRewrite(title),
      content: this.simulateRewrite(content),
      tags: ['生活', '分享'],
      originalTitle: title,
      originalContent: content,
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
