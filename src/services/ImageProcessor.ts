/**
 * ImageProcessor - 图片处理服务
 * 处理图片下载、压缩、格式转换
 */

import { Logger } from '../utils/logger'
import { ErrorHandler } from '../utils/errorHandler'

export interface ProcessedImage {
  url: string
  blob: Blob
  size: number
  format: string
}

export class ImageProcessor {
  /**
   * 下载图片
   */
  static async downloadImage(url: string): Promise<Blob> {
    Logger.info('下载图片', { url })

    try {
      const response = await fetch(url, {
        mode: 'cors',
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: 图片下载失败`)
      }

      const blob = await response.blob()
      
      Logger.info('图片下载成功', {
        url,
        size: blob.size,
        type: blob.type,
      })

      return blob
    } catch (error) {
      const appError = ErrorHandler.handleAndLog(
        error instanceof Error ? error : new Error('未知错误')
      )
      throw new Error(appError.message)
    }
  }

  /**
   * 批量下载图片
   */
  static async downloadImages(urls: string[]): Promise<ProcessedImage[]> {
    Logger.info('批量下载图片', { count: urls.length })

    const results: ProcessedImage[] = []

    for (const url of urls) {
      try {
        const blob = await this.downloadImage(url)
        results.push({
          url,
          blob,
          size: blob.size,
          format: blob.type,
        })
      } catch (error) {
        Logger.error('图片下载失败', { url, error })
        // 继续下载其他图片
      }
    }

    Logger.info('批量下载完成', {
      total: urls.length,
      success: results.length,
      failed: urls.length - results.length,
    })

    return results
  }

  /**
   * 创建下载链接
   */
  static createDownloadUrl(blob: Blob, _filename: string): string {
    const url = URL.createObjectURL(blob)
    return url
  }

  /**
   * 触发浏览器下载
   */
  static triggerDownload(blob: Blob, filename: string): void {
    const url = this.createDownloadUrl(blob, filename)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    // 清理URL对象
    setTimeout(() => URL.revokeObjectURL(url), 100)
    
    Logger.info('触发下载', { filename, size: blob.size })
  }

  /**
   * 批量触发下载（带延迟）
   */
  static async triggerBatchDownload(
    images: ProcessedImage[],
    delay: number = 300
  ): Promise<void> {
    Logger.info('批量触发下载', { count: images.length, delay })

    for (let i = 0; i < images.length; i++) {
      const image = images[i]
      const filename = `xiaohongshu-image-${i + 1}.jpg`
      
      this.triggerDownload(image.blob, filename)
      
      // 延迟，避免浏览器阻止
      if (i < images.length - 1) {
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }

    Logger.info('批量下载完成')
  }

  /**
   * 获取图片信息
   */
  static async getImageInfo(url: string): Promise<{
    width: number
    height: number
    size: number
    format: string
  }> {
    return new Promise((resolve, reject) => {
      const img = new Image()
      
      img.onload = () => {
        resolve({
          width: img.width,
          height: img.height,
          size: 0, // 需要下载才能获取
          format: url.split('.').pop() || 'unknown',
        })
      }

      img.onerror = () => {
        reject(new Error('无法加载图片'))
      }

      img.src = url
    })
  }

  /**
   * 验证图片URL
   */
  static isValidImageUrl(url: string): boolean {
    try {
      const urlObj = new URL(url)
      const ext = urlObj.pathname.split('.').pop()?.toLowerCase()
      return ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext || '')
    } catch {
      return false
    }
  }

  /**
   * 批量验证图片URL
   */
  static validateImageUrls(urls: string[]): {
    valid: string[]
    invalid: string[]
  } {
    const valid: string[] = []
    const invalid: string[] = []

    urls.forEach((url) => {
      if (this.isValidImageUrl(url)) {
        valid.push(url)
      } else {
        invalid.push(url)
      }
    })

    Logger.info('图片URL验证', {
      total: urls.length,
      valid: valid.length,
      invalid: invalid.length,
    })

    return { valid, invalid }
  }
}
