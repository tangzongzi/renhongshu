/**
 * LinkParser - 小红书链接解析服务
 * 支持多种链接格式：标准链接、分享链接、短链接
 */

import { Logger } from '../utils/logger'
import { ErrorHandler } from '../utils/errorHandler'

export interface ParsedLink {
  postId: string
  originalUrl: string
  linkType: 'standard' | 'share' | 'short'
}

export class LinkParser {
  // 标准链接格式: https://www.xiaohongshu.com/explore/[postId]
  private static STANDARD_PATTERN = /xiaohongshu\.com\/explore\/([a-zA-Z0-9]+)/

  // 分享链接格式: https://www.xiaohongshu.com/discovery/item/[postId]
  private static SHARE_PATTERN = /xiaohongshu\.com\/discovery\/item\/([a-zA-Z0-9]+)/

  // 短链接格式: https://xhslink.com/[code]
  private static SHORT_PATTERN = /xhslink\.com\/([a-zA-Z0-9]+)/

  // 清理链接中的查询参数和特殊字符
  private static cleanUrl(url: string): string {
    // 移除表情符号和特殊字符
    let cleaned = url.replace(/[😆🎉🔥💕✨]/g, '').trim()
    // 移除多余的空格
    cleaned = cleaned.replace(/\s+/g, ' ')
    return cleaned
  }

  /**
   * 验证链接是否为有效的小红书链接
   */
  static isValidLink(url: string): boolean {
    if (!url || typeof url !== 'string') {
      return false
    }

    const cleanedUrl = this.cleanUrl(url)
    
    return (
      this.STANDARD_PATTERN.test(cleanedUrl) ||
      this.SHARE_PATTERN.test(cleanedUrl) ||
      this.SHORT_PATTERN.test(cleanedUrl)
    )
  }

  /**
   * 解析小红书链接，提取帖子ID
   */
  static parseLink(url: string): ParsedLink {
    Logger.logUserAction('解析链接', { url })

    if (!url || typeof url !== 'string') {
      const error = ErrorHandler.handleValidationError('链接不能为空')
      ErrorHandler.logError(error)
      throw new Error(error.message)
    }

    const cleanedUrl = this.cleanUrl(url)

    // 尝试匹配标准链接
    const standardMatch = cleanedUrl.match(this.STANDARD_PATTERN)
    if (standardMatch) {
      const result = {
        postId: standardMatch[1],
        originalUrl: cleanedUrl,
        linkType: 'standard' as const,
      }
      Logger.info('链接解析成功', { linkType: 'standard', postId: result.postId })
      return result
    }

    // 尝试匹配分享链接
    const shareMatch = cleanedUrl.match(this.SHARE_PATTERN)
    if (shareMatch) {
      const result = {
        postId: shareMatch[1],
        originalUrl: cleanedUrl,
        linkType: 'share' as const,
      }
      Logger.info('链接解析成功', { linkType: 'share', postId: result.postId })
      return result
    }

    // 尝试匹配短链接
    const shortMatch = cleanedUrl.match(this.SHORT_PATTERN)
    if (shortMatch) {
      const result = {
        postId: shortMatch[1],
        originalUrl: cleanedUrl,
        linkType: 'short' as const,
      }
      Logger.info('链接解析成功', { linkType: 'short', postId: result.postId })
      return result
    }

    const error = ErrorHandler.handleValidationError('不支持的链接格式，请输入有效的小红书链接')
    ErrorHandler.logError(error)
    throw new Error(error.message)
  }

  /**
   * 批量验证链接
   */
  static validateLinks(urls: string[]): boolean[] {
    return urls.map(url => this.isValidLink(url))
  }

  /**
   * 批量解析链接
   */
  static parseLinks(urls: string[]): ParsedLink[] {
    return urls.map(url => this.parseLink(url))
  }
}
