/**
 * API Client - 统一的API调用客户端
 * 支持本地开发和生产环境
 */

import { Logger } from '../utils/logger'
import { ErrorHandler } from '../utils/errorHandler'

const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || '/api'

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  trackingId?: string
}

export class ApiClient {
  /**
   * 发送POST请求
   */
  static async post<T>(
    endpoint: string,
    body: Record<string, any>
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`
    
    Logger.logApiCall(endpoint, 'POST')

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      })

      const data: ApiResponse<T> = await response.json()

      Logger.logApiCall(endpoint, 'POST', response.status)

      if (!data.success) {
        throw new Error(data.error || 'API请求失败')
      }

      if (!data.data) {
        throw new Error('API返回数据为空')
      }

      return data.data
    } catch (error) {
      const appError = ErrorHandler.handleApiError(
        error instanceof Error ? error : new Error('未知错误'),
        endpoint
      )
      ErrorHandler.logError(appError)
      throw new Error(appError.message)
    }
  }

  /**
   * 发送GET请求
   */
  static async get<T>(endpoint: string): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`
    
    Logger.logApiCall(endpoint, 'GET')

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const data: ApiResponse<T> = await response.json()

      Logger.logApiCall(endpoint, 'GET', response.status)

      if (!data.success) {
        throw new Error(data.error || 'API请求失败')
      }

      if (!data.data) {
        throw new Error('API返回数据为空')
      }

      return data.data
    } catch (error) {
      const appError = ErrorHandler.handleApiError(
        error instanceof Error ? error : new Error('未知错误'),
        endpoint
      )
      ErrorHandler.logError(appError)
      throw new Error(appError.message)
    }
  }

  /**
   * 检查API是否可用
   */
  static async healthCheck(): Promise<boolean> {
    try {
      // 尝试调用一个简单的API
      await this.get('/health')
      return true
    } catch {
      return false
    }
  }
}
