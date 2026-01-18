/**
 * ErrorHandler - 统一错误处理工具
 * 提供错误分类、格式化和日志记录功能
 */

export enum ErrorType {
  NETWORK = 'NETWORK',
  VALIDATION = 'VALIDATION',
  PARSE = 'PARSE',
  API = 'API',
  UNKNOWN = 'UNKNOWN',
}

export interface AppError {
  type: ErrorType
  message: string
  originalError?: Error
  timestamp: Date
  trackingId: string
}

export class ErrorHandler {
  /**
   * 生成唯一追踪ID
   */
  static generateTrackingId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * 创建应用错误
   */
  static createError(
    type: ErrorType,
    message: string,
    originalError?: Error
  ): AppError {
    return {
      type,
      message,
      originalError,
      timestamp: new Date(),
      trackingId: this.generateTrackingId(),
    }
  }

  /**
   * 处理网络错误
   */
  static handleNetworkError(error: Error): AppError {
    return this.createError(
      ErrorType.NETWORK,
      '网络连接失败，请检查网络设置',
      error
    )
  }

  /**
   * 处理验证错误
   */
  static handleValidationError(message: string): AppError {
    return this.createError(ErrorType.VALIDATION, message)
  }

  /**
   * 处理解析错误
   */
  static handleParseError(error: Error): AppError {
    return this.createError(
      ErrorType.PARSE,
      '内容解析失败，请稍后重试',
      error
    )
  }

  /**
   * 处理API错误
   */
  static handleApiError(error: Error, endpoint?: string): AppError {
    const message = endpoint
      ? `API请求失败: ${endpoint}`
      : 'API请求失败，请稍后重试'
    
    return this.createError(ErrorType.API, message, error)
  }

  /**
   * 处理未知错误
   */
  static handleUnknownError(error: Error): AppError {
    return this.createError(
      ErrorType.UNKNOWN,
      '发生未知错误，请稍后重试',
      error
    )
  }

  /**
   * 格式化错误信息用于显示
   */
  static formatErrorMessage(error: AppError): string {
    return `${error.message} (ID: ${error.trackingId})`
  }

  /**
   * 记录错误到控制台
   */
  static logError(error: AppError): void {
    console.error('[错误]', {
      type: error.type,
      message: error.message,
      trackingId: error.trackingId,
      timestamp: error.timestamp,
      originalError: error.originalError,
    })
  }

  /**
   * 处理并记录错误
   */
  static handleAndLog(error: Error, type?: ErrorType): AppError {
    let appError: AppError

    if (type) {
      appError = this.createError(type, error.message, error)
    } else {
      // 自动判断错误类型
      if (error.message.includes('fetch') || error.message.includes('network')) {
        appError = this.handleNetworkError(error)
      } else if (error.message.includes('parse') || error.message.includes('JSON')) {
        appError = this.handleParseError(error)
      } else {
        appError = this.handleUnknownError(error)
      }
    }

    this.logError(appError)
    return appError
  }
}
