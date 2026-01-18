import { useState } from 'react'
import LinkInput from './components/LinkInput'
import ContentPreview from './components/ContentPreview'
import PublishGuide from './components/PublishGuide'
import HistoryPage from './components/HistoryPage'
import { LinkParser } from './services/LinkParser'
import { ContentScraper } from './services/ContentScraper'
import { useContentStore } from './store/useContentStore'
import { useHistoryStore } from './store/useHistoryStore'

type Page = 'input' | 'loading' | 'preview' | 'rewriting' | 'result' | 'publish' | 'complete' | 'history'

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('input')
  const [postId, setPostId] = useState<string>('')
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [loadingSteps, setLoadingSteps] = useState<string[]>([])
  
  const { setOriginalContent, clearContent } = useContentStore()
  const { addItem } = useHistoryStore()

  const handleLinkSubmit = async (url: string) => {
    try {
      const parsed = LinkParser.parseLink(url)
      setPostId(parsed.postId)
      
      setCurrentPage('loading')
      setLoadingProgress(0)
      setLoadingSteps([])
      
      // 模拟加载步骤
      setTimeout(() => {
        setLoadingSteps(['解析链接完成'])
        setLoadingProgress(33)
      }, 500)
      
      setTimeout(() => {
        setLoadingSteps(['解析链接完成', '获取标题和文案'])
        setLoadingProgress(66)
      }, 1000)
      
      setTimeout(() => {
        setLoadingSteps(['解析链接完成', '获取标题和文案', '下载图片中...'])
        setLoadingProgress(100)
      }, 1500)
      
      const content = await ContentScraper.scrapeContent(parsed.postId)
      setOriginalContent(content)
      
      setTimeout(() => {
        setCurrentPage('preview')
      }, 2000)
    } catch (error) {
      console.error('处理链接失败:', error)
      throw error
    }
  }

  const handlePublishComplete = () => {
    const contentStore = useContentStore.getState()
    const rewritten = contentStore.rewrittenContent
    const original = contentStore.originalContent
    
    if (rewritten && original) {
      // 保存到历史记录
      addItem({
        url: original.postId,
        postId: original.postId,
        title: rewritten.title,
        content: rewritten.content,
        tags: rewritten.tags,
        imageCount: original.images.length,
        status: 'completed',
      })
    }
    
    setCurrentPage('complete')
  }

  const handleNewSession = () => {
    clearContent()
    setPostId('')
    setCurrentPage('input')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto">
        {currentPage === 'input' && (
          <LinkInput 
            onNext={handleLinkSubmit}
            onViewHistory={() => setCurrentPage('history')}
          />
        )}
        
        {currentPage === 'loading' && (
          <div className="min-h-screen flex flex-col items-center justify-center px-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-12">正在抓取内容...</h2>
            
            <div className="w-full max-w-md mb-8">
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-pink-500 to-pink-400 transition-all duration-500"
                  style={{ width: `${loadingProgress}%` }}
                ></div>
              </div>
            </div>
            
            <div className="space-y-3">
              {loadingSteps.map((step, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-gray-700">{step}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {currentPage === 'preview' && (
          <ContentPreview 
            postId={postId}
            onBack={handleNewSession}
            onNext={() => {
              setCurrentPage('rewriting')
              setTimeout(() => setCurrentPage('result'), 3000)
            }}
          />
        )}
        
        {currentPage === 'rewriting' && (
          <div className="min-h-screen flex flex-col items-center justify-center px-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-12">AI正在改写...</h2>
            
            <div className="w-full max-w-md mb-8">
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-pink-500 to-pink-400 animate-pulse" style={{ width: '80%' }}></div>
              </div>
            </div>
            
            <p className="text-sm text-gray-500">预计需要 3-5 秒</p>
          </div>
        )}
        
        {currentPage === 'result' && (
          <ContentPreview 
            postId={postId}
            onBack={() => setCurrentPage('preview')}
            onNext={() => setCurrentPage('publish')}
            isRewritten
          />
        )}
        
        {currentPage === 'publish' && (
          <PublishGuide onComplete={handlePublishComplete} />
        )}
        
        {currentPage === 'complete' && (
          <div className="min-h-screen flex flex-col items-center justify-center px-4">
            <div className="w-20 h-20 rounded-full bg-green-500 flex items-center justify-center mb-6">
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-3">准备完成</h2>
            <p className="text-gray-500 mb-8">已为您准备好发布所需的一切</p>
            
            <div className="space-y-3 mb-12 w-full max-w-md">
              <div className="flex items-center justify-between">
                <span className="text-gray-700">3张图片已准备</span>
                <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-700">文案和标签已复制</span>
                <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-700">小红书APP已打开</span>
                <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-100 rounded-2xl p-6 mb-8 w-full max-w-md">
              <h3 className="font-semibold text-gray-900 mb-2">温馨提示</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                在小红书中完成发布后，可以返回这里查看历史记录
              </p>
            </div>
            
            <div className="flex space-x-4 w-full max-w-md">
              <button
                onClick={() => setCurrentPage('history')}
                className="flex-1 py-4 bg-gray-100 text-gray-700 rounded-full font-medium hover:bg-gray-200 transition-all"
              >
                查看历史
              </button>
              <button
                onClick={handleNewSession}
                className="flex-1 py-4 bg-gradient-to-r from-pink-500 to-pink-400 text-white rounded-full font-medium hover:shadow-lg transition-all"
              >
                再来一次
              </button>
            </div>
          </div>
        )}
        
        {currentPage === 'history' && (
          <HistoryPage 
            onBack={handleNewSession}
            onSelectItem={handleLinkSubmit}
          />
        )}
      </div>
    </div>
  )
}

export default App
