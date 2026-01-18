/**
 * AppLauncher - APP唤起服务
 * 处理剪贴板复制、URL Scheme生成、平台检测
 */

import { Logger } from '../utils/logger'

export type Platform = 'ios' | 'android' | 'desktop' | 'unknown'

export class AppLauncher {
  /**
   * 检测平台
   */
  static detectPlatform(): Platform {
    const userAgent = navigator.userAgent.toLowerCase()

    if (/iphone|ipad|ipod/.test(userAgent)) {
      return 'ios'
    }

    if (/android/.test(userAgent)) {
      return 'android'
    }

    if (/windows|mac|linux/.test(userAgent)) {
      return 'desktop'
    }

    return 'unknown'
  }

  /**
   * 复制到剪贴板
   */
  static async copyToClipboard(text: string): Promise<boolean> {
    Logger.info('复制到剪贴板', { length: text.length })

    try {
      await navigator.clipboard.writeText(text)
      Logger.info('复制成功')
      return true
    } catch (error) {
      Logger.error('复制失败', { error })
      
      // 降级方案：使用传统方法
      try {
        const textarea = document.createElement('textarea')
        textarea.value = text
        textarea.style.position = 'fixed'
        textarea.style.opacity = '0'
        document.body.appendChild(textarea)
        textarea.select()
        const success = document.execCommand('copy')
        document.body.removeChild(textarea)
        
        if (success) {
          Logger.info('复制成功（降级方案）')
          return true
        }
      } catch (fallbackError) {
        Logger.error('降级方案也失败', { fallbackError })
      }
      
      return false
    }
  }

  /**
   * 生成小红书URL Scheme
   */
  static generateXiaohongshuScheme(action: 'publish' | 'home' = 'publish'): string {
    const schemes = {
      publish: 'xhsdiscover://publish',
      home: 'xhsdiscover://home',
    }

    return schemes[action]
  }

  /**
   * 打开小红书APP
   */
  static async openXiaohongshuApp(
    action: 'publish' | 'home' = 'publish',
    fallbackUrl: string = 'https://www.xiaohongshu.com'
  ): Promise<void> {
    const platform = this.detectPlatform()
    const scheme = this.generateXiaohongshuScheme(action)

    Logger.info('打开小红书APP', { platform, action, scheme })

    try {
      // 尝试打开APP
      window.location.href = scheme

      // 设置超时，如果APP未安装则打开网页
      setTimeout(() => {
        Logger.warn('APP可能未安装，打开网页版')
        window.open(fallbackUrl, '_blank')
      }, 1500)
    } catch (error) {
      Logger.error('打开APP失败', { error })
      window.open(fallbackUrl, '_blank')
    }
  }

  /**
   * 准备发布内容
   */
  static async preparePublishContent(
    title: string,
    content: string,
    tags: string[]
  ): Promise<{
    text: string
    copied: boolean
  }> {
    // 格式化内容
    const formattedTags = tags.map(tag => `#${tag}`).join(' ')
    const fullText = `${title}\n\n${content}\n\n${formattedTags}`

    // 复制到剪贴板
    const copied = await this.copyToClipboard(fullText)

    Logger.info('准备发布内容', {
      titleLength: title.length,
      contentLength: content.length,
      tagCount: tags.length,
      copied,
    })

    return {
      text: fullText,
      copied,
    }
  }

  /**
   * 完整发布流程
   */
  static async launchPublishFlow(
    title: string,
    content: string,
    tags: string[]
  ): Promise<{
    success: boolean
    copied: boolean
    message: string
  }> {
    Logger.logUserAction('启动发布流程')

    try {
      // 1. 准备内容
      const { copied } = await this.preparePublishContent(title, content, tags)

      // 2. 打开APP
      await this.openXiaohongshuApp('publish')

      return {
        success: true,
        copied,
        message: copied
          ? '内容已复制，小红书APP已打开'
          : '小红书APP已打开，请手动复制内容',
      }
    } catch (error) {
      Logger.error('发布流程失败', { error })
      return {
        success: false,
        copied: false,
        message: '发布流程失败，请手动操作',
      }
    }
  }

  /**
   * 检查剪贴板权限
   */
  static async checkClipboardPermission(): Promise<boolean> {
    try {
      const result = await navigator.permissions.query({
        name: 'clipboard-write' as PermissionName,
      })
      return result.state === 'granted'
    } catch {
      // 某些浏览器不支持权限查询
      return true
    }
  }

  /**
   * 检查APP是否已安装（仅供参考，不完全准确）
   */
  static async checkAppInstalled(): Promise<boolean> {
    const platform = this.detectPlatform()

    if (platform === 'desktop') {
      return false
    }

    // 这个方法不完全准确，仅供参考
    return new Promise((resolve) => {
      const scheme = this.generateXiaohongshuScheme('home')
      const iframe = document.createElement('iframe')
      iframe.style.display = 'none'
      iframe.src = scheme

      let timeout: NodeJS.Timeout

      const cleanup = () => {
        clearTimeout(timeout)
        document.body.removeChild(iframe)
      }

      timeout = setTimeout(() => {
        cleanup()
        resolve(false) // 超时认为未安装
      }, 1000)

      iframe.onload = () => {
        cleanup()
        resolve(true) // 加载成功认为已安装
      }

      document.body.appendChild(iframe)
    })
  }
}
