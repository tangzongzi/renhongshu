import { useState } from 'react'
import { LinkParser } from '../services/LinkParser'
import { useHistoryStore } from '../store/useHistoryStore'

interface LinkInputProps {
  onNext: (url: string) => Promise<void>
  onViewHistory: () => void
}

export default function LinkInput({ onNext, onViewHistory }: LinkInputProps) {
  const [url, setUrl] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  
  const { getRecentItems } = useHistoryStore()
  const recentItems = getRecentItems(2)

  const handleSubmit = async () => {
    setError('')

    if (!url.trim()) {
      setError('请输入小红书链接')
      return
    }

    if (!LinkParser.isValidLink(url)) {
      setError('不支持的链接格式，请输入有效的小红书链接')
      return
    }

    try {
      setIsLoading(true)
      await onNext(url)
    } catch (err) {
      setError(err instanceof Error ? err.message : '链接解析失败')
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit()
    }
  }

  const formatTime = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - new Date(date).getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)

    if (minutes < 60) return `${minutes}分钟前`
    if (hours < 24) return `${hours}小时前`
    return '昨天'
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      {/* 标题 */}
      <h1 className="text-2xl font-bold text-center text-gray-900 mb-12">
        小红书自动发布工具
      </h1>

      {/* 输入卡片 */}
      <div className="bg-white rounded-3xl shadow-sm p-8 mb-6">
        <label className="block text-sm text-gray-400 mb-3">
          粘贴小红书链接
        </label>
        
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="https://..."
          className="w-full px-4 py-4 bg-gray-50 border-0 rounded-2xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all mb-6"
          disabled={isLoading}
        />

        {error && (
          <p className="mb-4 text-sm text-red-500">{error}</p>
        )}

        <button
          onClick={handleSubmit}
          disabled={isLoading}
          className="w-full py-4 bg-gradient-to-r from-pink-500 to-pink-400 text-white text-base font-medium rounded-full hover:shadow-lg transition-all disabled:opacity-50"
        >
          {isLoading ? '解析中...' : '开始抓取内容'}
        </button>
      </div>

      {/* 支持的链接格式 */}
      <p className="text-center text-sm text-gray-400 mb-8">
        支持的链接格式<br />
        标准链接 / 分享链接 / 短链接
      </p>

      {/* 最近使用 */}
      {recentItems.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-gray-900">最近使用</h3>
            <button
              onClick={onViewHistory}
              className="text-sm text-pink-500 hover:text-pink-600"
            >
              查看全部
            </button>
          </div>
          
          <div className="space-y-3">
            {recentItems.map((item) => (
              <div
                key={item.id}
                onClick={() => setUrl(item.url)}
                className="bg-white rounded-2xl p-4 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
              >
                <p className="text-sm text-gray-900 mb-1 line-clamp-1">{item.title || item.url}</p>
                <p className="text-xs text-gray-400">{formatTime(item.createdAt)}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
