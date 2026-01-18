/**
 * ContentValidator - 内容合规检查工具
 * 检查敏感词、字数限制等
 */

import { Logger } from './logger'

export interface ValidationResult {
  valid: boolean
  errors: string[]
  warnings: string[]
}

export class ContentValidator {
  // 敏感词列表（示例，实际应该更完整）
  private static sensitiveWords = [
    '政治',
    '赌博',
    '色情',
    '暴力',
    '毒品',
    '枪支',
    '诈骗',
    '传销',
  ]

  /**
   * 验证标题
   */
  static validateTitle(title: string): ValidationResult {
    const errors: string[] = []
    const warnings: string[] = []

    // 检查是否为空
    if (!title || title.trim().length === 0) {
      errors.push('标题不能为空')
    }

    // 检查长度（1-50字）
    if (title.length > 50) {
      errors.push('标题不能超过50字')
    }

    if (title.length < 5) {
      warnings.push('标题过短，建议至少5个字')
    }

    // 检查敏感词
    const sensitiveFound = this.checkSensitiveWords(title)
    if (sensitiveFound.length > 0) {
      errors.push(`标题包含敏感词: ${sensitiveFound.join(', ')}`)
    }

    Logger.debug('标题验证', { title, errors, warnings })

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    }
  }

  /**
   * 验证内容
   */
  static validateContent(content: string): ValidationResult {
    const errors: string[] = []
    const warnings: string[] = []

    // 检查是否为空
    if (!content || content.trim().length === 0) {
      errors.push('内容不能为空')
    }

    // 检查长度（1-2000字）
    if (content.length > 2000) {
      errors.push('内容不能超过2000字')
    }

    if (content.length < 20) {
      warnings.push('内容过短，建议至少20个字')
    }

    // 检查敏感词
    const sensitiveFound = this.checkSensitiveWords(content)
    if (sensitiveFound.length > 0) {
      errors.push(`内容包含敏感词: ${sensitiveFound.join(', ')}`)
    }

    Logger.debug('内容验证', { contentLength: content.length, errors, warnings })

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    }
  }

  /**
   * 验证标签
   */
  static validateTags(tags: string[]): ValidationResult {
    const errors: string[] = []
    const warnings: string[] = []

    // 检查数量（1-10个）
    if (!tags || tags.length === 0) {
      errors.push('至少需要1个标签')
    }

    if (tags.length > 10) {
      errors.push('标签不能超过10个')
    }

    // 检查每个标签
    tags.forEach((tag, index) => {
      if (!tag || tag.trim().length === 0) {
        errors.push(`标签${index + 1}不能为空`)
      }

      if (tag.length > 20) {
        errors.push(`标签${index + 1}不能超过20字`)
      }

      // 检查敏感词
      const sensitiveFound = this.checkSensitiveWords(tag)
      if (sensitiveFound.length > 0) {
        errors.push(`标签${index + 1}包含敏感词: ${sensitiveFound.join(', ')}`)
      }
    })

    Logger.debug('标签验证', { tagCount: tags.length, errors, warnings })

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    }
  }

  /**
   * 验证完整内容
   */
  static validateAll(
    title: string,
    content: string,
    tags: string[]
  ): ValidationResult {
    const titleResult = this.validateTitle(title)
    const contentResult = this.validateContent(content)
    const tagsResult = this.validateTags(tags)

    const allErrors = [
      ...titleResult.errors,
      ...contentResult.errors,
      ...tagsResult.errors,
    ]

    const allWarnings = [
      ...titleResult.warnings,
      ...contentResult.warnings,
      ...tagsResult.warnings,
    ]

    Logger.info('完整内容验证', {
      valid: allErrors.length === 0,
      errorCount: allErrors.length,
      warningCount: allWarnings.length,
    })

    return {
      valid: allErrors.length === 0,
      errors: allErrors,
      warnings: allWarnings,
    }
  }

  /**
   * 检查敏感词
   */
  private static checkSensitiveWords(text: string): string[] {
    const found: string[] = []

    this.sensitiveWords.forEach((word) => {
      if (text.includes(word)) {
        found.push(word)
      }
    })

    return found
  }

  /**
   * 清理内容（移除敏感词）
   */
  static cleanContent(text: string): string {
    let cleaned = text

    this.sensitiveWords.forEach((word) => {
      const regex = new RegExp(word, 'g')
      cleaned = cleaned.replace(regex, '***')
    })

    return cleaned
  }
}
