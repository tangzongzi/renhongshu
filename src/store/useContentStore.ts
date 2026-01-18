import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { ScrapedContent } from '../services/ContentScraper'
import { RewrittenContent } from '../services/AIRewriter'

interface ContentState {
  // 当前内容
  originalContent: ScrapedContent | null
  rewrittenContent: RewrittenContent | null
  
  // 草稿
  draftTitle: string
  draftContent: string
  
  // 操作
  setOriginalContent: (content: ScrapedContent) => void
  setRewrittenContent: (content: RewrittenContent) => void
  setDraftTitle: (title: string) => void
  setDraftContent: (content: string) => void
  clearContent: () => void
}

export const useContentStore = create<ContentState>()(
  persist(
    (set) => ({
      originalContent: null,
      rewrittenContent: null,
      draftTitle: '',
      draftContent: '',
      
      setOriginalContent: (content) => set({ originalContent: content }),
      setRewrittenContent: (content) => set({ rewrittenContent: content }),
      setDraftTitle: (title) => set({ draftTitle: title }),
      setDraftContent: (content) => set({ draftContent: content }),
      clearContent: () => set({
        originalContent: null,
        rewrittenContent: null,
        draftTitle: '',
        draftContent: '',
      }),
    }),
    {
      name: 'content-storage',
    }
  )
)
