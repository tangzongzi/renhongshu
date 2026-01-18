import { useHistoryStore } from '../store/useHistoryStore'

interface HistoryPageProps {
  onBack: () => void
  onSelectItem: (url: string) => void
}

export default function HistoryPage({ onBack, onSelectItem }: HistoryPageProps) {
  const { items, clearHistory } = useHistoryStore()

  const formatTime = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - new Date(date).getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 60) return `${minutes}分钟前`
    if (hours < 24) return `${hours}小时前`
    if (days === 1) return '昨天'
    return new Date(date).toLocaleDateString('zh-CN')
  }

  const groupByDate = () => {
    const groups: { [key: string]: typeof items } = {}
    
    items.forEach(item => {
      const date = new Date(item.createdAt)
      const now = new Date()
      const diff = now.getTime() - date.getTime()
      const days = Math.floor(diff / 86400000)
      
      let key = '今天'
      if (days === 1) key = '昨天'
      else if (days > 1) key = date.toLocaleDateString('zh-CN')
      
      if (!groups[key]) groups[key] = []
      groups[key].push(item)
    })
    
    return groups
  }

  const groups = groupByDate()

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-6">
      {/* 标题栏 */}
      <div className="flex items-center mb-6">
        <button
          onClick={onBack}
          className="p-2 -ml-2"
        >
          <svg className="w-6 h-6 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-xl font-bold text-gray-900 ml-4">历史记录</h1>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-500">暂无历史记录</p>
        </div>
      ) : (
        <>
          {Object.entries(groups).map(([date, dateItems]) => (
            <div key={date} className="mb-6">
              <h3 className="text-base font-semibold text-gray-900 mb-3">{date}</h3>
              
              <div className="space-y-3">
                {dateItems.map((item, index) => (
                  <div
                    key={item.id}
                    onClick={() => onSelectItem(item.url)}
                    className={`bg-white rounded-2xl p-4 cursor-pointer hover:shadow-md transition-shadow ${
                      index === 0 && date === '今天' ? 'border-2 border-blue-500' : ''
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      {/* 缩略图 */}
                      <div className="w-16 h-16 bg-gray-200 rounded-xl flex-shrink-0"></div>
                      
                      {/* 内容 */}
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-gray-900 mb-1 line-clamp-2">
                          {item.title}
                        </h4>
                        <p className="text-xs text-gray-500 mb-1">
                          {formatTime(item.createdAt)}
                        </p>
                        {item.status === 'completed' && (
                          <span className="text-xs text-green-500">已完成</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {items.length > 0 && (
            <button
              onClick={() => {
                if (confirm('确定要清除所有历史记录吗？')) {
                  clearHistory()
                }
              }}
              className="w-full py-3 bg-white text-gray-700 rounded-full font-medium border border-gray-200"
            >
              清除历史
            </button>
          )}
        </>
      )}
    </div>
  )
}
