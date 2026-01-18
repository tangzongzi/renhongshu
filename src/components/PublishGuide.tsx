import { useState } from 'react'
import { useContentStore } from '../store/useContentStore'
import { ImageProcessor } from '../services/ImageProcessor'
import { AppLauncher } from '../services/AppLauncher'

interface PublishGuideProps {
  onComplete: () => void
}

export default function PublishGuide({ onComplete }: PublishGuideProps) {
  const [copiedTitle, setCopiedTitle] = useState(false)
  const [copiedContent, setCopiedContent] = useState(false)
  const [downloading, setDownloading] = useState(false)

  const { rewrittenContent, originalContent } = useContentStore()

  const title = rewrittenContent?.title || originalContent?.title || ''
  const content = rewrittenContent 
    ? `${rewrittenContent.content}\n\n${rewrittenContent.tags.map(tag => `#${tag}`).join(' ')}`
    : originalContent?.content || ''
  const images = originalContent?.images || []

  const copyToClipboard = async (text: string, type: 'title' | 'content') => {
    const success = await AppLauncher.copyToClipboard(text)
    
    if (success) {
      if (type === 'title') {
        setCopiedTitle(true)
        setTimeout(() => setCopiedTitle(false), 2000)
      } else {
        setCopiedContent(true)
        setTimeout(() => setCopiedContent(false), 2000)
      }
    }
  }

  const downloadAllImages = async () => {
    setDownloading(true)
    try {
      const processedImages = await ImageProcessor.downloadImages(images)
      await ImageProcessor.triggerBatchDownload(processedImages, 300)
    } catch (error) {
      console.error('图片下载失败:', error)
    } finally {
      setDownloading(false)
    }
  }

  const openXiaohongshu = async () => {
    if (rewrittenContent) {
      await AppLauncher.launchPublishFlow(
        rewrittenContent.title,
        rewrittenContent.content,
        rewrittenContent.tags
      )
    }
    
    setTimeout(() => {
      onComplete()
    }, 2000)
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-6 sm:px-6 md:px-8">
      {/* 图片下载 */}
      <div className="bg-white rounded-3xl p-4 sm:p-6 mb-4">
        <h3 className="text-sm text-gray-500 mb-4">保存图片到相册</h3>
        <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-4">
          {images.map((img, index) => (
            <div
              key={index}
              className="aspect-square bg-gray-200 rounded-2xl overflow-hidden"
            >
              <img
                src={img}
                alt={`图片 ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>
        <button
          onClick={downloadAllImages}
          disabled={downloading}
          className="w-full py-3 bg-gray-100 text-gray-700 rounded-full font-medium flex items-center justify-center space-x-2 disabled:opacity-50 text-sm sm:text-base"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          <span>{downloading ? '下载中...' : '一键下载图片'}</span>
        </button>
      </div>

      {/* 标题复制 */}
      <div className="bg-white rounded-3xl p-4 sm:p-6 mb-4">
        <h3 className="text-sm text-gray-500 mb-3">标题</h3>
        <p className="text-sm sm:text-base text-gray-900 leading-relaxed mb-4">{title}</p>
        <button
          onClick={() => copyToClipboard(title, 'title')}
          className="w-full py-3 bg-gray-100 text-gray-700 rounded-full font-medium flex items-center justify-center space-x-2 text-sm sm:text-base"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          <span>{copiedTitle ? '已复制' : '复制标题'}</span>
        </button>
      </div>

      {/* 文案复制 */}
      <div className="bg-white rounded-3xl p-4 sm:p-6 mb-6">
        <h3 className="text-sm text-gray-500 mb-3">文案和标签</h3>
        <p className="text-sm sm:text-base text-gray-900 leading-relaxed whitespace-pre-wrap mb-4">{content}</p>
        <button
          onClick={() => copyToClipboard(content, 'content')}
          className="w-full py-3 bg-gray-100 text-gray-700 rounded-full font-medium flex items-center justify-center space-x-2 text-sm sm:text-base"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          <span>{copiedContent ? '已复制' : '复制文案'}</span>
        </button>
      </div>

      {/* 打开小红书 */}
      <button
        onClick={openXiaohongshu}
        className="w-full py-4 bg-gradient-to-r from-pink-500 to-pink-400 text-white text-base font-medium rounded-full hover:shadow-lg transition-all"
      >
        打开小红书APP
      </button>
    </div>
  )
}
