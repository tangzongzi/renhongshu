/**
 * Logger - 操作日志记录工具
 * 记录关键操作和用户行为
 */

export enum LogLevel {
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
  DEBUG = 'DEBUG',
}

export interface LogEntry {
  level: LogLevel
  message: string
  trackingId: string
  timestamp: Date
  data?: Record<string, any>
}

export class Logger {
  private static logs: LogEntry[] = []
  private static maxLogs = 100 // 最多保存100条日志

  /**
   * 生成唯一追踪ID
   */
  static generateTrackingId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * 创建日志条目
   */
  private static createLog(
    level: LogLevel,
    message: string,
    data?: Record<string, any>
  ): LogEntry {
    const log: LogEntry = {
      level,
      message,
      trackingId: this.generateTrackingId(),
      timestamp: new Date(),
      data,
    }

    // 保存到内存
    this.logs.push(log)
    if (this.logs.length > this.maxLogs) {
      this.logs.shift() // 移除最旧的日志
    }

    return log
  }

  /**
   * 记录信息日志
   */
  static info(message: string, data?: Record<string, any>): void {
    const log = this.createLog(LogLevel.INFO, message, data)
    console.log(`[${log.level}] ${log.message}`, log.trackingId, data)
  }

  /**
   * 记录警告日志
   */
  static warn(message: string, data?: Record<string, any>): void {
    const log = this.createLog(LogLevel.WARN, message, data)
    console.warn(`[${log.level}] ${log.message}`, log.trackingId, data)
  }

  /**
   * 记录错误日志
   */
  static error(message: string, data?: Record<string, any>): void {
    const log = this.createLog(LogLevel.ERROR, message, data)
    console.error(`[${log.level}] ${log.message}`, log.trackingId, data)
  }

  /**
   * 记录调试日志
   */
  static debug(message: string, data?: Record<string, any>): void {
    if (import.meta.env?.DEV) {
      const log = this.createLog(LogLevel.DEBUG, message, data)
      console.debug(`[${log.level}] ${log.message}`, log.trackingId, data)
    }
  }

  /**
   * 记录用户操作
   */
  static logUserAction(action: string, details?: Record<string, any>): void {
    this.info(`用户操作: ${action}`, details)
  }

  /**
   * 记录API调用
   */
  static logApiCall(endpoint: string, method: string, status?: number): void {
    this.info(`API调用: ${method} ${endpoint}`, { status })
  }

  /**
   * 获取所有日志
   */
  static getLogs(): LogEntry[] {
    return [...this.logs]
  }

  /**
   * 获取最近的日志
   */
  static getRecentLogs(count: number = 10): LogEntry[] {
    return this.logs.slice(-count)
  }

  /**
   * 清除所有日志
   */
  static clearLogs(): void {
    this.logs = []
  }

  /**
   * 导出日志为JSON
   */
  static exportLogs(): string {
    return JSON.stringify(this.logs, null, 2)
  }
}
