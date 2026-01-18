import { useState, useEffect } from 'react'
import { ContentScraper, ScrapedContent } from '../services/ContentScraper'
import { AIRewriter, RewrittenContent } from '../services/AIRewriter'
import { useContentStore } from '../store/useContentStore'

interface ContentPreviewProps {
  postId: string
  onBack: () => void
  onNext: () => void
  isRewritten?: boolean
}

export default function ContentPreview({ postId, onBack, onNext, isRewritten = false }: ContentPreviewProps) {
  const [content, setContent] = useState<ScrapedContent | null>(null)
  const [rewritten, setRewritten] = useState<RewrittenContent | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [editedTitle, setEditedTitle] = useState('')
  const [editedContent, setEditedContent] = useState('')

  const { setOriginalContent, setRewrittenContent, setDraftTitle, setDraftContent } = useContentStore()

  useEffect(() => {
    loadContent()
  }, [isRewritten])

  // 自动保存草稿
  useEffect(() => {
    if (editedTitle || editedContent) {
      const timer = setTimeout(() => {
        setDraftTitle(editedTitle)
        setDraftContent(editedContent)
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [editedTitle, editedContent])

  const loadContent = async () => {
    setIsLoading(true)
    try {
      const scraped = await ContentScraper.scrapeContent(postId)
      setContent(scraped)
      setOriginalContent(scraped)

      if (isRewritten) {
        const rewrittenData = await AIRewriter.rewriteContent(
          scraped.title,
          scraped.content
        )
        setRewritten(rewrittenData)
        setRewrittenContent(rewrittenData)
        setEditedTitle(rewrittenData.title)
        setEditedContent(AIRewriter.formatForPublish(rewrittenData))
      } else {
        setEditedTitle(scraped.title)
        setEditedContent(scraped.content)
      }
    } catch (error) {
      console.error('加载内容失败:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegenerate = async () => {
    if (!content) return
    
    setIsLoading(true)
    try {
      const rewrittenData = await AIRewriter.rewriteContent(
        content.title,
        content.content
      )
      setRewritten(rewrittenData)
      setRewrittenContent(rewrittenData)
      setEditedTitle(rewrittenData.title)
      setEditedContent(AIRewriter.formatForPublish(rewrittenData))
    } catch (error) {
      console.error('重新生成失败:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-pink-500 mx-auto mb-4"></div>
          <p className="text-gray-700">
            {isRewritten ? 'AI正在改写...' : '正在加载内容...'}
          </p>
        </div>
      </div>
    )
  }

  if (!content) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-700 mb-4">加载失败，请重试</p>
          <button onClick={onBack} className="text-pink-500">返回</button>
        </div>
      </div>
    )
  }

  const charCount = editedContent.length

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-6">
      {/* 图片预览 */}
      <div className="mb-6">
        <p className="text-sm text-gray-500 mb-3">图片 {content.images.length}张</p>
        <div className="grid grid-cols-3 gap-3">
          {content.images.map((img, index) => (
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
      </div>

      {/* 标题卡片 */}
      <div className="bg-white rounded-3xl p-6 mb-4" style={{ border: isRewritten ? '2px solid #3B82F6' : 'none' }}>
        <h3 className="text-sm text-gray-500 mb-3">标题</h3>
        <p className="text-base text-gray-900 leading-relaxed mb-4">{editedTitle}</p>
        
        {isRewritten && (
          <div className="grid grid-cols-2 gap-3">
            <button className="py-3 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
              编辑
            </button>
            <button
              onClick={handleRegenerate}
              disabled={isLoading}
              className="py-3 bg-gray-100 text-gray-700 rounded-full text-sm font-medium disabled:opacity-50"
            >
              重新生成
            </button>
          </div>
        )}
      </div>

      {/* 文案卡片 */}
      <div className="bg-white rounded-3xl p-6 mb-6">
        <h3 className="text-sm text-gray-500 mb-3">
          文案{isRewritten && '和标签'} {charCount}字
        </h3>
        <p className="text-base text-gray-900 leading-relaxed whitespace-pre-wrap mb-4">
          {editedContent}
        </p>
        
        {isRewritten && rewritten && (
          <>
            <p className="text-xs text-gray-400 mb-4">
              AI已根据内容自动生成标签
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button className="py-3 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                编辑
              </button>
              <button
                onClick={handleRegenerate}
                disabled={isLoading}
                className="py-3 bg-gray-100 text-gray-700 rounded-full text-sm font-medium disabled:opacity-50"
              >
                重新生成
              </button>
            </div>
          </>
        )}
      </div>

      {/* 操作按钮 */}
      <button
        onClick={onNext}
        className="w-full py-4 bg-gradient-to-r from-pink-500 to-pink-400 text-white text-base font-medium rounded-full hover:shadow-lg transition-all"
      >
        {isRewritten ? '确认并发布' : '使用AI改写'}
      </button>
    </div>
  )
}
